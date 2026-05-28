import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import PageMeta from '../components/PageMeta'
import RegionsWidget from '../components/RegionsWidget'
import SiteBreadcrumbs from '../components/SiteBreadcrumbs'
import SiteSidebarNav from '../components/SiteSidebarNav'
import PageLayout from '../components/PageLayout'
import ContentWithImages from '../components/ContentWithImages'
import { CITIES } from '../constants/cities'
import { cityMeta } from '../utils/seoMeta'

const FALLBACK_IMG = 'https://images.pexels.com/photos/1123972/pexels-photo-1123972.jpeg?auto=compress&cs=tinysrgb&w=1200'

// Deterministic style from slug (for pages without stored style)
function slugStyle(slug) {
  let h = 0
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) | 0
  return (Math.abs(h) % 7) + 1
}

// ── Hero components ──────────────────────────────────────────────────────────

function Hero1({ title, img }) {
  // Top banner → gradient overlay → title at bottom
  return (
    <div style={{ width: '100%', height: '380px', overflow: 'hidden', position: 'relative' }}>
      <img src={img} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(10,10,10,0.78) 100%)' }} />
      <div style={{ position: 'absolute', bottom: '32px', left: 0, right: 0 }}>
        <div className="container">
          <h1 style={{ color: '#fff', fontWeight: 900, fontSize: '2.2rem', margin: 0, textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}>{title}</h1>
        </div>
      </div>
    </div>
  )
}

function Hero2({ title, img }) {
  // Split: image right, title+badge left
  return (
    <div className="hero2-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '340px', overflow: 'hidden' }}>
      <div style={{ background: 'var(--dark)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '48px 40px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--accent)', color: '#000', padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700, marginBottom: '16px', width: 'fit-content' }}>
          ⚡ Асфальтирование в Подмосковье
        </div>
        <h1 style={{ color: '#fff', fontWeight: 900, fontSize: '2rem', margin: '0 0 16px', lineHeight: 1.2 }}>{title}</h1>
        <p style={{ color: 'var(--mid)', margin: 0, fontSize: '0.95rem' }}>от 630 руб/м² · Гарантия 5 лет · Выезд сегодня</p>
      </div>
      <div style={{ overflow: 'hidden' }}>
        <img src={img} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
    </div>
  )
}

function Hero3({ title, img }) {
  // Diagonal / angled hero
  return (
    <div style={{ position: 'relative', height: '360px', overflow: 'hidden' }}>
      <img src={img} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(10,10,10,0.9) 0%, rgba(10,10,10,0.4) 60%, transparent 100%)' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center' }}>
        <div className="container">
          <div style={{ maxWidth: '520px' }}>
            <div style={{ width: '48px', height: '4px', background: 'var(--accent)', marginBottom: '20px', borderRadius: '2px' }} />
            <h1 style={{ color: '#fff', fontWeight: 900, fontSize: '2.2rem', margin: '0 0 12px', lineHeight: 1.2 }}>{title}</h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0, fontSize: '0.95rem' }}>Профессиональное асфальтирование · от 630 руб/м²</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Hero4({ title, img }) {
  // Full-bleed tall image, content starts overlapping bottom
  return (
    <div style={{ position: 'relative', height: '480px', overflow: 'hidden', marginBottom: '-80px' }}>
      <img src={img} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0) 30%, rgba(10,10,10,1) 100%)' }} />
      <div style={{ position: 'absolute', bottom: '100px', left: 0, right: 0 }}>
        <div className="container">
          <h1 style={{ color: '#fff', fontWeight: 900, fontSize: '2.4rem', margin: 0, textShadow: '0 2px 16px rgba(0,0,0,0.8)' }}>{title}</h1>
        </div>
      </div>
    </div>
  )
}

function Hero5({ title }) {
  // No image — accent color strip with stats
  return (
    <div style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #111 100%)', borderBottom: '3px solid var(--accent)', padding: '60px 0 48px' }}>
      <div className="container">
        <h1 style={{ color: '#fff', fontWeight: 900, fontSize: '2.4rem', margin: '0 0 24px', lineHeight: 1.2 }}>{title}</h1>
        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
          {[['от 630 ₽/м²', 'Цена'], ['5 лет', 'Гарантия'], ['15 лет', 'Опыт'], ['сегодня', 'Выезд']].map(([val, label]) => (
            <div key={label}>
              <div style={{ color: 'var(--accent)', fontWeight: 900, fontSize: '1.4rem' }}>{val}</div>
              <div style={{ color: 'var(--mid)', fontSize: '0.8rem' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Hero6({ title, img }) {
  // Compact banner + accent stripe
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ width: '100%', height: '300px', overflow: 'hidden' }}>
        <img src={img} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'brightness(0.55)' }} />
      </div>
      <div style={{ background: 'var(--accent)', padding: '16px 0' }}>
        <div className="container">
          <h1 style={{ color: '#000', fontWeight: 900, fontSize: '1.8rem', margin: 0 }}>{title}</h1>
        </div>
      </div>
    </div>
  )
}

function Hero7({ title, img }) {
  // Centered overlay with frosted glass card
  return (
    <div style={{ position: 'relative', height: '400px', overflow: 'hidden' }}>
      <img src={img} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'brightness(0.45)' }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '36px 48px', textAlign: 'center', maxWidth: '600px' }}>
          <h1 style={{ color: '#fff', fontWeight: 900, fontSize: '2rem', margin: '0 0 12px', lineHeight: 1.3 }}>{title}</h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', margin: 0, fontSize: '0.95rem' }}>от 630 руб/м² · Выезд бесплатно · Гарантия 5 лет</p>
        </div>
      </div>
    </div>
  )
}

const HEROES = { 1: Hero1, 2: Hero2, 3: Hero3, 4: Hero4, 5: Hero5, 6: Hero6, 7: Hero7 }

// ── Main component ───────────────────────────────────────────────────────────

export default function City({ onQuoteClick }) {
  const { slug } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [blogs, setBlogs] = useState([])

  useEffect(() => {
    setLoading(true)
    setData(null)
    fetch(`/api/page/podmoskovye/${slug}`)
      .then(r => {
        if (!r.ok) throw new Error('Ошибка загрузки')
        return r.json()
      })
      .then(d => { setData(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })

    fetch('/api/blog/recent?limit=3')
      .then(r => r.ok ? r.json() : { posts: [] })
      .then(d => setBlogs(d.posts || []))
      .catch(() => {})
  }, [slug])

  const cityName = CITIES.find(c => c.slug === slug)?.name || slug
  const breadcrumbItems = [
    { label: 'Главная', to: '/' },
    { label: 'Подмосковье', to: '/regiony/' },
    { label: cityName },
  ]

  const fallbackMeta = cityMeta(cityName, slug)

  if (loading) {
    return (
      <>
        <PageMeta meta={fallbackMeta} />
        <div className="loading">Загрузка...</div>
      </>
    )
  }
  if (data?.placeholder) return (
    <>
      <PageMeta meta={data.meta} jsonld={data.jsonld} />
      <PageLayout
        onQuoteClick={onQuoteClick}
        topPadding="48px"
        breadcrumbs={breadcrumbItems}
        sidebarExtra={<RegionsWidget />}
      >
        <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '16px' }}>
          Асфальтирование в {cityName}
        </h1>
        <p style={{ color: 'var(--mid)', fontSize: '1rem', lineHeight: 1.7, marginBottom: '28px' }}>
          Мы уже работаем в {cityName}. Страница с ценами и условиями скоро появится — оставьте заявку прямо сейчас, замерщик приедет бесплатно.
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button type="button" onClick={onQuoteClick} className="btn">Получить расчёт бесплатно</button>
          <a href="tel:+79096282800" className="btn btn-outline">+7 909 628 28 00</a>
        </div>
      </PageLayout>
    </>
  )
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
  const img = data.image_url || FALLBACK_IMG
  const title = (data.meta?.title || '').split(/[|—]/)[0].trim()
  const HeroComponent = HEROES[style] || Hero1
  // Style 4 uses tall image that overlaps content, needs extra padding
  const topPadding = style === 4 ? '128px' : '48px'

  return (
    <>
      <PageMeta meta={data.meta} jsonld={data.jsonld} />
      <HeroComponent title={title} img={img} />

      <div className="container city-layout" style={{ padding: `${topPadding} 20px 48px`, display: 'grid', gridTemplateColumns: '1fr 280px', gap: '40px', alignItems: 'start', maxWidth: '1200px' }}>
        <div>
          <SiteBreadcrumbs items={breadcrumbItems} />
          <ContentWithImages content={data.content} img={img} imageUrls={data.image_urls || []} style={style} />

          <CallBlock onQuoteClick={onQuoteClick} />

          <div style={{ marginTop: '48px' }}>
            <h2 style={{ fontWeight: 900, fontSize: '1.4rem', marginBottom: '16px' }}>Район присутствия</h2>
            <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid #2a2a2a' }}>
              <iframe
                src={`https://yandex.ru/map-widget/v1/?text=${encodeURIComponent(title || slug)}&z=12&lang=ru_RU`}
                width="100%"
                height="380"
                style={{ display: 'block', border: 0 }}
                title={`Карта — ${slug}`}
                loading="lazy"
                allowFullScreen
              />
            </div>
          </div>

          {blogs.length > 0 && (
            <div style={{ marginTop: '60px' }}>
              <h2 style={{ fontWeight: 900, fontSize: '1.6rem', marginBottom: '24px' }}>Полезные статьи об асфальтировании</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))', gap: '20px' }}>
                {blogs.map(post => (
                  <Link key={post.slug} to={`/blog/${post.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ background: 'var(--gray)', borderRadius: '8px', overflow: 'hidden', height: '100%' }}>
                      <div style={{ height: '160px', overflow: 'hidden' }}>
                        <img src={post.image_url || FALLBACK_IMG} alt={post.name || post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ padding: '16px' }}>
                        <p style={{ fontWeight: 700, fontSize: '0.95rem', margin: 0, lineHeight: 1.4 }}>{post.name || post.title}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <div style={{ marginTop: '16px' }}>
                <Link to="/blog/" style={{ color: 'var(--accent)', fontWeight: 700 }}>Все статьи →</Link>
              </div>
            </div>
          )}
        </div>

        <SiteSidebarNav onQuoteClick={onQuoteClick}>
          <RegionsWidget />
        </SiteSidebarNav>
      </div>
    </>
  )
}

function CallBlock({ onQuoteClick }) {
  return (
    <div style={{ background: 'var(--accent)', borderRadius: '8px', padding: '32px', marginTop: '48px', maxWidth: '860px' }}>
      <h3 style={{ color: 'var(--black)', fontWeight: 900, fontSize: '1.4rem', marginBottom: '8px' }}>
        Асфальтирование в вашем городе
      </h3>
      <p style={{ color: '#333', marginBottom: '20px' }}>Выезжаем по всей Московской области. Замер бесплатно.</p>
      <button
        onClick={onQuoteClick}
        style={{ background: 'var(--black)', color: 'var(--white)', padding: '12px 28px', borderRadius: '4px', fontWeight: 700, cursor: 'pointer', border: 'none', fontSize: '1rem' }}
      >
        Получить расчёт
      </button>
    </div>
  )
}
