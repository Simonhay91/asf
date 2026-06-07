import { Link } from 'react-router-dom'
import PageMeta from '../components/PageMeta'
import PageLayout from '../components/PageLayout'
import { OBEKTY_META } from '../utils/seoMeta'
import { OBEKTY_ITEMS } from '../constants/obekty'

export default function Obekty({ onQuoteClick }) {
  return (
    <>
      <PageMeta meta={OBEKTY_META} />
      <PageLayout
        onQuoteClick={onQuoteClick}
        breadcrumbs={[
          { label: 'Главная', to: '/' },
          { label: 'Объекты' },
        ]}
      >
        <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '16px' }}>Наши объекты</h1>
        <p style={{ color: 'var(--mid)', lineHeight: 1.7, marginBottom: '32px', maxWidth: '720px' }}>
          Реальные проекты асфальтирования в Москве и Подмосковье: дворы, парковки, дороги и промышленные
          площадки. Все фото с объектов нашей бригады.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '24px',
            marginBottom: '40px',
          }}
        >
          {OBEKTY_ITEMS.map(item => (
            <article
              key={item.title}
              style={{
                background: 'var(--gray)',
                borderRadius: '10px',
                overflow: 'hidden',
                border: '1px solid #2a2a2a',
              }}
            >
              <div style={{ height: '200px', overflow: 'hidden' }}>
                <img
                  src={item.img}
                  alt={`${item.workType} — ${item.location}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  loading="lazy"
                />
              </div>
              <div style={{ padding: '18px' }}>
                <div
                  style={{
                    display: 'inline-block',
                    background: 'var(--accent)',
                    color: '#000',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: '20px',
                    marginBottom: '10px',
                  }}
                >
                  {item.workType}
                </div>
                <h2 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 8px', lineHeight: 1.35 }}>
                  {item.title}
                </h2>
                <p style={{ margin: '0 0 6px', color: 'var(--mid)', fontSize: '0.88rem' }}>{item.location}</p>
                <p style={{ margin: 0, color: 'var(--light)', fontSize: '0.88rem' }}>{item.volume}</p>
              </div>
            </article>
          ))}
        </div>

        <p style={{ color: 'var(--mid)', marginBottom: '24px' }}>
          Нужен такой же результат у вас?{' '}
          <Link to="/uslugi/" style={{ color: 'var(--accent)' }}>
            Смотрите услуги
          </Link>{' '}
          или оставьте заявку — замерщик приедет бесплатно.
        </p>
        <button type="button" onClick={onQuoteClick} className="btn">
          Получить расчёт бесплатно
        </button>
      </PageLayout>
    </>
  )
}
