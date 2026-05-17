import { Link } from 'react-router-dom'
import PageMeta from '../components/PageMeta'
import { DISTRICTS, OKRUGS, OKRUG_ORDER } from '../constants/districts'
import { useDistrictsStatus } from '../hooks/useDistrictsStatus'

const META = {
  title: 'Асфальтирование в Москве — районы и округа | РусскийАсфальт',
  description: 'Асфальтирование во всех районах Москвы под ключ. Выберите свой округ и район — выезд замерщика в день обращения, цены от 630 руб/м².',
  canonical: 'https://russkiyasphalt.ru/moskva/',
  'og:title': 'Районы Москвы — РусскийАсфальт',
  'og:type': 'website',
}

const TOTAL = Object.values(DISTRICTS).reduce((s, arr) => s + arr.length, 0)

export default function MoscowList() {
  const generatedSlugs = useDistrictsStatus()

  return (
    <>
      <PageMeta meta={META} jsonld={[]} />

      {/* Hero */}
      <div style={{ background: 'var(--dark)', borderBottom: '1px solid #2a2a2a', padding: '56px 20px 48px' }}>
        <div className="container">
          <div style={{ fontSize: '0.8rem', color: 'var(--mid)', marginBottom: '12px' }}>
            <Link to="/" style={{ color: 'var(--mid)' }}>Главная</Link>
            {' / '}
            <span style={{ color: 'var(--white)' }}>Москва</span>
          </div>
          <h1 style={{ fontWeight: 900, fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', marginBottom: '12px' }}>
            Асфальтирование в Москве — по районам
          </h1>
          <p style={{ color: 'var(--mid)', fontSize: '1rem', maxWidth: '600px', marginTop: '20px', marginBottom: '24px' }}>
            Выполняем укладку асфальта, ямочный ремонт и благоустройство во всех
            районах Москвы. Без субподряда — своя техника и бригада.
          </p>
          <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontWeight: 900, fontSize: '1.4rem', color: 'var(--accent)' }}>{TOTAL}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--mid)' }}>районов охвата</div>
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: '1.4rem', color: 'var(--accent)' }}>10</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--mid)' }}>округов</div>
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: '1.4rem', color: 'var(--accent)' }}>от 630 ₽/м²</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--mid)' }}>цена укладки</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '56px 20px' }}>
        {OKRUG_ORDER.map(okrug => {
          const districts = DISTRICTS[okrug]
          const { name, short } = OKRUGS[okrug]
          return (
            <div key={okrug} style={{ marginBottom: '48px' }}>
              <h2 style={{
                fontWeight: 800, fontSize: '1.1rem', marginBottom: '16px',
                paddingBottom: '10px', borderBottom: '2px solid var(--accent)',
                display: 'inline-block', color: 'var(--white)',
              }}>
                {name} ({short})
              </h2>
              <div className="region-city-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '10px',
              }}>
                {districts.map(d => {
                  const isDone = generatedSlugs ? generatedSlugs.has(d.slug) : false
                  const baseStyle = {
                    background: 'var(--gray)',
                    borderRadius: '6px',
                    padding: '12px 16px',
                    fontSize: '0.93rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                  }
                  if (isDone) {
                    return (
                      <Link
                        key={d.slug}
                        to={`/moskva/${okrug}/${d.slug}/`}
                        style={{ ...baseStyle, border: '1px solid #2a2a2a', color: 'var(--light)', textDecoration: 'none' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = 'var(--light)' }}
                      >
                        <span>{d.name}</span>
                        <span style={{ opacity: 0.5, fontSize: '0.8rem' }}>→</span>
                      </Link>
                    )
                  }
                  return (
                    <span key={d.slug} style={{ ...baseStyle, border: '1px solid #1e1e1e', color: 'var(--mid)', opacity: 0.5, cursor: 'default' }}>
                      <span>{d.name}</span>
                      <span style={{ fontSize: '0.7rem' }}>скоро</span>
                    </span>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
