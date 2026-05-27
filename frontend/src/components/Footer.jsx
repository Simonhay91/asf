import { Link } from 'react-router-dom'
import BrandLogo from './BrandLogo'
import {
  BRAND_NAME,
  BRAND_GEO,
  BRAND_PRICE_FROM,
  BRAND_YEAR,
  BRAND_PHONE,
  BRAND_PHONE_HREF,
  BRAND_EMAIL,
} from '../constants/brand'

export default function Footer() {
  return (
    <footer style={{ background: 'var(--dark)', borderTop: '1px solid var(--gray)', marginTop: '60px', padding: '40px 0' }}>
      <div className="container footer-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '32px', fontSize: '0.9rem' }}>
        <div>
          <BrandLogo size="sm" showTagline asLink={false} />
          <p style={{ color: 'var(--mid)', lineHeight: 1.6, marginTop: '16px' }}>
            Асфальтирование в {BRAND_GEO} под ключ. {BRAND_NAME} — собственная техника, гарантия 5 лет.
          </p>
        </div>
        <div>
          <div style={{ fontWeight: 700, marginBottom: '12px', color: 'var(--accent)' }}>Услуги</div>
          <ul style={{ listStyle: 'none', color: 'var(--mid)', lineHeight: 2 }}>
            <li><Link to="/uslugi/asfaltirovanie-dvorov/">Асфальтирование дворов</Link></li>
            <li><Link to="/uslugi/asfaltirovanie-parkovok/">Асфальтирование парковок</Link></li>
            <li><Link to="/uslugi/yamochnyj-remont/">Ямочный ремонт</Link></li>
            <li><Link to="/uslugi/asfaltovaya-kroshka/">Асфальтовая крошка</Link></li>
          </ul>
          <div style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            <Link to="/moskva/" style={{ color: 'var(--mid)', fontSize: '0.85rem' }}>Москва →</Link>
            <Link to="/regiony/" style={{ color: 'var(--mid)', fontSize: '0.85rem' }}>Подмосковье →</Link>
          </div>
        </div>
        <div>
          <div style={{ fontWeight: 700, marginBottom: '12px', color: 'var(--accent)' }}>Контакты</div>
          <p style={{ color: 'var(--mid)', lineHeight: 2 }}>
            <a href={BRAND_PHONE_HREF}>{BRAND_PHONE}</a><br />
            <a href={`mailto:${BRAND_EMAIL}`}>{BRAND_EMAIL}</a><br />
            Пн–Вс: 08:00–20:00
          </p>
        </div>
      </div>
      <div className="container" style={{ borderTop: '1px solid var(--gray)', marginTop: '32px', paddingTop: '20px', color: 'var(--mid)', fontSize: '0.8rem' }}>
        © {BRAND_YEAR} {BRAND_NAME}. Асфальтирование в {BRAND_GEO} от {BRAND_PRICE_FROM} руб/м².
      </div>
    </footer>
  )
}
