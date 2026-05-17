import os
import logging
import httpx

logger = logging.getLogger(__name__)

PEXELS_API_KEY = os.getenv("PEXELS_API_KEY", "")
PEXELS_API_URL = "https://api.pexels.com/v1/search"

SLUG_KEYWORDS: dict[str, str] = {
    # ── exact service slugs ──
    "asfaltirovanie-dvorov":                        "asphalt paving residential yard driveway",
    "asfaltirovanie-parkovok":                      "asphalt parking lot construction aerial",
    "asfaltirovanie-dorog":                         "asphalt road paving construction machinery",
    "yamochnyj-remont":                             "road repair pothole asphalt workers",
    "asfaltovaya-kroshka":                          "crushed asphalt gravel road surface",
    "asfaltirovanie-promyshlennyh-ploshhadok":      "industrial warehouse facility asphalt road",
    "asfaltirovanie-sportivnyh-ploshhadok":         "sports court asphalt basketball tennis outdoor",
    "kompleksnoe-blagoustrojstvo-dvora-pod-klyuch": "landscaping paved courtyard pathway greenery",
    # ── slug fragment → query (blog topics) ──
    "skolko-stoit":          "asphalt road construction cost",
    "rasschitat-stoimost":   "asphalt paving cost calculator",
    "vybrat-podryadchika":   "road construction contractor workers",
    "vybrat-kompaniyu":      "construction company workers professional",
    "letom-i-zimoj":         "asphalt paving winter summer",
    "zimoj":                 "road construction winter cold",
    "kroshka":               "crushed asphalt gravel surface",
    "sroki-sluzhby":         "asphalt road longevity durability",
    "podgotovka":            "road construction ground preparation",
    "parkovk":               "parking lot asphalt construction",
    "treshin":               "road cracks asphalt repair damage",
    "treskaetsya":           "road cracks asphalt damage",
    "podmoskovye":           "road construction moscow russia suburban",
    "moskv":                 "road construction moscow city",
    "sport":                 "sports court surface asphalt outdoor",
    "blagoustrojstvo":       "landscaping paved yard pathway",
    "promyshlenn":           "industrial warehouse road asphalt",
    "velodorozhk":           "bicycle path paving outdoor",
    "trotuarn":              "sidewalk paving tiles outdoor",
    "plitk":                 "paving tiles sidewalk outdoor",
    "bruschatk":             "cobblestone paving outdoor pathway",
    "bordyur":               "curb stone road border installation",
    "drenazh":               "drainage system road construction",
    "livnev":                "storm drain drainage road",
    "voda":                  "road drainage water management",
    "remont-otmostk":        "foundation waterproof concrete repair",
    "remont":                "asphalt road repair workers",
    "zamena":                "road asphalt replacement construction",
    "vosstanovlenie":        "asphalt road restoration repair",
    "restavraciya":          "old asphalt road restoration",
    "osnov":                 "road foundation base construction",
    "sloev":                 "asphalt layers road cross-section",
    "tolshina":              "asphalt thickness road construction",
    "ukladk":                "asphalt paving machine laying",
    "usilenie":              "road reinforcement geogrid construction",
    "georeshetk":            "geogrid reinforcement road base",
    "razmetk":               "road marking paint lines",
    "znakok":                "road sign traffic control",
    "lezhachij-policejskij": "speed bump road installation",
    "AZS":                   "gas station asphalt construction",
    "avtomojk":              "car wash facility asphalt",
    "sklad":                 "warehouse logistics facility asphalt",
    "terminal":              "logistics terminal warehouse road",
    "SKT":                   "cottage community road asphalt",
    "kottedzhn":             "cottage community road paving",
    "dacha":                 "country house driveway asphalt",
    "dom":                   "house driveway asphalt paving",
    "dvor":                  "courtyard asphalt residential paving",
    "igrovaya":              "playground asphalt children outdoor",
    "detsk":                 "children playground surface safe",
    "zapah":                 "asphalt hot summer construction",
    "zhara":                 "asphalt hot weather summer",
    "trava":                 "grass through asphalt crack weed",
    "vydutie":               "asphalt bubble blister repair",
    "volny":                 "asphalt uneven surface waves repair",
    "pyatn":                 "asphalt stain oil cleaning",
    "chistk":                "road asphalt cleaning sweeping",
    "sneg":                  "snow removal road winter asphalt",
    "ozelenenie":            "green landscaping yard planting",
    "dizajn-dvor":           "yard landscape design paving outdoor",
    "barbeku":               "outdoor barbecue patio paving",
    "dekorativn":            "decorative outdoor paving landscape",
    "osveshenie":            "outdoor lighting road pathway night",
    "stoimost-nedvizhimost": "house real estate value property",
    "vdohnovl":              "beautiful yard landscaping design",
    "gravij":                "gravel road surface driveway",
    "beton":                 "concrete road surface construction",
    "dokumenty":             "construction permit documents",
    "garantiya":             "construction quality guarantee",
    "dogovor":               "construction contract business",
    "sekonomit":             "construction budget saving money",
    "pod-klyuch":            "turnkey construction complete project",
    "professional":          "professional construction workers team",
    "prinyat-rabotu":        "construction site inspection quality",
    "ulovki":                "construction fraud warning",
    "sezon":                 "construction season planning",
    "razreshenie":           "construction permit approval",
    "ekologichesk":          "eco-friendly construction environment",
    "GOST":                  "road construction standards quality",
    "klimat":                "road construction climate weather",
    "grunt":                 "soil ground road construction",
    "puchinistye":           "frost heave ground road foundation",
    "district":              "asphalt paving road moscow",
    "city":                  "road construction suburban moscow",
}

# Category-level fallback queries when no slug match is found
CATEGORY_QUERIES: dict[str, str] = {
    "technical":     "asphalt road construction technology process",
    "business":      "construction company workers professional team",
    "local":         "road construction moscow suburban residential",
    "problems":      "road asphalt repair damage crack fix",
    "inspiration":   "beautiful paved yard landscaping design outdoor",
    "service_blog":  "asphalt paving service construction professional",
    "landscaping":   "landscaping paving outdoor yard pathway green",
}

DEFAULT_QUERY = "asphalt road paving construction"

DISTRICT_BLOG_QUERIES = [
    "asphalt road construction urban city workers",
    "road paving construction machinery equipment",
    "asphalt laying compactor roller machine street",
    "street road construction site workers outdoor",
    "road resurfacing city construction professional",
    "asphalt paving truck heavy machinery",
    "road surface construction process daylight",
    "asphalt repair road workers tools",
    "construction workers road paving team",
    "new road asphalt surface smooth",
]

import hashlib

def _pick_query(slug: str, location_type: str = "", category: str = "") -> str:
    # 1. Exact slug match
    if slug in SLUG_KEYWORDS:
        return SLUG_KEYWORDS[slug]
    # 2. Partial fragment match
    for key, query in SLUG_KEYWORDS.items():
        if key in slug:
            return query
    # 3. Category fallback
    if category and category in CATEGORY_QUERIES:
        return CATEGORY_QUERIES[category]
    # 4. Location type fallback
    if location_type == "district":
        return SLUG_KEYWORDS["district"]
    if location_type == "city":
        return SLUG_KEYWORDS["city"]
    # 5. For district/city blog slugs (asfalt-{name}), rotate varied queries by slug hash
    idx = int(hashlib.md5(slug.encode()).hexdigest(), 16) % len(DISTRICT_BLOG_QUERIES)
    return DISTRICT_BLOG_QUERIES[idx]


async def fetch_images(slug: str, location_type: str = "", location_name: str = "", category: str = "", count: int = 3) -> list[str]:
    """
    Return up to `count` unique Pexels photo URLs for the given slug.
    Uses varied queries to get visually different images.
    """
    if not PEXELS_API_KEY:
        return []

    if location_name and location_type in ("city", "district"):
        base_query = f"asphalt road paving {location_name} construction"
    else:
        base_query = _pick_query(slug, location_type, category)

    # Alternate queries for variety
    alt_queries = [
        base_query,
        base_query.replace("asphalt", "road").replace("paving", "construction"),
        f"construction workers road machinery moscow",
    ]

    results: list[str] = []
    try:
        from backend.database import db
        used_docs = await db.used_images.find({}, {"photo_id": 1, "_id": 0}).to_list(None)
        used_ids: set[int] = {doc["photo_id"] for doc in used_docs}

        async with httpx.AsyncClient(timeout=15) as client:
            for i, query in enumerate(alt_queries):
                if len(results) >= count:
                    break
                for page in range(1, 3):
                    resp = await client.get(
                        PEXELS_API_URL,
                        headers={"Authorization": PEXELS_API_KEY},
                        params={"query": query, "per_page": 30, "page": page, "orientation": "landscape"},
                    )
                    resp.raise_for_status()
                    photos = resp.json().get("photos", [])
                    for photo in photos:
                        if photo["id"] not in used_ids and len(results) < count:
                            url = photo["src"]["large"]
                            await db.used_images.insert_one({
                                "photo_id": photo["id"],
                                "slug": slug,
                                "query": query,
                                "url": url,
                            })
                            used_ids.add(photo["id"])
                            results.append(url)
                    if len(results) >= count:
                        break

        logger.info(f"Pexels fetched {len(results)}/{count} images for '{slug}'")
    except Exception as e:
        logger.error(f"Pexels fetch_images failed for slug={slug}: {e}")

    return results


async def fetch_image(slug: str, location_type: str = "", location_name: str = "", category: str = "") -> str | None:
    """
    Return a unique Pexels photo URL for the given slug.
    Tracks used photo IDs in MongoDB to avoid duplicates across pages.
    """
    if not PEXELS_API_KEY:
        logger.warning("PEXELS_API_KEY not set, skipping image fetch")
        return None

    if location_name and location_type in ("city", "district"):
        query = f"asphalt road paving {location_name} construction"
    else:
        query = _pick_query(slug, location_type, category)

    try:
        # Lazy import to avoid circular dependency
        from backend.database import db

        used_docs = await db.used_images.find({}, {"photo_id": 1, "_id": 0}).to_list(None)
        used_ids: set[int] = {doc["photo_id"] for doc in used_docs}

        async with httpx.AsyncClient(timeout=15) as client:
            # Fetch up to 3 pages (max 80 each) to find an unused photo
            for page in range(1, 4):
                resp = await client.get(
                    PEXELS_API_URL,
                    headers={"Authorization": PEXELS_API_KEY},
                    params={"query": query, "per_page": 80, "page": page, "orientation": "landscape"},
                )
                resp.raise_for_status()
                photos = resp.json().get("photos", [])
                if not photos:
                    break

                # Pick first photo whose ID hasn't been used yet
                for photo in photos:
                    if photo["id"] not in used_ids:
                        url = photo["src"]["large"]
                        await db.used_images.insert_one({
                            "photo_id": photo["id"],
                            "slug": slug,
                            "query": query,
                            "url": url,
                        })
                        logger.info(f"Pexels image for '{slug}' (page {page}, id {photo['id']}): {url}")
                        return url

        logger.warning(f"All Pexels photos used for query '{query}', returning last one")
        # Fallback: return any photo from first page rather than None
        resp = await httpx.AsyncClient(timeout=10).get(
            PEXELS_API_URL,
            headers={"Authorization": PEXELS_API_KEY},
            params={"query": query, "per_page": 1, "orientation": "landscape"},
        )
        photos = resp.json().get("photos", [])
        return photos[0]["src"]["large"] if photos else None

    except Exception as e:
        logger.error(f"Pexels fetch failed for slug={slug}: {e}")
        return None
