import os
import re
import xml.etree.ElementTree as ET
from datetime import datetime
from typing import Optional

SITE_URL = "https://russkiyasphalt.ru"
SITE_NAME = "РусскийАсфальт"
DEFAULT_IMAGE = f"{SITE_URL}/og-image.svg"
COMPANY_PHONE = os.getenv("COMPANY_PHONE", "")
COMPANY_EMAIL = os.getenv("COMPANY_EMAIL", "info@russkiyasphalt.ru")

SERVICE_SLUGS = frozenset({
    "asfaltirovanie-dvorov",
    "asfaltirovanie-parkovok",
    "asfaltirovanie-dorog",
    "yamochnyj-remont",
    "asfaltovaya-kroshka",
    "asfaltirovanie-promyshlennyh-ploshhadok",
    "asfaltirovanie-sportivnyh-ploshhadok",
    "kompleksnoe-blagoustrojstvo-dvora-pod-klyuch",
})

_SLUG_SEGMENT = re.compile(r"^[a-z0-9-]+$")


# ─── META TAGS ───

def normalize_path(path: str) -> str:
    if path.startswith("http"):
        return path
    p = path if path.startswith("/") else f"/{path}"
    if p != "/" and not p.endswith("/"):
        p += "/"
    return p


def build_meta(title: str, description: str, url: str, image: str = DEFAULT_IMAGE, page_type: str = "website") -> dict:
    if not url or not url.strip():
        raise ValueError("build_meta: empty url")
    if not (description or "").strip():
        description = (
            f"{title}. Асфальтирование в Москве и Подмосковье под ключ — "
            f"цены от 630 руб/м², гарантия 5 лет."
        )
    path = normalize_path(url.strip())
    canonical = path if path.startswith("http") else f"{SITE_URL}{path}"
    return {
        "title": title,
        "description": description[:160],
        "canonical": canonical,
        "og:title": title,
        "og:description": description[:200],
        "og:url": canonical,
        "og:image": image,
        "og:type": page_type,
        "og:site_name": SITE_NAME,
        "og:locale": "ru_RU",
        "twitter:card": "summary_large_image",
        "twitter:title": title,
        "twitter:description": description[:200],
        "twitter:image": image,
    }


# Moscow administrative okrugs (slug → full name, short label, district count)
MOSCOW_OKRUGS: dict[str, tuple[str, str, int]] = {
    "czao": ("Центральный административный округ", "ЦАО", 11),
    "sao": ("Северный административный округ", "САО", 15),
    "svao": ("Северо-Восточный административный округ", "СВАО", 16),
    "vao": ("Восточный административный округ", "ВАО", 16),
    "uvao": ("Юго-Восточный административный округ", "ЮВАО", 12),
    "yuao": ("Южный административный округ", "ЮАО", 13),
    "yuzsao": ("Юго-Западный административный округ", "ЮЗАО", 13),
    "zao": ("Западный административный округ", "ЗАО", 13),
    "szao": ("Северо-Западный административный округ", "СЗАО", 8),
    "zelenogradskij": ("Зеленоградский административный округ", "ЗелАО", 7),
}


def okrug_meta(okrug_name: str, okrug_short: str, okrug_slug: str, district_count: int) -> dict:
    # Title: «в ЮВАО» — грамматически корректно; полное название — в description
    title = f"Асфальтирование в {okrug_short} — от 630 руб/м² | {SITE_NAME}"
    description = (
        f"Асфальтирование дворов, площадок и парковок в {okrug_name} ({okrug_short}). "
        f"{district_count} районов, выезд замерщика в день обращения, цены от 630 руб/м² под ключ."
    )
    return build_meta(title, description, f"/moskva/{okrug_slug}/")


def district_meta(district_name: str, okrug_name: str, okrug: str, slug: str) -> dict:
    if not slug or not okrug:
        raise ValueError(f"district_meta: empty slug or okrug")
    title = f"Асфальтирование в {district_name} — от 630 руб/м² | {SITE_NAME}"
    description = (
        f"Асфальтирование в {district_name} ({okrug_name}) под ключ. "
        f"Выезд замерщика в день обращения, гарантия 5 лет. Цены от 630 руб/м²."
    )
    return build_meta(title, description, f"/moskva/{okrug}/{slug}/")


def city_meta(city_name: str, slug: str) -> dict:
    if not slug:
        raise ValueError("city_meta: empty slug")
    title = f"Асфальтирование в {city_name} — от 630 руб/м² | {SITE_NAME}"
    description = (
        f"Асфальтирование в {city_name} и Московской области под ключ. "
        f"Собственная техника, гарантия 5 лет. Выезд замерщика бесплатно."
    )
    return build_meta(title, description, f"/podmoskovye/{slug}/")


def blog_meta(title_text: str, excerpt: str, slug: str) -> dict:
    if not slug:
        raise ValueError("blog_meta: empty slug")
    if not (excerpt or "").strip():
        excerpt = (
            f"{title_text}: советы по асфальтированию в Москве и Подмосковье, "
            f"цены, технологии и опыт компании {SITE_NAME}."
        )
    # Blog posts that mirror a service page should canonicalize to /uslugi/.
    path = f"/uslugi/{slug}/" if slug in SERVICE_SLUGS else f"/blog/{slug}/"
    return build_meta(f"{title_text} | {SITE_NAME}", excerpt[:160], path, page_type="article")


def not_found_meta(path: str) -> dict:
    meta = build_meta(
        f"Страница не найдена — {SITE_NAME}",
        "Запрашиваемая страница не найдена. Асфальтирование в Москве и Подмосковье под ключ.",
        path,
    )
    meta["noindex"] = True
    return meta


def service_meta(service_name: str, slug: str, price_from: int) -> dict:
    if not slug:
        raise ValueError("service_meta: empty slug")
    title = f"{service_name} в Москве — от {price_from} руб/м² | {SITE_NAME}"
    description = f"{service_name} в Москве под ключ. Цена от {price_from} руб/м², гарантия 5 лет."
    return build_meta(title, description, f"/uslugi/{slug}/")


# ─── STATIC PAGE META (shared with SPA prerender) ───

HOME_META = build_meta(
    "Асфальтирование в Москве и Подмосковье — от 630 руб/м² | РусскийАсфальт",
    "Асфальтирование двора, парковок и дорог в Москве и Подмосковье под ключ. "
    "Цена от 630 руб/м². Выезд замерщика в день обращения, гарантия 5 лет.",
    "/",
)

KONTAKTY_META = build_meta(
    f"Контакты — {SITE_NAME}",
    "Офис: Москва, ул. Мясницкая, 41, стр. 5 (м. Красные Ворота). Телефон, email, режим работы. "
    "Выезд замерщика в день обращения.",
    "/kontakty/",
)

ABOUT_META = build_meta(
    f"О компании — {SITE_NAME}",
    "РусскийАсфальт: 15 лет асфальтирования в Москве и Подмосковье, собственная техника, "
    "гарантия 5 лет на все виды работ.",
    "/o-kompanii/",
)

BLOG_LIST_META = build_meta(
    "Блог об асфальтировании — РусскийАсфальт",
    "Статьи об асфальтировании: цены, технологии, советы по выбору подрядчика. "
    "Полезные материалы от профессионалов.",
    "/blog/",
)

MOSCOW_LIST_META = build_meta(
    "Асфальтирование в Москве — районы и округа | РусскийАсфальт",
    "Асфальтирование во всех районах Москвы под ключ. Выберите свой округ и район — "
    "выезд замерщика в день обращения, цены от 630 руб/м².",
    "/moskva/",
)

REGION_LIST_META = build_meta(
    "Асфальтирование в Подмосковье — города и районы | РусскийАсфальт",
    "Выполняем асфальтирование во всех городах Московской области. "
    "Выберите ваш город и узнайте условия и цены.",
    "/regiony/",
)

SERVICE_LIST_META = build_meta(
    "Услуги асфальтирования в Москве | РусскийАсфальт",
    "Асфальтирование дворов, парковок, дорог, ямочный ремонт в Москве и Подмосковье. "
    "Гарантия 5 лет, выезд замерщика в день обращения.",
    "/uslugi/",
)

PRICE_LIST_META = build_meta(
    "Цена асфальтирования площадки и двора в Москве — прайс от 630 ₽/м² | РусскийАсфальт",
    "Прайс на асфальтирование площадки, двора и территории под ключ в Москве: от 630 ₽/м² с материалом. "
    "Парковки, стоянки, ямочный ремонт от 1 200 ₽/м². Замер бесплатно.",
    "/prajs-list/",
)

STATIC_PAGE_META: dict[str, dict] = {
    "/": HOME_META,
    "/kontakty/": KONTAKTY_META,
    "/o-kompanii/": ABOUT_META,
    "/blog/": BLOG_LIST_META,
    "/moskva/": MOSCOW_LIST_META,
    "/regiony/": REGION_LIST_META,
    "/uslugi/": SERVICE_LIST_META,
    "/prajs-list/": PRICE_LIST_META,
}


# ─── JSON-LD ───

def jsonld_organization() -> dict:
    data = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": SITE_NAME,
        "url": SITE_URL,
        "email": COMPANY_EMAIL,
        "description": "Асфальтирование в Москве и Подмосковье под ключ. 15 лет опыта, гарантия 5 лет.",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "ул. Мясницкая, д. 41, стр. 5",
            "addressLocality": "Москва",
            "addressCountry": "RU",
        },
        "areaServed": {"@type": "AdministrativeArea", "name": "Москва и Московская область"},
        "priceRange": "от 630 руб/м²",
        "openingHours": "Mo-Su 08:00-20:00",
    }
    if COMPANY_PHONE:
        data["telephone"] = COMPANY_PHONE
    return data


def jsonld_service(
    service_name: str,
    description: str,
    price_from: int,
    url: str,
    reviews: Optional[list[str]] = None,
) -> dict:
    # Google Review Snippets do not support Service as parent type; Product is supported.
    has_reviews = bool(reviews)
    schema: dict = {
        "@context": "https://schema.org",
        "@type": ["Service", "Product"] if has_reviews else "Service",
        "name": service_name,
        "description": description,
        "provider": {"@type": "LocalBusiness", "name": SITE_NAME, "url": SITE_URL},
        "areaServed": "Москва и Московская область",
        "offers": {
            "@type": "Offer",
            "priceCurrency": "RUB",
            "price": price_from,
            **({"availability": "https://schema.org/InStock"} if has_reviews else {}),
        },
        "url": f"{SITE_URL}{url}",
    }
    if reviews:
        review_schemas = [_review_to_schema(r, service_name) for r in reviews]
        schema["review"] = review_schemas
        aggregate = _aggregate_rating(review_schemas)
        if aggregate:
            schema["aggregateRating"] = aggregate
    return schema


def _aggregate_rating(review_schemas: list[dict]) -> Optional[dict]:
    """Build AggregateRating from Review objects (required by Google when reviewRating is present)."""
    if not review_schemas:
        return None
    values: list[float] = []
    best = 5.0
    for review in review_schemas:
        rating = review.get("reviewRating") or {}
        raw = rating.get("ratingValue")
        if raw is None:
            continue
        values.append(float(raw))
        best = max(best, float(rating.get("bestRating", 5)))
    if not values:
        return None
    avg = round(sum(values) / len(values), 1)
    return {
        "@type": "AggregateRating",
        "ratingValue": str(int(avg) if avg == int(avg) else avg),
        "reviewCount": str(len(review_schemas)),
        "bestRating": str(int(best)),
        "worstRating": "1",
    }


def _review_to_schema(review_text: str, item_name: str) -> dict:
    """Convert plain-text review ('text — Имя') to schema.org Review."""
    parts = review_text.rsplit("—", 1)
    body = parts[0].strip().strip("«»")
    author = parts[1].strip() if len(parts) > 1 else "Клиент"
    return {
        "@type": "Review",
        "itemReviewed": {"@type": "Product", "name": item_name},
        "reviewBody": body,
        "author": {"@type": "Person", "name": author},
        "reviewRating": {
            "@type": "Rating",
            "ratingValue": "5",
            "bestRating": "5",
            "worstRating": "1",
        },
    }


def jsonld_breadcrumb(items: list[tuple[str, str]]) -> dict:
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": i, "name": name, "item": f"{SITE_URL}{url}"}
            for i, (name, url) in enumerate(items, 1)
        ],
    }


def jsonld_faq(questions: list[tuple[str, str]]) -> dict:
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}}
            for q, a in questions
        ],
    }


def jsonld_article(title: str, description: str, url: str, published: datetime) -> dict:
    date_str = published.strftime("%Y-%m-%d")
    return {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": title,
        "description": description,
        "url": f"{SITE_URL}{url}",
        "datePublished": date_str,
        "dateModified": date_str,
        "author": {"@type": "Organization", "name": SITE_NAME},
        "publisher": {"@type": "Organization", "name": SITE_NAME, "url": SITE_URL},
    }


# ─── SITEMAP ───

def moscow_okrug_static_urls() -> list[tuple[str, str, str]]:
    return [
        (f"/moskva/{slug}/", "0.85", "weekly")
        for slug in MOSCOW_OKRUGS
    ]


STATIC_URLS = [
    ("/", "1.0", "weekly"),
    ("/moskva/", "0.9", "weekly"),
    *moscow_okrug_static_urls(),
    ("/regiony/", "0.8", "weekly"),
    ("/blog/", "0.7", "weekly"),
    ("/uslugi/", "0.8", "weekly"),
    ("/o-kompanii/", "0.7", "monthly"),
    ("/prajs-list/", "0.8", "monthly"),
    ("/kontakty/", "0.6", "monthly"),
    ("/uslugi/asfaltirovanie-dvorov/", "0.8", "monthly"),
    ("/uslugi/asfaltirovanie-parkovok/", "0.8", "monthly"),
    ("/uslugi/asfaltirovanie-dorog/", "0.8", "monthly"),
    ("/uslugi/yamochnyj-remont/", "0.8", "monthly"),
    ("/uslugi/asfaltovaya-kroshka/", "0.8", "monthly"),
    ("/uslugi/asfaltirovanie-promyshlennyh-ploshhadok/", "0.8", "monthly"),
    ("/uslugi/asfaltirovanie-sportivnyh-ploshhadok/", "0.8", "monthly"),
    ("/uslugi/kompleksnoe-blagoustrojstvo-dvora-pod-klyuch/", "0.8", "monthly"),
]


def _safe_sitemap_path(path: str) -> bool:
    if not path or not path.startswith("/"):
        return False
    for part in path.strip("/").split("/"):
        if not part or not _SLUG_SEGMENT.match(part):
            return False
    return True


def _blog_slug_from_path(path: str) -> Optional[str]:
    m = re.match(r"^/blog/([^/]+)/$", path)
    return m.group(1) if m else None


def build_sitemap(generated_pages: list[dict]) -> str:
    urlset = ET.Element("urlset")
    urlset.set("xmlns", "http://www.sitemaps.org/schemas/sitemap/0.9")
    today = datetime.utcnow().strftime("%Y-%m-%d")

    for path, priority, changefreq in STATIC_URLS:
        el = ET.SubElement(urlset, "url")
        ET.SubElement(el, "loc").text = f"{SITE_URL}{path}"
        ET.SubElement(el, "lastmod").text = today
        ET.SubElement(el, "changefreq").text = changefreq
        ET.SubElement(el, "priority").text = priority

    static_paths = {path for path, _, _ in STATIC_URLS}

    for page in (generated_pages or []):
        path = page.get("url", "").strip()
        if not path:
            continue
        if path in static_paths:
            continue
        if not _safe_sitemap_path(path):
            continue
        page_type = page.get("type", "district")
        blog_slug = _blog_slug_from_path(path)
        if blog_slug and blog_slug in SERVICE_SLUGS:
            continue
        priority = "0.9" if page_type in ("district", "city") else "0.6"
        generated_at = page.get("generated_at")
        lastmod = generated_at.strftime("%Y-%m-%d") if isinstance(generated_at, datetime) else today
        el = ET.SubElement(urlset, "url")
        ET.SubElement(el, "loc").text = f"{SITE_URL}{path}"
        ET.SubElement(el, "lastmod").text = lastmod
        ET.SubElement(el, "changefreq").text = "monthly"
        ET.SubElement(el, "priority").text = priority

    ET.indent(urlset, space="  ")
    return '<?xml version="1.0" encoding="UTF-8"?>\n' + ET.tostring(urlset, encoding="unicode")


# ─── ROBOTS ───

ROBOTS_TXT = f"""User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /sys-9x4k2m

User-agent: Yandex
Allow: /
Crawl-delay: 1
Clean-param: utm_source&utm_medium&utm_campaign&utm_content&utm_term /
Clean-param: yclid&gclid&fbclid&openstat&from /
Clean-param: ref /

User-agent: Googlebot
Allow: /

Sitemap: {SITE_URL}/sitemap.xml
"""


# ─── CANONICAL ───

def canonical_url(path: str) -> str:
    return f"{SITE_URL}{normalize_path(path)}"


def district_canonical(okrug: str, slug: str) -> str:
    return canonical_url(f"/moskva/{okrug}/{slug}/")


def city_canonical(slug: str) -> str:
    return canonical_url(f"/podmoskovye/{slug}/")


def blog_canonical(slug: str) -> str:
    return canonical_url(f"/blog/{slug}/")
