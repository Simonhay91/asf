"""
autopost.py — daily content generation scheduler for РусскийАсфальт.

Usage:
    python autopost.py                  # run once now
    python autopost.py --schedule       # run daily at 09:00 Moscow time

The daily run picks content in a balanced round-robin across 3 clusters:
  Day 1: blog topic  + moscow district
  Day 2: blog topic  + podmoskovye city
  Day 3: blog topic  + moscow district
  ...

Run in background: nohup python autopost.py --schedule >> logs/autopost.log 2>&1 &
"""

import asyncio
import argparse
import logging
import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path

# Make sure project root is on path
sys.path.insert(0, str(Path(__file__).parent))

from backend.database import init_db
from backend.services.generate import generate_next, generate_cities_by_region
from backend.services.telegram_service import notify

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s — %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("autopost")

MOSCOW_TZ = timezone(timedelta(hours=3))
DAILY_HOUR = 9  # 09:00 Moscow time


async def run_daily() -> None:
    """Execute one balanced daily generation run."""
    now = datetime.now(MOSCOW_TZ)
    # Alternate geo cluster by day-of-year (even → moscow, odd → podmoskovye)
    geo_type = "moscow" if now.timetuple().tm_yday % 2 == 0 else "podmoskovye"

    logger.info(f"Daily run started: blog + {geo_type}")
    await notify(f"🕘 Автопостинг запущен ({now.strftime('%d.%m %H:%M')} МСК)")

    # 1. Blog topic (technical / business / local / problems / inspiration / service_blog / landscaping)
    blog_result = await generate_next("blog")
    blog_names = [g.get("title", g.get("name", "?")) for g in blog_result.get("generated", [])]
    logger.info(f"Blog: {blog_names}")

    # 2. Geo page (district or city)
    geo_result = await generate_next(geo_type)
    geo_names = [g.get("name", "?") for g in geo_result.get("generated", [])]
    logger.info(f"Geo ({geo_type}): {geo_names}")

    all_generated = blog_names + geo_names
    if all_generated:
        await notify(f"✅ Автопостинг завершён:\n" + "\n".join(f"  • {n}" for n in all_generated))
    else:
        await notify("⚠️ Автопостинг: нет pending элементов в очереди")

    logger.info("Daily run complete")


async def schedule_loop() -> None:
    """Wait until 09:00 Moscow time, then run daily in an infinite loop."""
    logger.info("Scheduler started — waiting for 09:00 MSK")
    while True:
        now = datetime.now(MOSCOW_TZ)
        next_run = now.replace(hour=DAILY_HOUR, minute=0, second=0, microsecond=0)
        if now >= next_run:
            next_run += timedelta(days=1)
        wait_seconds = (next_run - now).total_seconds()
        logger.info(f"Next run at {next_run.strftime('%Y-%m-%d %H:%M')} MSK (in {wait_seconds/3600:.1f}h)")
        await asyncio.sleep(wait_seconds)
        try:
            await run_daily()
        except Exception as e:
            logger.error(f"Daily run failed: {e}", exc_info=True)
            await notify(f"❌ Автопостинг: ошибка\n{str(e)[:300]}")


async def seed_new_topics() -> None:
    """Insert topics 101-150 from blog_topics.json into MongoDB (upsert)."""
    import json
    from pathlib import Path
    from backend.database import db

    seed_file = Path(__file__).parent / "seed" / "blog_topics.json"
    all_topics = json.loads(seed_file.read_text(encoding="utf-8"))
    new_topics = [t for t in all_topics if t["id"] >= 101]

    inserted = 0
    for topic in new_topics:
        result = await db.blog_topics.update_one(
            {"slug": topic["slug"]},
            {"$setOnInsert": topic},
            upsert=True,
        )
        if result.upserted_id:
            inserted += 1

    logger.info(f"Seeded {inserted} new topics (skipped {len(new_topics) - inserted} existing)")
    print(f"✅ Seeded {inserted} new topics into blog_topics collection")


async def main() -> None:
    parser = argparse.ArgumentParser(description="РусскийАсфальт autopost scheduler")
    parser.add_argument("--schedule", action="store_true", help="Run on daily schedule at 09:00 MSK")
    parser.add_argument("--seed", action="store_true", help="Seed new topics (101-150) into MongoDB")
    parser.add_argument("--region", type=str, help="Generate all pending cities in region (e.g. север, запад)")
    args = parser.parse_args()

    await init_db()

    if args.seed:
        await seed_new_topics()
    elif args.schedule:
        await schedule_loop()
    elif args.region:
        result = await generate_cities_by_region(args.region)
        count = len(result.get("generated", []))
        print(f"✅ Регион «{args.region}»: {count} городов сгенерировано")
        for g in result.get("generated", []):
            print(f"  • {g.get('name')} → {g.get('page_url')}")
    else:
        await run_daily()


if __name__ == "__main__":
    asyncio.run(main())
