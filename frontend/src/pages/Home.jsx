import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import PageMeta from '../components/PageMeta'
import { HOME_META } from '../utils/seoMeta'
import { ALL_SERVICES } from '../constants/services'
import { CITIES } from '../constants/cities'
import {
  BRAND_TAGLINE,
  BRAND_EXPERIENCE,
  BRAND_WARRANTY,
  BRAND_PRICE_FROM,
  BRAND_PHONE_HREF,
  WHY_PRICE_INTRO,
  WHY_PRICE_POINTS,
  WHY_PRICE_COMPARE,
} from '../constants/brand'
import { useCitiesStatus } from '../hooks/useCitiesStatus'

const SLIDES = [
  {
    img: '/photos/work3.jpg',
    title: 'Асфальтирование\nпод ключ',
    sub: 'Дворы, парковки, дороги — от 630 руб/м². Гарантия 5 лет.',
  },
  {
    img: '/photos/work5.jpg',
    title: 'Собственная\nтехника',
    sub: 'Без посредников и аренды — работаем быстро и дешевле.',
  },
  {
    img: '/photos/work9.jpg',
    title: 'Москва и\nПодмосковье',
    sub: 'Более 500 объектов. Выезд замерщика в день обращения.',
  },
]

const PRICES = [
  { label: 'Асфальтирование 4 см', price: 'от 630', unit: 'руб/м²', note: 'горячий асфальт', popular: false },
  { label: 'Асфальтирование 6 см', price: 'от 730', unit: 'руб/м²', note: 'усиленное покрытие', popular: true },
  { label: 'Ямочный ремонт', price: 'от 1 200', unit: 'руб/м²', note: 'без замены полотна', popular: false },
  { label: 'Асфальтовая крошка', price: 'от 350', unit: 'руб/м²', note: 'бюджетный вариант', popular: false },
]

const ADVANTAGES = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
    title: 'Гарантия 5 лет по договору',
    desc: 'Прописываем гарантийные обязательства в контракте. Бесплатно устраняем дефекты, если они возникнут по нашей вине.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18"/>
      </svg>
    ),
    title: 'Контроль качества на каждом этапе',
    desc: 'Проверяем плотность, температуру и состав смеси на соответствие ГОСТу при укладке асфальта в Московской области.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
    title: 'Прямые поставки без посредников',
    desc: 'Работаем с ведущими АБЗ напрямую — цены ниже рыночных без потери качества материалов.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    title: 'Парк собственной техники 15+ единиц',
    desc: 'Катки, асфальтоукладчики, фрезы — никаких простоев из-за аренды. Асфальтирование под ключ в любых объёмах.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
    title: '15 лет в дорожном строительстве',
    desc: 'Более 500 объектов сдано. Знаем специфику грунтов Подмосковья, климат и требования администрации.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
    title: 'Фиксированная цена в договоре',
    desc: 'После выезда замерщика цена не меняется. Никаких «непредвиденных расходов» в процессе укладки асфальта.',
  },
]

// Home shows all 8 from shared constants (max 8, 4×2 grid)
const SERVICES = ALL_SERVICES.slice(0, 8)

const PROJECTS = [
  { name: 'Строительство автодороги ООО «Газрегион»', volume: '44 000 м²', days: '3 месяца', address: 'МО, Одинцовский р-н, пос. Горки-10' },
  { name: 'Восстановление покрытия — Кондитерский концерн Бабаевский', volume: '2 976 м²', days: '4 дня', address: 'г. Москва, ул. Малая Красносельская, 7' },
  { name: 'Асфальтирование школьного двора МБОУ СОШ №4', volume: '550 м²', days: '2 дня', address: 'МО, г. Балашиха' },
  { name: 'Восстановление покрытия Сергиево-Посадского мясокомбината', volume: '4 650 м²', days: '6 дней', address: 'МО, г. Сергиев Посад' },
  { name: 'Асфальтирование территории ООО «АТК-14»', volume: '3 800 м²', days: '5 дней', address: 'МО, г. Воскресенск, Технопарк Федино' },
  { name: 'Дорога с/п Ульянинское, д. Поддубье', volume: '10 000 м²', days: '15 дней', address: 'МО, Раменский р-н, д. Поддубье' },
]

const REVIEWS = [
  { name: 'Сергей Михайлович', stars: 5, text: 'Заказывал асфальтирование около своего магазина. Остался доволен работой — всё сделано оперативно и качественно.' },
  { name: 'Инна Викторовна', stars: 4, text: 'Заказывала укладку асфальта на даче. Специалисты приехали, подготовили площадку, заасфальтировали аккуратно и быстро. Рекомендую!' },
  { name: 'Татьяна Васильевна', stars: 4.5, text: 'Остановились на асфальтовой крошке для придомовой территории. Обратились в компанию — очень довольны результатом.' },
  { name: 'Сергей Семенович', stars: 5, text: 'Понравилось, что с оформлением заявки не возникло проблем, специалисты приехали быстро. Приятно, что дали пятилетнюю гарантию.' },
  { name: 'Виктор Анатольевич', stars: 3, text: 'Нужно было заасфальтировать двор многоэтажки. Специалисты приехали на следующий день после подписания договора, уложились в два дня.' },
  { name: 'Виталий', stars: 4, text: 'Хочу поблагодарить за укладку асфальта на территории моего предприятия. Стоимость приемлемая, результат — отличный!' },
]


const CALC_TYPES = [
  { label: 'Асфальтирование 4 см', price: 630 },
  { label: 'Асфальтирование 5 см', price: 730 },
  { label: 'Асфальтирование 6 см', price: 850 },
  { label: 'Ямочный ремонт', price: 1260 },
  { label: 'Асфальтовая крошка', price: 350 },
]

const FAQS = [
  {
    q: 'Какие виды асфальтирования существуют?',
    a: 'Основные виды: укладка горячего асфальтобетона (самый распространённый), литой асфальт (не требует катка), холодный асфальт (для временного ремонта) и асфальтовая крошка (бюджетный вариант для второстепенных зон). Выбор зависит от нагрузки на покрытие и бюджета.',
  },
  {
    q: 'Можно ли асфальтировать зимой?',
    a: 'Да, при соблюдении технологии. Горячий асфальт укладывается при температуре до −10°C — основание предварительно прогревается. Литой асфальт работает до −20°C. Холодный асфальт — при любой температуре как временная мера.',
  },
  {
    q: 'Какой срок службы у асфальтового покрытия?',
    a: 'Асфальтовое полотно, уложенное по всем правилам, служит 12–15 лет без капитального ремонта — а при правильной эксплуатации и до 20 лет. Срок зависит от качества основания, марки смеси и нагрузки.',
  },
  {
    q: 'Что такое асфальтовая крошка и в чём её преимущество?',
    a: 'Асфальтовая крошка — измельчённый вторичный асфальт. Главное преимущество — низкая цена (от 350 руб/м²). Подходит для дачных дорожек, хозяйственных зон, временных покрытий. Недостаток — срок службы 2–4 года и размягчение в жару.',
  },
  {
    q: 'Почему асфальт разрушается?',
    a: 'Главные причины: слабое или плохо дренированное основание, нарушение технологии укладки (холодная смесь, недостаточное уплотнение), морозное пучение грунта, нагрузка выше расчётной и естественное старение битума после 12–15 лет.',
  },
]

const BLOG_PREVIEWS = [
  { slug: 'skolko-stoit-asfaltirovanie-dvora', title: 'Сколько стоит асфальтирование двора в 2025 году', img: '/photos/work3.jpg' },
  { slug: 'kak-vybrat-podryadchika-asfaltirovanie', title: 'Как выбрать подрядчика: 7 критериев', img: '/photos/work7.jpg' },
  { slug: 'yamochnyj-remont-vs-zamena-asfalta', title: 'Ямочный ремонт или полная замена — что выбрать?', img: '/photos/work8.jpg' },
]

export default function Home({ onQuoteClick }) {
  const [current, setCurrent] = useState(0)
  const timerRef = useRef(null)
  const generatedSlugs = useCitiesStatus()

  const go = (idx) => setCurrent((idx + SLIDES.length) % SLIDES.length)

  useEffect(() => {
    timerRef.current = setInterval(() => setCurrent(c => (c + 1) % SLIDES.length), 5000)
    return () => clearInterval(timerRef.current)
  }, [])

  const slide = SLIDES[current]

  return (
    <>
      <PageMeta meta={HOME_META} />

      {/* ── HERO SLIDER ── */}
      <section className="hero-section" style={{ position: 'relative', height: '560px', overflow: 'hidden' }}>
        {SLIDES.map((s, i) => (
          <div key={i} style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${s.img})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            opacity: i === current ? 1 : 0,
            transition: 'opacity 0.8s ease',
          }} />
        ))}
        {/* dark overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.78) 40%, rgba(0,0,0,0.2) 100%)' }} />

        {/* content */}
        <div className="container" style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', alignItems: 'center' }}>
          <div style={{ maxWidth: '600px' }}>
            <div style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '14px' }}>
              {BRAND_TAGLINE}
            </div>
            <h1 className="hero-h1" style={{ fontSize: '3rem', fontWeight: 900, lineHeight: 1.15, marginBottom: '18px', color: 'var(--white)', whiteSpace: 'pre-line' }}>
              {slide.title.split('\n').map((line, i) => (
                <span key={i}>{i === 1 ? <span style={{ color: 'var(--accent)' }}>{line}</span> : line}{i === 0 && <br />}</span>
              ))}
            </h1>
            <p className="hero-sub" style={{ fontSize: '1.15rem', color: '#ccc', marginBottom: '20px', lineHeight: 1.6 }}>
              {slide.sub}
            </p>
            <div className="brand-trust-pills" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '28px' }}>
              {[BRAND_EXPERIENCE, `Гарантия ${BRAND_WARRANTY}`, `от ${BRAND_PRICE_FROM} ₽/м²`].map(label => (
                <span
                  key={label}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    border: '1px solid rgba(245,166,35,0.35)',
                    background: 'rgba(245,166,35,0.08)',
                    color: '#ddd',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                  }}
                >
                  {label}
                </span>
              ))}
            </div>
            <div className="hero-btns" style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <button onClick={onQuoteClick} className="btn" style={{ fontSize: '1rem', padding: '14px 28px' }}>
                Получить расчёт
              </button>
              <a href={BRAND_PHONE_HREF} className="btn btn-outline" style={{ fontSize: '1rem', padding: '14px 28px' }}>
                Позвонить
              </a>
              <a
                href="https://t.me/asf_prj_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
                style={{ fontSize: '1rem', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.16 14.47l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.988.089z"/>
                </svg>
                Telegram
              </a>
            </div>
          </div>
        </div>

        {/* dots */}
        <div style={{ position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '10px', zIndex: 3 }}>
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => { clearInterval(timerRef.current); go(i) }}
              style={{
                width: i === current ? '28px' : '8px',
                height: '8px', borderRadius: '4px',
                background: i === current ? 'var(--accent)' : 'rgba(255,255,255,0.35)',
                border: 'none', cursor: 'pointer',
                transition: 'all 0.3s',
                padding: 0,
              }}
            />
          ))}
        </div>

        {/* arrows */}
        {['‹', '›'].map((arrow, dir) => (
          <button
            key={arrow}
            className="hero-arrows"
            onClick={() => { clearInterval(timerRef.current); go(current + (dir === 0 ? -1 : 1)) }}
            style={{
              position: 'absolute', top: '50%', transform: 'translateY(-50%)',
              [dir === 0 ? 'left' : 'right']: '20px',
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff', fontSize: '1.6rem', width: '44px', height: '44px',
              borderRadius: '50%', cursor: 'pointer', zIndex: 3,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(4px)',
            }}
          >{arrow}</button>
        ))}
      </section>

      {/* ── TRUST BAR ── */}
      <section style={{ background: 'var(--accent)', padding: '14px 0' }}>
        <div className="container trust-bar" style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' }}>
          {[['500+', 'объектов'], ['15 лет', 'на рынке'], ['5 лет', 'гарантия'], ['0 ₽', 'выезд замерщика']].map(([num, label]) => (
            <div key={label} style={{ textAlign: 'center', color: 'var(--black)' }}>
              <div style={{ fontWeight: 900, fontSize: '1.25rem' }}>{num}</div>
              <div style={{ fontSize: '0.78rem', fontWeight: 600 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section style={{ padding: '64px 0', background: 'var(--dark)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--white)' }}>Услуги</h2>
            <Link to="/uslugi/" style={{ color: 'var(--accent)', fontSize: '0.9rem', fontWeight: 600 }}>Все услуги →</Link>
          </div>
          <div className="grid-services" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
            {SERVICES.map(s => (
              <Link key={s.href} to={s.href}
                style={{ textDecoration: 'none', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 2px 12px rgba(0,0,0,0.4)', transition: 'transform 0.2s, box-shadow 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.6)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.4)' }}>
                {/* Image with gradient overlay */}
                <div className="svc-img" style={{ height: '200px', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                  <img src={s.img} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s' }}
                    onMouseEnter={e => e.target.style.transform = 'scale(1.07)'}
                    onMouseLeave={e => e.target.style.transform = 'scale(1)'} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,10,10,0.85) 0%, rgba(10,10,10,0.1) 55%)' }} />
                  {/* Price badge */}
                  <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'var(--accent)', color: 'var(--black)', fontWeight: 900, fontSize: '0.78rem', padding: '4px 10px', borderRadius: '20px' }}>
                    {s.price}
                  </div>
                </div>
                {/* Text on dark bottom */}
                <div style={{ background: 'var(--gray)', padding: '16px 18px 18px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ fontWeight: 800, color: 'var(--white)', fontSize: '0.97rem', lineHeight: 1.3 }}>{s.name}</div>
                  <div style={{ color: 'var(--mid)', fontSize: '0.82rem' }}>{s.desc}</div>
                  <div style={{ marginTop: '10px', color: 'var(--accent)', fontWeight: 700, fontSize: '0.85rem' }}>Подробнее →</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICES ── */}
      <section style={{ padding: '64px 0', background: '#0d0d0d' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '36px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--white)', marginBottom: '6px' }}>Цены на асфальтирование территорий и дворов</h2>
              <p style={{ color: 'var(--mid)', fontSize: '0.9rem' }}>Фиксированная цена прописывается в договоре — без скрытых расходов</p>
            </div>
            <Link to="/prajs-list/" style={{ color: 'var(--accent)', fontSize: '0.9rem', fontWeight: 600, whiteSpace: 'nowrap' }}>Полный прайс-лист →</Link>
          </div>
          <div className="grid-prices" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #2a2a2a' }}>
            {PRICES.map((p, i) => (
              <div key={p.label} style={{
                background: p.popular ? 'var(--accent)' : 'var(--gray)',
                padding: '28px 22px',
                position: 'relative',
                borderRight: i < PRICES.length - 1 ? '1px solid #2a2a2a' : 'none',
              }}>
                {p.popular && (
                  <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'var(--black)', color: 'var(--accent)', fontSize: '0.7rem', fontWeight: 800, padding: '3px 8px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Популярно
                  </div>
                )}
                <div style={{ fontSize: '0.82rem', color: p.popular ? 'rgba(0,0,0,0.65)' : 'var(--mid)', marginBottom: '12px', fontWeight: 600 }}>
                  {p.label}
                </div>
                <div style={{ fontSize: '1.9rem', fontWeight: 900, color: p.popular ? 'var(--black)' : 'var(--accent)', lineHeight: 1 }}>
                  {p.price}
                </div>
                <div style={{ fontSize: '0.8rem', color: p.popular ? 'rgba(0,0,0,0.55)' : 'var(--mid)', marginTop: '4px' }}>
                  {p.unit}
                </div>
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: `1px solid ${p.popular ? 'rgba(0,0,0,0.15)' : '#333'}`, fontSize: '0.8rem', color: p.popular ? 'rgba(0,0,0,0.6)' : 'var(--mid)' }}>
                  {p.note}
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button onClick={onQuoteClick} className="btn">Получить точный расчёт →</button>
            <Link to="/prajs-list/" className="btn btn-outline">Прайс-лист</Link>
          </div>

          <div
            style={{
              marginTop: '48px',
              padding: '32px',
              background: 'var(--gray)',
              border: '1px solid #2a2a2a',
              borderRadius: '12px',
            }}
          >
            <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--white)', marginBottom: '12px' }}>
              Почему от {BRAND_PRICE_FROM} ₽/м², а не «от 395 ₽»?
            </h3>
            <p style={{ color: 'var(--mid)', lineHeight: 1.7, marginBottom: '24px', maxWidth: '720px' }}>
              {WHY_PRICE_INTRO}
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '16px',
                marginBottom: '20px',
              }}
            >
              {WHY_PRICE_POINTS.map(point => (
                <div
                  key={point.title}
                  style={{
                    padding: '18px',
                    background: '#1a1a1a',
                    borderRadius: '8px',
                    border: '1px solid #333',
                  }}
                >
                  <div style={{ fontWeight: 700, color: 'var(--accent)', marginBottom: '8px', fontSize: '0.95rem' }}>
                    {point.title}
                  </div>
                  <p style={{ color: 'var(--mid)', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>
                    {point.desc}
                  </p>
                </div>
              ))}
            </div>
            <p style={{ color: '#999', fontSize: '0.88rem', lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>
              {WHY_PRICE_COMPARE}
            </p>
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section style={{ padding: '64px 0', background: 'var(--dark)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '56px', alignItems: 'center' }} className="about-grid">
            {/* Photo collage */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '220px 160px', gap: '10px' }}>
              <img
                src="/photos/work6.jpg"
                alt="Наши рабочие на объекте"
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px', gridRow: 'span 2' }}
              />
              <img
                src="/photos/work1.jpg"
                alt="Подготовка основания"
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }}
              />
              <img
                src="/photos/work10.jpg"
                alt="Готовое покрытие из тротуарной плитки"
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }}
              />
            </div>

            {/* Text */}
            <div>
              <div style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '14px' }}>
                О компании
              </div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--white)', marginBottom: '20px', lineHeight: 1.2 }}>
                РусскийАсфальт — асфальт под ключ в Москве и Подмосковье
              </h2>
              <p style={{ color: 'var(--mid)', lineHeight: 1.75, marginBottom: '16px', fontSize: '0.95rem' }}>
                Мы реализуем полный спектр услуг в сфере дорожного строительства на территории Москвы и Московской области: асфальтирование автодорог, пешеходных и велосипедных дорожек, парковок. Выполняем ремонт дорог, благоустройство придомовых участков и детских площадок, укладку бортовых камней.
              </p>
              <p style={{ color: 'var(--mid)', lineHeight: 1.75, marginBottom: '28px', fontSize: '0.95rem' }}>
                Все работы выполняются строго в соответствии со стандартами ГОСТ и СНиП. Компания входит в СРО, предоставляем сертификаты и паспорт качества на все используемые материалы.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
                {[
                  'Член СРО Ассоциация «ЭнергоСтройАльянс»',
                  'Сертифицированные материалы от надёжных производителей',
                  'Все работы по ГОСТ и СНиП',
                  'Бесплатный выезд специалиста на объект',
                ].map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ flexShrink: 0, width: '20px', height: '20px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                        <polyline points="2,6 5,9 10,3" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span style={{ fontSize: '0.9rem', color: 'var(--light)', lineHeight: 1.4 }}>{item}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                {[
                  { num: '15 лет', label: 'на рынке' },
                  { num: '500+', label: 'объектов' },
                  { num: '5 лет', label: 'гарантия' },
                  { num: '0 ₽', label: 'выезд замерщика' },
                ].map(s => (
                  <div key={s.num} style={{ background: 'var(--gray)', border: '1px solid #2a2a2a', borderRadius: '8px', padding: '14px 16px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{ color: 'var(--accent)', fontSize: '1.2rem', fontWeight: 900, flexShrink: 0 }}>{s.num}</div>
                    <div style={{ color: 'var(--mid)', fontSize: '0.8rem' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PHOTO GALLERY ── */}
      <section style={{ padding: '64px 0', background: '#0d0d0d' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--white)', marginBottom: '6px' }}>Наши работы</h2>
              <p style={{ color: 'var(--mid)', fontSize: '0.9rem' }}>Фотографии с реальных объектов нашей компании</p>
            </div>
          </div>
          <div className="photo-gallery" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gridTemplateRows: 'repeat(2, 200px)', gap: '10px' }}>
            {[
              { src: '/photos/work3.jpg', alt: 'Асфальтоукладчик и каток на дороге', style: { gridColumn: 'span 2', gridRow: 'span 2' } },
              { src: '/photos/work5.jpg', alt: 'Укладка асфальта VÖGELE' },
              { src: '/photos/work7.jpg', alt: 'Экскаватор с асфальтом' },
              { src: '/photos/work9.jpg', alt: 'Тротуарная плитка — готовый объект' },
              { src: '/photos/work10.jpg', alt: 'Пешеходная дорожка у дома' },
              { src: '/photos/work1.jpg', alt: 'Подготовка основания' },
              { src: '/photos/work6.jpg', alt: 'Рабочие укладывают геотекстиль' },
              { src: '/photos/work2.jpg', alt: 'Каток на щебне' },
              { src: '/photos/work4.jpg', alt: 'Уплотнение щебня катком' },
            ].map((img, i) => (
              <div key={i} style={{ borderRadius: '8px', overflow: 'hidden', ...img.style }}>
                <img
                  src={img.src}
                  alt={img.alt}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s' }}
                  onMouseEnter={e => e.target.style.transform = 'scale(1.06)'}
                  onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ADVANTAGES ── */}
      <section style={{ padding: '64px 0', background: 'var(--dark)' }}>
        <div className="container">
          <div style={{ maxWidth: '700px', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--white)', marginBottom: '12px' }}>
              Почему нам доверяют асфальтирование в Москве и Подмосковье?
            </h2>
            <p style={{ color: 'var(--mid)', fontSize: '1rem', lineHeight: 1.6 }}>
              Мы не просто укладываем асфальт — мы создаём долговечные покрытия с официальной гарантией. Репутация строится на качестве, которое можно проверить.
            </p>
          </div>
          <div className="grid-advantages" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {ADVANTAGES.map(a => (
              <div key={a.title} style={{ background: 'var(--gray)', border: '1px solid #2a2a2a', borderRadius: '10px', padding: '28px', display: 'flex', gap: '18px', alignItems: 'flex-start' }}>
                <div style={{ flexShrink: 0, color: 'var(--accent)', marginTop: '2px' }}>{a.icon}</div>
                <div>
                  <h3 style={{ fontWeight: 700, color: 'var(--white)', marginBottom: '8px', fontSize: '1rem', margin: '0 0 8px' }}>{a.title}</h3>
                  <p style={{ color: 'var(--mid)', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>{a.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BLOG PREVIEW ── */}
      <section style={{ padding: '64px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--white)' }}>Полезные статьи</h2>
            <Link to="/blog/" style={{ color: 'var(--accent)', fontSize: '0.9rem', fontWeight: 600 }}>Все статьи →</Link>
          </div>
          <div className="grid-blog" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
            {BLOG_PREVIEWS.map(post => (
              <Link key={post.slug} to={`/blog/${post.slug}/`} style={{ textDecoration: 'none', background: 'var(--gray)', border: '1px solid #2a2a2a', borderRadius: '10px', overflow: 'hidden', transition: 'border-color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#2a2a2a'}>
                <div style={{ height: '170px', overflow: 'hidden' }}>
                  <img src={post.img} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
                <div style={{ padding: '18px' }}>
                  <p style={{ color: 'var(--white)', fontWeight: 600, fontSize: '0.95rem', lineHeight: 1.4, marginBottom: '10px' }}>{post.title}</p>
                  <span style={{ color: 'var(--accent)', fontSize: '0.82rem', fontWeight: 700 }}>Читать →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CALCULATOR ── */}
      <section style={{ padding: '64px 0', background: 'var(--dark)' }}>
        <div className="container" style={{ maxWidth: '700px' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--white)', marginBottom: '8px' }}>Калькулятор стоимости</h2>
          <p style={{ color: 'var(--mid)', marginBottom: '32px' }}>Рассчитайте примерную стоимость за 30 секунд</p>
          <Calculator onQuoteClick={onQuoteClick} />
        </div>
      </section>

      {/* ── PROJECTS ── */}
      <section style={{ padding: '64px 0' }}>
        <div className="container">
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--white)', marginBottom: '24px' }}>Реализованные проекты</h2>
          <div style={{ borderRadius: '12px', overflow: 'hidden', marginBottom: '28px', position: 'relative', height: '220px' }}>
            <img
              src="/photos/work7.jpg"
              alt="Реализованные проекты"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 100%)', display: 'flex', alignItems: 'center', paddingLeft: '36px' }}>
              <div>
                <div style={{ color: 'var(--accent)', fontWeight: 900, fontSize: '2rem' }}>500+</div>
                <div style={{ color: '#fff', fontSize: '1rem', fontWeight: 600 }}>объектов сдано в Москве и МО</div>
              </div>
            </div>
          </div>
          <div className="grid-projects" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {PROJECTS.map((p, i) => (
              <div key={i} style={{ background: 'var(--gray)', border: '1px solid #2a2a2a', borderRadius: '10px', padding: '22px' }}>
                <div style={{ fontWeight: 700, color: 'var(--white)', fontSize: '0.95rem', marginBottom: '14px', lineHeight: 1.4 }}>{p.name}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', gap: '8px', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--accent)', fontWeight: 700, minWidth: '70px' }}>Объём:</span>
                    <span style={{ color: '#ccc' }}>{p.volume}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--accent)', fontWeight: 700, minWidth: '70px' }}>Сроки:</span>
                    <span style={{ color: '#ccc' }}>{p.days}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--accent)', fontWeight: 700, minWidth: '70px' }}>Адрес:</span>
                    <span style={{ color: '#ccc' }}>{p.address}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COVERAGE MAP ── */}
      <section style={{ padding: '64px 0', background: 'var(--dark)' }}>
        <div className="container">
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--white)', marginBottom: '8px' }}>Карта присутствия</h2>
          <p style={{ color: 'var(--mid)', marginBottom: '32px' }}>Работаем во всех городах Москвы и Подмосковья</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {CITIES.map(c => {
              const isDone = generatedSlugs ? generatedSlugs.has(c.slug) : false
              if (isDone) {
                return (
                  <Link
                    key={c.slug}
                    to={`/podmoskovye/${c.slug}/`}
                    style={{ padding: '7px 14px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '20px', color: '#ccc', fontSize: '0.85rem', textDecoration: 'none', transition: 'all 0.15s', whiteSpace: 'nowrap' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#ccc' }}
                  >
                    {c.name}
                  </Link>
                )
              }
              return (
                <span key={c.slug} style={{ padding: '7px 14px', background: '#111', border: '1px solid #1e1e1e', borderRadius: '20px', color: '#444', fontSize: '0.85rem', whiteSpace: 'nowrap', cursor: 'default' }}>
                  {c.name}
                </span>
              )
            })}
          </div>
          <div style={{ marginTop: '24px' }}>
            <Link to="/regiony/" style={{ color: 'var(--accent)', fontSize: '0.9rem', fontWeight: 600 }}>
              Все города Подмосковья →
            </Link>
          </div>
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section style={{ padding: '64px 0', background: 'var(--dark)' }}>
        <div className="container">
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--white)', marginBottom: '32px' }}>Отзывы клиентов</h2>
          <div className="grid-reviews" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {REVIEWS.map((r, i) => (
              <div key={i} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '10px', padding: '24px' }}>
                <div style={{ display: 'flex', gap: '2px', marginBottom: '12px', alignItems: 'center' }}>
                  <Stars rating={r.stars} />
                  <span style={{ color: 'var(--mid)', fontSize: '0.8rem', marginLeft: '6px' }}>{r.stars}</span>
                </div>
                <p style={{ color: '#ccc', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '16px' }}>«{r.text}»</p>
                <div style={{ fontWeight: 700, color: 'var(--white)', fontSize: '0.88rem' }}>{r.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ padding: '64px 0' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--white)', marginBottom: '32px' }}>Популярные вопросы</h2>
          <FaqList />
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '72px 0', background: 'linear-gradient(135deg, #1a1a1a 0%, #111 100%)', borderTop: '1px solid #222' }}>
        <div className="container cta-block" style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px' }}>
            Бесплатно
          </div>
          <h2 style={{ fontSize: '2.2rem', color: 'var(--white)', fontWeight: 900, marginBottom: '14px', lineHeight: 1.2 }}>
            Нужен расчёт стоимости?
          </h2>
          <p style={{ color: 'var(--mid)', marginBottom: '32px', fontSize: '1.05rem', lineHeight: 1.6 }}>
            Оставьте заявку — замерщик приедет в день обращения.<br />Расчёт и консультация бесплатно.
          </p>
          <div className="hero-btns" style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={onQuoteClick} className="btn" style={{ fontSize: '1.05rem', padding: '15px 32px' }}>
              Получить расчёт
            </button>
            <a href="tel:+79096282800" className="btn btn-outline" style={{ fontSize: '1.05rem', padding: '15px 32px' }}>
              +7 909 628 28 00
            </a>
          </div>
        </div>
      </section>
    </>
  )
}

function Stars({ rating }) {
  return (
    <span style={{ display: 'inline-flex', gap: '1px' }}>
      {[1, 2, 3, 4, 5].map(i => {
        const full = rating >= i
        const half = !full && rating >= i - 0.5
        return (
          <span key={i} style={{ position: 'relative', fontSize: '1rem', color: '#333' }}>
            ★
            {(full || half) && (
              <span style={{
                position: 'absolute', left: 0, top: 0,
                color: 'var(--accent)',
                width: full ? '100%' : '50%',
                overflow: 'hidden',
                display: 'inline-block',
              }}>★</span>
            )}
          </span>
        )
      })}
    </span>
  )
}

function Calculator({ onQuoteClick }) {
  const [type, setType] = useState(0)
  const [area, setArea] = useState('')

  const price = CALC_TYPES[type].price
  const total = area ? Math.round(parseFloat(area) * price) : null

  return (
    <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '28px' }}>
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', color: 'var(--mid)', fontSize: '0.85rem', marginBottom: '8px' }}>Вид работ</label>
        <select
          value={type}
          onChange={e => setType(Number(e.target.value))}
          style={{ width: '100%', background: '#111', border: '1px solid #333', borderRadius: '6px', padding: '10px 14px', color: 'var(--white)', fontSize: '0.95rem', outline: 'none' }}
        >
          {CALC_TYPES.map((t, i) => (
            <option key={i} value={i}>{t.label} — от {t.price} руб/м²</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', color: 'var(--mid)', fontSize: '0.85rem', marginBottom: '8px' }}>Площадь (м²)</label>
        <input
          type="number"
          min="1"
          placeholder="Например: 200"
          value={area}
          onChange={e => setArea(e.target.value)}
          style={{ width: '100%', background: '#111', border: '1px solid #333', borderRadius: '6px', padding: '10px 14px', color: 'var(--white)', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
        />
      </div>

      {total ? (
        <div style={{ background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.3)', borderRadius: '8px', padding: '18px 20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ color: 'var(--mid)', fontSize: '0.82rem', marginBottom: '4px' }}>Примерная стоимость</div>
            <div style={{ color: 'var(--accent)', fontSize: '2rem', fontWeight: 900 }}>
              {total.toLocaleString('ru-RU')} ₽
            </div>
            <div style={{ color: 'var(--mid)', fontSize: '0.78rem', marginTop: '4px' }}>
              {area} м² × {price} руб/м² (без учёта основания)
            </div>
          </div>
        </div>
      ) : (
        <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: '8px', padding: '18px 20px', marginBottom: '20px', textAlign: 'center', color: 'var(--mid)', fontSize: '0.9rem' }}>
          Введите площадь, чтобы увидеть расчёт
        </div>
      )}

      <button onClick={onQuoteClick} className="btn" style={{ width: '100%', padding: '13px' }}>
        Получить точный расчёт бесплатно →
      </button>
      <p style={{ color: 'var(--mid)', fontSize: '0.78rem', marginTop: '10px', textAlign: 'center' }}>
        Калькулятор даёт ориентировочную стоимость. Точная цена — после бесплатного выезда замерщика.
      </p>
    </div>
  )
}

function FaqList() {
  const [open, setOpen] = useState(null)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      {FAQS.map((faq, i) => (
        <div key={i} style={{ border: '1px solid #333', borderRadius: '8px', overflow: 'hidden', background: '#1e1e1e' }}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            style={{
              width: '100%', textAlign: 'left', padding: '18px 20px',
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px',
            }}
          >
            <span style={{ color: 'var(--white)', fontWeight: 600, fontSize: '0.97rem', lineHeight: 1.4 }}>{faq.q}</span>
            <span style={{ color: 'var(--accent)', fontSize: '1.3rem', flexShrink: 0, transition: 'transform 0.25s', transform: open === i ? 'rotate(45deg)' : 'rotate(0deg)' }}>+</span>
          </button>
          {open === i && (
            <div style={{ padding: '0 20px 18px', color: '#ccc', fontSize: '0.92rem', lineHeight: 1.65 }}>
              {faq.a}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
