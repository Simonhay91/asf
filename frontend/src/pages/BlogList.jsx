import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageMeta from '../components/PageMeta'
import SiteBreadcrumbs from '../components/SiteBreadcrumbs'
import PageLayout from '../components/PageLayout'
import { BLOG_LIST_META } from '../utils/seoMeta'

const FALLBACK_IMG = 'https://images.pexels.com/photos/302686/pexels-photo-302686.jpeg?auto=compress&cs=tinysrgb&h=400&w=700'
const PER_PAGE = 12

export default function BlogList({ onQuoteClick }) {
  const [posts, setPosts] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const skip = (page - 1) * PER_PAGE
    fetch(`/api/pages/list?page_type=blog&limit=${PER_PAGE}&skip=${skip}`)
      .then(r => r.json())
      .then(d => {
        setPosts(d.pages || [])
        setTotal(d.total || 0)
        setLoading(false)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      })
      .catch(() => setLoading(false))
  }, [page])

  const totalPages = Math.ceil(total / PER_PAGE)

  return (
    <>
      <PageMeta meta={BLOG_LIST_META} />

      <section style={{ padding: '48px 0 24px', borderBottom: '1px solid #222' }}>
        <div className="container">
          <SiteBreadcrumbs
            items={[
              { label: 'Главная', to: '/' },
              { label: 'Блог' },
            ]}
          />
          <div style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px' }}>
            Блог
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--white)', marginBottom: '12px' }}>
            Об асфальтировании
          </h1>
          <p style={{ color: 'var(--mid)', fontSize: '1.05rem' }}>
            Советы, цены, технологии — всё для тех, кто планирует асфальтирование
          </p>
        </div>
      </section>

      <PageLayout onQuoteClick={onQuoteClick} topPadding="32px">
          {loading ? (
            <div className="loading">Загрузка...</div>
          ) : (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '28px',
                marginBottom: '48px',
              }}>
                {posts.map(post => (
                  <BlogCard key={post.slug} post={post} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setPage(p => p - 1)}
                    disabled={page === 1}
                    style={btnStyle(false, page === 1)}
                  >
                    ← Назад
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => {
                    const isActive = p === page
                    const showDot = totalPages > 7 && p !== 1 && p !== totalPages && Math.abs(p - page) > 2
                    if (showDot && (p === page - 3 || p === page + 3)) {
                      return <span key={p} style={{ color: 'var(--mid)', padding: '0 4px' }}>…</span>
                    }
                    if (showDot) return null
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        style={btnStyle(isActive, false)}
                      >
                        {p}
                      </button>
                    )
                  })}

                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={page === totalPages}
                    style={btnStyle(false, page === totalPages)}
                  >
                    Вперёд →
                  </button>
                </div>
              )}

              {total > 0 && (
                <div style={{ textAlign: 'center', color: 'var(--mid)', fontSize: '0.82rem', marginTop: '16px' }}>
                  Страница {page} из {totalPages} · Всего статей: {total}
                </div>
              )}
            </>
          )}
      </PageLayout>
    </>
  )
}

function btnStyle(active, disabled) {
  return {
    background: active ? 'var(--accent)' : 'var(--gray)',
    color: active ? 'var(--black)' : disabled ? 'var(--mid)' : 'var(--white)',
    border: `1px solid ${active ? 'var(--accent)' : '#2a2a2a'}`,
    borderRadius: '6px',
    padding: '8px 14px',
    fontWeight: active ? 800 : 600,
    fontSize: '0.9rem',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.4 : 1,
    transition: 'background 0.15s',
  }
}

function BlogCard({ post }) {
  const slug = post.url?.replace('/blog/', '').replace('/', '') || post.slug
  const date = post.generated_at
    ? new Date(post.generated_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  return (
    <Link
      to={`/blog/${slug}/`}
      style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', background: 'var(--gray)', border: '1px solid #2a2a2a', borderRadius: '10px', overflow: 'hidden', transition: 'border-color 0.2s', cursor: 'pointer' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = '#2a2a2a'}
    >
      <div style={{ height: '200px', overflow: 'hidden', flexShrink: 0 }}>
        <img
          src={post.image_url || FALLBACK_IMG}
          alt={post.title || post.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onError={e => { e.target.src = FALLBACK_IMG }}
        />
      </div>
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {date && (
          <div style={{ color: 'var(--mid)', fontSize: '0.78rem', marginBottom: '10px' }}>{date}</div>
        )}
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--white)', lineHeight: 1.4, marginBottom: '10px', flex: 1 }}>
          {post.title || post.name}
        </h2>
        {post.meta_description && (
          <p style={{ color: 'var(--mid)', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {post.meta_description}
          </p>
        )}
        <span style={{ color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 700 }}>
          Читать →
        </span>
      </div>
    </Link>
  )
}
