import os
import logging
import httpx

logger = logging.getLogger(__name__)

YANDEX_TOKEN = os.getenv("YANDEX_WEBMASTER_TOKEN", "")
YANDEX_HOST_ID = os.getenv("YANDEX_HOST_ID", "")
API_URL = "https://api.webmaster.yandex.net/v4/user/{user_id}/hosts/{host_id}/recrawl/queue"


async def ping_urls(urls: list[str]) -> None:
    """Submit URLs to Yandex Webmaster indexing queue."""
    if not YANDEX_TOKEN or not YANDEX_HOST_ID:
        logger.warning("Yandex Webmaster not configured, skipping ping")
        return

    try:
        async with httpx.AsyncClient(timeout=15) as http:
            # First get user_id
            resp = await http.get(
                "https://api.webmaster.yandex.net/v4/user",
                headers={"Authorization": f"OAuth {YANDEX_TOKEN}"},
            )
            resp.raise_for_status()
            user_id = resp.json()["user_id"]

            # Submit each URL
            endpoint = API_URL.format(user_id=user_id, host_id=YANDEX_HOST_ID)
            for url in urls:
                r = await http.post(
                    endpoint,
                    headers={
                        "Authorization": f"OAuth {YANDEX_TOKEN}",
                        "Content-Type": "application/json",
                    },
                    json={"url": url},
                )
                if r.status_code in (200, 201, 202):
                    logger.info(f"Yandex pinged: {url}")
                else:
                    logger.warning(f"Yandex ping failed {r.status_code}: {url}")

    except Exception as e:
        logger.error(f"Yandex ping error: {e}", exc_info=True)
        # Non-critical — do not raise
