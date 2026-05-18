import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import PageMeta from '../components/PageMeta'

const SECTIONS = [
  {
    id: 'asfalt',
    title: 'Асфальтирование',
    icon: '🛣️',
    rows: [
      { name: 'Асфальтирование под ключ', unit: 'м²', min: 630, max: 800, highlight: true },
      { name: 'Асфальтирование дворов', unit: 'м²', min: 630, max: 730, highlight: true },
      { name: 'Асфальтирование парковок', unit: 'м²', min: 630, max: 730 },
      { name: 'Асфальтирование стоянок', unit: 'м²', min: 630, max: 730 },
      { name: 'Асфальтирование дорог и улиц', unit: 'м²', min: 630, max: 730 },
      { name: 'Асфальтирование придомовой территории', unit: 'м²', min: 630, max: 730 },
      { name: 'Асфальтирование площадок', unit: 'м²', min: 630, max: 800 },
      { name: 'Асфальтирование дорожек и тротуаров', unit: 'м²', min: 630, max: 730 },
      { name: 'Асфальтирование частного дома и участка', unit: 'м²', min: 630, max: 730 },
      { name: 'Асфальтирование дачного участка', unit: 'м²', min: 630, max: 730 },
      { name: 'Асфальтирование СНТ', unit: 'м²', min: 630, max: 800 },
      { name: 'Асфальтирование территорий предприятий', unit: 'м²', min: 630, max: 800 },
      { name: 'Асфальтирование малых площадей (до 100 м²)', unit: 'м²', min: 730, max: 900 },
      { name: 'Укладка асфальтовой крошки', unit: 'м²', min: 350, max: 500, highlight: true },
    ],
  },
  {
    id: 'remont',
    title: 'Ремонт асфальта',
    icon: '🔧',
    rows: [
      { name: 'Ямочный ремонт асфальта', unit: 'м²', min: 1200, max: 2500, highlight: true },
      { name: 'Ремонт трещин в асфальте', unit: 'п.м.', min: 300, max: 800 },
      { name: 'Ремонт и замена асфальта', unit: 'м²', min: 800, max: 1500 },
      { name: 'Резка асфальта (алмазная)', unit: 'п.м.', min: 250, max: 500 },
      { name: 'Демонтаж асфальтового покрытия', unit: 'м²', min: 150, max: 300 },
    ],
  },
  {
    id: 'dorogi',
    title: 'Строительство дорог',
    icon: '🚧',
    rows: [
      { name: 'Строительство дорог с нуля', unit: 'м²', min: 900, max: 1500 },
      { name: 'Строительство временных дорог', unit: 'м²', min: 500, max: 900 },
      { name: 'Строительство дорог в СНТ', unit: 'м²', min: 700, max: 1200 },
      { name: 'Строительство дачных дорог', unit: 'м²', min: 630, max: 1000 },
      { name: 'Строительство грунтовых дорог', unit: 'м²', min: 300, max: 600 },
      { name: 'Дорожные работы под ключ', unit: 'м²', min: 900, max: 1800 },
    ],
  },
  {
    id: 'blag',
    title: 'Благоустройство',
    icon: '🏡',
    rows: [
      { name: 'Укладка тротуарной плитки', unit: 'м²', min: 850, max: 1400 },
      { name: 'Укладка брусчатки', unit: 'м²', min: 900, max: 1600 },
      { name: 'Установка бордюров и поребриков', unit: 'п.м.', min: 350, max: 600 },
      { name: 'Установка лежачих полицейских', unit: 'шт.', min: 4500, max: 9000 },
      { name: 'Нанесение дорожной разметки', unit: 'п.м.', min: 80, max: 200 },
      { name: 'Озеленение и благоустройство', unit: 'м²', min: 400, max: 900 },
    ],
  },
  {
    id: 'extra',
    title: 'Доп. работы',
    icon: '⚙️',
    rows: [
      { name: 'Земляные работы (срезка, планировка)', unit: 'м²', min: 100, max: 250 },
      { name: 'Вывоз строительного мусора', unit: 'т', min: 1500, max: 3000 },
      { name: 'Уборка снега и содержание дорог', unit: 'м²', min: 30, max: 80 },
      { name: 'Выезд замерщика', unit: 'выезд', min: 0, max: 0, free: true },
    ],
  },
]

const FEATURED = [
  { label: 'Асфальт под ключ', from: 630, unit: '₽/м²', desc: 'С материалом и работой' },
  { label: 'Ямочный ремонт', from: 1200, unit: '₽/м²', desc: 'Быстро, с гарантией' },
  { label: 'Асфальтовая крошка', from: 350, unit: '₽/м²', desc: 'Экономичное покрытие' },
  { label: 'Замер объекта', from: 0, unit: '', desc: 'В день обращения', free: true },
]

const SERVICE_LINKS = [
  { to: '/uslugi/asfaltirovanie-dvorov/', label: 'Дворы' },
  { to: '/uslugi/asfaltirovanie-parkovok/', label: 'Парковки' },
  { to: '/uslugi/asfaltirovanie-dorog/', label: 'Дороги' },
  { to: '/uslugi/yamochnyj-remont/', label: 'Ямочный ремонт' },
  { to: '/uslugi/asfaltovaya-kroshka/', label: 'Крошка' },
  { to: '/uslugi/asfaltirovanie-promyshlennyh-ploshhadok/', label: 'Промплощадки' },
]

const META = {
  title: 'Прайс-лист на асфальтирование в Москве 2026 | от 630 ₽/м² | РусскийАсфальт',
  description: 'Прайс на асфальтирование в Москве: дворы и парковки от 630 ₽/м², ямочный ремонт от 1 200 ₽/м², крошка от 350 ₽/м². Цены с материалом. Замер бесплатно.',
  canonical: 'https://russkiyasphalt.ru/prajs-list/',
  'og:title': 'Прайс-лист на асфальтирование | от 630 ₽/м² | РусскийАсфальт',
  'og:type': 'website',
}

function formatPrice(min, max, free) {
  if (free || (min === 0 && max === 0)) return 'Бесплатно'
  if (min === max) return `от ${min.toLocaleString('ru')} ₽`
  return `${min.toLocaleString('ru')} – ${max.toLocaleString('ru')} ₽`
}

function PriceRow({ row }) {
  const price = formatPrice(row.min, row.max, row.free)
  const isFree = row.free || (row.min === 0 && row.max === 0)

  return (
    <div className={`price-row${row.highlight ? ' price-row--hot' : ''}`}>
      <div className="price-row__main">
        <span className="price-row__name">{row.name}</span>
        <span className="price-row__unit">{row.unit}</span>
      </div>
      <span className={`price-row__price${isFree ? ' price-row__price--free' : ''}`}>{price}</span>
    </div>
  )
}

export default function PriceList({ onQuoteClick }) {
  const [activeId, setActiveId] = useState(SECTIONS[0].id)
  const sectionRefs = useRef({})

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible?.target?.id) setActiveId(visible.target.id)
      },
      { rootMargin: '-120px 0px -55% 0px', threshold: [0, 0.15, 0.4] },
    )
    SECTIONS.forEach(s => {
      const el = sectionRefs.current[s.id]
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  const scrollToSection = id => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setActiveId(id)
  }

  return (
    <>
      <PageMeta meta={META} jsonld={[]} />

      {/* Hero */}
      <section className="price-hero">
        <img src="/photos/work5.jpg" alt="Асфальтирование — прайс-лист" className="price-hero__bg" />
        <div className="price-hero__overlay" />
        <div className="container price-hero__content">
          <nav className="price-breadcrumb">
            <Link to="/">Главная</Link>
            <span>/</span>
            <span>Прайс-лист</span>
          </nav>
          <h1 className="price-hero__title">
            Прайс-лист
            <span> на асфальтирование</span>
          </h1>
          <p className="price-hero__sub">
            Москва и Московская область · 2026 · цены с материалом
          </p>
          <button type="button" className="btn price-hero__cta" onClick={onQuoteClick}>
            Получить точный расчёт
          </button>
        </div>
      </section>

      {/* Featured prices */}
      <section className="price-featured-wrap">
        <div className="container">
          <div className="price-featured-grid">
            {FEATURED.map(f => (
              <div key={f.label} className={`price-featured-card${f.free ? ' price-featured-card--free' : ''}`}>
                <div className="price-featured-card__label">{f.label}</div>
                <div className="price-featured-card__price">
                  {f.free ? (
                    <span className="price-featured-card__free">Бесплатно</span>
                  ) : (
                    <>
                      <span className="price-featured-card__from">от</span>
                      {f.from.toLocaleString('ru')}
                      <span className="price-featured-card__unit">{f.unit}</span>
                    </>
                  )}
                </div>
                <div className="price-featured-card__desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sticky category nav */}
      <nav className="price-nav" aria-label="Разделы прайса">
        <div className="price-nav__scroll">
          {SECTIONS.map(s => (
            <button
              key={s.id}
              type="button"
              className={`price-nav__pill${activeId === s.id ? ' price-nav__pill--active' : ''}`}
              onClick={() => scrollToSection(s.id)}
            >
              <span className="price-nav__icon" aria-hidden>{s.icon}</span>
              {s.title}
            </button>
          ))}
        </div>
      </nav>

      <div className="container price-body">
        {SECTIONS.map(section => (
          <section
            key={section.id}
            id={section.id}
            ref={el => { sectionRefs.current[section.id] = el }}
            className="price-section"
          >
            <header className="price-section__head">
              <span className="price-section__icon" aria-hidden>{section.icon}</span>
              <h2 className="price-section__title">{section.title}</h2>
              <span className="price-section__count">{section.rows.length} поз.</span>
            </header>

            {/* Desktop table */}
            <div className="price-table-wrap">
              <table className="price-table">
                <thead>
                  <tr>
                    <th>Наименование</th>
                    <th>Ед.</th>
                    <th>Цена</th>
                  </tr>
                </thead>
                <tbody>
                  {section.rows.map(row => {
                    const price = formatPrice(row.min, row.max, row.free)
                    const isFree = row.free || (row.min === 0 && row.max === 0)
                    return (
                      <tr key={row.name} className={row.highlight ? 'price-table__row--hot' : ''}>
                        <td>{row.name}</td>
                        <td><span className="price-badge">{row.unit}</span></td>
                        <td className={isFree ? 'price-table__free' : ''}>{price}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="price-cards">
              {section.rows.map(row => (
                <PriceRow key={row.name} row={row} />
              ))}
            </div>
          </section>
        ))}

        <aside className="price-note">
          <strong>Важно:</strong> цены ориентировочные и зависят от площади, основания, удалённости от МКАД и объёма.
          Скидка при объёме от 500 м².{' '}
          <button type="button" className="price-note__link" onClick={onQuoteClick}>
            Закажите бесплатный замер
          </button>{' '}
          для точного расчёта.
        </aside>

        <div className="price-services">
          <h2 className="price-services__title">Подробнее об услугах</h2>
          <div className="price-services__links">
            {SERVICE_LINKS.map(s => (
              <Link key={s.to} to={s.to} className="price-services__chip">
                {s.label}
                <span aria-hidden>→</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="price-cta-block cta-block">
          <h2>Рассчитаем стоимость за 30 минут</h2>
          <p>Замерщик выедет в день обращения — бесплатно</p>
          <button type="button" className="btn" onClick={onQuoteClick}>
            Получить расчёт
          </button>
        </div>
      </div>

      {/* Mobile sticky CTA */}
      <div className="price-sticky-cta">
        <button type="button" className="btn price-sticky-cta__btn" onClick={onQuoteClick}>
          Бесплатный замер и расчёт
        </button>
      </div>
    </>
  )
}
