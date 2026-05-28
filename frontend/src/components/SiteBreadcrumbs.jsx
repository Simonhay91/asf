import { Link } from 'react-router-dom'

/** @param {{ items: { label: string, to?: string }[] }} props */
export default function SiteBreadcrumbs({ items, className = '' }) {
  if (!items?.length) return null
  const cls = ['site-breadcrumbs', className].filter(Boolean).join(' ')
  return (
    <nav className={cls} aria-label="Хлебные крошки">
      {items.map((item, i) => {
        const isLast = i === items.length - 1
        return (
          <span key={`${item.label}-${i}`} className="site-breadcrumbs__segment">
            {i > 0 && <span className="site-breadcrumbs__sep" aria-hidden>/</span>}
            {item.to && !isLast ? (
              <Link to={item.to} className="site-breadcrumbs__link">
                {item.label}
              </Link>
            ) : (
              <span className="site-breadcrumbs__current">{item.label}</span>
            )}
          </span>
        )
      })}
    </nav>
  )
}
