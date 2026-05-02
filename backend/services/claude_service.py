import re
import os
import random
import logging
import anthropic

logger = logging.getLogger(__name__)

client = anthropic.AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
MODEL = "claude-sonnet-4-5"

COMPANY_PHONE = "+7 909 628 28 00"
COMPANY_PHONE_TEL = "tel:+79096282800"

COMPANY_BLOCK = """
Ты SEO-копирайтер компании РусскийАсфальт (russkiyasphalt.ru).

КОМПАНИЯ:
- Асфальтирование в Москве и Подмосковье под ключ
- Опыт: 15 лет на рынке
- Гарантия: 5 лет официально, в договоре
- Выезд замерщика: в день обращения, бесплатно
- Собственная техника: без посредников и наценок
- Телефон: +7 909 628 28 00

ЦЕНЫ (фиксируются в договоре):
- Асфальтирование 4 см: от 630 руб/м²
- Асфальтирование 5 см: от 730 руб/м²
- Ямочный ремонт: от 1 200 руб/м²
- Асфальтовая крошка: от 350 руб/м²

ТОН: агрессивный, уверенный. Акцент на цену, скорость, гарантию. Без воды.
ВАЖНО: если упоминаешь телефон — используй ТОЛЬКО +7 909 628 28 00. Никаких других номеров.
""".strip()

PAGE_STYLES = {
    1: "Проблема → Решение → Цены → Этапы работ → CTA",
    2: "Преимущества → Услуги → Наши работы → Цены → CTA",
    3: "Цены в самом начале → Почему мы → Процесс → Гарантии → CTA",
    4: "Локальный контекст → Что делали здесь → Услуги → Цены → CTA",
    5: "FAQ → Услуги → Цены → Отзывы (текст) → CTA",
    6: "Сравнение материалов → Рекомендация → Наши работы → Цены → CTA",
    7: "Этапы работ пошагово → Важность каждого этапа → Цены → CTA",
}

BLOG_TOPICS = {
    1: "Сколько стоит асфальтировать {object} в {location}",
    2: "Ямочный ремонт в {location}: когда делать и сколько стоит",
    3: "Асфальт или плитка: что выбрать для {object} в {location}",
    4: "Как выбрать подрядчика по асфальтированию в {location}",
    5: "Асфальтирование парковки в {location}: этапы и цены",
    6: "Почему трескается асфальт и как исправить в {location}",
    7: "Сезонное асфальтирование в {location}: что важно знать",
}

BLOG_OBJECTS = {
    1: "двор",
    2: "дорогу",
    3: "участок",
    4: "парковку",
    5: "парковку",
    6: "покрытие",
    7: "территорию",
}

TOPIC_STYLES = {
    "technical":    "Экспертная статья: проблема → техническое объяснение → пошаговое решение → практические советы → CTA",
    "business":     "Деловая статья: ситуация → анализ → конкретные советы (нумерованный список) → вывод → CTA",
    "local":        "Локальная статья: местный контекст → специфика региона → наши работы → преимущества → CTA",
    "problems":     "Статья-решение: описание проблемы → причины → решения (с ценами) → профилактика → CTA",
    "inspiration":  "Вдохновляющая статья: история/образ → возможности → примеры → призыв к действию → CTA",
    "service_blog": "Сервисная статья: что включает услуга → этапы → цены (таблица) → почему мы → CTA",
    "landscaping":  "Статья о благоустройстве: зачем нужно → технология → сочетание с асфальтом → цены → CTA",
}

COMPANY_INFO = (
    "Опыт: 15 лет на рынке. "
    "Гарантия: 5 лет официально, в договоре. "
    "Выезд замерщика: в день обращения, бесплатно. "
    "Собственная техника и контроль качества на каждом этапе. "
    "Цены: асфальтирование от 630 руб/м², ямочный ремонт от 1 200 руб/м²."
)

REVIEWS = [
    "Заказывал асфальтирование около своего магазина. Остался доволен — всё сделано оперативно и качественно. — Сергей М.",
    "Специалисты приехали, подготовили площадку, заасфальтировали аккуратно и быстро. Рекомендую! — Инна В.",
    "Остановились на асфальтовой крошке для придомовой территории. Очень довольны результатом. — Татьяна В.",
    "Приятно, что с оформлением заявки не возникло проблем, специалисты приехали быстро. Дали пятилетнюю гарантию. — Сергей С.",
    "Нужно было заасфальтировать двор. Специалисты приехали на следующий день, уложились в два дня. — Виктор А.",
    "Хочу поблагодарить за укладку асфальта на территории предприятия. Стоимость приемлемая, результат — отличный! — Виталий",
]

CTA_LINKS = [
    "[Асфальтирование дворов](/uslugi/asfaltirovanie-dvorov/)",
    "[Асфальтирование парковок](/uslugi/asfaltirovanie-parkovok/)",
    "[Асфальтирование дорог](/uslugi/asfaltirovanie-dorog/)",
    "[Ямочный ремонт](/uslugi/yamochnyj-remont/)",
    "[Асфальтовая крошка](/uslugi/asfaltovaya-kroshka/)",
    "[Прайс-лист](/prajs-list/)",
]

SERVICE_META = {
    "asfaltirovanie-dvorov": {
        "name": "Асфальтирование дворов",
        "price_min": 630, "price_max": 730,
        "keywords": [
            "асфальтирование двора", "заасфальтировать двор Москва",
            "укладка асфальта во дворе цена", "асфальтирование придомовой территории",
        ],
        "related_slugs": ["asfaltirovanie-parkovok", "yamochnyj-remont", "asfaltovaya-kroshka"],
    },
    "asfaltirovanie-parkovok": {
        "name": "Асфальтирование парковок",
        "price_min": 630, "price_max": 730,
        "keywords": [
            "асфальтирование парковки", "заасфальтировать парковку Москва",
            "укладка асфальта на парковке цена", "строительство парковки асфальт",
        ],
        "related_slugs": ["asfaltirovanie-dvorov", "asfaltirovanie-dorog", "yamochnyj-remont"],
    },
    "asfaltirovanie-dorog": {
        "name": "Асфальтирование дорог",
        "price_min": 630, "price_max": 730,
        "keywords": [
            "асфальтирование дороги", "укладка асфальта на дороге цена",
            "асфальтирование проезда Москва", "строительство дороги асфальт",
        ],
        "related_slugs": ["asfaltirovanie-parkovok", "yamochnyj-remont", "asfaltirovanie-dvorov"],
    },
    "yamochnyj-remont": {
        "name": "Ямочный ремонт",
        "price_min": 1200, "price_max": 2500,
        "keywords": [
            "ямочный ремонт асфальта", "ямочный ремонт Москва цена",
            "ремонт ям в асфальте", "заделка выбоин асфальт",
        ],
        "related_slugs": ["asfaltirovanie-dvorov", "asfaltirovanie-dorog", "asfaltovaya-kroshka"],
    },
    "asfaltovaya-kroshka": {
        "name": "Асфальтовая крошка",
        "price_min": 350, "price_max": 500,
        "keywords": [
            "асфальтовая крошка цена", "укладка асфальтовой крошки Москва",
            "асфальтная крошка за м2", "отсев асфальт дешево",
        ],
        "related_slugs": ["asfaltirovanie-dvorov", "yamochnyj-remont", "asfaltirovanie-parkovok"],
    },
    "asfaltirovanie-promyshlennyh-ploshhadok": {
        "name": "Асфальтирование промышленных площадок",
        "price_min": 630, "price_max": 800,
        "keywords": [
            "асфальтирование промышленных площадок", "асфальт для склада Москва",
            "укладка асфальта на заводе", "асфальтирование территории предприятия цена",
        ],
        "related_slugs": ["asfaltirovanie-dorog", "asfaltirovanie-parkovok", "yamochnyj-remont"],
    },
    "asfaltirovanie-sportivnyh-ploshhadok": {
        "name": "Асфальтирование спортивных площадок",
        "price_min": 630, "price_max": 750,
        "keywords": [
            "асфальтирование спортивной площадки", "покрытие для корта асфальт",
            "асфальт для беговой дорожки цена", "асфальтирование велодорожки Москва",
        ],
        "related_slugs": ["asfaltirovanie-dvorov", "kompleksnoe-blagoustrojstvo-dvora-pod-klyuch", "asfaltovaya-kroshka"],
    },
    "kompleksnoe-blagoustrojstvo-dvora-pod-klyuch": {
        "name": "Комплексное благоустройство двора под ключ",
        "price_min": 350, "price_max": 700,
        "keywords": [
            "благоустройство двора под ключ", "комплексное благоустройство территории Москва",
            "асфальтирование двора с бордюрами", "дренаж и асфальт во дворе цена",
        ],
        "related_slugs": ["asfaltirovanie-dvorov", "asfaltovaya-kroshka", "asfaltirovanie-sportivnyh-ploshhadok"],
    },
}


async def generate_district_page(district: dict, research: str, style_id: int) -> dict:
    name = district["name"]
    okrug_name = district["okrug_name"]
    style_desc = PAGE_STYLES.get(style_id, PAGE_STYLES[1])

    prompt = f"""{COMPANY_BLOCK}

ЗАДАЧА: SEO-страница для района {name} ({okrug_name}), Москва.
СТРУКТУРА (стиль {style_id}/7): {style_desc}

ДАННЫЕ О РАЙОНЕ:
{research}

ТРЕБОВАНИЯ:
- Объём: 1800–2200 слов
- H1: вариация "Асфальтирование в {name}"
- Упомяни 3–5 реальных улиц из данных
- Блок с ценами (таблица или список)
- CTA в конце
- НЕ упоминай конкретных клиентов или выдуманные объекты
- Только русский язык

META (после разделителя ---META---):
meta_title: Асфальтирование в {name} — от 630 руб/м² | РусскийАсфальт
meta_description: [150–160 символов, с ценой и гарантией]

ФОРМАТ: только markdown + ---META--- блок. Без пояснений."""

    logger.info(f"Generating district page: {name}, style {style_id}")
    response = await client.messages.create(
        model=MODEL,
        max_tokens=4096,
        messages=[{"role": "user", "content": prompt}],
    )
    return _parse_output(response.content[0].text, fallback_title=f"Асфальтирование в {name}")


async def generate_city_page(city: dict, research: str, style_id: int) -> dict:
    name = city["name"]
    style_desc = PAGE_STYLES.get(style_id, PAGE_STYLES[1])

    prompt = f"""{COMPANY_BLOCK}

ЗАДАЧА: SEO-страница для города {name} (Московская область).
СТРУКТУРА (стиль {style_id}/7): {style_desc}

ДАННЫЕ О ГОРОДЕ:
{research}

ТРЕБОВАНИЯ:
- Объём: 1600–2000 слов
- H1: вариация "Асфальтирование в {name}"
- Упомяни реальные улицы и особенности города
- Акцент: работаем по всей Московской области
- Блок с ценами и CTA
- Только русский язык

META (после разделителя ---META---):
meta_title: Асфальтирование в {name} — от 630 руб/м² | РусскийАсфальт
meta_description: [150–160 символов]

ФОРМАТ: только markdown + ---META--- блок. Без пояснений."""

    logger.info(f"Generating city page: {name}, style {style_id}")
    response = await client.messages.create(
        model=MODEL,
        max_tokens=4096,
        messages=[{"role": "user", "content": prompt}],
    )
    return _parse_output(response.content[0].text, fallback_title=f"Асфальтирование в {name}")


async def generate_blog_article(
    location_name: str,
    location_type: str,
    research: str,
    style_id: int,
) -> dict:
    topic_template = BLOG_TOPICS.get(style_id, BLOG_TOPICS[1])
    obj = BLOG_OBJECTS.get(style_id, "территорию")
    topic = topic_template.format(object=obj, location=location_name)
    loc_context = "района Москвы" if location_type == "district" else "города Подмосковья"

    prompt = f"""{COMPANY_BLOCK}

ЗАДАЧА: Блог-статья для сайта компании.
ТЕМА: {topic}
КОНТЕКСТ: статья для {loc_context} {location_name}

ДАННЫЕ:
{research}

ТРЕБОВАНИЯ:
- Объём: 1200–1600 слов
- H1: тема (можно перефразировать)
- Упомяни локальные особенности {location_name}
- 2–3 внутренних ссылки из списка:
  /uslugi/asfaltirovanie-dvorov/
  /uslugi/asfaltirovanie-parkovok/
  /uslugi/asfaltirovanie-dorog/
  /uslugi/yamochnyj-remont/
  /uslugi/asfaltovaya-kroshka/
  /prajs-list/
- CTA в конце
- Только русский язык

META (после разделителя ---META---):
meta_title: {topic} | РусскийАсфальт
meta_description: [150–160 символов]

ФОРМАТ: только markdown + ---META--- блок. Без пояснений."""

    logger.info(f"Generating blog: {topic[:60]}, style {style_id}")
    response = await client.messages.create(
        model=MODEL,
        max_tokens=3072,
        messages=[{"role": "user", "content": prompt}],
    )
    result = _parse_output(response.content[0].text, fallback_title=topic)
    result["topic"] = topic
    return result


async def generate_topic_article(topic: dict, research: str = "") -> dict:
    """Generate a standalone blog article from blog_topics seed."""
    title = topic["title"]
    category = topic.get("category", "technical")
    style_variant = TOPIC_STYLES.get(category, TOPIC_STYLES["technical"])
    review = random.choice(REVIEWS)
    fact_sheet = research if research else "Данные недоступны — используй экспертные формулировки без конкретных цифр."
    cta_links = "\n".join(f"  {link}" for link in CTA_LINKS)

    prompt = f"""Role: Ты — AI-архитектор контента для «РусскийАсфальт».
Goal: Создание SEO-статьи, которая гарантированно индексируется и конвертирует.

INPUT DATA:
Topic: {title}
Fact-Sheet: {fact_sheet}
Style: {style_variant}
Review: {review}
Company: {COMPANY_INFO}

INSTRUCTION (Pipeline):

1. Data Integration: Используй Fact-Sheet как единственный источник технических данных (цены, ГОСТы, температуры). Если данных нет — не выдумывай, используй общие экспертные формулировки.

2. Structure Enforcement (строго):
   — Вступление: проблема пользователя + решение
   — Технический блок: ГОСТы, этапы, нюансы из Fact-Sheet (таблица если применимо)
   — Блок «Почему РусскийАсфальт»: {COMPANY_INFO}
   — Блок «Социальное доказательство»: вставь отзыв из Review дословно
   — Заключение + CTA

3. Tone & Style: {style_variant}. Экспертный, без «воды», акцент на долговечность и надёжность.

4. SEO Compliance:
   — Органично включи LSI-фразы: «асфальтирование под ключ», «асфальт Москва», «укладка асфальта цена за м²»
   — Internal links (вставляй в местах, где речь о конкретной услуге):
{cta_links}

5. Constraint: статья 1500–2200 слов. Используй таблицы для сравнения цен или материалов.

OUTPUT FORMAT: только готовый Markdown (H1, H2, H3, таблицы). Никаких вводных фраз от себя.

META (после разделителя ---META---):
meta_title: {title} | РусскийАсфальт
meta_description: [150–160 символов: ключевое слово + польза + CTA]"""

    logger.info(f"Generating topic blog: {title[:60]}")
    response = await client.messages.create(
        model=MODEL,
        max_tokens=4096,
        messages=[{"role": "user", "content": prompt}],
    )
    result = _parse_output(response.content[0].text, fallback_title=title)
    result["topic"] = title
    return result


async def generate_service_page(slug: str) -> dict:
    """Generate full AI content for a service page (/uslugi/{slug}/)."""
    meta = SERVICE_META.get(slug)
    if not meta:
        raise ValueError(f"Unknown service slug: {slug}")

    service_name = meta["name"]
    price_min = meta["price_min"]
    price_max = meta["price_max"]
    keywords_str = ", ".join(meta["keywords"])
    reviews_sample = random.sample(REVIEWS, 2)
    reviews_str = "\n".join(f'- «{r}»' for r in reviews_sample)

    related_links = [
        link for link in CTA_LINKS
        if any(s in link for s in meta["related_slugs"])
    ]
    related_str = "\n".join(f"  {l}" for l in related_links)

    prompt = f"""{COMPANY_BLOCK}

ЗАДАЧА: Полноценная SEO-страница услуги «{service_name}» (URL: /uslugi/{slug}/).

СТРУКТУРА (строго по порядку):

1. **Hero** — H1: название услуги + оффер (цена, гарантия). Подзаголовок: какую проблему клиента решаем.

2. **Введение** — Почему {service_name} важно именно в Москве и МО. Боль клиента, наше решение. 2–3 абзаца.

3. **Процесс** — 4 этапа с заголовком H2: от замера до сдачи. Акцент на технологию и оборудование.

4. **Технические преимущества** — Маркированный список:
   - Собственная лаборатория контроля качества
   - Сертифицированные материалы (ГОСТ/СНиП)
   - Собственная техника без посредников
   - Официальный договор и гарантия 5 лет

5. **Цены** — Таблица markdown с диапазоном {price_min}–{price_max} руб/м². 2–4 варианта по объёму/сложности.

6. **Почему мы** — 3 пункта: Опыт 15 лет | Гарантия 5 лет | Выезд замерщика сегодня.

7. **Отзывы** — 2 реальных отзыва клиентов (вставь дословно):
{reviews_str}

8. **CTA-блок** — «Получить расчёт стоимости» с призывом заполнить форму. Укажи, что выезд замерщика бесплатный.

SEO: органично вставь ключевые слова: {keywords_str}
Перелинковка (вставляй в тексте там, где уместно):
{related_str}

ТРЕБОВАНИЯ:
- Объём: 1500–2000 слов
- Только русский язык
- Профессиональный, доверительный тон. Без воды. Акцент на цену, скорость, гарантию.
- Не выдумывай конкретные адреса или имена клиентов

META (после разделителя ---META---):
meta_title: {service_name} в Москве — от {price_min} руб/м² | РусскийАсфальт
meta_description: [150–160 символов: ключевое слово + цена + гарантия + CTA]

ФОРМАТ: только markdown + ---META--- блок. Без вводных фраз от себя."""

    logger.info(f"Generating service page: {slug}")
    response = await client.messages.create(
        model=MODEL,
        max_tokens=4096,
        messages=[{"role": "user", "content": prompt}],
    )
    result = _parse_output(response.content[0].text, fallback_title=f"{service_name} в Москве")
    result["slug"] = slug
    result["service_name"] = service_name
    result["reviews"] = reviews_sample
    return result


# ─── helpers ───

_PHONE_RE = re.compile(
    r'(?:\+7|8)[\s\-\(]*\d{3}[\s\-\)]*\d{3}[\s\-]*\d{2}[\s\-]*\d{2}'
)

def _sanitize_phones(text: str) -> str:
    """Replace any phone number or placeholder in generated content with the official one."""
    # Replace real phone numbers (any +7/8 XXXXXXXXXX pattern)
    text = _PHONE_RE.sub(COMPANY_PHONE, text)
    # Replace +7 (XXX) XXX-XX-XX style placeholders
    text = re.sub(r'(?:\+7|8)[\s\-\(]*[Xx\*]{2,}[\s\-\(\)Xx\*\d]*', COMPANY_PHONE, text)
    # Replace standalone XXXXX / XXX-XX-XX placeholders
    text = re.sub(r'\b[Xx]{3,}(?:[\s\-][Xx\d]+)*\b', COMPANY_PHONE, text)
    return text


def _parse_output(raw: str, fallback_title: str) -> dict:
    if "---META---" in raw:
        parts = raw.split("---META---", 1)
        content = parts[0].strip()
        meta_block = parts[1].strip()
    else:
        logger.warning("Claude output missing ---META--- block")
        content = raw.strip()
        meta_block = ""

    content = _sanitize_phones(content)
    meta_title = (_extract_field(meta_block, "meta_title") or fallback_title)[:70]
    meta_description = (_extract_field(meta_block, "meta_description") or "")[:160]

    return {"content": content, "meta_title": meta_title, "meta_description": meta_description}


def _extract_field(text: str, field: str) -> str:
    match = re.search(rf"^{field}:\s*(.+)$", text, re.MULTILINE | re.IGNORECASE)
    if match:
        return match.group(1).strip().strip('"').strip("'")
    return ""


def parse_faq_from_markdown(markdown_text: str) -> list[tuple[str, str]]:
    """Extract Q&A pairs from Claude output (style 5). Supports 3 formats."""
    # Format 1: ### Question?\nAnswer
    matches = re.findall(
        r"#{2,4}\s+(.+\?)\s*\n+([\s\S]+?)(?=\n#{2,4}|\Z)", markdown_text, re.MULTILINE
    )
    if matches:
        return [(q.strip(), re.sub(r'\s+', ' ', a).strip()[:500]) for q, a in matches if q and a]

    # Format 2: **Question?**\nAnswer
    matches = re.findall(
        r"\*\*(.+\?)\*\*\s*\n+([\s\S]+?)(?=\n\*\*|\Z)", markdown_text, re.MULTILINE
    )
    if matches:
        return [(q.strip(), re.sub(r'\s+', ' ', a).strip()[:500]) for q, a in matches if q and a]

    # Format 3: Q: ... / A: ...
    matches = re.findall(
        r"[QВ]:\s*(.+\?)\s*\n+[AА]:\s*([\s\S]+?)(?=\n[QВ]:|\Z)", markdown_text, re.MULTILINE
    )
    return [(q.strip(), re.sub(r'\s+', ' ', a).strip()[:500]) for q, a in matches if q and a]
