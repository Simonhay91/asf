import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import PageMeta from '../components/PageMeta'
import PriceCalculator from '../components/PriceCalculator'
import PriceInlineQuote from '../components/PriceInlineQuote'
import WhyPriceBlock from '../components/WhyPriceBlock'
import PriceReviewsStrip from '../components/PriceReviewsStrip'
import { BRAND_PHONE, BRAND_PHONE_HREF } from '../constants/brand'

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
  title: 'Цена асфальтирования площадки и двора в Москве — прайс от 630 ₽/м² | РусскийАсфальт',
  description:
    'Прайс на асфальтирование площадки, двора и территории под ключ в Москве: от 630 ₽/м² с материалом. ' +
    'Парковки, стоянки, ямочный ремонт от 1 200 ₽/м². Замер бесплатно.',
  canonical: 'https://russkiyasphalt.ru/prajs-list/',
  'og:title': 'Асфальтирование площадки и двора — цена за м² | РусскийАсфальт',
  'og:type': 'website',
}

function formatPrice(min, max, free) {
  if (free || (min === 0 && max === 0)) return 'Бесплатно'
  if (min === max) return `от ${min.toLocaleString('ru')} ₽`
  return `${min.toLocaleString('ru')} – ${max.toLocaleString('ru')} ₽`
}

function quoteCommentFor(name) {
  return `Интересует: ${name} (прайс-лист)`
}

function PriceRow({ row, onSelect }) {
  const price = formatPrice(row.min, row.max, row.free)
  const isFree = row.free || (row.min === 0 && row.max === 0)
  const clickable = !isFree && onSelect
  const className = `price-row${row.highlight ? ' price-row--hot' : ''}${clickable ? ' price-row--clickable' : ''}`

  const inner = (
    <>
      <div className="price-row__main">
        <span className="price-row__name">{row.name}</span>
        <span className="price-row__unit">{row.unit}</span>
      </div>
      <span className={`price-row__price${isFree ? ' price-row__price--free' : ''}`}>{price}</span>
      {clickable && <span className="price-row__action">Расчёт →</span>}
    </>
  )

  if (!clickable) {
    return <div className={className}>{inner}</div>
  }

  return (
    <button type="button" className={className} onClick={() => onSelect(row.name)}>
      {inner}
    </button>
  )
}

export default function PriceList({ onQuoteClick }) {
  const [activeId, setActiveId] = useState(SECTIONS[0].id)
  const sectionRefs = useRef({})

  const requestQuote = (comment = '') => {
    onQuoteClick?.(comment)
  }

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
            Прайс на асфальтирование
            <span> площадок, дворов и территорий</span>
          </h1>
          <p className="price-hero__sub">
            Москва и Московская область · цена за м² под ключ · 2026
          </p>
          <div className="price-hero__actions">
            <button type="button" className="btn price-hero__cta" onClick={() => requestQuote()}>
              Получить точный расчёт
            </button>
            <a href={BRAND_PHONE_HREF} className="btn btn-outline price-hero__call">
              {BRAND_PHONE}
            </a>
          </div>
        </div>
      </section>

      <section className="price-featured-wrap">
        <div className="container">
          <div className="price-featured-grid">
            {FEATURED.map(f => (
              <button
                key={f.label}
                type="button"
                className={`price-featured-card${f.free ? ' price-featured-card--free' : ''} price-featured-card--btn`}
                onClick={() => requestQuote(f.free ? 'Нужен бесплатный замер' : quoteCommentFor(f.label))}
              >
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
                <span className="price-featured-card__cta-hint">Заказать расчёт →</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="price-convert-wrap">
        <div className="container price-convert-grid">
          <PriceCalculator onQuoteClick={requestQuote} />
          <PriceInlineQuote sourceUrl="/prajs-list/" />
        </div>
      </section>

      <div className="container">
        <WhyPriceBlock compact />
        <PriceReviewsStrip />
      </div>

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

            <div className="price-table-wrap">
              <table className="price-table">
                <thead>
                  <tr>
                    <th>Наименование</th>
                    <th>Ед.</th>
                    <th>Цена</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {section.rows.map(row => {
                    const price = formatPrice(row.min, row.max, row.free)
                    const isFree = row.free || (row.min === 0 && row.max === 0)
                    return (
                      <tr
                        key={row.name}
                        className={`${row.highlight ? 'price-table__row--hot' : ''}${!isFree ? ' price-table__row--clickable' : ''}`}
                        onClick={!isFree ? () => requestQuote(quoteCommentFor(row.name)) : undefined}
                        role={!isFree ? 'button' : undefined}
                        tabIndex={!isFree ? 0 : undefined}
                        onKeyDown={
                          !isFree
                            ? e => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault()
                                  requestQuote(quoteCommentFor(row.name))
                                }
                              }
                            : undefined
                        }
                      >
                        <td>{row.name}</td>
                        <td><span className="price-badge">{row.unit}</span></td>
                        <td className={isFree ? 'price-table__free' : ''}>{price}</td>
                        <td className="price-table__action">{!isFree ? 'Расчёт →' : ''}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="price-cards">
              {section.rows.map(row => (
                <PriceRow key={row.name} row={row} onSelect={name => requestQuote(quoteCommentFor(name))} />
              ))}
            </div>
          </section>
        ))}

        <aside className="price-note">
          <strong>Важно:</strong> цены ориентировочные и зависят от площади, основания, удалённости от МКАД и объёма.
          Скидка при объёме от 500 м².{' '}
          <button type="button" className="price-note__link" onClick={() => requestQuote()}>
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
          <div className="price-cta-block__actions">
            <button type="button" className="btn" onClick={() => requestQuote()}>
              Получить расчёт
            </button>
            <a href={BRAND_PHONE_HREF} className="btn btn-outline price-cta-block__call">
              Позвонить
            </a>
          </div>
        </div>
      </div>

      <div className="price-sticky-cta">
        <a href={BRAND_PHONE_HREF} className="btn btn-outline price-sticky-cta__call">
          Позвонить
        </a>
        <button type="button" className="btn price-sticky-cta__btn" onClick={() => requestQuote()}>
          Заявка на расчёт
        </button>
      </div>
    </>
  )
}
