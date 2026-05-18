import { Navigate, useLocation } from 'react-router-dom'

/** 301-equivalent client redirect to the same path with a trailing slash. */
export default function TrailingSlashRedirect() {
  const { pathname, search, hash } = useLocation()
  const target = pathname.endsWith('/') ? pathname : `${pathname}/`
  return <Navigate to={`${target}${search}${hash}`} replace />
}
