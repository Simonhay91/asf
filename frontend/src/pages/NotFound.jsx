import { Link, useLocation } from 'react-router-dom'
import PageMeta from '../components/PageMeta'
import {
  BRAND_NAME,
  BRAND_PHONE,
  BRAND_PHONE_HREF,
  BRAND_ADDRESS,
  BRAND_MAP_URL,
} from '../constants/brand'
import { notFoundMeta } from '../utils/seoMeta'
import SiteBreadcrumbs from '../components/SiteBreadcrumbs'
import { MAIN_NAV } from '../constants/nav'

export default function NotFound() {
  const { pathname } = useLocation()
  return (
    <>
      <PageMeta meta={notFoundMeta(pathname)} />
      <div className="container" style={{ padding: '56px 20px 80px', maxWidth: '720px' }}>
        <SiteBreadcrumbs
          items={[
            { label: 'Главная', to: '/' },
            { label: '404' },
          ]}
        />

        <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 4rem)', fontWeight: 900, color: 'var(--accent)', margin: '0 0 12px', lineHeight: 1 }}>
          404
        </h1>
        <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--white)', margin: '0 0 12px' }}>
          Страница не найдена
        </p>
        <p style={{ color: 'var(--mid)', lineHeight: 1.7, marginBottom: '32px' }}>
          Возможно, ссылка устарела или была введена с ошибкой. Перейдите на главную или выберите раздел ниже.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: '10px',
            marginBottom: '36px',
          }}
        >
          {MAIN_NAV.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              style={{
                display: 'block',
                padding: '12px 14px',
                background: 'var(--gray)',
                borderRadius: '8px',
                color: 'var(--light)',
                fontWeight: 600,
                fontSize: '0.9rem',
                textAlign: 'center',
              }}
            >
              {label}
            </Link>
          ))}
        </div>

        <div
          style={{
            background: 'var(--gray)',
            borderRadius: '8px',
            padding: '24px',
            marginBottom: '28px',
            textAlign: 'left',
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: '10px', color: 'var(--accent)' }}>Офис {BRAND_NAME}</div>
          <p style={{ margin: '0 0 12px', color: 'var(--light)', lineHeight: 1.6 }}>{BRAND_ADDRESS}</p>
          <a
            href={BRAND_MAP_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--accent)', fontSize: '0.9rem' }}
          >
            Открыть на Яндекс.Картах →
          </a>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'flex-start' }}>
          <Link to="/" className="btn">
            На главную
          </Link>
          <Link to="/kontakty/" className="btn btn-outline">
            Контакты
          </Link>
          <a href={BRAND_PHONE_HREF} className="btn btn-outline">
            {BRAND_PHONE}
          </a>
        </div>
      </div>
    </>
  )
}
