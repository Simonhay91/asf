import { Link } from 'react-router-dom'
import BrandLogo from './BrandLogo'
import { MAIN_NAV } from '../constants/nav'
import { USLUGI_PAGES } from '../constants/services'
import {
  BRAND_NAME,
  BRAND_GEO,
  BRAND_PRICE_FROM,
  BRAND_YEAR,
  BRAND_PHONE,
  BRAND_PHONE_HREF,
  BRAND_EMAIL,
  BRAND_ADDRESS_LINE1,
  BRAND_METRO,
  BRAND_HOURS,
  BRAND_MAP_URL,
} from '../constants/brand'

export default function Footer() {
  return (
    <footer style={{ background: 'var(--dark)', borderTop: '1px solid var(--gray)', marginTop: '60px', padding: '40px 0' }}>
      <div className="container footer-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px', fontSize: '0.9rem' }}>
        <div>
          <BrandLogo size="sm" showTagline asLink={false} />
          <p style={{ color: 'var(--mid)', lineHeight: 1.6, marginTop: '16px' }}>
            Асфальтирование в {BRAND_GEO} под ключ. {BRAND_NAME} — собственная техника, гарантия 5 лет.
          </p>
        </div>
        <div>
          <div style={{ fontWeight: 700, marginBottom: '12px', color: 'var(--accent)' }}>Разделы</div>
          <ul style={{ listStyle: 'none', color: 'var(--mid)', lineHeight: 2, padding: 0, margin: 0 }}>
            {MAIN_NAV.filter(item => item.to !== '/').map(item => (
              <li key={item.to}><Link to={item.to}>{item.label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <div style={{ fontWeight: 700, marginBottom: '12px', color: 'var(--accent)' }}>Услуги</div>
          <ul style={{ listStyle: 'none', color: 'var(--mid)', lineHeight: 2, padding: 0, margin: 0 }}>
            {USLUGI_PAGES.map(s => (
              <li key={s.href}><Link to={s.href}>{s.name}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <div style={{ fontWeight: 700, marginBottom: '12px', color: 'var(--accent)' }}>Контакты</div>
          <p style={{ color: 'var(--mid)', lineHeight: 1.9 }}>
            <a href={BRAND_PHONE_HREF}>{BRAND_PHONE}</a><br />
            <a href={`mailto:${BRAND_EMAIL}`}>{BRAND_EMAIL}</a><br />
            {BRAND_ADDRESS_LINE1}<br />
            {BRAND_METRO}<br />
            <a href={BRAND_MAP_URL} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem' }}>
              Яндекс.Карты
            </a><br />
            {BRAND_HOURS}
          </p>
        </div>
      </div>
      <div className="container" style={{ borderTop: '1px solid var(--gray)', marginTop: '32px', paddingTop: '20px', color: 'var(--mid)', fontSize: '0.8rem' }}>
        © {BRAND_YEAR} {BRAND_NAME}. Асфальтирование в {BRAND_GEO} от {BRAND_PRICE_FROM} руб/м².
      </div>
    </footer>
  )
}
