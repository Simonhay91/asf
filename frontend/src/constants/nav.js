/** Site-wide navigation — single source for header, subnav, sidebar, footer */

export const MAIN_NAV = [
  { to: '/', label: 'Главная', end: true },
  { to: '/uslugi/', label: 'Услуги' },
  { to: '/prajs-list/', label: 'Прайс' },
  { to: '/moskva/', label: 'Москва' },
  { to: '/regiony/', label: 'Подмосковье' },
  { to: '/blog/', label: 'Блог' },
  { to: '/o-kompanii/', label: 'О компании' },
  { to: '/kontakty/', label: 'Контакты' },
]

export function isNavActive(pathname, item) {
  if (item.end) return pathname === '/' || pathname === ''
  if (item.to === '/uslugi/') return pathname.startsWith('/uslugi')
  if (item.to === '/moskva/') return pathname.startsWith('/moskva')
  if (item.to === '/regiony/') return pathname.startsWith('/regiony') || pathname.startsWith('/podmoskovye')
  if (item.to === '/blog/') return pathname.startsWith('/blog')
  return pathname === item.to || pathname.startsWith(item.to)
}
