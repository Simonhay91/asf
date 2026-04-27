import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import PageMeta from '../components/PageMeta'
import { USLUGI_PAGES } from '../constants/services'

const SERVICE_META = {
  'asfaltirovanie-dvorov': {
    label: 'Асфальтирование дворов',
    price: 'от 630 ₽/м²',
    img: 'https://images.pexels.com/photos/8134845/pexels-photo-8134845.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600',
  },
  'asfaltirovanie-parkovok': {
    label: 'Асфальтирование парковок',
    price: 'от 630 ₽/м²',
    img: 'https://images.pexels.com/photos/9716297/pexels-photo-9716297.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600',
  },
  'asfaltirovanie-dorog': {
    label: 'Асфальтирование дорог',
    price: 'от 630 ₽/м²',
    img: 'https://images.pexels.com/photos/35890914/pexels-photo-35890914.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600',
  },
  'yamochnyj-remont': {
    label: 'Ямочный ремонт',
    price: 'от 1 200 ₽/м²',
    img: 'https://images.pexels.com/photos/6018642/pexels-photo-6018642.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600',
  },
  'asfaltovaya-kroshka': {
    label: 'Асфальтовая крошка',
    price: 'от 350 ₽/м²',
    img: 'https://images.pexels.com/photos/4040619/pexels-photo-4040619.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600',
  },
  'asfaltirovanie-promyshlennyh-ploshhadok': {
    label: 'Промышленные площадки',
    price: 'от 630 ₽/м²',
    img: 'https://images.pexels.com/photos/1117452/pexels-photo-1117452.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600',
  },
  'asfaltirovanie-sportivnyh-ploshhadok': {
    label: 'Спортивные площадки',
    price: 'от 630 ₽/м²',
    img: 'https://images.pexels.com/photos/209977/pexels-photo-209977.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600',
  },
  'kompleksnoe-blagoustrojstvo-dvora-pod-klyuch': {
    label: 'Благоустройство двора',
    price: 'под ключ',
    img: 'https://images.pexels.com/photos/280222/pexels-photo-280222.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600',
  },
}


export default function Service({ onQuoteClick }) {
  const { slug } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [blogs, setBlogs] = useState([])

  useEffect(() => {
    setLoading(true)
    setData(null)
    fetch(`/api/page/uslugi/${slug}`)
      .then(r => {
        if (!r.ok) throw new Error(r.status === 404 ? 'Услуга не найдена' : 'Ошибка загрузки')
        return r.json()
      })
      .then(d => { setData(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })

    fetch('/api/blog/recent?limit=3')
      .then(r => r.ok ? r.json() : { posts: [] })
      .then(d => setBlogs(d.posts || []))
      .catch(() => {})
  }, [slug])

  if (loading) return <div className="loading">Загрузка...</div>
  if (error) return (
    <div className="container" style={{ padding: '60px 20px' }}>
      <div className="error-box">{error}</div>
    </div>
  )

  const svcMeta = SERVICE_META[slug] || { label: slug, price: '', img: '' }
  const heroImg = data.image_url || svcMeta.img

  return (
    <>
      <PageMeta meta={data.meta} jsonld={data.jsonld} />

      {/* ── Hero ── */}
      <div className="svc-hero" style={{ position: 'relative', overflow: 'hidden' }}>
        {heroImg && (
          <img
            src={heroImg}
            alt={svcMeta.label}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(10,10,10,0.88) 50%, rgba(10,10,10,0.4) 100%)' }} />
        <div className="container" style={{ position: 'relative', zIndex: 2, padding: '48px 20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '14px' }}>
            <Link to="/" style={{ color: 'rgba(255,255,255,0.5)' }}>Главная</Link>
            {' / '}
            <Link to="/uslugi/" style={{ color: 'rgba(255,255,255,0.5)' }}>Услуги</Link>
            {' / '}
            <span style={{ color: 'var(--light)' }}>{svcMeta.label}</span>
          </div>
          <h1 style={{ fontWeight: 900, fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', color: 'var(--white)', marginBottom: '14px', lineHeight: 1.2, maxWidth: '600px' }}>
            {svcMeta.label}
            <br />
            <span style={{ color: 'var(--accent)' }}>в Москве и МО</span>
          </h1>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ background: 'var(--accent)', color: 'var(--black)', fontWeight: 900, padding: '6px 18px', borderRadius: '20px', fontSize: '0.97rem' }}>
              {svcMeta.price}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>Гарантия 5 лет · Замер бесплатно</span>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '40px 20px' }}>
        <div className="svc-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '48px', alignItems: 'start', maxWidth: '1100px' }}>

          {/* Main content */}
          <div>
            {data.has_ai_content ? (
              <div className="prose">
                <ReactMarkdown>{data.content}</ReactMarkdown>
              </div>
            ) : (
              <StaticPlaceholder name={svcMeta.label} onQuoteClick={onQuoteClick} />
            )}

            <CallBlock onQuoteClick={onQuoteClick} />

            {blogs.length > 0 && (
              <div style={{ marginTop: '60px' }}>
                <h2 style={{ fontWeight: 900, fontSize: '1.4rem', marginBottom: '20px' }}>
                  Полезные статьи
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '16px' }}>
                  {blogs.map(post => (
                    <Link
                      key={post.slug}
                      to={`/blog/${post.slug}`}
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <div style={{ background: 'var(--gray)', borderRadius: '8px', padding: '16px', height: '100%' }}>
                        <p style={{ fontWeight: 700, fontSize: '0.9rem', margin: 0, lineHeight: 1.4 }}>
                          {post.name || post.title}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
                <div style={{ marginTop: '12px' }}>
                  <Link to="/blog/" style={{ color: 'var(--accent)', fontWeight: 700 }}>
                    Все статьи →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside>
          <div style={{ position: 'sticky', top: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Services nav — from shared constants */}
            <div style={{ background: 'var(--gray)', borderRadius: '8px', padding: '20px' }}>
              <h3 style={{ fontWeight: 900, fontSize: '0.95rem', marginBottom: '14px', color: 'var(--accent)' }}>
                Наши услуги
              </h3>
              <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {USLUGI_PAGES.map(s => {
                  const isActive = s.href === `/uslugi/${slug}/`
                  return (
                    <Link
                      key={s.href}
                      to={s.href}
                      style={{
                        textDecoration: 'none',
                        padding: '9px 12px',
                        borderRadius: '4px',
                        fontWeight: isActive ? 700 : 500,
                        fontSize: '0.88rem',
                        background: isActive ? 'var(--accent)' : 'transparent',
                        color: isActive ? 'var(--black)' : 'var(--light)',
                        transition: 'background 0.15s',
                        borderLeft: isActive ? 'none' : '2px solid transparent',
                      }}
                      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#2a2a2a' }}
                      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                    >
                      {s.name}
                    </Link>
                  )
                })}
              </nav>
            </div>

            {/* CTA */}
            <div style={{ background: 'var(--accent)', borderRadius: '8px', padding: '20px' }}>
              <p style={{ fontWeight: 900, fontSize: '1rem', color: 'var(--black)', marginBottom: '6px' }}>
                Бесплатный замер
              </p>
              <p style={{ fontSize: '0.82rem', color: '#333', marginBottom: '14px', lineHeight: 1.4 }}>
                Выезд в день обращения. Расчёт за 30 минут.
              </p>
              <button
                onClick={onQuoteClick}
                style={{
                  width: '100%', background: 'var(--black)', color: 'var(--white)',
                  padding: '11px', borderRadius: '4px', fontWeight: 700,
                  cursor: 'pointer', border: 'none', fontSize: '0.92rem',
                }}
              >
                Получить расчёт
              </button>
            </div>

            {/* Yandex Map */}
            <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #2a2a2a' }}>
              <iframe
                src={`https://yandex.ru/map-widget/v1/?text=${encodeURIComponent(`${svcMeta.label} Москва`)}&z=10&lang=ru_RU`}
                width="100%"
                height="240"
                style={{ display: 'block', border: 0 }}
                title={`Карта — ${svcMeta.label}`}
                loading="lazy"
                allowFullScreen
              />
            </div>
          </div>
          </aside>
        </div>
      </div>
    </>
  )
}

function CallBlock({ onQuoteClick }) {
  return (
    <div style={{
      background: 'var(--accent)', borderRadius: '8px', padding: '28px 32px', marginTop: '48px',
      display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '20px', justifyContent: 'space-between',
    }}>
      <div>
        <h3 style={{ color: 'var(--black)', fontWeight: 900, fontSize: '1.3rem', marginBottom: '4px' }}>
          Готовы рассчитать стоимость?
        </h3>
        <p style={{ color: '#333', margin: 0, fontSize: '0.9rem' }}>
          Замерщик приедет в день обращения — бесплатно
        </p>
      </div>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={onQuoteClick}
          style={{
            background: 'var(--black)', color: 'var(--white)',
            padding: '12px 28px', borderRadius: '4px',
            fontWeight: 700, cursor: 'pointer', border: 'none', fontSize: '1rem', whiteSpace: 'nowrap',
          }}
        >
          Получить расчёт
        </button>
        <a
          href="tel:+79096282800"
          style={{
            background: 'transparent', color: 'var(--black)',
            padding: '12px 20px', borderRadius: '4px',
            fontWeight: 700, border: '2px solid var(--black)', fontSize: '1rem',
            textDecoration: 'none', whiteSpace: 'nowrap',
          }}
        >
          +7 909 628 28 00
        </a>
      </div>
    </div>
  )
}

function StaticPlaceholder({ name, onQuoteClick }) {
  return (
    <div>
      <h1 style={{ fontWeight: 900, fontSize: '2rem', marginBottom: '16px' }}>{name} в Москве</h1>
      <p style={{ color: 'var(--mid)', marginBottom: '32px', fontSize: '1.05rem' }}>
        Профессиональное {name.toLowerCase()} в Москве и Подмосковье под ключ.
        Собственная техника, гарантия 5 лет, выезд замерщика в день обращения.
      </p>
      <div className="svc-static-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginBottom: '32px' }}>
        {[
          { label: '15 лет', sub: 'на рынке' },
          { label: '5 лет', sub: 'гарантия' },
          { label: 'от 630 ₽', sub: 'за м²' },
        ].map(item => (
          <div key={item.label} style={{ background: 'var(--gray)', borderRadius: '8px', padding: '20px', textAlign: 'center' }}>
            <div style={{ fontWeight: 900, fontSize: '1.6rem', color: 'var(--accent)' }}>{item.label}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--mid)', marginTop: '4px' }}>{item.sub}</div>
          </div>
        ))}
      </div>
      <button
        onClick={onQuoteClick}
        className="btn"
        style={{ fontSize: '1rem', padding: '14px 32px' }}
      >
        Получить расчёт стоимости
      </button>
    </div>
  )
}
