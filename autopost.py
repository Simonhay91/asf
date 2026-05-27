"""
autopost.py — content generation scheduler for РусскийАсфальт.

Usage:
    python autopost.py                      # once: 2 Moscow districts
    python autopost.py --count 1            # once: 1 district
    python autopost.py --schedule           # 09:00 & 18:00 MSK daily, 2× moscow each
    python autopost.py --blog               # once: blog + 1 moscow (legacy)

Cron (server, 2× per day at 09:00 and 18:00 MSK):
    0 6,15 * * * cd /var/www/russkiyasphalt && ./scripts/cron-moscow.sh >> logs/cron-moscow.log 2>&1

Or use supervisord program [program:autopost] (see supervisord.conf).
"""

import asyncio
import argparse
import logging
import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(__file__).parent
sys.path.insert(0, str(ROOT))
load_dotenv(ROOT / ".env")

from backend.database import init_db
from backend.services.generate import generate_next, generate_moscow_districts, generate_cities_by_region
from backend.services.telegram_service import notify

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s — %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("autopost")

MOSCOW_TZ = timezone(timedelta(hours=3))
# 09:00 and 18:00 Moscow — 2 district generations per run → 4 districts/day
SCHEDULE_HOURS_MSK = (9, 18)
MOSCOW_PER_RUN = 2


async def run_moscow_batch(count: int = MOSCOW_PER_RUN) -> None:
    """Generate `count` Moscow district pages."""
    now = datetime.now(MOSCOW_TZ)
    logger.info(f"Moscow batch started: count={count}")
    await notify(f"🕘 Генерация Москва ×{count} ({now.strftime('%d.%m %H:%M')} МСК)")

    result = await generate_moscow_districts(count)
    generated = result.get("generated", [])
    names = [g.get("name", "?") for g in generated]

    if names:
        await notify("✅ Москва сгенерировано:\n" + "\n".join(f"  • {n}" for n in names))
        logger.info(f"Moscow done: {names}")
    else:
        await notify("⚠️ Москва: нет pending районов в очереди")
        logger.warning("Moscow: nothing pending")

    logger.info("Moscow batch complete")


async def run_daily_legacy() -> None:
    """Blog + one Moscow district (old behaviour)."""
    now = datetime.now(MOSCOW_TZ)
    logger.info("Legacy daily run: blog + moscow")
    await notify(f"🕘 Автопостинг (blog+москва) ({now.strftime('%d.%m %H:%M')} МСК)")

    blog_result = await generate_next("blog")
    blog_names = [g.get("title", g.get("name", "?")) for g in blog_result.get("generated", [])]

    geo_result = await generate_next("moscow")
    geo_names = [g.get("name", "?") for g in geo_result.get("generated", [])]

    all_generated = blog_names + geo_names
    if all_generated:
        await notify("✅ Автопостинг завершён:\n" + "\n".join(f"  • {n}" for n in all_generated))
    else:
        await notify("⚠️ Автопостинг: нет pending элементов в очереди")


def _next_run_at(now: datetime) -> datetime:
    """Next scheduled slot among SCHEDULE_HOURS_MSK today or tomorrow."""
    candidates = []
    for hour in SCHEDULE_HOURS_MSK:
        slot = now.replace(hour=hour, minute=0, second=0, microsecond=0)
        if slot > now:
            candidates.append(slot)
    if candidates:
        return min(candidates)
    tomorrow = now + timedelta(days=1)
    return tomorrow.replace(hour=SCHEDULE_HOURS_MSK[0], minute=0, second=0, microsecond=0)


async def schedule_loop() -> None:
    """Run Moscow ×2 at 09:00 and 18:00 MSK every day."""
    hours = ", ".join(f"{h:02d}:00" for h in SCHEDULE_HOURS_MSK)
    logger.info(f"Scheduler started — Moscow ×{MOSCOW_PER_RUN} at {hours} MSK")
    await notify(f"📅 Автопостинг: Москва ×{MOSCOW_PER_RUN}, {hours} МСК")

    while True:
        now = datetime.now(MOSCOW_TZ)
        next_run = _next_run_at(now)
        wait_seconds = (next_run - now).total_seconds()
        logger.info(
            f"Next run at {next_run.strftime('%Y-%m-%d %H:%M')} MSK "
            f"(in {wait_seconds / 3600:.1f}h)"
        )
        await asyncio.sleep(wait_seconds)
        try:
            await run_moscow_batch(MOSCOW_PER_RUN)
        except Exception as e:
            logger.error(f"Scheduled run failed: {e}", exc_info=True)
            await notify(f"❌ Автопостинг: ошибка\n{str(e)[:300]}")


async def seed_new_topics() -> None:
    """Insert topics 101-150 from blog_topics.json into MongoDB (upsert)."""
    import json
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
    parser.add_argument(
        "--schedule",
        action="store_true",
        help=f"Daily at {SCHEDULE_HOURS_MSK} MSK, {MOSCOW_PER_RUN} districts per run",
    )
    parser.add_argument("--blog", action="store_true", help="Legacy: blog + 1 moscow")
    parser.add_argument("--seed", action="store_true", help="Seed new topics (101-150)")
    parser.add_argument("--region", type=str, help="Generate all pending cities in region")
    parser.add_argument(
        "--count",
        type=int,
        default=MOSCOW_PER_RUN,
        help=f"Moscow districts per run (default {MOSCOW_PER_RUN})",
    )
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
    elif args.blog:
        await run_daily_legacy()
    else:
        await run_moscow_batch(max(1, min(args.count, 5)))


if __name__ == "__main__":
    asyncio.run(main())
