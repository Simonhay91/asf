import { Link, useParams } from 'react-router-dom'
import PageMeta from '../components/PageMeta'
import { DISTRICTS, OKRUGS, OKRUG_ORDER } from '../constants/districts'
import { useDistrictsStatus } from '../hooks/useDistrictsStatus'
import { okrugMeta } from '../utils/seoMeta'
import { BRAND_PHONE, BRAND_PHONE_HREF, BRAND_PRICE_FROM } from '../constants/brand'

const FAQ = [
  {
    q: 'Сколько стоит асфальтирование во дворе и на площадке?',
    a: `Цена укладки под ключ — от ${BRAND_PRICE_FROM} ₽/м² с материалом и подготовкой основания. Точная смета после бесплатного замера на объекте.`,
  },
  {
    q: 'Как быстро выезжаете на объект?',
    a: 'Замерщик приезжает в день обращения по Москве. Работы планируем после согласования сметы и договора.',
  },
  {
    q: 'Даете ли гарантию на асфальт?',
    a: 'Да — гарантия 5 лет на работы фиксируется в договоре. Собственная техника, без субподряда.',
  },
]

export default function MoscowOkrug({ onQuoteClick }) {
  const { okrug } = useParams()
  const info = OKRUGS[okrug]
  const districts = DISTRICTS[okrug] || []
  const { done: generatedSlugs, images: districtImages } = useDistrictsStatus()

  if (!info) {
    return (
      <div className="container" style={{ padding: '80px 20px' }}>
        <p>Округ не найден. <Link to="/moskva/">Все районы Москвы</Link></p>
      </div>
    )
  }

  const doneCount = districts.filter(d => generatedSlugs?.has(d.slug)).length
  const meta = okrugMeta(info.name, info.short, okrug, districts.length)
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  }

  return (
    <>
      <PageMeta meta={meta} jsonld={[faqJsonLd]} />

      <div style={{ background: 'var(--dark)', borderBottom: '1px solid #2a2a2a', padding: '48px 20px 40px' }}>
        <div className="container">
          <nav style={{ fontSize: '0.85rem', color: 'var(--mid)', marginBottom: '16px' }}>
            <Link to="/" style={{ color: 'var(--mid)' }}>Главная</Link>
            {' / '}
            <Link to="/moskva/" style={{ color: 'var(--mid)' }}>Москва</Link>
            {' / '}
            <span>{info.short}</span>
          </nav>
          <h1 style={{ fontWeight: 900, fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', marginBottom: '12px', lineHeight: 1.2 }}>
            Асфальтирование в {info.name}
          </h1>
          <p style={{ color: 'var(--mid)', maxWidth: '640px', lineHeight: 1.7, marginBottom: '20px' }}>
            Укладка асфальта, ямочный ремонт и благоустройство дворов, площадок и парковок в {info.short}.
            Работаем под ключ — от {BRAND_PRICE_FROM} ₽/м², выезд замерщика бесплатно, гарантия 5 лет.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button type="button" className="btn" onClick={onQuoteClick}>
              Расчёт бесплатно
            </button>
            <a href={BRAND_PHONE_HREF} className="btn btn-outline">{BRAND_PHONE}</a>
            <Link to="/prajs-list/" className="btn btn-outline">Прайс-лист</Link>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '40px 20px 24px' }}>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '32px' }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: '1.3rem', color: 'var(--accent)' }}>{districts.length}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--mid)' }}>районов в округе</div>
          </div>
          {generatedSlugs && (
            <div>
              <div style={{ fontWeight: 900, fontSize: '1.3rem', color: 'var(--accent)' }}>{doneCount}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--mid)' }}>страниц с ценами и условиями</div>
            </div>
          )}
        </div>

        <h2 style={{ fontWeight: 800, fontSize: '1.15rem', marginBottom: '16px' }}>
          Районы {info.short}
        </h2>
        <div className="moscow-district-grid">
          {districts.map(d => {
            const isDone = generatedSlugs?.has(d.slug)
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

        <section style={{ marginTop: '48px', marginBottom: '32px' }}>
          <h2 style={{ fontWeight: 800, fontSize: '1.15rem', marginBottom: '16px' }}>Другие округа Москвы</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {OKRUG_ORDER.filter(o => o !== okrug).map(o => (
              <Link
                key={o}
                to={`/moskva/${o}/`}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: '1px solid #333',
                  color: 'var(--light)',
                  fontSize: '0.88rem',
                }}
              >
                {OKRUGS[o].short}
              </Link>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: '48px' }}>
          <h2 style={{ fontWeight: 800, fontSize: '1.15rem', marginBottom: '20px' }}>Частые вопросы</h2>
          {FAQ.map(({ q, a }) => (
            <div
              key={q}
              style={{
                marginBottom: '16px',
                padding: '16px 20px',
                background: 'var(--gray)',
                borderRadius: '10px',
                border: '1px solid #2a2a2a',
              }}
            >
              <h3 style={{ fontWeight: 700, fontSize: '0.95rem', margin: '0 0 8px', color: 'var(--white)' }}>{q}</h3>
              <p style={{ margin: 0, color: 'var(--mid)', lineHeight: 1.65, fontSize: '0.92rem' }}>{a}</p>
            </div>
          ))}
        </section>
      </div>
    </>
  )
}
