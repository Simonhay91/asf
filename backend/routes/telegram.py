import os
import logging
from fastapi import APIRouter, Request, HTTPException, BackgroundTasks

from backend.services.generate import generate_next, regenerate_slug, regenerate_service, get_status, get_next_queue, refresh_all_images, generate_cities_by_region
from backend.services.telegram_service import notify, send_keyboard, edit_keyboard, answer_callback
from backend.services import cursor_service
from backend.services.cursor_service import CursorAPIError, AGENT_ID_RE

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/webhook", tags=["telegram"])

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "")


@router.post("/telegram")
async def telegram_webhook(request: Request, background_tasks: BackgroundTasks):
    """Handle incoming Telegram bot updates."""
    try:
        data = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    # Handle inline button callbacks
    callback = data.get("callback_query")
    if callback:
        cb_chat_id = str(callback.get("message", {}).get("chat", {}).get("id", ""))
        if cb_chat_id != CHAT_ID:
            return {"ok": True}
        background_tasks.add_task(_handle_callback, callback)
        return {"ok": True}

    message = data.get("message") or data.get("edited_message")
    if not message:
        return {"ok": True}

    chat_id = str(message.get("chat", {}).get("id", ""))
    text = message.get("text", "").strip()

    if chat_id != CHAT_ID:
        logger.warning(f"Unauthorized Telegram message from chat {chat_id}")
        return {"ok": True}

    background_tasks.add_task(_handle_command, text)
    return {"ok": True}


async def _handle_callback(callback: dict) -> None:
    """Handle inline keyboard button presses."""
    cb_id = callback["id"]
    data = callback.get("data", "")
    message_id = callback.get("message", {}).get("message_id")

    await answer_callback(cb_id)

    if data.startswith("preview:"):
        loc_type = data.split(":", 1)[1]
        await _show_preview(loc_type, message_id)

    elif data.startswith("generate:"):
        loc_type = data.split(":", 1)[1]
        await _do_generate(loc_type, message_id)

    elif data == "cancel":
        await edit_keyboard(message_id, "❌ Отменено.", [])


async def _show_preview(loc_type: str, message_id: int) -> None:
    """Show next items in queue with confirm button."""
    try:
        q = await get_next_queue(3)
        s = await get_status()

        if loc_type == "podmoskovye":
            items = q["podmoskovye"]
            stat = s["podmoskovye"]
            label = "🌲 Подмосковье"
        elif loc_type == "moscow":
            items = q["moscow"]
            stat = s["moscow"]
            label = "🏙 Москва"
        else:
            items = []
            stat = None
            label = "📝 Блог"

        if stat:
            progress = f"{stat['done']}/{stat['total']} готово, осталось {stat['pending']}"
        else:
            blog_stat = s.get("blog", {})
            progress = ""

        queue_text = "\n".join(f"  • {n}" for n in items) if items else "  (очередь пуста)"
        text = (
            f"{label}\n"
            f"{progress}\n\n"
            f"<b>Следующие в очереди:</b>\n{queue_text}\n\n"
            f"Запустить генерацию?"
        )
        buttons = [
            [{"text": "▶️ Генерировать", "callback_data": f"generate:{loc_type}"}],
            [{"text": "❌ Отмена", "callback_data": "cancel"}],
        ]
        await edit_keyboard(message_id, text, buttons)
    except Exception as e:
        await edit_keyboard(message_id, f"❌ Ошибка: {str(e)[:200]}", [])


async def _do_generate(loc_type: str, message_id: int) -> None:
    """Execute generation and update message with result."""
    labels = {"podmoskovye": "🌲 Подмосковье", "moscow": "🏙 Москва", "blog": "📝 Блог"}
    label = labels.get(loc_type, loc_type)

    await edit_keyboard(message_id, f"⏳ Генерирую {label}...", [])

    try:
        result = await generate_next(loc_type)
        if result["status"] == "nothing_pending":
            await edit_keyboard(message_id, f"✅ {label}: очередь пуста, нечего генерировать.", [])
        else:
            items = result.get("generated", [])
            names = [g.get("name") or g.get("title", "?") for g in items]

            if loc_type in ("moscow", "podmoskovye"):
                buttons = [
                    [{"text": "📝 + Блог", "callback_data": "preview:blog"}],
                    [{"text": "▶️ Ещё один", "callback_data": f"preview:{loc_type}"}],
                ]
                text = f"✅ <b>Готово:</b> {', '.join(names)}\n\nЧто дальше?"
            else:
                buttons = [[{"text": "▶️ Ещё блог", "callback_data": "preview:blog"}]]
                text = f"✅ <b>Готово:</b> {', '.join(names)}"

            await edit_keyboard(message_id, text, buttons)
    except Exception as e:
        await edit_keyboard(message_id, f"❌ Ошибка: {str(e)[:300]}", [])


async def _handle_command(text: str) -> None:
    if text == "/generate" or text == "/start":
        # Show interactive menu
        try:
            s = await get_status()
            mo = s["moscow"]
            pm = s["podmoskovye"]
            menu_text = (
                "🚀 <b>Генерация страниц</b>\n\n"
                f"🏙 Москва: {mo['done']}/{mo['total']} ({mo['pending']} осталось)\n"
                f"🌲 Подмосковье: {pm['done']}/{pm['total']} ({pm['pending']} осталось)\n\n"
                "Выбери что генерировать:"
            )
        except Exception:
            menu_text = "🚀 Выбери что генерировать:"

        buttons = [
            [
                {"text": "🌲 Подмосковье", "callback_data": "preview:podmoskovye"},
                {"text": "🏙 Москва", "callback_data": "preview:moscow"},
            ],
            [{"text": "📝 Блог", "callback_data": "preview:blog"}],
        ]
        await send_keyboard(menu_text, buttons)

    elif text.startswith("/generate "):
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
                await regenerate_slug(slug)
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
            "<b>Генерация:</b>\n"
            "/generate — интерактивное меню с кнопками\n"
            "/generate moscow — только Москва\n"
            "/generate podmoskovye — только Подмосковье\n"
            "/generate blog — только блог-тема\n"
            "/generate uslugi — все страницы услуг\n"
            "/generate region север — все города региона\n"
            "  (север, восток, юго-восток, юг, юго-запад, запад)\n"
            "/regenerate {slug} — перегенерировать район/город\n"
            "/regenerate uslugi {slug} — перегенерировать услугу\n"
            "/refresh-images — обновить изображения блогов\n"
            "/status — прогресс\n"
            "/next — очередь\n\n"
            "<b>Код (Cursor Cloud Agent):</b>\n"
            "/code {задача} — запустить coding agent\n"
            "/code follow {bc-id} {задача} — follow-up\n"
            "/code status — последние agents\n"
            "/code status {bc-id} — статус agent\n"
            "/code cancel {bc-id} — отменить run\n"
            "/code help — подробнее"
        )

    elif text.startswith("/code"):
        await _handle_code_command(text)

    else:
        await notify("❓ Неизвестная команда. Используй /help")


async def _handle_code_command(text: str) -> None:
    """Handle /code subcommands for Cursor Cloud Agent."""
    if not cursor_service.is_configured():
        await notify(
            "❌ Cursor не настроен.\n"
            "Добавь CURSOR_API_KEY в .env на сервере.\n"
            "Ключ: cursor.com/dashboard → Integrations"
        )
        return

    body = text[len("/code"):].strip()

    if not body or body == "help":
        await notify(
            "💻 <b>Cursor Cloud Agent</b>\n\n"
            "Отправь coding-задачу с телефона — agent работает в облаке,\n"
            "меняет код в GitHub и создаёт PR.\n\n"
            "<b>Примеры:</b>\n"
            "<code>/code Fix mobile layout in PriceList.jsx</code>\n"
            "<code>/code Добавь breadcrumbs на страницу услуг</code>\n\n"
            "<code>/code follow bc-xxx Добавь unit tests</code>\n"
            "<code>/code status</code> — последние agents\n"
            "<code>/code status bc-xxx</code> — детали\n"
            "<code>/code cancel bc-xxx</code> — отменить"
        )
        return

    if body == "status":
        try:
            msg = await cursor_service.format_agents_list(5)
            await notify(msg)
        except CursorAPIError as e:
            await notify(f"❌ Cursor error: {str(e)[:200]}")
        return

    if body.startswith("status "):
        agent_id = body.split(maxsplit=1)[1].strip()
        if not AGENT_ID_RE.match(agent_id):
            await notify("❌ Неверный ID. Формат: <code>bc-xxxxxxxx</code>")
            return
        try:
            msg = await cursor_service.format_agent_status(agent_id)
            await notify(msg)
        except CursorAPIError as e:
            await notify(f"❌ Cursor error: {str(e)[:200]}")
        return

    if body.startswith("cancel "):
        agent_id = body.split(maxsplit=1)[1].strip()
        if not AGENT_ID_RE.match(agent_id):
            await notify("❌ Неверный ID. Формат: <code>bc-xxxxxxxx</code>")
            return
        try:
            agent = await cursor_service.get_agent(agent_id)
            run_id = agent.get("latestRunId")
            if not run_id:
                await notify("❌ Нет активного run для отмены.")
                return
            await cursor_service.cancel_run(agent_id, run_id)
            await notify(f"🛑 Run отменён: <code>{agent_id}</code>")
        except CursorAPIError as e:
            await notify(f"❌ {str(e)[:200]}")
        return

    if body.startswith("follow "):
        rest = body[len("follow "):].strip()
        parts = rest.split(maxsplit=1)
        if len(parts) < 2 or not AGENT_ID_RE.match(parts[0]):
            await notify(
                "❌ Формат: <code>/code follow bc-xxx описание задачи</code>"
            )
            return
        agent_id, task = parts[0], parts[1]
        await notify(f"⏳ Follow-up для <code>{agent_id}</code>...")
        try:
            result = await cursor_service.send_followup(agent_id, task)
            agent = result["agent"]
            run = result["run"]
            url = agent.get("url", "")
            msg = (
                f"🚀 <b>Follow-up запущен</b>\n"
                f"🆔 <code>{agent['id']}</code>\n"
                f"🏃 Run: <code>{run['id']}</code>"
            )
            if url:
                msg += f'\n🔗 <a href="{url}">Cursor</a>'
            msg += "\n\nУведомлю когда готово."
            await notify(msg)
        except CursorAPIError as e:
            await notify(f"❌ Cursor error: {str(e)[:200]}")
        return

    # Default: new coding task
    task = body
    if len(task) < 10:
        await notify("❌ Задача слишком короткая. Опиши подробнее что нужно сделать.")
        return

    preview = task[:120] + ("…" if len(task) > 120 else "")
    await notify(f"⏳ Запускаю Cursor agent...\n<i>{preview}</i>")

    try:
        result = await cursor_service.create_coding_task(task)
        agent = result["agent"]
        run = result["run"]
        url = agent.get("url", "")
        msg = (
            f"🚀 <b>Cursor Agent запущен</b>\n"
            f"🆔 <code>{agent['id']}</code>\n"
            f"🏃 Run: <code>{run['id']}</code>"
        )
        if url:
            msg += f'\n🔗 <a href="{url}">Открыть в Cursor</a>'
        msg += "\n\nРаботаю в облаке → PR появится автоматически.\nУведомлю когда готово."
        await notify(msg)
    except CursorAPIError as e:
        await notify(f"❌ Cursor error: {str(e)[:300]}")
