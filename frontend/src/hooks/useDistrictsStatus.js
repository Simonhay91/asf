import { useState, useEffect } from 'react'

let _cache = null
let _promise = null

/** @returns {{ done: Set<string>|null, images: Record<string, string> }} */
export function useDistrictsStatus() {
  const [state, setState] = useState(() =>
    _cache ? { done: new Set(_cache.slugs), images: { ..._cache.images } } : { done: null, images: {} },
  )

  useEffect(() => {
    if (_cache) {
      setState({ done: new Set(_cache.slugs), images: { ..._cache.images } })
      return
    }
    if (!_promise) {
      _promise = fetch('/api/districts?status=done&limit=200')
        .then(r => (r.ok ? r.json() : { items: [] }))
        .then(d => {
          const items = d.items || []
          const slugs = items.map(c => c.slug)
          const images = {}
          items.forEach(c => {
            if (c.image_url) images[c.slug] = c.image_url
          })
          _cache = { slugs, images }
          return _cache
        })
        .catch(() => {
          _promise = null
          return { slugs: [], images: {} }
        })
    }
    _promise.then(({ slugs, images }) => {
      setState({ done: new Set(slugs), images: { ...images } })
    })
  }, [])

  return state
}
