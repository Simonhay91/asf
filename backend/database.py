import os
import json
import logging
from pathlib import Path

from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGODB_URL)
db = client.russkiyasphalt


async def init_db() -> None:
    """Create indexes and seed collections if empty."""
    # TTL index on research_cache
    await db.research_cache.create_index("expires_at", expireAfterSeconds=0)
    await db.research_cache.create_index("location_slug", unique=True)

    # Indexes for fast lookups
    await db.moscow_districts.create_index("slug", unique=True)
    await db.moscow_districts.create_index([("status", 1), ("priority_order", 1)])
    await db.podmoskovye_cities.create_index("slug", unique=True)
    await db.podmoskovye_cities.create_index([("status", 1), ("priority_order", 1)])
    await db.generated_pages.create_index("slug", unique=True)
    await db.generated_pages.create_index("type")
    await db.generated_pages.create_index("url")
    await db.used_images.create_index("photo_id", unique=True)
    await db.used_images.create_index("slug")

    await _seed_if_empty()
    logger.info("DB initialized")


async def _seed_if_empty() -> None:
    seed_dir = Path(__file__).parent.parent / "seed"

    if await db.moscow_districts.count_documents({}) == 0:
        seed_file = seed_dir / "moscow_districts.json"
        if seed_file.exists():
            data = json.loads(seed_file.read_text(encoding="utf-8"))
            await db.moscow_districts.insert_many(data)
            logger.info(f"Seeded {len(data)} Moscow districts")

    if await db.podmoskovye_cities.count_documents({}) == 0:
        seed_file = seed_dir / "podmoskovye_cities.json"
        if seed_file.exists():
            data = json.loads(seed_file.read_text(encoding="utf-8"))
            await db.podmoskovye_cities.insert_many(data)
            logger.info(f"Seeded {len(data)} Podmoskovye cities")

    if await db.blog_topics.count_documents({}) == 0:
        seed_file = seed_dir / "blog_topics.json"
        if seed_file.exists():
            data = json.loads(seed_file.read_text(encoding="utf-8"))
            await db.blog_topics.insert_many(data)
            await db.blog_topics.create_index("slug", unique=True)
            await db.blog_topics.create_index([("status", 1), ("priority_order", 1)])
            logger.info(f"Seeded {len(data)} blog topics")

    if await db.generated_pages.count_documents({"type": "blog"}) == 0:
        seed_file = seed_dir / "blog_posts.json"
        if seed_file.exists():
            from datetime import datetime
            data = json.loads(seed_file.read_text(encoding="utf-8"))
            for post in data:
                post["generated_at"] = datetime.fromisoformat(post["generated_at"])
            await db.generated_pages.insert_many(data)
            logger.info(f"Seeded {len(data)} blog posts")
