import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import PageMeta from '../components/PageMeta'
import RegionsWidget from '../components/RegionsWidget'
import { CITIES } from '../constants/cities'

const FALLBACK_IMG = 'https://images.pexels.com/photos/1123972/pexels-photo-1123972.jpeg?auto=compress&cs=tinysrgb&w=600'

export default function City({ onQuoteClick }) {
  const { slug } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [blogs, setBlogs] = useState([])

  useEffect(() => {
    setLoading(true)
    setNotFound(false)
    fetch(`/api/page/podmoskovye/${slug}`)
      .then(r => {
        if (r.status === 404) { setNotFound(true); setLoading(false); return null }
        if (!r.ok) throw new Error('Ошибка загрузки')
        return r.json()
      })
      .then(d => { if (d) { setData(d); setLoading(false) } })
      .catch(e => { setError(e.message); setLoading(false) })

    fetch('/api/blog/recent?limit=3')
      .then(r => r.ok ? r.json() : { posts: [] })
      .then(d => setBlogs(d.posts || []))
      .catch(() => {})
  }, [slug])

  const cityName = CITIES.find(c => c.slug === slug)?.name || slug

  if (loading) return <div className="loading">Загрузка...</div>
  if (notFound) return (
    <div className="container" style={{ padding: '80px 20px', maxWidth: '700px' }}>
      <div style={{ fontSize: '0.85rem', color: 'var(--mid)', marginBottom: '24px' }}>
        <Link to="/" style={{ color: 'var(--mid)' }}>Главная</Link>
        {' / '}
        <Link to="/regiony/" style={{ color: 'var(--mid)' }}>Подмосковье</Link>
        {' / '}
        <span>{cityName}</span>
      </div>
      <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '16px' }}>
        Асфальтирование в {cityName}
      </h1>
      <p style={{ color: 'var(--mid)', fontSize: '1rem', lineHeight: 1.7, marginBottom: '28px' }}>
        Мы уже работаем в {cityName}. Страница с ценами и условиями скоро появится — оставьте заявку прямо сейчас, замерщик приедет бесплатно.
      </p>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button onClick={onQuoteClick} className="btn">Получить расчёт бесплатно</button>
        <a href="tel:+79096282800" className="btn btn-outline">+7 909 628 28 00</a>
      </div>
    </div>
  )
  if (error) return (
    <div className="container" style={{ padding: '60px 20px' }}>
      <div className="error-box">{error}</div>
    </div>
  )

  return (
    <>
      <PageMeta meta={data.meta} jsonld={data.jsonld} />

      {data.image_url && (
        <div style={{ width: '100%', height: '380px', overflow: 'hidden', position: 'relative' }}>
          <img
            src={data.image_url}
            alt={data.meta?.title || ''}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(10,10,10,0.72) 100%)' }} />
          <div style={{ position: 'absolute', bottom: '32px', left: 0, right: 0 }}>
            <div className="container">
              <h1 style={{ color: '#fff', fontWeight: 900, fontSize: '2.2rem', margin: 0, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                {(data.meta?.title || '').split(/[|—]/)[0].trim()}
              </h1>
            </div>
          </div>
        </div>
      )}

      <div className="container city-layout" style={{ padding: '48px 20px', display: 'grid', gridTemplateColumns: '1fr 300px', gap: '48px', alignItems: 'start', maxWidth: '1200px' }}>
        {/* Main content */}
        <div>
          <div className="prose">
            <ReactMarkdown>{data.content}</ReactMarkdown>
          </div>

          <CallBlock onQuoteClick={onQuoteClick} />

          {/* Yandex Maps */}
          <div style={{ marginTop: '48px' }}>
            <h2 style={{ fontWeight: 900, fontSize: '1.4rem', marginBottom: '16px' }}>
              Район присутствия
            </h2>
            <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid #2a2a2a' }}>
              <iframe
                src={`https://yandex.ru/map-widget/v1/?text=${encodeURIComponent((data.meta?.title || '').replace(/[|—].*/,'').trim() || slug)}&z=12&lang=ru_RU`}
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
              <h2 style={{ fontWeight: 900, fontSize: '1.6rem', marginBottom: '24px' }}>
                Полезные статьи об асфальтировании
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))', gap: '20px' }}>
                {blogs.map(post => (
                  <Link
                    key={post.slug}
                    to={`/blog/${post.slug}`}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <div style={{ background: 'var(--gray)', borderRadius: '8px', overflow: 'hidden', height: '100%' }}>
                      <div style={{ height: '160px', overflow: 'hidden' }}>
                        <img
                          src={post.image_url || FALLBACK_IMG}
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

        {/* Sidebar */}
        <aside>
          <RegionsWidget />
        </aside>
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
