import os
import logging
from fastapi import APIRouter, Request, HTTPException

from backend.services.generate import generate_next, regenerate_slug, regenerate_service, get_status, get_next_queue, refresh_all_images, generate_cities_by_region
from backend.services.telegram_service import notify

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/webhook", tags=["telegram"])

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "")


@router.post("/telegram")
async def telegram_webhook(request: Request):
    """Handle incoming Telegram bot updates."""
    try:
        data = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    message = data.get("message") or data.get("edited_message")
    if not message:
        return {"ok": True}

    chat_id = str(message.get("chat", {}).get("id", ""))
    text = message.get("text", "").strip()

    # Only respond to admin chat
    if chat_id != CHAT_ID:
        logger.warning(f"Unauthorized Telegram message from chat {chat_id}")
        return {"ok": True}

    await _handle_command(text)
    return {"ok": True}


async def _handle_command(text: str) -> None:
    if text.startswith("/generate"):
        parts = text.split()
        loc_type = parts[1] if len(parts) > 1 else "both"
        if loc_type not in ("moscow", "podmoskovye", "both", "blog", "uslugi"):
            await notify("❌ Неверный тип. Используй: /generate moscow | podmoskovye | both | blog | uslugi")
            return
        await notify(f"⏳ Начинаю генерацию ({loc_type})...")
        try:
            result = await generate_next(loc_type)
            if result["status"] == "nothing_pending":
                await notify("✅ Нет pending элементов в очереди")
            else:
                items = result.get("generated", [])
                names = [g.get("name") or g.get("title", "?") for g in items]
                await notify(f"✅ Готово: {', '.join(names)}")
        except Exception as e:
            await notify(f"❌ Ошибка генерации: {str(e)[:300]}")

    elif text.startswith("/regenerate"):
        parts = text.split()
        if len(parts) < 2:
            await notify("❌ Использование: /regenerate {slug} | /regenerate uslugi {slug}")
            return
        if parts[1] == "uslugi" and len(parts) >= 3:
            slug = parts[2]
            await notify(f"⏳ Регенерирую услугу {slug}...")
            try:
                await regenerate_service(slug)
                await notify(f"✅ Услуга регенерирована: {slug}")
            except ValueError:
                await notify(f"❌ Услуга не найдена: {slug}")
            except Exception as e:
                await notify(f"❌ Ошибка: {str(e)[:300]}")
        else:
            slug = parts[1]
            await notify(f"⏳ Регенерирую {slug}...")
            try:
                result = await regenerate_slug(slug)
                await notify(f"✅ Регенерирован: {slug}")
            except ValueError:
                await notify(f"❌ Slug не найден: {slug}")
            except Exception as e:
                await notify(f"❌ Ошибка: {str(e)[:300]}")

    elif text == "/status":
        try:
            s = await get_status()
            mo = s["moscow"]
            pm = s["podmoskovye"]
            msg = (
                f"📊 <b>Статус</b>\n\n"
                f"🏙 Москва: {mo['done']}/{mo['total']} ({mo['pending']} осталось)\n"
                f"🌲 Подмосковье: {pm['done']}/{pm['total']} ({pm['pending']} осталось)\n"
                f"📄 Всего страниц: {s['total_pages']}"
            )
            await notify(msg)
        except Exception as e:
            await notify(f"❌ Ошибка: {str(e)[:200]}")

    elif text == "/next":
        try:
            q = await get_next_queue(5)
            mo = "\n".join(f"  • {n}" for n in q["moscow"]) or "  (пусто)"
            pm = "\n".join(f"  • {n}" for n in q["podmoskovye"]) or "  (пусто)"
            await notify(f"⏭ <b>Следующие в очереди</b>\n\n🏙 Москва:\n{mo}\n\n🌲 Подмосковье:\n{pm}")
        except Exception as e:
            await notify(f"❌ Ошибка: {str(e)[:200]}")

    elif text.startswith("/generate region"):
        parts = text.split(maxsplit=2)
        if len(parts) < 3:
            await notify("❌ Использование: /generate region {название}\nДоступные: север, восток, юго-восток, юг, юго-запад, запад")
            return
        region = parts[2].strip().lower()
        valid = {"север", "восток", "юго-восток", "юг", "юго-запад", "запад"}
        if region not in valid:
            await notify(f"❌ Неверный регион. Доступные: {', '.join(sorted(valid))}")
            return
        await notify(f"⏳ Запускаю генерацию для региона «{region}»...")
        try:
            result = await generate_cities_by_region(region)
            count = len(result.get("generated", []))
            if count == 0:
                await notify(f"✅ Регион «{region}»: нет pending городов")
            else:
                names = [g.get("name", "?") for g in result["generated"]]
                await notify(f"✅ Регион «{region}»: {count} городов\n" + "\n".join(f"  • {n}" for n in names))
        except Exception as e:
            await notify(f"❌ Ошибка генерации региона: {str(e)[:300]}")

    elif text == "/refresh-images":
        await notify("⏳ Обновляю изображения для всех блог-страниц...")
        try:
            result = await refresh_all_images()
            await notify(f"✅ Готово: {result['updated']} обновлено, {result['failed']} ошибок")
        except Exception as e:
            await notify(f"❌ Ошибка: {str(e)[:300]}")

    elif text == "/help":
        await notify(
            "🤖 <b>Команды</b>\n\n"
            "/generate — следующий (город + блог)\n"
            "/generate moscow — только Москва\n"
            "/generate podmoskovye — только Подмосковье\n"
            "/generate blog — только блог-тема\n"
            "/generate uslugi — все 8 страниц услуг\n"
            "/generate region север — все города региона\n"
            "  (север, восток, юго-восток, юг, юго-запад, запад)\n"
            "/regenerate {slug} — перегенерировать район/город\n"
            "/regenerate uslugi {slug} — перегенерировать услугу\n"
            "/refresh-images — обновить изображения всех блогов\n"
            "/status — прогресс\n"
            "/next — очередь"
        )
    else:
        await notify("❓ Неизвестная команда. Используй /help")
