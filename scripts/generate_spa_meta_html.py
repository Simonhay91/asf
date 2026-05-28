#!/usr/bin/env python3
"""
Write per-URL index.html files with unique title/description for Yandex/Google crawlers.

Usage (after frontend build):
  cd /var/www/russkiyasphalt
  npm run build --prefix frontend
  ./venv/bin/python scripts/generate_spa_meta_html.py
"""

import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

from backend.database import init_db
from backend.services.spa_meta import rebuild_spa_meta_html


async def main() -> None:
    await init_db()
    count = await rebuild_spa_meta_html()
    if count:
        print(f"OK: unique meta HTML for {count} URLs in frontend/dist/")
    else:
        print("Nothing generated — run `npm run build` in frontend/ first.")


if __name__ == "__main__":
    asyncio.run(main())
