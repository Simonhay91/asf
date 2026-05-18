import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import PageMeta from '../components/PageMeta'
import { districtMetaFallback } from '../utils/seoMeta'

const FALLBACK_IMG = 'https://images.pexels.com/photos/1123972/pexels-photo-1123972.jpeg?auto=compress&cs=tinysrgb&w=600'

export default function District({ onQuoteClick }) {
  const { okrug, slug } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [blogs, setBlogs] = useState([])

  useEffect(() => {
    setLoading(true)
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

  const fallbackMeta = districtMetaFallback(okrug, slug)

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

  return (
    <>
      <PageMeta meta={data.meta} jsonld={data.jsonld} />
      <div className="container" style={{ padding: '48px 20px' }}>
        <div className="prose" style={{ maxWidth: '860px' }}>
          <ReactMarkdown>{data.content}</ReactMarkdown>
        </div>

        <CallBlock onQuoteClick={onQuoteClick} />

        {blogs.length > 0 && (
          <div style={{ marginTop: '60px', maxWidth: '860px' }}>
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
    </>
  )
}

function CallBlock({ onQuoteClick }) {
  return (
    <div style={{ background: 'var(--accent)', borderRadius: '8px', padding: '32px', marginTop: '48px', maxWidth: '860px' }}>
      <h3 style={{ color: 'var(--black)', fontWeight: 900, fontSize: '1.4rem', marginBottom: '8px' }}>
        Готовы рассчитать стоимость?
      </h3>
      <p style={{ color: '#333', marginBottom: '20px' }}>Замерщик в день обращения — бесплатно</p>
      <button
        onClick={onQuoteClick}
        style={{ background: 'var(--black)', color: 'var(--white)', padding: '12px 28px', borderRadius: '4px', fontWeight: 700, cursor: 'pointer', border: 'none', fontSize: '1rem' }}
      >
        Получить расчёт
      </button>
    </div>
  )
}
