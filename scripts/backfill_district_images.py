#!/usr/bin/env python3
"""
Backfill Wikimedia images for Moscow district pages missing image_url.

Usage:
  cd /var/www/russkiyasphalt
  ./venv/bin/python scripts/backfill_district_images.py
  ./venv/bin/python scripts/backfill_district_images.py --limit 10
"""

import argparse
import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

from backend.database import init_db, db
from backend.services.wikimedia import fetch_wikimedia_image
from backend.services.pexels import fetch_image


async def main(limit: int | None = None) -> None:
    await init_db()

    query = {"type": "district", "$or": [{"image_url": None}, {"image_url": ""}]}
    cursor = db.generated_pages.find(query, {"slug": 1, "name": 1})
    pages = await cursor.to_list(limit or 200)

    if not pages:
        print("All district pages already have images.")
        return

    print(f"Backfilling images for {len(pages)} districts...")
    updated = 0

    for page in pages:
        slug = page["slug"]
        district = await db.moscow_districts.find_one({"slug": slug}, {"name": 1})
        name = district["name"] if district else slug

        url = await fetch_wikimedia_image(name, "district", slug=slug)
        if not url:
            url = await fetch_image(slug, "district", location_name=name)

        if url:
            await db.generated_pages.update_one(
                {"slug": slug, "type": "district"},
                {"$set": {"image_url": url}},
            )
            updated += 1
            print(f"  ✓ {name}: {url[:80]}...")
        else:
            print(f"  ✗ {name}: no image found")

    print(f"Done. Updated {updated}/{len(pages)}.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=None)
    args = parser.parse_args()
    asyncio.run(main(args.limit))
