import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import PageMeta from '../components/PageMeta'
import RegionsWidget from '../components/RegionsWidget'

const FALLBACK_IMG = 'https://images.pexels.com/photos/1123972/pexels-photo-1123972.jpeg?auto=compress&cs=tinysrgb&w=600'

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

  if (loading) return <div className="loading">Загрузка...</div>
  if (error) return (
    <div className="container" style={{ padding: '60px 20px' }}>
      <div className="error-box">{error}</div>
    </div>
  )

  return (
    <>
      <PageMeta meta={data.meta} jsonld={data.jsonld} />

      {data.image_url && (
        <div style={{ width: '100%', height: '420px', overflow: 'hidden', position: 'relative' }}>
          <img
            src={data.image_url}
            alt={data.meta?.title || ''}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(10,10,10,0.7) 100%)' }} />
        </div>
      )}

      <div className="container blog-layout" style={{ padding: '48px 20px', display: 'grid', gridTemplateColumns: '1fr 300px', gap: '48px', alignItems: 'start', maxWidth: '1200px' }}>
        {/* Main content */}
        <div>
          {data.generated_at && (
            <div style={{ color: 'var(--mid)', fontSize: '0.85rem', marginBottom: '24px' }}>
              Опубликовано: {new Date(data.generated_at).toLocaleDateString('ru-RU')}
            </div>
          )}
          <div className="prose">
            <ReactMarkdown>{data.content}</ReactMarkdown>
          </div>
          <div style={{ background: 'var(--gray)', borderRadius: '8px', padding: '28px', marginTop: '48px', border: '1px solid #333' }}>
            <p style={{ color: 'var(--light)', marginBottom: '16px', fontSize: '1.05rem' }}>
              <strong>РусскийАсфальт</strong> — асфальтирование в Москве и Подмосковье от 630 руб/м².
              Гарантия 5 лет, выезд замерщика в день обращения.
            </p>
            <button onClick={onQuoteClick} className="btn">Получить расчёт</button>
          </div>
        </div>

        {/* Sidebar */}
        <aside>
          {related.length > 0 && (
            <div style={{ background: 'var(--gray)', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
              <h3 style={{ fontWeight: 900, fontSize: '1.05rem', marginBottom: '16px', marginTop: 0 }}>
                Похожие статьи
              </h3>
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
