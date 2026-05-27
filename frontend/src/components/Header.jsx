import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import BrandLogo from './BrandLogo'

export default function Header({ onQuoteClick }) {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(() => { setOpen(false) }, [location])

  return (
    <header style={{ background: 'var(--dark)', borderBottom: '2px solid var(--accent)', position: 'sticky', top: 0, zIndex: 200 }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px' }}>
        <BrandLogo size="md" />

        {/* Desktop nav */}
        <nav className="header-nav-desktop" style={{ display: 'flex', gap: '24px', alignItems: 'center', fontSize: '0.9rem' }}>
          <Link to="/" style={{ color: 'var(--light)' }}>Главная</Link>
          <Link to="/uslugi/" style={{ color: 'var(--light)' }}>Услуги</Link>
          <Link to="/prajs-list/" style={{ color: 'var(--light)' }}>Прайс-лист</Link>
          <Link to="/moskva/" style={{ color: 'var(--light)' }}>Москва</Link>
          <Link to="/regiony/" style={{ color: 'var(--light)' }}>Подмосковье</Link>
          <Link to="/blog/" style={{ color: 'var(--light)' }}>Блог</Link>
          <a
            href="https://t.me/asf_prj_bot"
            target="_blank"
            rel="noopener noreferrer"
            title="Написать в Telegram"
            style={{ color: 'var(--light)', display: 'flex', alignItems: 'center' }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.16 14.47l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.988.089z"/>
            </svg>
          </a>
          <button onClick={onQuoteClick} className="btn" style={{ padding: '8px 18px', fontSize: '0.9rem' }}>
            Получить расчёт
          </button>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="header-burger"
          onClick={() => setOpen(o => !o)}
          aria-label="Меню"
          style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: 'var(--white)' }}
        >
          {open ? (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          ) : (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/></svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div style={{ background: 'var(--dark)', borderTop: '1px solid #333', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {[
            { to: '/', label: 'Главная' },
            { to: '/uslugi/', label: 'Услуги' },
            { to: '/prajs-list/', label: 'Прайс-лист' },
            { to: '/moskva/', label: 'Москва' },
            { to: '/regiony/', label: 'Подмосковье' },
            { to: '/blog/', label: 'Блог' },
          ].map(item => (
            <Link
              key={item.to}
              to={item.to}
              style={{ color: 'var(--light)', padding: '12px 0', borderBottom: '1px solid #2a2a2a', fontSize: '1.05rem', fontWeight: 600 }}
            >
              {item.label}
            </Link>
          ))}
          <button
            onClick={() => { setOpen(false); onQuoteClick?.() }}
            className="btn"
            style={{ marginTop: '12px', width: '100%', padding: '14px', fontSize: '1rem' }}
          >
            Получить расчёт
          </button>
        </div>
      )}
    </header>
  )
}
