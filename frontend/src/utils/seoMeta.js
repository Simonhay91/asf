import { BRAND_NAME } from '../constants/brand'

const SITE_URL = 'https://russkiyasphalt.ru'
const SITE_NAME = BRAND_NAME
const DEFAULT_IMAGE = `${SITE_URL}/og-image.svg`

function normalizePath(path) {
  if (path.startsWith('http')) return path
  let p = path.startsWith('/') ? path : `/${path}`
  if (p !== '/' && !p.endsWith('/')) p += '/'
  return p
}

export function buildMeta(title, description, path, pageType = 'website') {
  const canonical = path.startsWith('http') ? path : `${SITE_URL}${normalizePath(path)}`
  const desc = (description || '').slice(0, 160)
  const ogDesc = (description || '').slice(0, 200)
  return {
    title,
    description: desc,
    canonical,
    'og:title': title,
    'og:description': ogDesc,
    'og:url': canonical,
    'og:image': DEFAULT_IMAGE,
    'og:type': pageType,
  }
}

export function cityMeta(cityName, slug) {
  const title = `Асфальтирование в ${cityName} — от 630 руб/м² | ${SITE_NAME}`
  const description =
    `Асфальтирование в ${cityName} и Московской области под ключ. ` +
    'Собственная техника, гарантия 5 лет. Выезд замерщика бесплатно.'
  return buildMeta(title, description, `/podmoskovye/${slug}/`)
}

const SERVICE_SEO = {
  'asfaltirovanie-dvorov': { name: 'Асфальтирование дворов', price: 630 },
  'asfaltirovanie-parkovok': { name: 'Асфальтирование парковок', price: 630 },
  'asfaltirovanie-dorog': { name: 'Асфальтирование дорог', price: 630 },
  'yamochnyj-remont': { name: 'Ямочный ремонт', price: 1200 },
  'asfaltovaya-kroshka': { name: 'Асфальтовая крошка', price: 350 },
  'asfaltirovanie-promyshlennyh-ploshhadok': { name: 'Промышленные площадки', price: 630 },
  'asfaltirovanie-sportivnyh-ploshhadok': { name: 'Спортивные площадки', price: 630 },
  'kompleksnoe-blagoustrojstvo-dvora-pod-klyuch': { name: 'Благоустройство двора', price: 350 },
}

export function serviceMeta(slug) {
  const svc = SERVICE_SEO[slug]
  if (!svc) return null
  const title = `${svc.name} в Москве — от ${svc.price} руб/м² | ${SITE_NAME}`
  const description = `${svc.name} в Москве под ключ. Цена от ${svc.price} руб/м², гарантия 5 лет.`
  return buildMeta(title, description, `/uslugi/${slug}/`)
}

export function blogMetaFromSlug(slug) {
  const title = slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
  const description =
    `${title}: советы по асфальтированию в Москве и Подмосковье, цены и технологии от ${SITE_NAME}.`
  return buildMeta(`${title} | ${SITE_NAME}`, description, `/blog/${slug}/`, 'article')
}

export const KONTAKTY_META = buildMeta(
  `Контакты — ${SITE_NAME}`,
  'Офис: Москва, ул. Мясницкая, 41, стр. 5 (м. Красные Ворота). Телефон, email, режим работы. Выезд замерщика в день обращения.',
  '/kontakty/',
)

export const ABOUT_META = buildMeta(
  `О компании — ${SITE_NAME}`,
  'РусскийАсфальт: 15 лет асфальтирования в Москве и Подмосковье, собственная техника, гарантия 5 лет на все виды работ.',
  '/o-kompanii/',
)

export function okrugMeta(okrugName, okrugShort, okrugSlug, districtCount) {
  const title = `Асфальтирование в ${okrugName} — от 630 руб/м² | ${SITE_NAME}`
  const description =
    `Асфальтирование дворов, площадок и парковок в ${okrugName} (${okrugShort}). ` +
    `${districtCount} районов, выезд замерщика в день обращения, цены от 630 руб/м² под ключ.`
  return buildMeta(title, description, `/moskva/${okrugSlug}/`)
}

export function districtMetaFallback(okrug, slug, districtName, okrugShort) {
  const place = districtName || 'районе Москвы'
  const ao = okrugShort ? ` (${okrugShort})` : ''
  const title = `Асфальтирование в ${place}${ao} — от 630 руб/м² | ${SITE_NAME}`
  const description =
    `Асфальтирование в ${place} под ключ: дворы, площадки, парковки. ` +
    'Выезд замерщика в день обращения, гарантия 5 лет, от 630 руб/м².'
  return buildMeta(title, description, `/moskva/${okrug}/${slug}/`)
}

export const HOME_META = buildMeta(
  'Асфальтирование в Москве и Подмосковье — от 630 руб/м² | РусскийАсфальт',
  'Асфальтирование двора, парковок и дорог в Москве и Подмосковье под ключ. Цена от 630 руб/м². Выезд замерщика в день обращения, гарантия 5 лет.',
  '/',
)

export const BLOG_LIST_META = buildMeta(
  'Блог об асфальтировании — РусскийАсфальт',
  'Статьи об асфальтировании: цены, технологии, советы по выбору подрядчика. Полезные материалы от профессионалов.',
  '/blog/',
)

export const NOT_FOUND_META = buildMeta(
  `Страница не найдена — ${SITE_NAME}`,
  'Запрашиваемая страница не найдена. Асфальтирование в Москве и Подмосковье под ключ — цены от 630 руб/м², гарантия 5 лет.',
  '/',
)
