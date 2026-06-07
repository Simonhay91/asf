import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import PageMeta from '../components/PageMeta'
import RegionsWidget from '../components/RegionsWidget'
import SiteBreadcrumbs from '../components/SiteBreadcrumbs'
import SiteSidebarNav from '../components/SiteSidebarNav'
import ContentWithImages from '../components/ContentWithImages'
import { CITIES } from '../constants/cities'
import { ALL_SERVICES } from '../constants/services'
import { cityServiceMeta } from '../utils/seoMeta'

const FALLBACK_IMG = 'https://images.pexels.com/photos/1123972/pexels-photo-1123972.jpeg?auto=compress&cs=tinysrgb&w=1200'

const SERVICE_BY_SLUG = Object.fromEntries(
  ALL_SERVICES.map(s => [s.href.replace(/^\/uslugi\//, '').replace(/\/$/, ''), s]),
)

function slugStyle(slug) {
  let h = 0
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) | 0
  return (Math.abs(h) % 7) + 1
}

export default function CityService({ onQuoteClick }) {
  const { city, service } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const cityName = CITIES.find(c => c.slug === city)?.name || data?.city_name || city
  const serviceInfo = SERVICE_BY_SLUG[service]
  const serviceName = serviceInfo?.name || data?.service_name || service

  useEffect(() => {
    setLoading(true)
    setData(null)
    fetch(`/api/page/podmoskovye/${city}/${service}`)
      .then(r => {
        if (!r.ok) throw new Error(r.status === 404 ? 'Страница не найдена' : 'Ошибка загрузки')
        return r.json()
      })
      .then(d => { setData(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [city, service])

  const fallbackMeta = cityServiceMeta(serviceName, cityName, city, service)
  const breadcrumbItems = [
    { label: 'Главная', to: '/' },
    { label: 'Подмосковье', to: '/regiony/' },
    { label: cityName, to: `/podmoskovye/${city}/` },
    { label: serviceName },
  ]

  if (loading) {
    return (
      <>
        <PageMeta meta={fallbackMeta} />
        <div className="loading">Загрузка...</div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <PageMeta meta={fallbackMeta} />
        <div className="container" style={{ padding: '60px 20px' }}>
          <div className="error-box">{error}</div>
        </div>
      </>
    )
  }

  if (data?.placeholder) {
    return (
      <>
        <PageMeta meta={data.meta} jsonld={data.jsonld} />
        <div className="container city-layout" style={{ padding: '48px 20px', maxWidth: '1200px' }}>
          <SiteBreadcrumbs items={breadcrumbItems} />
          <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '16px' }}>
            {serviceName} в {cityName}
          </h1>
          <p style={{ color: 'var(--mid)', lineHeight: 1.7, marginBottom: '28px', maxWidth: '640px' }}>
            Мы выполняем {serviceName.toLowerCase()} в {cityName}. Подробная страница скоро появится —
            оставьте заявку, замерщик приедет бесплатно.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button type="button" onClick={onQuoteClick} className="btn">Получить расчёт бесплатно</button>
            <Link to={`/podmoskovye/${city}/`} className="btn btn-outline">Асфальтирование в {cityName}</Link>
          </div>
        </div>
      </>
    )
  }

  const style = data.style || slugStyle(`${city}-${service}`)
  const img = data.image_url || serviceInfo?.img || FALLBACK_IMG
  const title = (data.meta?.title || '').split(/[|—]/)[0].trim() || `${serviceName} в ${cityName}`

  return (
    <>
      <PageMeta meta={data.meta} jsonld={data.jsonld} />
      <div style={{ width: '100%', height: '320px', overflow: 'hidden', position: 'relative' }}>
        <img src={img} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(10,10,10,0.82) 100%)' }} />
        <div style={{ position: 'absolute', bottom: '28px', left: 0, right: 0 }}>
          <div className="container">
            <h1 style={{ color: '#fff', fontWeight: 900, fontSize: '2rem', margin: 0 }}>{title}</h1>
          </div>
        </div>
      </div>

      <div className="container city-layout" style={{ padding: '48px 20px', display: 'grid', gridTemplateColumns: '1fr 280px', gap: '40px', alignItems: 'start', maxWidth: '1200px' }}>
        <div>
          <SiteBreadcrumbs items={breadcrumbItems} />
          <ContentWithImages content={data.content} img={img} imageUrls={data.image_urls || []} style={style} />

          <div style={{ background: 'var(--accent)', borderRadius: '8px', padding: '32px', marginTop: '48px', maxWidth: '860px' }}>
            <h3 style={{ color: 'var(--black)', fontWeight: 900, fontSize: '1.3rem', marginBottom: '8px' }}>
              {serviceName} в {cityName}
            </h3>
            <p style={{ color: '#333', marginBottom: '20px' }}>Выезд замерщика бесплатно · Гарантия 5 лет</p>
            <button
              type="button"
              onClick={onQuoteClick}
              style={{ background: 'var(--black)', color: 'var(--white)', padding: '12px 28px', borderRadius: '4px', fontWeight: 700, cursor: 'pointer', border: 'none' }}
            >
              Получить расчёт
            </button>
          </div>
        </div>

        <SiteSidebarNav onQuoteClick={onQuoteClick}>
          <RegionsWidget />
          <div style={{ marginTop: '24px' }}>
            <Link to={`/podmoskovye/${city}/`} style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '0.9rem' }}>
              ← Все услуги в {cityName}
            </Link>
          </div>
        </SiteSidebarNav>
      </div>
    </>
  )
}
