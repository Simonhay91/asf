#!/usr/bin/env python3
"""
Submit every sitemap URL to the Yandex recrawl queue, respecting the daily
quota. Resumable: already-submitted URLs are stored in a state file so a
second run (e.g. next day) continues with the remainder.

Usage:
  cd /var/www/russkiyasphalt
  ./venv/bin/python scripts/yandex_submit_all.py
  ./venv/bin/python scripts/yandex_submit_all.py --dry-run
"""

import argparse
import asyncio
import json
import os
import re
import sys
from pathlib import Path

import httpx
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parent.parent
load_dotenv(ROOT / ".env")

SITEMAP_URL = "https://russkiyasphalt.ru/sitemap.xml"
STATE_FILE = ROOT / "scripts" / ".yandex_submitted.json"
TOKEN = os.getenv("YANDEX_WEBMASTER_TOKEN", "")
HOST_ID = os.getenv("YANDEX_HOST_ID", "")


async def fetch_sitemap_urls(http: httpx.AsyncClient) -> list[str]:
    resp = await http.get(SITEMAP_URL)
    resp.raise_for_status()
    return re.findall(r"<loc>(.*?)</loc>", resp.text)


def load_state() -> set[str]:
    if STATE_FILE.exists():
        return set(json.loads(STATE_FILE.read_text()))
    return set()


def save_state(submitted: set[str]) -> None:
    STATE_FILE.write_text(json.dumps(sorted(submitted), ensure_ascii=False, indent=2))


async def main(dry_run: bool = False) -> None:
    if not TOKEN or not HOST_ID:
        sys.exit("YANDEX_WEBMASTER_TOKEN / YANDEX_HOST_ID not set in .env")

    async with httpx.AsyncClient(timeout=20) as http:
        headers = {"Authorization": f"OAuth {TOKEN}"}

        user_id = (await http.get(
            "https://api.webmaster.yandex.net/v4/user", headers=headers
        )).json()["user_id"]

        quota = (await http.get(
            f"https://api.webmaster.yandex.net/v4/user/{user_id}"
            f"/hosts/{HOST_ID}/recrawl/quota", headers=headers
        )).json()
        remaining = quota.get("quota_remainder", 0)

        all_urls = await fetch_sitemap_urls(http)
        submitted = load_state()
        pending = [u for u in all_urls if u not in submitted]

        print(f"Sitemap: {len(all_urls)} URLs | already submitted: {len(submitted)} "
              f"| pending: {len(pending)} | quota left today: {remaining}")

        batch = pending[:remaining]
        if dry_run:
            print(f"[dry-run] would submit {len(batch)} URLs now")
            return

        endpoint = (f"https://api.webmaster.yandex.net/v4/user/{user_id}"
                    f"/hosts/{HOST_ID}/recrawl/queue")
        ok = 0
        for url in batch:
            r = await http.post(endpoint, headers=headers, json={"url": url})
            if r.status_code == 202:
                submitted.add(url)
                ok += 1
            elif r.status_code == 429:
                print(f"Quota exhausted at {ok} submissions, stopping.")
                break
            else:
                print(f"  fail {r.status_code}: {url}")

        save_state(submitted)
        left = len([u for u in all_urls if u not in submitted])
        print(f"Submitted {ok} this run. Total done: {len(submitted)}/{len(all_urls)}. "
              f"Remaining: {left} (run again tomorrow for the rest).")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()
    asyncio.run(main(dry_run=args.dry_run))
