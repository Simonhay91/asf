import json
import logging
from fastapi import APIRouter, HTTPException

from backend.database import db
from backend.services.seo import (
    district_meta, city_meta, blog_meta, service_meta,
    jsonld_organization, jsonld_service, jsonld_breadcrumb, jsonld_article, jsonld_faq,
    ROBOTS_TXT, SITE_NAME, SITE_URL,
)
from backend.services.claude_service import parse_faq_from_markdown, _sanitize_phones

logger = logging.getLogger(__name__)
router = APIRouter(tags=["pages"])

SERVICES = {
    "asfaltirovanie-dvorov":                    {"name": "Асфальтирование дворов",        "price_from": 630,  "description": "Асфальтирование дворовых территорий под ключ в Москве и Подмосковье."},
    "asfaltirovanie-parkovok":                  {"name": "Асфальтирование парковок",      "price_from": 630,  "description": "Асфальтирование парковочных зон любой площади."},
    "asfaltirovanie-dorog":                     {"name": "Асфальтирование дорог",         "price_from": 630,  "description": "Укладка асфальта на дорогах и проездах."},
    "yamochnyj-remont":                         {"name": "Ямочный ремонт",                "price_from": 1200, "description": "Ямочный ремонт асфальта — быстро и с гарантией."},
    "asfaltovaya-kroshka":                      {"name": "Асфальтовая крошка",            "price_from": 350,  "description": "Укладка асфальтовой крошки для временного покрытия."},
    "asfaltirovanie-promyshlennyh-ploshhadok":  {"name": "Промышленные площадки",         "price_from": 630,  "description": "Асфальтирование складов, заводов и промышленных территорий."},
    "asfaltirovanie-sportivnyh-ploshhadok":     {"name": "Спортивные площадки",           "price_from": 630,  "description": "Укладка асфальта на кортах, беговых дорожках и спортплощадках."},
    "kompleksnoe-blagoustrojstvo-dvora-pod-klyuch": {"name": "Благоустройство двора",     "price_from": 350,  "description": "Комплексное благоустройство: дренаж, бордюры, разметка, озеленение."},
}


@router.get("/api/page/moskva/{okrug}/{slug}")
async def get_district_page(okrug: str, slug: str):
    page = await db.generated_pages.find_one({"slug": slug, "type": "district"}, {"_id": 0})
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")

    district = await db.moscow_districts.find_one({"slug": slug}, {"_id": 0})
    district_name = district["name"] if district else slug
    okrug_name = district["okrug_name"] if district else okrug

    meta = district_meta(district_name, okrug_name, okrug, slug)

    breadcrumb = jsonld_breadcrumb([
        ("Главная", "/"),
        ("Москва", "/moskva/"),
        (okrug_name, f"/moskva/{okrug}/"),
        (district_name, f"/moskva/{okrug}/{slug}/"),
    ])

    jsonld = [jsonld_organization(), breadcrumb]
    if page.get("style_page") == 5:
        faq_pairs = parse_faq_from_markdown(page.get("page_content", ""))
        if faq_pairs:
            jsonld.append(jsonld_faq(faq_pairs))

    return {
        "meta": meta,
        "jsonld": jsonld,
        "content": _sanitize_phones(page.get("page_content", "")),
        "generated_at": page.get("generated_at"),
    }


@router.get("/api/page/podmoskovye/{slug}")
async def get_city_page(slug: str):
    page = await db.generated_pages.find_one({"slug": slug, "type": "city"}, {"_id": 0})
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")

    city = await db.podmoskovye_cities.find_one({"slug": slug}, {"_id": 0})
    city_name = city["name"] if city else slug

    meta = city_meta(city_name, slug)
    breadcrumb = jsonld_breadcrumb([
        ("Главная", "/"),
        ("Подмосковье", "/podmoskovye/"),
        (city_name, f"/podmoskovye/{slug}/"),
    ])

    return {
        "meta": meta,
        "jsonld": [jsonld_organization(), breadcrumb],
        "content": _sanitize_phones(page.get("page_content", "")),
        "generated_at": page.get("generated_at"),
        "image_url": page.get("image_url"),
    }


@router.get("/api/page/blog/{slug}")
async def get_blog_page(slug: str):
    page = await db.generated_pages.find_one({"slug": slug, "type": "blog"}, {"_id": 0})
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")

    title = page.get("title", slug)
    excerpt = page.get("meta_description", "")
    meta = blog_meta(title, excerpt, slug)
    generated_at = page.get("generated_at")

    jsonld = [
        jsonld_organization(),
        jsonld_breadcrumb([("Главная", "/"), ("Блог", "/blog/"), (title, f"/blog/{slug}/")]),
    ]
    if generated_at:
        jsonld.append(jsonld_article(title, excerpt, f"/blog/{slug}/", generated_at))

    return {
        "meta": meta,
        "jsonld": jsonld,
        "content": _sanitize_phones(page.get("page_content", "")),
        "generated_at": generated_at,
        "image_url": page.get("image_url"),
    }


@router.get("/api/page/uslugi/{slug}")
async def get_service_page(slug: str):
    service = SERVICES.get(slug)
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    meta = service_meta(service["name"], slug, service["price_from"])
    service_url = f"/uslugi/{slug}/"

    # Try to load AI-generated content from DB
    page = await db.generated_pages.find_one({"slug": slug, "type": {"$in": ["service", "blog"]}}, {"_id": 0})
    content = _sanitize_phones(page.get("page_content", "")) if page else ""
    reviews = page.get("reviews", []) if page else []
    generated_at = page.get("generated_at") if page else None

    jsonld = [
        jsonld_organization(),
        jsonld_service(
            service["name"],
            service["description"],
            service["price_from"],
            service_url,
            reviews=reviews,
        ),
        jsonld_breadcrumb([
            ("Главная", "/"),
            ("Услуги", "/uslugi/"),
            (service["name"], service_url),
        ]),
    ]

    if content:
        faq_pairs = parse_faq_from_markdown(content)
        if faq_pairs:
            jsonld.append(jsonld_faq(faq_pairs))

    return {
        "meta": meta,
        "jsonld": jsonld,
        "content": content,
        "generated_at": generated_at,
        "has_ai_content": bool(content),
        "image_url": page.get("image_url") if page else None,
    }


@router.get("/api/pages/list")
async def list_pages(page_type: str = None, limit: int = 50, skip: int = 0):
    query = {"type": page_type} if page_type else {}
    pages = await db.generated_pages.find(
        query, {"_id": 0, "page_content": 0}
    ).sort("generated_at", -1).skip(skip).limit(limit).to_list(limit)
    total = await db.generated_pages.count_documents(query)
    return {"pages": pages, "total": total}


@router.get("/api/blog/recent")
async def recent_blogs(limit: int = 4, exclude: str = None):
    query: dict = {"type": "blog"}
    if exclude:
        query["slug"] = {"$ne": exclude}
    posts = await db.generated_pages.find(
        query, {"_id": 0, "slug": 1, "name": 1, "title": 1, "meta_description": 1, "image_url": 1, "url": 1, "generated_at": 1}
    ).sort("generated_at", -1).limit(limit).to_list(limit)
    return {"posts": posts}


@router.get("/api/districts")
async def list_districts(status: str = None, limit: int = 50, skip: int = 0):
    query = {"status": status} if status else {}
    items = await db.moscow_districts.find(
        query, {"_id": 0}
    ).sort("priority_order", 1).skip(skip).limit(limit).to_list(limit)
    total = await db.moscow_districts.count_documents(query)
    return {"items": items, "total": total}


@router.get("/api/cities")
async def list_cities(status: str = None, limit: int = 50, skip: int = 0):
    query = {"status": status} if status else {}
    items = await db.podmoskovye_cities.find(
        query, {"_id": 0}
    ).sort("priority_order", 1).skip(skip).limit(limit).to_list(limit)
    total = await db.podmoskovye_cities.count_documents(query)
    return {"items": items, "total": total}
