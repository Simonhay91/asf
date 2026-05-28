import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import PageMeta from '../components/PageMeta'
import ContentWithImages from '../components/ContentWithImages'
import SiteBreadcrumbs from '../components/SiteBreadcrumbs'
import SiteSidebarNav from '../components/SiteSidebarNav'
import { LocationHero, LOCATION_FALLBACK_IMG, slugStyle } from '../components/LocationHero'
import { districtMetaFallback } from '../utils/seoMeta'
import { DISTRICTS, OKRUGS } from '../constants/districts'

export default function District({ onQuoteClick }) {
  const { okrug, slug } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [blogs, setBlogs] = useState([])

  useEffect(() => {
    setLoading(true)
    setData(null)
    fetch(`/api/page/moskva/${okrug}/${slug}`)
      .then(r => {
        if (!r.ok) throw new Error(r.status === 404 ? 'Страница не найдена' : 'Ошибка загрузки')
        return r.json()
      })
      .then(d => { setData(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })

    fetch('/api/blog/recent?limit=3')
      .then(r => r.ok ? r.json() : { posts: [] })
      .then(d => setBlogs(d.posts || []))
      .catch(() => {})
  }, [okrug, slug])

  const districtRow = DISTRICTS[okrug]?.find(d => d.slug === slug)
  const okrugInfo = OKRUGS[okrug]
  const fallbackMeta = districtMetaFallback(
    okrug,
    slug,
    districtRow?.name,
    okrugInfo?.short,
  )

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

  const style = data.style || slugStyle(slug)
  const img = data.image_url || LOCATION_FALLBACK_IMG
  const title = (data.meta?.title || '').split(/[|—]/)[0].trim()
  const topPadding = style === 4 ? '128px' : '48px'
  const mapLabel = data.district_name || title

  return (
    <>
      <PageMeta meta={data.meta} jsonld={data.jsonld} />
      <LocationHero style={style} title={title} img={img} badge="Асфальтирование в Москве" />

      <div
        className="container city-layout"
        style={{
          padding: `${topPadding} 20px 48px`,
          display: 'grid',
          gridTemplateColumns: '1fr 300px',
          gap: '48px',
          alignItems: 'start',
          maxWidth: '1200px',
        }}
      >
        <div>
          <SiteBreadcrumbs
            items={[
              { label: 'Главная', to: '/' },
              { label: 'Москва', to: '/moskva/' },
              ...(okrugInfo ? [{ label: okrugInfo.short, to: `/moskva/${okrug}/` }] : []),
              { label: data.district_name || slug },
            ]}
          />

          <ContentWithImages
            content={data.content}
            img={img}
            imageUrls={data.image_urls || []}
            style={style}
          />

          <CallBlock onQuoteClick={onQuoteClick} districtName={data.district_name} />

          <div style={{ marginTop: '48px' }}>
            <h2 style={{ fontWeight: 900, fontSize: '1.4rem', marginBottom: '16px' }}>Район на карте</h2>
            <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid #2a2a2a' }}>
              <iframe
                src={`https://yandex.ru/map-widget/v1/?text=${encodeURIComponent(`${mapLabel}, Москва`)}&z=13&lang=ru_RU`}
                width="100%"
                height="380"
                style={{ display: 'block', border: 0 }}
                title={`Карта — ${mapLabel}`}
                loading="lazy"
                allowFullScreen
              />
            </div>
          </div>

          {blogs.length > 0 && (
            <div style={{ marginTop: '60px' }}>
              <h2 style={{ fontWeight: 900, fontSize: '1.6rem', marginBottom: '24px' }}>
                Полезные статьи об асфальтировании
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))', gap: '20px' }}>
                {blogs.map(post => (
                  <Link key={post.slug} to={`/blog/${post.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ background: 'var(--gray)', borderRadius: '8px', overflow: 'hidden', height: '100%' }}>
                      <div style={{ height: '160px', overflow: 'hidden' }}>
                        <img
                          src={post.image_url || LOCATION_FALLBACK_IMG}
                          alt={post.name || post.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <div style={{ padding: '16px' }}>
                        <p style={{ fontWeight: 700, fontSize: '0.95rem', margin: 0, lineHeight: 1.4 }}>
                          {post.name || post.title}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <div style={{ marginTop: '16px' }}>
                <Link to="/blog/" style={{ color: 'var(--accent)', fontWeight: 700 }}>
                  Все статьи →
                </Link>
              </div>
            </div>
          )}
        </div>

        <SiteSidebarNav onQuoteClick={onQuoteClick} />
      </div>
    </>
  )
}

function CallBlock({ onQuoteClick, districtName }) {
  return (
    <div style={{ background: 'var(--accent)', borderRadius: '8px', padding: '32px', marginTop: '48px', maxWidth: '860px' }}>
      <h3 style={{ color: 'var(--black)', fontWeight: 900, fontSize: '1.4rem', marginBottom: '8px' }}>
        {districtName ? `Расчёт для района ${districtName}` : 'Готовы рассчитать стоимость?'}
      </h3>
      <p style={{ color: '#333', marginBottom: '20px' }}>Замерщик в день обращения — бесплатно</p>
      <button
        type="button"
        onClick={onQuoteClick}
        style={{
          background: 'var(--black)',
          color: 'var(--white)',
          padding: '12px 28px',
          borderRadius: '4px',
          fontWeight: 700,
          cursor: 'pointer',
          border: 'none',
          fontSize: '1rem',
        }}
      >
        Получить расчёт
      </button>
    </div>
  )
}
