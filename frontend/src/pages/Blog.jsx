import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import PageMeta from '../components/PageMeta'
import RegionsWidget from '../components/RegionsWidget'
import ContentWithImages from '../components/ContentWithImages'
import { blogMetaFromSlug } from '../utils/seoMeta'

const FALLBACK_IMG = 'https://images.pexels.com/photos/1123972/pexels-photo-1123972.jpeg?auto=compress&cs=tinysrgb&w=1200'

function slugStyle(slug) {
  let h = 0
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) | 0
  return (Math.abs(h) % 7) + 1
}

// ── Hero components ──────────────────────────────────────────────────────────

function Hero1({ title, img, date }) {
  return (
    <div style={{ width: '100%', height: '420px', overflow: 'hidden', position: 'relative' }}>
      <img src={img} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(10,10,10,0.78) 100%)' }} />
      <div style={{ position: 'absolute', bottom: '36px', left: 0, right: 0 }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          {date && <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.8rem', marginBottom: '10px' }}>{date}</div>}
          <h1 style={{ color: '#fff', fontWeight: 900, fontSize: '2.1rem', margin: 0, lineHeight: 1.25, textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}>{title}</h1>
        </div>
      </div>
    </div>
  )
}

function Hero2({ title, img, date }) {
  return (
    <div className="hero2-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '360px', overflow: 'hidden' }}>
      <div style={{ background: '#0f0f0f', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '48px 40px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--accent)', color: '#000', padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '16px', width: 'fit-content' }}>
          📰 Блог РусскийАсфальт
        </div>
        <h1 style={{ color: '#fff', fontWeight: 900, fontSize: '1.85rem', margin: '0 0 16px', lineHeight: 1.25 }}>{title}</h1>
        {date && <div style={{ color: 'var(--mid)', fontSize: '0.82rem' }}>{date}</div>}
      </div>
      <div style={{ overflow: 'hidden' }}>
        <img src={img} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
    </div>
  )
}

function Hero3({ title, img, date }) {
  return (
    <div style={{ position: 'relative', height: '380px', overflow: 'hidden' }}>
      <img src={img} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(10,10,10,0.92) 0%, rgba(10,10,10,0.35) 65%, transparent 100%)' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center' }}>
        <div className="container">
          <div style={{ maxWidth: '540px' }}>
            <div style={{ width: '44px', height: '4px', background: 'var(--accent)', marginBottom: '18px', borderRadius: '2px' }} />
            <h1 style={{ color: '#fff', fontWeight: 900, fontSize: '2rem', margin: '0 0 10px', lineHeight: 1.25 }}>{title}</h1>
            {date && <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem' }}>{date}</div>}
          </div>
        </div>
      </div>
    </div>
  )
}

function Hero4({ title, img, date }) {
  return (
    <div style={{ position: 'relative', height: '500px', overflow: 'hidden', marginBottom: '-80px' }}>
      <img src={img} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0) 25%, rgba(10,10,10,1) 100%)' }} />
      <div style={{ position: 'absolute', bottom: '100px', left: 0, right: 0 }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          {date && <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginBottom: '10px' }}>{date}</div>}
          <h1 style={{ color: '#fff', fontWeight: 900, fontSize: '2.3rem', margin: 0, lineHeight: 1.2, textShadow: '0 2px 16px rgba(0,0,0,0.8)' }}>{title}</h1>
        </div>
      </div>
    </div>
  )
}

function Hero5({ title, date }) {
  return (
    <div style={{ background: 'linear-gradient(135deg, #111 0%, #1a1a1a 100%)', borderBottom: '3px solid var(--accent)', padding: '64px 0 48px' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <span style={{ background: 'var(--accent)', color: '#000', padding: '2px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>Блог</span>
          {date && <span style={{ color: 'var(--mid)', fontSize: '0.82rem' }}>{date}</span>}
        </div>
        <h1 style={{ color: '#fff', fontWeight: 900, fontSize: '2.4rem', margin: 0, lineHeight: 1.2 }}>{title}</h1>
      </div>
    </div>
  )
}

function Hero6({ title, img, date }) {
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ width: '100%', height: '320px', overflow: 'hidden' }}>
        <img src={img} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'brightness(0.5)' }} />
      </div>
      <div style={{ background: 'var(--accent)', padding: '18px 0' }}>
        <div className="container" style={{ maxWidth: '900px', display: 'flex', alignItems: 'baseline', gap: '16px', flexWrap: 'wrap' }}>
          <h1 style={{ color: '#000', fontWeight: 900, fontSize: '1.75rem', margin: 0, lineHeight: 1.2 }}>{title}</h1>
          {date && <span style={{ color: 'rgba(0,0,0,0.5)', fontSize: '0.8rem', flexShrink: 0 }}>{date}</span>}
        </div>
      </div>
    </div>
  )
}

function Hero7({ title, img, date }) {
  return (
    <div style={{ position: 'relative', height: '440px', overflow: 'hidden' }}>
      <img src={img} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'brightness(0.38)' }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '40px 52px', textAlign: 'center', maxWidth: '640px' }}>
          {date && <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.8rem', marginBottom: '12px' }}>{date}</div>}
          <h1 style={{ color: '#fff', fontWeight: 900, fontSize: '1.9rem', margin: 0, lineHeight: 1.3 }}>{title}</h1>
        </div>
      </div>
    </div>
  )
}

const HEROES = { 1: Hero1, 2: Hero2, 3: Hero3, 4: Hero4, 5: Hero5, 6: Hero6, 7: Hero7 }

// ── Main component ───────────────────────────────────────────────────────────

export default function Blog({ onQuoteClick }) {
  const { slug } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [related, setRelated] = useState([])

  useEffect(() => {
    setLoading(true)
    setRelated([])
    fetch(`/api/page/blog/${slug}`)
      .then(r => {
        if (!r.ok) throw new Error(r.status === 404 ? 'Статья не найдена' : 'Ошибка загрузки')
        return r.json()
      })
      .then(d => { setData(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })

    fetch(`/api/blog/recent?limit=4&exclude=${slug}`)
      .then(r => r.ok ? r.json() : { posts: [] })
      .then(d => setRelated(d.posts || []))
      .catch(() => {})
  }, [slug])

  const fallbackMeta = blogMetaFromSlug(slug)

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
  const img = data.image_url || FALLBACK_IMG
  const title = (data.meta?.title || '').split(/[|—]/)[0].trim()
  const date = data.generated_at ? new Date(data.generated_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) : null
  const HeroComponent = HEROES[style] || Hero1
  const topPadding = style === 4 ? '120px' : '48px'

  return (
    <>
      <PageMeta meta={data.meta} jsonld={data.jsonld} />
      <HeroComponent title={title} img={img} date={date} />

      <div className="container blog-layout" style={{ padding: `${topPadding} 20px 48px`, display: 'grid', gridTemplateColumns: '1fr 300px', gap: '48px', alignItems: 'start', maxWidth: '1200px' }}>
        <div>
          {/* Show date inside content only for styles without hero date */}
          {[1, 3, 4].includes(style) && date && (
            <div style={{ color: 'var(--mid)', fontSize: '0.85rem', marginBottom: '24px' }}>
              Опубликовано: {date}
            </div>
          )}
          <ContentWithImages content={data.content} img={img} imageUrls={data.image_urls || []} style={style} />
          <div style={{ background: 'var(--gray)', borderRadius: '8px', padding: '28px', marginTop: '48px', border: '1px solid #333' }}>
            <p style={{ color: 'var(--light)', marginBottom: '16px', fontSize: '1.05rem' }}>
              <strong>РусскийАсфальт</strong> — асфальтирование только в Москве и Подмосковье от 630 руб/м².
              Гарантия 5 лет, выезд замерщика в день обращения.
            </p>
            <button onClick={onQuoteClick} className="btn">Получить расчёт</button>
          </div>
        </div>

        <aside>
          {related.length > 0 && (
            <div style={{ background: 'var(--gray)', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
              <h3 style={{ fontWeight: 900, fontSize: '1.05rem', marginBottom: '16px', marginTop: 0 }}>Похожие статьи</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {related.map(post => (
                  <Link
                    key={post.slug}
                    to={`/blog/${post.slug}`}
                    style={{ textDecoration: 'none', color: 'inherit', display: 'flex', gap: '12px', alignItems: 'flex-start' }}
                  >
                    <img
                      src={post.image_url || FALLBACK_IMG}
                      alt={post.name || post.title}
                      style={{ width: '70px', height: '55px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }}
                    />
                    <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.4, fontWeight: 600 }}>
                      {post.name || post.title}
                    </p>
                  </Link>
                ))}
              </div>
              <Link to="/blog/" style={{ display: 'block', marginTop: '16px', color: 'var(--accent)', fontWeight: 700, fontSize: '0.9rem' }}>
                Все статьи →
              </Link>
            </div>
          )}
          <RegionsWidget />
        </aside>
      </div>
    </>
  )
}
