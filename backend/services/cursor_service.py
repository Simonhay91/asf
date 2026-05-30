"""
Cursor Cloud Agent integration for remote coding tasks via Telegram.

Uses the Cursor Cloud Agents API v1:
https://cursor.com/docs/cloud-agent/api/endpoints
"""

import asyncio
import logging
import os
import re
from datetime import datetime
from typing import Any, Optional

import httpx

from backend.database import db
from backend.services.telegram_service import notify

logger = logging.getLogger(__name__)

API_BASE = "https://api.cursor.com/v1"


def _env(key: str, default: str = "") -> str:
    return os.getenv(key, default)


def _poll_interval_sec() -> int:
    return int(_env("CURSOR_POLL_INTERVAL_SEC", "20"))


def _poll_max_attempts() -> int:
    return int(_env("CURSOR_POLL_MAX_ATTEMPTS", "360"))

TERMINAL_STATUSES = frozenset({"FINISHED", "ERROR", "CANCELLED", "EXPIRED"})
ACTIVE_STATUSES = frozenset({"CREATING", "RUNNING", "QUEUED"})
AGENT_ID_RE = re.compile(r"^bc-[0-9a-f-]+$", re.IGNORECASE)

STATUS_LABELS = {
    "CREATING": "⏳ Создаётся",
    "QUEUED": "⏳ В очереди",
    "RUNNING": "🔄 Работает",
    "FINISHED": "✅ Готово",
    "ERROR": "❌ Ошибка",
    "CANCELLED": "🛑 Отменено",
    "EXPIRED": "⌛ Истекло",
}

CODING_SYSTEM_PREFIX = """\
You are working on russkiyasphalt.ru — a Russian asphalt company SEO site.

Stack:
- Frontend: React + Vite (frontend/src/)
- Backend: FastAPI + MongoDB (backend/)
- Deploy: scripts/deploy.sh on server /var/www/russkiyasphalt

Rules:
- Follow existing code style and conventions in the repo
- Make minimal, focused changes — no over-engineering
- Do not add unrelated refactors or unnecessary comments
- Test that changes compile/build when relevant
- Commit with clear messages; push to branch (PR is created automatically)

Task:
"""


class CursorAPIError(Exception):
    """Raised when the Cursor API returns a non-retryable error."""

    def __init__(self, message: str, status_code: int = 0, retryable: bool = False):
        super().__init__(message)
        self.status_code = status_code
        self.retryable = retryable


def is_configured() -> bool:
    return bool(_env("CURSOR_API_KEY") and _repo_url())


def _repo_url() -> str:
    return _env("CURSOR_REPO_URL", "https://github.com/Simonhay91/asf")


def _default_branch() -> str:
    return _env("CURSOR_DEFAULT_BRANCH", "main")


def _default_model() -> str:
    return _env("CURSOR_MODEL", "composer-2.5")


def _headers() -> dict[str, str]:
    api_key = _env("CURSOR_API_KEY")
    if not api_key:
        return {}
    return {"Authorization": f"Bearer {api_key}"}


async def _api(
    method: str,
    path: str,
    *,
    json: Optional[dict] = None,
    params: Optional[dict] = None,
) -> Any:
    if not _env("CURSOR_API_KEY"):
        raise CursorAPIError("CURSOR_API_KEY не настроен", status_code=0)

    url = f"{API_BASE}{path}"
    try:
        async with httpx.AsyncClient(timeout=60, headers=_headers()) as http:
            resp = await http.request(method, url, json=json, params=params)
    except httpx.TimeoutException as e:
        raise CursorAPIError(f"Cursor API timeout: {e}", retryable=True) from e
    except httpx.HTTPError as e:
        raise CursorAPIError(f"Cursor API network error: {e}", retryable=True) from e

    if resp.status_code >= 400:
        detail = resp.text[:300]
        retryable = resp.status_code in (429, 502, 503, 504)
        raise CursorAPIError(
            f"Cursor API {resp.status_code}: {detail}",
            status_code=resp.status_code,
            retryable=retryable,
        )

    if resp.status_code == 204 or not resp.content:
        return None
    return resp.json()


async def create_coding_task(prompt: str) -> dict:
    """Launch a new Cloud Agent with the given coding task."""
    full_prompt = CODING_SYSTEM_PREFIX + prompt.strip()
    payload = {
        "prompt": {"text": full_prompt},
        "repos": [{"url": _repo_url(), "startingRef": _default_branch()}],
        "autoCreatePR": True,
        "skipReviewerRequest": True,
        "mode": "agent",
    }
    model = _default_model()
    if model:
        payload["model"] = {"id": model}

    data = await _api("POST", "/agents", json=payload)
    agent = data["agent"]
    run = data["run"]
    await _save_job(
        agent_id=agent["id"],
        run_id=run["id"],
        prompt=prompt.strip(),
        agent_url=agent.get("url", ""),
        status=run.get("status", "CREATING"),
    )
    asyncio.create_task(_poll_and_notify(agent["id"], run["id"]))
    return {"agent": agent, "run": run}


async def send_followup(agent_id: str, prompt: str) -> dict:
    """Send a follow-up prompt to an existing agent."""
    if not AGENT_ID_RE.match(agent_id):
        raise CursorAPIError(f"Неверный agent ID: {agent_id}")

    payload = {"prompt": {"text": prompt.strip()}, "mode": "agent"}
    data = await _api("POST", f"/agents/{agent_id}/runs", json=payload)
    run = data["run"]
    agent = await get_agent(agent_id)
    await _save_job(
        agent_id=agent_id,
        run_id=run["id"],
        prompt=prompt.strip(),
        agent_url=agent.get("url", ""),
        status=run.get("status", "CREATING"),
    )
    asyncio.create_task(_poll_and_notify(agent_id, run["id"]))
    return {"agent": agent, "run": run}


async def get_agent(agent_id: str) -> dict:
    return await _api("GET", f"/agents/{agent_id}")


async def get_run(agent_id: str, run_id: str) -> dict:
    return await _api("GET", f"/agents/{agent_id}/runs/{run_id}")


async def list_agents(limit: int = 5) -> list[dict]:
    data = await _api("GET", "/agents", params={"limit": limit})
    return data.get("items", [])


async def cancel_run(agent_id: str, run_id: str) -> None:
    await _api("POST", f"/agents/{agent_id}/runs/{run_id}/cancel")


async def recover_pending_jobs() -> None:
    """Resume polling for jobs that were active when the server restarted."""
    if not is_configured():
        return
    cursor = db.cursor_jobs.find(
        {"status": {"$in": list(ACTIVE_STATUSES)}, "notified": False}
    )
    jobs = await cursor.to_list(50)
    for job in jobs:
        logger.info(f"Recovering cursor job poll: {job['agent_id']}/{job['run_id']}")
        asyncio.create_task(_poll_and_notify(job["agent_id"], job["run_id"]))


async def _save_job(
    *,
    agent_id: str,
    run_id: str,
    prompt: str,
    agent_url: str,
    status: str,
) -> None:
    now = datetime.utcnow()
    await db.cursor_jobs.update_one(
        {"agent_id": agent_id, "run_id": run_id},
        {
            "$set": {
                "agent_id": agent_id,
                "run_id": run_id,
                "prompt": prompt[:500],
                "agent_url": agent_url,
                "status": status,
                "updated_at": now,
                "notified": False,
            },
            "$setOnInsert": {"created_at": now},
        },
        upsert=True,
    )


async def _update_job(agent_id: str, run_id: str, **fields) -> None:
    fields["updated_at"] = datetime.utcnow()
    await db.cursor_jobs.update_one(
        {"agent_id": agent_id, "run_id": run_id},
        {"$set": fields},
    )


def _format_git_info(git: Optional[dict]) -> str:
    if not git or not git.get("branches"):
        return ""
    lines = []
    for b in git["branches"]:
        branch = b.get("branch", "")
        pr_url = b.get("prUrl", "")
        if pr_url:
            lines.append(f'🔀 <a href="{pr_url}">Pull Request</a>')
        elif branch:
            lines.append(f"🌿 Branch: <code>{branch}</code>")
    return "\n".join(lines)


def _format_duration(ms: Optional[int]) -> str:
    if not ms:
        return ""
    sec = ms // 1000
    if sec < 60:
        return f"⏱ {sec}с"
    return f"⏱ {sec // 60}м {sec % 60}с"


async def _poll_and_notify(agent_id: str, run_id: str) -> None:
    """Poll run status until terminal, then send Telegram notification."""
    for attempt in range(_poll_max_attempts()):
        try:
            run = await get_run(agent_id, run_id)
            status = run.get("status", "UNKNOWN")
            await _update_job(agent_id, run_id, status=status)

            if status not in TERMINAL_STATUSES:
                await asyncio.sleep(_poll_interval_sec())
                continue

            job = await db.cursor_jobs.find_one(
                {"agent_id": agent_id, "run_id": run_id}
            )
            if job and job.get("notified"):
                return

            label = STATUS_LABELS.get(status, status)
            agent = await get_agent(agent_id)
            agent_url = agent.get("url", "")
            git_info = _format_git_info(run.get("git"))
            duration = _format_duration(run.get("durationMs"))
            result_text = (run.get("result") or "").strip()
            if len(result_text) > 600:
                result_text = result_text[:600] + "…"

            msg_parts = [
                f"💻 <b>Cursor Agent — {label}</b>",
                f"🆔 <code>{agent_id}</code>",
            ]
            if agent_url:
                msg_parts.append(f'🔗 <a href="{agent_url}">Открыть в Cursor</a>')
            if duration:
                msg_parts.append(duration)
            if git_info:
                msg_parts.append(git_info)
            if result_text:
                msg_parts.append(f"\n📝 {result_text}")

            await notify("\n".join(msg_parts))
            await _update_job(
                agent_id,
                run_id,
                notified=True,
                result=result_text[:1000] or None,
                pr_url=_extract_pr_url(run.get("git")),
                branch=_extract_branch(run.get("git")),
            )
            return

        except CursorAPIError as e:
            logger.warning(f"Poll error {agent_id}/{run_id} (attempt {attempt}): {e}")
            if not e.retryable and e.status_code not in (0, 429):
                await notify(f"❌ Cursor poll error: {str(e)[:200]}")
                return
            await asyncio.sleep(_poll_interval_sec() * 2)
        except Exception as e:
            logger.error(f"Unexpected poll error {agent_id}/{run_id}: {e}", exc_info=True)
            await asyncio.sleep(_poll_interval_sec() * 2)

    await notify(
        f"⌛ Cursor agent <code>{agent_id}</code> — таймаут ожидания.\n"
        f"Проверь статус: /code status {agent_id}"
    )


def _extract_pr_url(git: Optional[dict]) -> Optional[str]:
    if not git:
        return None
    for b in git.get("branches", []):
        if b.get("prUrl"):
            return b["prUrl"]
    return None


def _extract_branch(git: Optional[dict]) -> Optional[str]:
    if not git:
        return None
    for b in git.get("branches", []):
        if b.get("branch"):
            return b["branch"]
    return None


async def format_agent_status(agent_id: str) -> str:
    """Build a Telegram-friendly status message for one agent."""
    agent = await get_agent(agent_id)
    run_id = agent.get("latestRunId")
    label = STATUS_LABELS.get(agent.get("status", ""), agent.get("status", "?"))

    lines = [
        f"💻 <b>{agent.get('name', 'Agent')}</b>",
        f"📊 Status: {label}",
        f"🆔 <code>{agent_id}</code>",
    ]
    if agent.get("url"):
        lines.append(f'🔗 <a href="{agent["url"]}">Cursor</a>')

    if run_id:
        try:
            run = await get_run(agent_id, run_id)
            run_label = STATUS_LABELS.get(run.get("status", ""), run.get("status", "?"))
            lines.append(f"🏃 Run: {run_label} (<code>{run_id}</code>)")
            git_info = _format_git_info(run.get("git"))
            if git_info:
                lines.append(git_info)
            result = (run.get("result") or "").strip()
            if result:
                lines.append(f"📝 {result[:300]}{'…' if len(result) > 300 else ''}")
        except CursorAPIError:
            lines.append(f"🏃 Latest run: <code>{run_id}</code>")

    return "\n".join(lines)


async def format_agents_list(limit: int = 5) -> str:
    """Build a Telegram-friendly list of recent agents."""
    agents = await list_agents(limit)
    if not agents:
        return "📭 Нет активных Cursor agents."

    lines = ["💻 <b>Последние Cursor agents</b>\n"]
    for a in agents:
        status = STATUS_LABELS.get(a.get("status", ""), a.get("status", "?"))
        name = (a.get("name") or "Agent")[:50]
        lines.append(f"{status} <b>{name}</b>\n   <code>{a['id']}</code>")
    lines.append("\n/code status {id} — детали")
    return "\n".join(lines)
