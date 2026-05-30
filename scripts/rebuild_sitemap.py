#!/usr/bin/env python3
"""Rebuild sitemap.xml in MongoDB (filters bad slugs, blog/service duplicates)."""

import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

from backend.database import init_db
from backend.services.generate import _rebuild_sitemap


async def main() -> None:
    await init_db()
    await _rebuild_sitemap()
    print("OK: sitemap rebuilt")


if __name__ == "__main__":
    asyncio.run(main())
