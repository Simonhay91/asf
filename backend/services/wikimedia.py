import logging
import httpx

logger = logging.getLogger(__name__)

COMMONS_API = "https://commons.wikimedia.org/w/api.php"

# Excluded categories/keywords — avoid logos, coats of arms, maps, flags
EXCLUDE_KEYWORDS = ("map", "coat", "flag", "logo", "svg", "схема", "герб", "карт", "план")


async def fetch_wikimedia_image(location_name: str, location_type: str = "district") -> str | None:
    """
    Fetch a real photo of a Moscow district or Podmoskovye city from Wikimedia Commons.
    Returns a direct image URL or None if not found.
    """
    if location_type == "district":
        queries = [
            f"{location_name} район Москва",
            f"{location_name} Moscow district",
            f"{location_name} Москва",
        ]
    else:
        queries = [
            f"{location_name} город Подмосковье",
            f"{location_name} Russia city",
            f"{location_name} Московская область",
        ]

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            for query in queries:
                resp = await client.get(COMMONS_API, params={
                    "action": "query",
                    "list": "search",
                    "srsearch": query,
                    "srnamespace": "6",
                    "srlimit": "20",
                    "format": "json",
                })
                resp.raise_for_status()
                results = resp.json().get("query", {}).get("search", [])

                for item in results:
                    title = item.get("title", "")
                    title_lower = title.lower()

                    # Skip non-photo file types and unwanted content
                    if not any(title_lower.endswith(ext) for ext in (".jpg", ".jpeg", ".png")):
                        continue
                    if any(kw in title_lower for kw in EXCLUDE_KEYWORDS):
                        continue

                    # Fetch actual image URL
                    img_resp = await client.get(COMMONS_API, params={
                        "action": "query",
                        "titles": title,
                        "prop": "imageinfo",
                        "iiprop": "url|size",
                        "iiurlwidth": "1200",
                        "format": "json",
                    })
                    img_resp.raise_for_status()
                    pages = img_resp.json().get("query", {}).get("pages", {})
                    for page in pages.values():
                        imageinfo = page.get("imageinfo", [])
                        if imageinfo:
                            url = imageinfo[0].get("thumburl") or imageinfo[0].get("url")
                            if url:
                                logger.info(f"Wikimedia image for '{location_name}': {url}")
                                return url

    except Exception as e:
        logger.warning(f"Wikimedia fetch failed for '{location_name}': {e}")

    return None
