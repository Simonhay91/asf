import { Link } from 'react-router-dom'
import PageMeta from '../components/PageMeta'
import SiteBreadcrumbs from '../components/SiteBreadcrumbs'
import SiteSidebarNav from '../components/SiteSidebarNav'
import { CITIES, REGION_ORDER } from '../constants/cities'
import { useCitiesStatus } from '../hooks/useCitiesStatus'

const META = {
  title: 'Асфальтирование в Подмосковье — города и районы | РусскийАсфальт',
  description: 'Выполняем асфальтирование во всех городах Московской области. Выберите ваш город и узнайте условия и цены.',
  canonical: 'https://russkiyasphalt.ru/regiony/',
  'og:title': 'Асфальтирование в Подмосковье — города и районы | РусскийАсфальт',
  'og:description': 'Выполняем асфальтирование во всех городах Московской области. Выберите ваш город и узнайте условия и цены.',
  'og:url': 'https://russkiyasphalt.ru/regiony/',
  'og:image': 'https://russkiyasphalt.ru/og-image.svg',
  'og:type': 'website',
}

export default function RegionList({ onQuoteClick }) {
  const generatedSlugs = useCitiesStatus()
  const grouped = REGION_ORDER.reduce((acc, region) => {
    acc[region] = CITIES.filter(c => c.region === region)
    return acc
  }, {})

  return (
    <>
      <PageMeta meta={META} jsonld={[]} />

      {/* Hero */}
      <div style={{ background: 'var(--dark)', borderBottom: '1px solid #2a2a2a', padding: '56px 20px 48px' }}>
        <div className="container">
          <SiteBreadcrumbs
            items={[
              { label: 'Главная', to: '/' },
              { label: 'Подмосковье' },
            ]}
          />
          <h1 style={{ fontWeight: 900, fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', marginBottom: '12px' }}>
            Асфальтирование в Подмосковье
          </h1>
          <p style={{ color: 'var(--mid)', fontSize: '1rem', maxWidth: '600px', marginTop: '20px', marginBottom: '24px' }}>
            Выполняем укладку асфальта, ямочный ремонт и благоустройство во всех городах
            Московской области. Выезд замерщика в день обращения.
          </p>
          <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontWeight: 900, fontSize: '1.4rem', color: 'var(--accent)' }}>{CITIES.length}+</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--mid)' }}>городов охвата</div>
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: '1.4rem', color: 'var(--accent)' }}>1 день</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--mid)' }}>выезд замерщика</div>
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: '1.4rem', color: 'var(--accent)' }}>от 630 ₽/м²</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--mid)' }}>цена укладки</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container page-layout" style={{ padding: '40px 20px 48px', maxWidth: '1200px' }}>
        <div className="page-layout__grid">
        <div className="page-layout__main">
        {REGION_ORDER.map(region => {
          const cities = grouped[region]
          if (!cities || cities.length === 0) return null
          const label = region.charAt(0).toUpperCase() + region.slice(1)
          return (
            <div key={region} style={{ marginBottom: '48px' }}>
              <h2 style={{
                fontWeight: 800, fontSize: '1.1rem', marginBottom: '16px',
                paddingBottom: '10px', borderBottom: '2px solid var(--accent)',
                display: 'inline-block', color: 'var(--white)',
              }}>
                Подмосковье — {label}
              </h2>
              <div className="region-city-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '10px',
              }}>
                {cities.map(city => {
                  const isDone = generatedSlugs ? generatedSlugs.has(city.slug) : false
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
                        key={city.slug}
                        to={`/podmoskovye/${city.slug}/`}
                        style={{ ...baseStyle, border: '1px solid #2a2a2a', color: 'var(--light)', textDecoration: 'none' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = 'var(--light)' }}
                      >
                        <span><span className="city-prefix">Асфальтирование в </span>{city.name}</span>
                        <span style={{ opacity: 0.5, fontSize: '0.8rem' }}>→</span>
                      </Link>
                    )
                  }
                  return (
                    <span key={city.slug} style={{ ...baseStyle, border: '1px solid #1e1e1e', color: 'var(--mid)', opacity: 0.5, cursor: 'default' }}>
                      <span><span className="city-prefix">Асфальтирование в </span>{city.name}</span>
                      <span style={{ fontSize: '0.7rem' }}>скоро</span>
                    </span>
                  )
                })}
              </div>
            </div>
          )
        })}
        </div>
        <SiteSidebarNav onQuoteClick={onQuoteClick} />
        </div>
      </div>
    </>
  )
}
