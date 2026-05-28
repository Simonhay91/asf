import SiteBreadcrumbs from './SiteBreadcrumbs'
import SiteSidebarNav from './SiteSidebarNav'

/**
 * Standard content page: breadcrumbs + main column + site navigation sidebar.
 */
export default function PageLayout({
  breadcrumbs = [],
  children,
  sidebarExtra,
  onQuoteClick,
  topPadding = '24px',
}) {
  return (
    <div
      className="container page-layout"
      style={{ padding: `${topPadding} 20px 48px`, maxWidth: '1200px' }}
    >
      {breadcrumbs.length > 0 && <SiteBreadcrumbs items={breadcrumbs} />}
      <div className="page-layout__grid">
        <div className="page-layout__main">{children}</div>
        <SiteSidebarNav onQuoteClick={onQuoteClick}>{sidebarExtra}</SiteSidebarNav>
      </div>
    </div>
  )
}
