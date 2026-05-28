import { Link, useLocation } from 'react-router-dom'
import { MAIN_NAV, isNavActive } from '../constants/nav'

/** Sticky section nav — especially useful on mobile (header links are in burger menu). */
export default function SiteSubNav() {
  const { pathname } = useLocation()

  return (
    <nav className="site-subnav" aria-label="Разделы сайта">
      <div className="container site-subnav__inner">
        {MAIN_NAV.map(item => {
          const active = isNavActive(pathname, item)
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`site-subnav__link${active ? ' site-subnav__link--active' : ''}`}
              aria-current={active ? 'page' : undefined}
            >
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
