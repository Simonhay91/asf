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
  const { done: generatedSlugs, images: districtImages } = useDistrictsStatus()

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
              <div className="moscow-district-grid">
                {districts.map(d => {
                  const isDone = generatedSlugs ? generatedSlugs.has(d.slug) : false
                  const thumb = districtImages[d.slug]
                  if (isDone) {
                    return (
                      <Link
                        key={d.slug}
                        to={`/moskva/${okrug}/${d.slug}/`}
                        className="moscow-district-card moscow-district-card--done"
                      >
                        {thumb ? (
                          <img src={thumb} alt="" className="moscow-district-card__img" loading="lazy" />
                        ) : (
                          <div className="moscow-district-card__img moscow-district-card__img--empty" />
                        )}
                        <span className="moscow-district-card__name">{d.name}</span>
                        <span className="moscow-district-card__arrow">→</span>
                      </Link>
                    )
                  }
                  return (
                    <span key={d.slug} className="moscow-district-card moscow-district-card--pending">
                      <div className="moscow-district-card__img moscow-district-card__img--empty" />
                      <span className="moscow-district-card__name">{d.name}</span>
                      <span className="moscow-district-card__soon">скоро</span>
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
