# РусскийАсфальт — russkiyasphalt.ru

Автоматизированный SEO-сайт для компании по асфальтированию в Москве и Подмосковье.

## Стек

- **Backend:** FastAPI + Motor (MongoDB)
- **Frontend:** React 18 + Vite
- **AI Research:** Perplexity Sonar API
- **AI Content:** Claude Sonnet (`claude-sonnet-4-20250514`)
- **Уведомления:** Telegram Bot
- **Индексация:** Яндекс Вебмастер API

## Запуск

### 1. Скопировать `.env`

```bash
cp .env.example .env
# Заполнить ключи
```

### 2. Backend

```bash
pip install -r requirements.txt
uvicorn backend.main:app --reload --port 8000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

## Структура

```
backend/
  main.py              — FastAPI + lifespan (init_db, seed, TTL index)
  database.py          — Motor connection + seed
  routes/
    generate.py        — POST /api/generate, /api/status, /api/next
    pages.py           — GET /api/page/moskva/{okrug}/{slug} и др.
    telegram.py        — POST /webhook/telegram
  services/
    generate.py        — основной flow генерации
    claude_service.py  — Claude API
    perplexity.py      — Perplexity Sonar API
    yandex.py          — Яндекс Вебмастер ping
    telegram_service.py — уведомления
    seo.py             — meta, sitemap, robots, JSON-LD
  models/
    schemas.py         — Pydantic models
frontend/
  src/
    pages/
      Home.jsx         — главная
      District.jsx     — /moskva/{okrug}/{slug}
      City.jsx         — /podmoskovye/{slug}
      Blog.jsx         — /blog/{slug}
      Admin.jsx        — /admin — панель управления
seed/
  moscow_districts.json    — 125 районов
  podmoskovye_cities.json  — 90 городов
```

## Generation Flow

1. `find_one_and_update` (атомарный) → status: in_progress
2. Research: кэш → Perplexity Sonar
3. `style_id = (done_count % 7) + 1`
4. Claude → страница + блог (последовательно)
5. Сохранить в `generated_pages` (2 записи)
6. Обновить статус района/города → done
7. Rebuild sitemap → MongoDB `settings`
8. Яндекс ping
9. Telegram уведомление

## Telegram команды

- `/generate` — следующий (оба)
- `/generate moscow` — только Москва
- `/generate podmoskovye` — только Подмосковье
- `/regenerate {slug}` — перегенерировать
- `/status` — прогресс
- `/next` — очередь
- `/help` — справка

## ENV

```env
ANTHROPIC_API_KEY=
PERPLEXITY_API_KEY=
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
YANDEX_WEBMASTER_TOKEN=
YANDEX_HOST_ID=
MONGODB_URL=mongodb://localhost:27017
COMPANY_PHONE=+7-XXX-XXX-XX-XX
COMPANY_EMAIL=info@russkiyasphalt.ru
```

## Cron

Добавить на cron-job.org:
```
POST https://russkiyasphalt.ru/api/generate
Body: {"location_type": "both"}
Каждые 8 часов
```
