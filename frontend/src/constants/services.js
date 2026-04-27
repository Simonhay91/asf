/**
 * Single source of truth for all services.
 * Used by: Home.jsx (first 8), ServiceList.jsx (all), Service.jsx (hero image).
 *
 * href — route to navigate to
 * isUslugi — true = /uslugi/ page exists; false = blog article
 */
export const ALL_SERVICES = [
  {
    href: '/uslugi/asfaltirovanie-dvorov/',
    name: 'Асфальтирование дворов',
    desc: 'Придомовые территории, частные дома, ТСЖ',
    price: 'от 630 ₽/м²',
    img: '/photos/work10.jpg',
    isUslugi: true,
  },
  {
    href: '/uslugi/asfaltirovanie-parkovok/',
    name: 'Асфальтирование парковок',
    desc: 'Парковки для ТЦ, офисов, складов, ЖК',
    price: 'от 630 ₽/м²',
    img: '/photos/work3.jpg',
    isUslugi: true,
  },
  {
    href: '/uslugi/asfaltirovanie-dorog/',
    name: 'Асфальтирование дорог',
    desc: 'Подъездные пути, проезды, дачные дороги',
    price: 'от 630 ₽/м²',
    img: '/photos/work5.jpg',
    isUslugi: true,
  },
  {
    href: '/uslugi/yamochnyj-remont/',
    name: 'Ямочный ремонт',
    desc: 'Устранение выбоин без полной замены',
    price: 'от 1 200 ₽/м²',
    img: '/photos/work2.jpg',
    isUslugi: true,
  },
  {
    href: '/uslugi/asfaltovaya-kroshka/',
    name: 'Асфальтовая крошка',
    desc: 'Бюджетное покрытие для дачи и хоздвора',
    price: 'от 350 ₽/м²',
    img: '/photos/work4.jpg',
    isUslugi: true,
  },
  {
    href: '/uslugi/asfaltirovanie-promyshlennyh-ploshhadok/',
    name: 'Промышленные площадки',
    desc: 'Склады, заводы, терминалы',
    price: 'от 630 ₽/м²',
    img: '/photos/work7.jpg',
    isUslugi: true,
  },
  {
    href: '/uslugi/asfaltirovanie-sportivnyh-ploshhadok/',
    name: 'Спортивные площадки',
    desc: 'Корты, беговые дорожки, велодорожки',
    price: 'от 630 ₽/м²',
    img: '/photos/work6.jpg',
    isUslugi: true,
  },
  {
    href: '/uslugi/kompleksnoe-blagoustrojstvo-dvora-pod-klyuch/',
    name: 'Благоустройство двора',
    desc: 'Дренаж, бордюры, разметка под ключ',
    price: 'под ключ',
    img: '/photos/work8.jpg',
    isUslugi: true,
  },
]

/** All 8 uslugi pages (sidebar nav uses this) */
export const USLUGI_PAGES = ALL_SERVICES.filter(s => s.isUslugi)
