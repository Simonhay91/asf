import os
import logging
import httpx

logger = logging.getLogger(__name__)

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "")
SITE_URL = "https://russkiyasphalt.ru"

TYPE_LABELS = {
    "district": "🏙 Район Москвы",
    "city":     "🌲 Город Подмосковья",
    "blog":     "📝 Блог-статья",
    "service":  "🔧 Страница услуги",
}


async def notify(text: str) -> None:
    """Send a plain text message to the admin Telegram chat."""
    if not BOT_TOKEN or not CHAT_ID:
        logger.warning("Telegram not configured, skipping notify")
        return
    try:
        async with httpx.AsyncClient(timeout=10) as http:
            await http.post(
                f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage",
                json={"chat_id": CHAT_ID, "text": text, "parse_mode": "HTML"},
            )
    except Exception as e:
        logger.error(f"Telegram notify error: {e}", exc_info=True)


async def notify_page(
    name: str,
    page_type: str,
    url: str,
    image_url: str | None = None,
    meta_title: str = "",
    meta_description: str = "",
) -> None:
    """Send a beautifully formatted page notification with photo if available."""
    if not BOT_TOKEN or not CHAT_ID:
        return

    type_label = TYPE_LABELS.get(page_type, "📄 Страница")
    full_url = f"{SITE_URL}{url}"

    caption = (
        f"{type_label}\n\n"
        f"<b>{name}</b>\n"
    )
    if meta_title:
        caption += f"🏷 <i>{meta_title}</i>\n"
    if meta_description:
        caption += f"📋 {meta_description[:120]}{'…' if len(meta_description) > 120 else ''}\n"
    caption += f"\n🔗 <a href=\"{full_url}\">{full_url}</a>"

    try:
        async with httpx.AsyncClient(timeout=15) as http:
            if image_url:
                resp = await http.post(
                    f"https://api.telegram.org/bot{BOT_TOKEN}/sendPhoto",
                    json={
                        "chat_id": CHAT_ID,
                        "photo": image_url,
                        "caption": caption,
                        "parse_mode": "HTML",
                    },
                )
                if resp.status_code == 200:
                    return
                # Fall back to text if photo fails
            await http.post(
                f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage",
                json={"chat_id": CHAT_ID, "text": caption, "parse_mode": "HTML",
                      "disable_web_page_preview": False},
            )
    except Exception as e:
        logger.error(f"Telegram notify_page error: {e}", exc_info=True)


async def send_keyboard(text: str, buttons: list[list[dict]]) -> int | None:
    """Send a message with inline keyboard. Returns message_id."""
    if not BOT_TOKEN or not CHAT_ID:
        return None
    try:
        async with httpx.AsyncClient(timeout=10) as http:
            resp = await http.post(
                f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage",
                json={
                    "chat_id": CHAT_ID,
                    "text": text,
                    "parse_mode": "HTML",
                    "reply_markup": {"inline_keyboard": buttons},
                },
            )
            data = resp.json()
            return data.get("result", {}).get("message_id")
    except Exception as e:
        logger.error(f"Telegram send_keyboard error: {e}", exc_info=True)
        return None


async def edit_keyboard(message_id: int, text: str, buttons: list[list[dict]]) -> None:
    """Edit existing message with new text and keyboard."""
    if not BOT_TOKEN or not CHAT_ID:
        return
    try:
        async with httpx.AsyncClient(timeout=10) as http:
            await http.post(
                f"https://api.telegram.org/bot{BOT_TOKEN}/editMessageText",
                json={
                    "chat_id": CHAT_ID,
                    "message_id": message_id,
                    "text": text,
                    "parse_mode": "HTML",
                    "reply_markup": {"inline_keyboard": buttons},
                },
            )
    except Exception as e:
        logger.error(f"Telegram edit_keyboard error: {e}", exc_info=True)


async def answer_callback(callback_query_id: str, text: str = "") -> None:
    """Answer a callback query to remove loading state."""
    if not BOT_TOKEN:
        return
    try:
        async with httpx.AsyncClient(timeout=5) as http:
            await http.post(
                f"https://api.telegram.org/bot{BOT_TOKEN}/answerCallbackQuery",
                json={"callback_query_id": callback_query_id, "text": text},
            )
    except Exception as e:
        logger.error(f"Telegram answer_callback error: {e}", exc_info=True)


async def notify_quote(name: str, phone: str, comment: str = "", source_url: str = "") -> None:
    """Send a formatted quote request notification."""
    if not BOT_TOKEN or not CHAT_ID:
        logger.warning("Telegram not configured, skipping notify_quote")
        return

    source_line = f"\n🌐 Страница: <a href=\"{SITE_URL}{source_url}\">{source_url}</a>" if source_url else ""
    msg = (
        "📩 <b>Новая заявка с сайта!</b>\n\n"
        f"👤 Имя: <b>{name or '—'}</b>\n"
        f"📞 Телефон: <b>{phone}</b>\n"
        f"💬 Комментарий: {comment or '—'}"
        f"{source_line}"
    )
    try:
        async with httpx.AsyncClient(timeout=10) as http:
            await http.post(
                f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage",
                json={"chat_id": CHAT_ID, "text": msg, "parse_mode": "HTML",
                      "disable_web_page_preview": True},
            )
    except Exception as e:
        logger.error(f"Telegram notify_quote error: {e}", exc_info=True)
