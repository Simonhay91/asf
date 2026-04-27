import os
import logging
import httpx

logger = logging.getLogger(__name__)

PERPLEXITY_API_KEY = os.getenv("PERPLEXITY_API_KEY", "")
API_URL = "https://api.perplexity.ai/chat/completions"


async def research_topic(title: str, category: str) -> str:
    """
    Fetch factual data for a blog topic via Perplexity Sonar.
    Returns a fact-sheet in bullet-point format.
    """
    if not PERPLEXITY_API_KEY:
        logger.warning("PERPLEXITY_API_KEY not set, returning empty research")
        return ""

    category_hints = {
        "technical": "технические нормы, ГОСТы, СНиПы, температуры укладки, составы смесей, толщины слоёв, сроки работ",
        "business":  "цены в 2025–2026 году, типичные схемы работы подрядчиков, юридические нюансы, договорная практика",
        "local":     "климат Москвы и Подмосковья, грунты, нормы региона, особенности эксплуатации покрытий в условиях зимы и соли",
        "problems":  "причины дефектов асфальта, технологии ремонта, стоимость исправления, признаки некачественной укладки",
        "inspiration": "тренды благоустройства 2025–2026, примеры реализованных проектов, сравнение материалов, влияние на стоимость недвижимости",
    }
    hints = category_hints.get(category, "практические факты и актуальные данные по теме")

    prompt = (
        f"Ты исследователь контента для SEO-блога об асфальтировании в России. "
        f"После тебя копирайтер напишет статью на тему: «{title}». "
        f"Собери конкретные факты: {hints}. "
        f"Формат — только маркированный список фактов, без вступлений и выводов. "
        f"Максимум 350 слов. Только то, что копирайтер сможет прямо использовать в статье. "
        f"Не выдумывай данные — только реальные факты."
    )

    try:
        async with httpx.AsyncClient(timeout=30) as http:
            resp = await http.post(
                API_URL,
                headers={
                    "Authorization": f"Bearer {PERPLEXITY_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "sonar",
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": 800,
                },
            )
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"]

    except httpx.HTTPStatusError as e:
        logger.error(f"Perplexity HTTP error for topic '{title}': {e.response.status_code}")
        return ""
    except Exception as e:
        logger.error(f"Perplexity error for topic '{title}': {e}", exc_info=True)
        return ""


async def research_location(name: str, location_type: str) -> str:
    """
    Fetch local research data for a district or city via Perplexity Sonar.
    Returns markdown text with local facts, streets, landmarks.
    """
    if not PERPLEXITY_API_KEY:
        logger.warning("PERPLEXITY_API_KEY not set, returning stub research")
        return f"Район/город: {name}. Данные недоступны (API ключ не задан)."

    loc_context = "район Москвы" if location_type == "district" else "город Московской области"

    prompt = (
        f"Дай подробную справку о {loc_context} {name} для SEO-статьи об асфальтировании. "
        f"Включи: реальные улицы и проспекты, транспортную инфраструктуру, "
        f"жилые комплексы и дворы, промзоны и парковки, характерные проблемы с дорогами. "
        f"Только факты, без вступлений. Формат — маркированный список."
    )

    try:
        async with httpx.AsyncClient(timeout=30) as http:
            resp = await http.post(
                API_URL,
                headers={
                    "Authorization": f"Bearer {PERPLEXITY_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "sonar",
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": 1024,
                },
            )
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"]

    except httpx.HTTPStatusError as e:
        logger.error(f"Perplexity HTTP error for {name}: {e.response.status_code}")
        raise
    except Exception as e:
        logger.error(f"Perplexity error for {name}: {e}", exc_info=True)
        raise
