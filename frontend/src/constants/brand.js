/** Shared brand copy — single source of truth for UI */
export const BRAND_NAME = 'РусскийАсфальт'
export const BRAND_TAGLINE = 'Асфальт под ключ · Москва и МО · с 2009 года'
export const BRAND_GEO = 'Москва и Подмосковье'
export const BRAND_PRICE_FROM = '630'
export const BRAND_WARRANTY = '5 лет'
export const BRAND_EXPERIENCE = '15 лет'
export const BRAND_PHONE = '+7 909 628 28 00'
export const BRAND_PHONE_HREF = 'tel:+79096282800'
export const BRAND_EMAIL = 'info@russkiyasphalt.ru'
export const BRAND_YEAR = 2026

export const BRAND_ADDRESS =
  'Москва, Мясницкая улица, 41, стр. 5 (м. «Красные Ворота»)'
export const BRAND_ADDRESS_LINE1 = 'Москва, ул. Мясницкая, 41, стр. 5'
export const BRAND_METRO = 'м. «Красные Ворота»'
export const BRAND_MAP_QUERY = 'Москва, Мясницкая улица, 41, стр. 5'
export const BRAND_MAP_URL = `https://yandex.ru/maps/?text=${encodeURIComponent(BRAND_MAP_QUERY)}&z=17&lang=ru_RU`
export const BRAND_HOURS = 'Пн–Вс: 08:00–20:00'

/** E-E-A-T: когда появятся реальные реквизиты — вписать сюда (не нужен .env) */
export const BRAND_FOUNDED = 2009
export const BRAND_INN = ''
export const BRAND_OGRN = ''
export const BRAND_SRO = ''

/** Почему цена от 630 ₽/м² — не «дешёвый асфальт», а под ключ */
export const WHY_PRICE_INTRO =
  'На рынке Москвы и МО часто встречается «от 350–450 ₽/м²». Мы работаем от 630 ₽/м² — потому что в смету сразу входит полный цикл под ключ, а не только укладка верхнего слоя.'

export const WHY_PRICE_POINTS = [
  {
    title: 'Подготовка основания',
    desc: 'Планировка, щебень, уплотнение и проливка — без этого покрытие не прослужит 3–5 лет.',
  },
  {
    title: 'Горячий асфальт и ГОСТ',
    desc: 'Контроль температуры смеси, толщины слоя и уплотнения катком — не «крошка на песок».',
  },
  {
    title: 'Своя техника',
    desc: 'Асфальтоукладчик и катки без аренды — без простоев и накруток посредников.',
  },
  {
    title: 'Гарантия 5 лет в договоре',
    desc: 'Фиксированная цена после выезда замерщика. Дефекты по нашей вине устраняем бесплатно.',
  },
]

export const WHY_PRICE_COMPARE =
  'Бюджетные предложения «от 395 ₽» часто не включают основание, вывоз грунта или доставку смеси. После замера вы получаете прозрачную смету — без сюрпризов на объекте.'
