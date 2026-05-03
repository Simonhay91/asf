import logging
import random
from datetime import datetime, timedelta
from typing import Optional

from backend.database import db
from backend.services.claude_service import (
    generate_district_page,
    generate_city_page,
    generate_blog_article,
    generate_topic_article,
    generate_service_page,
    SERVICE_META,
)
from backend.services.perplexity import research_location, research_topic
from backend.services.pexels import fetch_image, fetch_images
from backend.services.yandex import ping_urls
from backend.services.telegram_service import notify, notify_page
from backend.services.seo import build_sitemap

logger = logging.getLogger(__name__)

RESEARCH_TTL_DAYS = 30
SITE_URL = "https://russkiyasphalt.ru"


# ─── PUBLIC API ───

async def generate_next(location_type: str = "both") -> dict:
    """
    location_type: "moscow" | "podmoskovye" | "both" | "blog" | "uslugi"
    """
    generated = []

    if location_type == "blog":
        result = await _process_next_topic()
        if result:
            generated.append(result)
    elif location_type == "uslugi":
        results = await generate_all_services()
        generated.extend(results)
    else:
        if location_type in ("moscow", "both"):
            result = await _process_next_district()
            if result:
                generated.append(result)

        if location_type in ("podmoskovye", "both"):
            result = await _process_next_city()
            if result:
                generated.append(result)

        # Also generate one blog topic on "both" runs
        if location_type == "both":
            result = await _process_next_topic()
            if result:
                generated.append(result)

    if not generated:
        return {"status": "nothing_pending"}

    await _rebuild_sitemap()
    return {"status": "ok", "generated": generated}


async def generate_cities_by_region(region: str) -> dict:
    """Generate all pending cities in a given region (e.g. 'север', 'запад')."""
    cities = await db.podmoskovye_cities.find(
        {"region": region, "status": "pending"},
        sort=[("priority_order", 1)],
    ).to_list(None)

    if not cities:
        return {"status": "nothing_pending", "region": region, "generated": []}

    await notify(f"⏳ Генерирую {len(cities)} городов региона «{region}»...")
    results = []
    for city in cities:
        try:
            await db.podmoskovye_cities.update_one(
                {"slug": city["slug"]}, {"$set": {"status": "in_progress"}}
            )
            result = await _run_city(city)
            if result:
                results.append(result)
        except Exception as e:
            logger.error(f"Region gen failed for {city['name']}: {e}")
            await db.podmoskovye_cities.update_one(
                {"slug": city["slug"]}, {"$set": {"status": "pending"}}
            )

    await _rebuild_sitemap()
    return {"status": "ok", "region": region, "generated": results}


async def generate_all_services():
    """Generate (or regenerate) all 5 service pages."""
    results = []
    for slug in SERVICE_META:
        result = await _run_service(slug)
        if result:
            results.append(result)
    return results


async def regenerate_service(slug: str) -> dict:
    """Force regenerate a single service page by slug."""
    if slug not in SERVICE_META:
        raise ValueError(f"Unknown service slug: {slug}")
    await db.generated_pages.delete_many({"slug": slug, "type": "service"})
    result = await _run_service(slug)
    if result:
        await _rebuild_sitemap()
    return {"status": "ok", "generated": [result] if result else []}


async def regenerate_slug(slug: str) -> dict:
    """Force regenerate a page by slug. Used by /regenerate Telegram command."""
    district = await db.moscow_districts.find_one({"slug": slug})
    city = await db.podmoskovye_cities.find_one({"slug": slug})

    if not district and not city:
        raise ValueError(f"Slug not found: {slug}")

    collection = db.moscow_districts if district else db.podmoskovye_cities
    location_type = "moscow" if district else "podmoskovye"

    # Reset status and remove old content
    await collection.update_one({"slug": slug}, {"$set": {"status": "pending", "generated_at": None}})
    await db.generated_pages.delete_many({"slug": slug})
    await db.generated_pages.delete_many({"slug": {"$regex": f"^asfalt-{slug}-"}})
    await db.research_cache.delete_one({"location_slug": slug})

    # Process specifically this slug
    if district:
        result = await _process_district(slug)
    else:
        result = await _process_city(slug)

    if result:
        await _rebuild_sitemap()
    return {"status": "ok", "generated": [result] if result else []}


async def refresh_all_images() -> dict:
    """Re-fetch Pexels images for all blog pages (does not touch district/city pages)."""
    pages = await db.generated_pages.find(
        {"type": {"$in": ["blog", "service"]}},
        {"slug": 1, "type": 1, "category": 1, "_id": 0},
    ).to_list(None)

    updated = 0
    failed = 0
    for p in pages:
        slug = p["slug"]
        category = p.get("category", "")
        loc_type = "service" if p["type"] == "service" else ""
        try:
            image_url = await fetch_image(slug, loc_type, category=category)
            if image_url:
                await db.generated_pages.update_one(
                    {"slug": slug, "type": p["type"]},
                    {"$set": {"image_url": image_url}},
                )
                updated += 1
        except Exception as e:
            logger.error(f"refresh_all_images failed for {slug}: {e}")
            failed += 1

    await notify(f"🖼 Изображения обновлены: {updated} страниц, {failed} ошибок")
    return {"updated": updated, "failed": failed}


async def get_status() -> dict:
    mo_done = await db.moscow_districts.count_documents({"status": "done"})
    mo_total = await db.moscow_districts.count_documents({})
    pm_done = await db.podmoskovye_cities.count_documents({"status": "done"})
    pm_total = await db.podmoskovye_cities.count_documents({})
    return {
        "moscow": {"done": mo_done, "total": mo_total, "pending": mo_total - mo_done},
        "podmoskovye": {"done": pm_done, "total": pm_total, "pending": pm_total - pm_done},
        "total_pages": await db.generated_pages.count_documents({}),
    }


async def get_next_queue(n: int = 5) -> dict:
    moscow = await db.moscow_districts.find(
        {"status": "pending"}, {"name": 1, "priority_order": 1}
    ).sort("priority_order", 1).limit(n).to_list(n)
    podmoskovye = await db.podmoskovye_cities.find(
        {"status": "pending"}, {"name": 1, "priority_order": 1}
    ).sort("priority_order", 1).limit(n).to_list(n)
    return {
        "moscow": [d["name"] for d in moscow],
        "podmoskovye": [c["name"] for c in podmoskovye],
    }


# ─── INTERNAL ───

async def _process_next_district() -> Optional[dict]:
    district = await db.moscow_districts.find_one_and_update(
        {"status": "pending"},
        {"$set": {"status": "in_progress"}},
        sort=[("priority_order", 1)],
        return_document=True,
    )
    if not district:
        return None
    return await _run_district(district)


async def _process_next_city() -> Optional[dict]:
    city = await db.podmoskovye_cities.find_one_and_update(
        {"status": "pending"},
        {"$set": {"status": "in_progress"}},
        sort=[("priority_order", 1)],
        return_document=True,
    )
    if not city:
        return None
    return await _run_city(city)


async def _process_district(slug: str) -> Optional[dict]:
    """Used by regenerate — locks specific slug."""
    district = await db.moscow_districts.find_one_and_update(
        {"slug": slug, "status": "pending"},
        {"$set": {"status": "in_progress"}},
        return_document=True,
    )
    if not district:
        return None
    return await _run_district(district)


async def _process_city(slug: str) -> Optional[dict]:
    city = await db.podmoskovye_cities.find_one_and_update(
        {"slug": slug, "status": "pending"},
        {"$set": {"status": "in_progress"}},
        return_document=True,
    )
    if not city:
        return None
    return await _run_city(city)


async def _run_district(district: dict) -> Optional[dict]:
    slug = district["slug"]
    name = district["name"]
    okrug = district["okrug"]

    try:
        research = await _get_research(slug, name, "district")
        style_id = await _next_style_id("moscow_districts")

        page = await generate_district_page(district, research, style_id)
        blog = await generate_blog_article(name, "district", research, style_id)

        page_url = f"/moskva/{okrug}/{slug}/"
        blog_slug = f"asfalt-{slug}"
        blog_url = f"/blog/{blog_slug}/"
        now = datetime.utcnow()

        city_image_urls = await fetch_images(slug, "district", location_name=name, count=3)
        blog_image_urls = await fetch_images(blog_slug, "", count=3)
        image_url = city_image_urls[0] if city_image_urls else None

        await db.generated_pages.insert_one({
            "slug": slug, "type": "district", "name": name,
            "title": page["meta_title"], "url": page_url,
            "page_content": page["content"],
            "meta_title": page["meta_title"], "meta_description": page["meta_description"],
            "generated_at": now, "style_page": style_id, "indexed": False, "indexed_at": None,
            "image_url": image_url, "image_urls": city_image_urls,
        })
        await db.generated_pages.insert_one({
            "slug": blog_slug, "type": "blog", "name": blog.get("topic", f"Блог — {name}"),
            "title": blog["meta_title"], "url": blog_url,
            "page_content": blog["content"],
            "meta_title": blog["meta_title"], "meta_description": blog["meta_description"],
            "generated_at": now, "style_blog": style_id, "indexed": False, "indexed_at": None,
            "image_url": blog_image_urls[0] if blog_image_urls else image_url,
            "image_urls": blog_image_urls,
        })
        await db.moscow_districts.update_one(
            {"slug": slug},
            {"$set": {"status": "done", "style_page": style_id, "style_blog": style_id,
                      "generated_at": now, "page_url": page_url, "blog_url": blog_url}},
        )

        await ping_urls([f"{SITE_URL}{page_url}", f"{SITE_URL}{blog_url}"])
        await notify_page(
            name=name, page_type="district", url=page_url, image_url=image_url,
            meta_title=page["meta_title"], meta_description=page["meta_description"],
        )
        logger.info(f"Done: district {name}")
        return {"type": "district", "name": name, "page_url": page_url, "blog_url": blog_url}

    except Exception as e:
        logger.error(f"Error generating district {name}: {e}", exc_info=True)
        await db.moscow_districts.update_one({"slug": slug}, {"$set": {"status": "pending"}})
        await notify(f"❌ Ошибка: {name}\n{str(e)[:200]}")
        raise


async def _run_city(city: dict) -> Optional[dict]:
    slug = city["slug"]
    name = city["name"]

    try:
        research = await _get_research(slug, name, "city")
        style_id = await _next_style_id("podmoskovye_cities")

        page = await generate_city_page(city, research, style_id)
        blog = await generate_blog_article(name, "city", research, style_id)

        page_url = f"/podmoskovye/{slug}/"
        blog_slug = f"asfalt-{slug}"
        blog_url = f"/blog/{blog_slug}/"
        now = datetime.utcnow()

        city_image_urls = await fetch_images(slug, "city", location_name=name, count=3)
        blog_image_urls = await fetch_images(blog_slug, "", count=3)
        image_url = city_image_urls[0] if city_image_urls else None

        await db.generated_pages.insert_one({
            "slug": slug, "type": "city", "name": name,
            "title": page["meta_title"], "url": page_url,
            "page_content": page["content"],
            "meta_title": page["meta_title"], "meta_description": page["meta_description"],
            "generated_at": now, "style_page": style_id, "indexed": False, "indexed_at": None,
            "image_url": image_url, "image_urls": city_image_urls,
        })
        await db.generated_pages.insert_one({
            "slug": blog_slug, "type": "blog", "name": blog.get("topic", f"Блог — {name}"),
            "title": blog["meta_title"], "url": blog_url,
            "page_content": blog["content"],
            "meta_title": blog["meta_title"], "meta_description": blog["meta_description"],
            "generated_at": now, "style_blog": style_id, "indexed": False, "indexed_at": None,
            "image_url": blog_image_urls[0] if blog_image_urls else image_url,
            "image_urls": blog_image_urls,
        })
        await db.podmoskovye_cities.update_one(
            {"slug": slug},
            {"$set": {"status": "done", "style_page": style_id, "style_blog": style_id,
                      "generated_at": now, "page_url": page_url, "blog_url": blog_url}},
        )

        await ping_urls([f"{SITE_URL}{page_url}", f"{SITE_URL}{blog_url}"])
        await notify_page(
            name=name, page_type="city", url=page_url, image_url=image_url,
            meta_title=page["meta_title"], meta_description=page["meta_description"],
        )
        logger.info(f"Done: city {name}")
        return {"type": "city", "name": name, "page_url": page_url, "blog_url": blog_url}

    except Exception as e:
        logger.error(f"Error generating city {name}: {e}", exc_info=True)
        await db.podmoskovye_cities.update_one({"slug": slug}, {"$set": {"status": "pending"}})
        await notify(f"❌ Ошибка: {name}\n{str(e)[:200]}")
        raise


async def _get_research(slug: str, name: str, location_type: str) -> str:
    cache = await db.research_cache.find_one({"location_slug": slug})
    if cache:
        logger.info(f"Research cache hit: {slug}")
        return cache["research_data"]

    logger.info(f"Research cache miss, fetching: {slug}")
    research = await research_location(name, location_type)
    await db.research_cache.insert_one({
        "location_slug": slug,
        "location_type": location_type,
        "research_data": research,
        "created_at": datetime.utcnow(),
        "expires_at": datetime.utcnow() + timedelta(days=RESEARCH_TTL_DAYS),
    })
    return research


async def _next_style_id(collection_name: str) -> int:
    last = await db[collection_name].find_one(
        {"status": "done", "style_page": {"$exists": True}},
        sort=[("generated_at", -1)],
    )
    last_style = last.get("style_page", 0) if last else 0
    choices = [i for i in range(1, 8) if i != last_style]
    return random.choice(choices)


async def _process_next_topic() -> Optional[dict]:
    topic = await db.blog_topics.find_one_and_update(
        {"status": "pending"},
        {"$set": {"status": "in_progress"}},
        sort=[("priority_order", 1)],
        return_document=True,
    )
    if not topic:
        return None
    return await _run_topic(topic)


async def _run_topic(topic: dict) -> Optional[dict]:
    slug = topic["slug"]
    title = topic["title"]
    category = topic.get("category", "technical")
    try:
        research = await research_topic(title, category)
        article = await generate_topic_article(topic, research=research)
        image_urls = await fetch_images(slug, "", category=category, count=3)
        image_url = image_urls[0] if image_urls else None
        now = datetime.utcnow()
        blog_url = f"/blog/{slug}/"

        await db.generated_pages.update_one(
            {"slug": slug},
            {"$set": {
                "slug": slug, "type": "blog", "name": title,
                "title": article["meta_title"], "url": blog_url,
                "page_content": article["content"],
                "meta_title": article["meta_title"],
                "meta_description": article["meta_description"],
                "generated_at": now, "indexed": False, "indexed_at": None,
                "image_url": image_url, "image_urls": image_urls,
            }},
            upsert=True,
        )
        await db.blog_topics.update_one(
            {"slug": slug},
            {"$set": {"status": "done", "generated_at": now}},
        )
        await ping_urls([f"{SITE_URL}{blog_url}"])
        await notify_page(
            name=title, page_type="blog", url=blog_url, image_url=image_url,
            meta_title=article["meta_title"], meta_description=article["meta_description"],
        )
        logger.info(f"Done: topic {title[:60]}")
        return {"type": "blog_topic", "title": title, "blog_url": blog_url}

    except Exception as e:
        logger.error(f"Error generating topic {title}: {e}", exc_info=True)
        await db.blog_topics.update_one({"slug": slug}, {"$set": {"status": "pending"}})
        raise


async def _run_service(slug: str) -> Optional[dict]:
    try:
        page = await generate_service_page(slug)
        service_url = f"/uslugi/{slug}/"
        now = datetime.utcnow()

        image_urls = await fetch_images(slug, "service", count=3)
        image_url = image_urls[0] if image_urls else None

        await db.generated_pages.update_one(
            {"slug": slug, "type": "service"},
            {"$set": {
                "slug": slug,
                "type": "service",
                "name": page["service_name"],
                "title": page["meta_title"],
                "url": service_url,
                "page_content": page["content"],
                "meta_title": page["meta_title"],
                "meta_description": page["meta_description"],
                "reviews": page.get("reviews", []),
                "generated_at": now,
                "indexed": False,
                "indexed_at": None,
                "image_url": image_url,
                "image_urls": image_urls,
            }},
            upsert=True,
        )

        await ping_urls([f"{SITE_URL}{service_url}"])
        await notify_page(
            name=page["service_name"], page_type="service", url=service_url, image_url=image_url,
            meta_title=page["meta_title"], meta_description=page["meta_description"],
        )
        logger.info(f"Done: service {slug}")
        return {"type": "service", "name": page["service_name"], "url": service_url}

    except Exception as e:
        logger.error(f"Error generating service {slug}: {e}", exc_info=True)
        await notify(f"❌ Ошибка услуга: {slug}\n{str(e)[:200]}")
        raise


async def _rebuild_sitemap() -> None:
    try:
        pages = await db.generated_pages.find(
            {}, {"url": 1, "type": 1, "generated_at": 1, "_id": 0}
        ).to_list(10000)
        xml = build_sitemap(pages)
        await db.settings.update_one(
            {"key": "sitemap"},
            {"$set": {"xml": xml, "updated_at": datetime.utcnow()}},
            upsert=True,
        )
        logger.info("Sitemap rebuilt")
    except Exception as e:
        logger.error(f"Sitemap rebuild failed: {e}", exc_info=True)
