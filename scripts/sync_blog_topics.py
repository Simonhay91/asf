"""Run once on server: python3 scripts/sync_blog_topics.py
Inserts new blog topics from seed/blog_topics.json into MongoDB (skips existing)."""
import asyncio
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from backend.database import db, init_db


async def main():
    await init_db()

    seed_file = Path(__file__).parent.parent / "seed" / "blog_topics.json"
    data = json.loads(seed_file.read_text(encoding="utf-8"))

    inserted = 0
    skipped = 0
    for topic in data:
        existing = await db.blog_topics.find_one({"id": topic["id"]})
        if existing:
            skipped += 1
            continue
        await db.blog_topics.insert_one(topic)
        inserted += 1

    total = await db.blog_topics.count_documents({})
    print(f"Done — inserted: {inserted}, skipped: {skipped}, total in DB: {total}")


asyncio.run(main())
