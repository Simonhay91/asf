import { Link } from 'react-router-dom'
import PageMeta from '../components/PageMeta'
import { ALL_SERVICES } from '../constants/services'

const STATIC_META = {
  title: 'Услуги асфальтирования в Москве | РусскийАсфальт',
  description: 'Асфальтирование дворов, парковок, дорог, ямочный ремонт в Москве и Подмосковье. Гарантия 5 лет, выезд замерщика в день обращения.',
  canonical: 'https://russkiyasphalt.ru/uslugi/',
  'og:title': 'Услуги асфальтирования | РусскийАсфальт',
  'og:description': 'Полный спектр услуг по асфальтированию в Москве и МО.',
  'og:type': 'website',
}

const STATS = [
  { num: '15 лет', label: 'на рынке' },
  { num: '500+', label: 'объектов' },
  { num: '5 лет', label: 'гарантия' },
  { num: '0 ₽', label: 'замер' },
]

export default function ServiceList({ onQuoteClick }) {
  return (
    <>
      <PageMeta meta={STATIC_META} jsonld={[]} />

      {/* ── Hero ── */}
      <div style={{ position: 'relative', overflow: 'hidden', minHeight: '320px' }}>
        <img
          src="/photos/work3.jpg"
          alt="Асфальтирование в Москве"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(10,10,10,0.92) 55%, rgba(10,10,10,0.5) 100%)' }} />
        <div className="container" style={{ position: 'relative', zIndex: 2, padding: '56px 20px 52px' }}>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', marginBottom: '14px' }}>
            <Link to="/" style={{ color: 'rgba(255,255,255,0.45)' }}>Главная</Link>
            {' / '}
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>Услуги</span>
          </div>
          <h1 style={{ fontWeight: 900, fontSize: 'clamp(1.7rem, 4vw, 2.6rem)', color: 'var(--white)', marginBottom: '14px', lineHeight: 1.15, maxWidth: '580px' }}>
            Услуги асфальтирования<br />
            <span style={{ color: 'var(--accent)' }}>в Москве и МО</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem', maxWidth: '500px', marginBottom: '36px', lineHeight: 1.6 }}>
            Укладка асфальта под ключ — от замера до сдачи. Собственная техника, официальный договор, гарантия 5 лет.
          </p>
          <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap' }}>
            {STATS.map(s => (
              <div key={s.num} style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 900, fontSize: '1.5rem', color: 'var(--accent)', lineHeight: 1 }}>{s.num}</div>
                <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', marginTop: '3px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Services grid ── */}
      <div className="container" style={{ padding: '52px 20px 64px' }}>
        <div className="uslugi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '56px' }}>
          {ALL_SERVICES.map(s => (
            <Link
              key={s.href}
              to={s.href}
              style={{ textDecoration: 'none', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 2px 12px rgba(0,0,0,0.4)', transition: 'transform 0.2s, box-shadow 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 32px rgba(0,0,0,0.6)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.4)' }}
            >
              <div style={{ height: '200px', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                <img
                  src={s.img}
                  alt={s.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s' }}
                  onMouseEnter={e => e.target.style.transform = 'scale(1.07)'}
                  onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,10,10,0.85) 0%, rgba(10,10,10,0.05) 55%)' }} />
                <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'var(--accent)', color: 'var(--black)', fontWeight: 900, fontSize: '0.75rem', padding: '4px 10px', borderRadius: '20px' }}>
                  {s.price}
                </div>
              </div>
              <div style={{ background: 'var(--gray)', padding: '18px 20px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '2px solid #222' }}>
                <div style={{ fontWeight: 800, color: 'var(--white)', fontSize: '0.97rem', lineHeight: 1.3 }}>{s.name}</div>
                <div style={{ color: 'var(--mid)', fontSize: '0.82rem', lineHeight: 1.4 }}>{s.desc}</div>
                <div style={{ marginTop: 'auto', paddingTop: '10px', color: 'var(--accent)', fontWeight: 700, fontSize: '0.85rem' }}>Подробнее →</div>
              </div>
            </Link>
          ))}
        </div>

        {/* ── How we work ── */}
        <div style={{ background: 'var(--gray)', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '40px', marginBottom: '48px' }}>
          <h2 style={{ fontWeight: 900, fontSize: '1.5rem', color: 'var(--white)', marginBottom: '32px' }}>Как мы работаем</h2>
          <div className="uslugi-steps" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
            {[
              { step: '01', title: 'Заявка', desc: 'Звоните или оставляйте заявку — ответим в течение 15 минут' },
              { step: '02', title: 'Выезд замерщика', desc: 'Бесплатный выезд в день обращения, замер и смета' },
              { step: '03', title: 'Договор', desc: 'Фиксируем цену и сроки в официальном договоре' },
              { step: '04', title: 'Сдача объекта', desc: 'Работы в срок, гарантийный акт на 5 лет' },
            ].map(s => (
              <div key={s.step}>
                <div style={{ fontWeight: 900, fontSize: '2.2rem', color: 'var(--accent)', lineHeight: 1, marginBottom: '10px', opacity: 0.9 }}>{s.step}</div>
                <div style={{ fontWeight: 700, color: 'var(--white)', fontSize: '1rem', marginBottom: '6px' }}>{s.title}</div>
                <div style={{ color: 'var(--mid)', fontSize: '0.85rem', lineHeight: 1.5 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA ── */}
        <div style={{ background: 'var(--accent)', borderRadius: '12px', padding: '40px 48px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>
          <div>
            <h2 style={{ color: 'var(--black)', fontWeight: 900, fontSize: '1.5rem', marginBottom: '6px' }}>
              Не знаете какая услуга нужна?
            </h2>
            <p style={{ color: '#333', margin: 0, fontSize: '0.95rem' }}>
              Замерщик приедет, оценит участок и предложит оптимальное решение — бесплатно
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={onQuoteClick}
              style={{ background: 'var(--black)', color: 'var(--white)', padding: '14px 32px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', border: 'none', fontSize: '1rem', whiteSpace: 'nowrap' }}
            >
              Получить замер бесплатно
            </button>
            <a
              href="tel:+79096282800"
              style={{ background: 'transparent', color: 'var(--black)', padding: '14px 24px', borderRadius: '6px', fontWeight: 700, border: '2px solid var(--black)', fontSize: '1rem', textDecoration: 'none', whiteSpace: 'nowrap' }}
            >
              +7 909 628 28 00
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
