import { Link, useLocation } from 'react-router-dom'
import { MAIN_NAV, isNavActive } from '../constants/nav'
import { BRAND_PHONE, BRAND_PHONE_HREF } from '../constants/brand'

export default function SiteSidebarNav({ onQuoteClick, children }) {
  const { pathname } = useLocation()

  return (
    <aside className="site-sidebar">
      <div className="site-sidebar__sticky">
        <nav className="site-sidebar__nav" aria-label="Навигация по сайту">
          <div className="site-sidebar__title">Разделы</div>
          {MAIN_NAV.map(item => {
            const active = isNavActive(pathname, item)
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`site-sidebar__link${active ? ' site-sidebar__link--active' : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {children}

        <div className="site-sidebar__cta">
          <p className="site-sidebar__cta-title">Бесплатный замер</p>
          <p className="site-sidebar__cta-text">Выезд в день обращения по Москве и МО</p>
          <button type="button" className="btn site-sidebar__cta-btn" onClick={onQuoteClick}>
            Получить расчёт
          </button>
          <a href={BRAND_PHONE_HREF} className="site-sidebar__phone">
            {BRAND_PHONE}
          </a>
        </div>
      </div>
    </aside>
  )
}
