import { Link } from 'react-router-dom'
import { CITIES, REGION_ORDER } from '../constants/cities'

export default function RegionsWidget() {
  return (
    <div style={{ background: 'var(--gray)', borderRadius: '8px', padding: '20px' }}>
      <h3 style={{ fontWeight: 900, fontSize: '1.05rem', marginBottom: '16px', marginTop: 0 }}>
        Регионы
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {REGION_ORDER.map(region => {
          const cities = CITIES.filter(c => c.region === region)
          if (!cities.length) return null
          const label = region.charAt(0).toUpperCase() + region.slice(1)
          return (
            <div key={region}>
              <div style={{ fontSize: '0.75rem', color: 'var(--mid)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                {label}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {cities.slice(0, 4).map(c => (
                  <Link
                    key={c.slug}
                    to={`/podmoskovye/${c.slug}/`}
                    style={{ background: '#2a2a2a', padding: '4px 10px', borderRadius: '20px', fontSize: '0.78rem', color: 'var(--light)', textDecoration: 'none', border: '1px solid #444' }}
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
      </div>
      <Link to="/regiony/" style={{ display: 'block', marginTop: '16px', color: 'var(--accent)', fontWeight: 700, fontSize: '0.9rem' }}>
        Все города →
      </Link>
    </div>
  )
}
