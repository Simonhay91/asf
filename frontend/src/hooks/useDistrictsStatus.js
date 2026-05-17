import { useState, useEffect } from 'react'

let _cache = null
let _promise = null

export function useDistrictsStatus() {
  const [done, setDone] = useState(_cache ? new Set(_cache) : null)

  useEffect(() => {
    if (_cache) { setDone(new Set(_cache)); return }
    if (!_promise) {
      _promise = fetch('/api/districts?status=done&limit=200')
        .then(r => r.ok ? r.json() : { items: [] })
        .then(d => { _cache = (d.items || []).map(c => c.slug); return _cache })
        .catch(() => { _promise = null; return [] })
    }
    _promise.then(slugs => setDone(new Set(slugs)))
  }, [])

  return done
}
