import logging
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel

from backend.models.schemas import GenerateRequest, RegenerateRequest
from backend.services.generate import (
    generate_next,
    generate_moscow_districts,
    regenerate_slug,
    get_status,
    get_next_queue,
)
from backend.services.telegram_service import notify, notify_quote

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["generate"])


class QuoteRequest(BaseModel):
    name: str = ""
    phone: str
    comment: str = ""
    source_url: str = ""


@router.post("/quote")
async def submit_quote(req: QuoteRequest):
    """Receive quote request from site and forward to Telegram."""
    try:
        await notify_quote(name=req.name, phone=req.phone, comment=req.comment, source_url=req.source_url)
        return {"status": "ok"}
    except Exception as e:
        logger.error(f"Quote notify error: {e}")
        raise HTTPException(status_code=500, detail="Failed to send")


async def _run_generate_job(location_type: str, count: int) -> None:
    try:
        if location_type == "moscow":
            result = await generate_moscow_districts(count)
        else:
            result = await generate_next(location_type)
        names = [g.get("name", g.get("title", "?")) for g in result.get("generated", [])]
        if names:
            await notify(
                f"✅ Cron /api/generate ({location_type}):\n"
                + "\n".join(f"  • {n}" for n in names)
            )
        else:
            await notify(f"⚠️ Cron /api/generate ({location_type}): очередь пуста")
    except Exception as e:
        logger.error(f"Background generate failed: {e}", exc_info=True)
        await notify(f"❌ Cron generate: {str(e)[:300]}")


@router.post("/generate")
async def trigger_generate(req: GenerateRequest, background_tasks: BackgroundTasks):
    """Trigger generation. Use background=true for cron-job.org (avoids HTTP timeout)."""
    try:
        if req.background:
            background_tasks.add_task(_run_generate_job, req.location_type, req.count)
            return {
                "status": "started",
                "location_type": req.location_type,
                "count": req.count if req.location_type == "moscow" else 1,
            }
        if req.location_type == "moscow":
            return await generate_moscow_districts(req.count)
        return await generate_next(req.location_type)
    except Exception as e:
        logger.error(f"Generate error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/regenerate")
async def trigger_regenerate(req: RegenerateRequest):
    """Force regenerate a specific slug."""
    try:
        result = await regenerate_slug(req.slug)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Regenerate error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status")
async def status():
    return await get_status()


@router.get("/next")
async def next_queue(n: int = 5):
    return await get_next_queue(n)
