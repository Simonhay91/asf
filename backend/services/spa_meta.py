"""Inject per-URL meta tags into built SPA index.html for crawlers (Yandex/Google)."""

from __future__ import annotations

import html
import logging
import re
from pathlib import Path

from backend.database import db
from backend.services.seo import (
    HOME_META,
    STATIC_PAGE_META,
    blog_meta,
    city_meta,
    district_meta,
    normalize_path,
    service_meta,
)

logger = logging.getLogger(__name__)

SERVICE_PAGES = {
    "asfaltirovanie-dvorov": {"name": "Асфальтирование дворов", "price_from": 630},
    "asfaltirovanie-parkovok": {"name": "Асфальтирование парковок", "price_from": 630},
    "asfaltirovanie-dorog": {"name": "Асфальтирование дорог", "price_from": 630},
    "yamochnyj-remont": {"name": "Ямочный ремонт", "price_from": 1200},
    "asfaltovaya-kroshka": {"name": "Асфальтовая крошка", "price_from": 350},
    "asfaltirovanie-promyshlennyh-ploshhadok": {"name": "Промышленные площадки", "price_from": 630},
    "asfaltirovanie-sportivnyh-ploshhadok": {"name": "Спортивные площадки", "price_from": 630},
    "kompleksnoe-blagoustrojstvo-dvora-pod-klyuch": {"name": "Благоустройство двора", "price_from": 350},
}


def _esc(value: str) -> str:
    return html.escape(value or "", quote=True)


def inject_meta_into_html(html_template: str, meta: dict) -> str:
    """Replace title/description and inject canonical + Open Graph in <head>."""
    title = meta["title"]
    description = meta["description"]
    canonical = meta["canonical"]
    og_title = meta.get("og:title", title)
    og_desc = meta.get("og:description", description)
    og_url = meta.get("og:url", canonical)
    og_image = meta.get("og:image", meta.get("twitter:image", ""))
    og_type = meta.get("og:type", "website")

    out = re.sub(
        r"<title>.*?</title>",
        f"<title>{_esc(title)}</title>",
        html_template,
        count=1,
        flags=re.DOTALL,
    )
    out = re.sub(
        r'<meta name="description" content="[^"]*"\s*/?>',
        f'<meta name="description" content="{_esc(description)}" />',
        out,
        count=1,
    )

    # Remove previously injected SEO block (idempotent rebuilds).
    out = re.sub(
        r"\n?\s*<!-- spa-meta:start -->.*?<!-- spa-meta:end -->\n?",
        "\n",
        out,
        count=1,
        flags=re.DOTALL,
    )

    seo_block = f"""    <!-- spa-meta:start -->
    <link rel="canonical" href="{_esc(canonical)}" />
    <meta property="og:title" content="{_esc(og_title)}" />
    <meta property="og:description" content="{_esc(og_desc)}" />
    <meta property="og:url" content="{_esc(og_url)}" />
    <meta property="og:type" content="{_esc(og_type)}" />
    <meta name="twitter:title" content="{_esc(og_title)}" />
    <meta name="twitter:description" content="{_esc(og_desc)}" />"""
    if og_image:
        seo_block += f'\n    <meta property="og:image" content="{_esc(og_image)}" />'
    seo_block += "\n    <!-- spa-meta:end -->"

    out = re.sub(r"(<title>.*?</title>)", rf"\1\n{seo_block}", out, count=1, flags=re.DOTALL)
    return out


_template_cache: str | None = None
_template_mtime: float | None = None


def load_spa_template() -> str:
    """Read built frontend/dist/index.html (cached by mtime)."""
    global _template_cache, _template_mtime
    path = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist" / "index.html"
    if not path.is_file():
        raise FileNotFoundError(f"Run npm run build first: {path}")
    mtime = path.stat().st_mtime
    if _template_cache is None or _template_mtime != mtime:
        _template_cache = path.read_text(encoding="utf-8")
        _template_mtime = mtime
    return _template_cache


async def resolve_meta_for_path(path: str) -> dict:
    """Resolve title/description/canonical for a public URL path."""
    path = normalize_path(path or "/")

    if path in STATIC_PAGE_META:
        return STATIC_PAGE_META[path]

    if m := re.match(r"^/podmoskovye/([^/]+)/$", path):
        slug = m.group(1)
        city = await db.podmoskovye_cities.find_one({"slug": slug}, {"name": 1})
        name = city["name"] if city else slug.replace("-", " ").title()
        return city_meta(name, slug)

    if m := re.match(r"^/moskva/([^/]+)/([^/]+)/$", path):
        okrug, slug = m.group(1), m.group(2)
        district = await db.moscow_districts.find_one({"slug": slug}, {"name": 1, "okrug_name": 1})
        name = district["name"] if district else slug.replace("-", " ").title()
        okrug_name = (district or {}).get("okrug_name") or okrug
        return district_meta(name, okrug_name, okrug, slug)

    if m := re.match(r"^/blog/([^/]+)/$", path):
        slug = m.group(1)
        page = await db.generated_pages.find_one(
            {"slug": slug, "type": "blog"},
            {"title": 1, "meta_description": 1},
        )
        if page:
            return blog_meta(page.get("title") or slug, page.get("meta_description") or "", slug)
        return blog_meta(slug.replace("-", " ").title(), "", slug)

    if m := re.match(r"^/uslugi/([^/]+)/$", path):
        slug = m.group(1)
        svc = SERVICE_PAGES.get(slug)
        if svc:
            return service_meta(svc["name"], slug, svc["price_from"])

    return HOME_META


async def render_spa_html(path: str) -> str:
    template = load_spa_template()
    meta = await resolve_meta_for_path(path)
    return inject_meta_into_html(template, meta)


async def collect_all_paths_with_meta() -> list[tuple[str, dict]]:
    """Return (path, meta) for every public URL."""
    seen: set[str] = set()
    results: list[tuple[str, dict]] = []

    def add(path: str, meta: dict) -> None:
        path = path if path.endswith("/") else f"{path}/"
        if path in seen:
            return
        seen.add(path)
        results.append((path, meta))

    for path, meta in STATIC_PAGE_META.items():
        add(path, meta)

    for slug, svc in SERVICE_PAGES.items():
        add(f"/uslugi/{slug}/", service_meta(svc["name"], slug, svc["price_from"]))

    districts = await db.moscow_districts.find(
        {}, {"slug": 1, "name": 1, "okrug": 1, "okrug_name": 1, "_id": 0}
    ).to_list(200)
    for d in districts:
        okrug = d.get("okrug") or ""
        slug = d.get("slug") or ""
        if not okrug or not slug:
            continue
        add(
            f"/moskva/{okrug}/{slug}/",
            district_meta(
                d.get("name") or slug,
                d.get("okrug_name") or okrug,
                okrug,
                slug,
            ),
        )

    cities = await db.podmoskovye_cities.find({}, {"slug": 1, "name": 1, "_id": 0}).to_list(200)
    for c in cities:
        slug = c.get("slug") or ""
        if not slug:
            continue
        add(f"/podmoskovye/{slug}/", city_meta(c.get("name") or slug, slug))

    blogs = await db.generated_pages.find(
        {"type": "blog"},
        {"slug": 1, "title": 1, "meta_description": 1, "_id": 0},
    ).to_list(500)
    for b in blogs:
        slug = b.get("slug") or ""
        if not slug:
            continue
        title = b.get("title") or slug.replace("-", " ").title()
        add(f"/blog/{slug}/", blog_meta(title, b.get("meta_description") or "", slug))

    return results


def write_spa_meta_html(dist_dir: Path, paths_with_meta: list[tuple[str, dict]]) -> int:
    """Write index.html with unique meta for each URL path under dist_dir."""
    template_path = dist_dir / "index.html"
    if not template_path.is_file():
        raise FileNotFoundError(f"Build output not found: {template_path}")

    template = template_path.read_text(encoding="utf-8")
    count = 0

    for path, meta in paths_with_meta:
        html_out = inject_meta_into_html(template, meta)
        if path == "/":
            out_file = dist_dir / "index.html"
        else:
            out_file = dist_dir / path.strip("/") / "index.html"
            out_file.parent.mkdir(parents=True, exist_ok=True)
        out_file.write_text(html_out, encoding="utf-8")
        count += 1

    return count


async def rebuild_spa_meta_html(project_root: Path | None = None) -> int:
    """Regenerate prerendered HTML meta files. Safe to call after each content generation."""
    root = project_root or Path(__file__).resolve().parent.parent.parent
    dist_dir = root / "frontend" / "dist"
    if not (dist_dir / "index.html").is_file():
        logger.info("SPA meta skip: %s/index.html not found (run npm run build first)", dist_dir)
        return 0

    paths = await collect_all_paths_with_meta()
    count = write_spa_meta_html(dist_dir, paths)
    logger.info("SPA meta HTML rebuilt for %d URLs", count)
    return count
