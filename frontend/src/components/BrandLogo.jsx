import { Link } from 'react-router-dom'
import { BRAND_NAME, BRAND_TAGLINE } from '../constants/brand'

const SIZES = {
  sm: { mark: 28, name: '1rem', tagline: '0.72rem', gap: 8 },
  md: { mark: 36, name: '1.35rem', tagline: '0.78rem', gap: 10 },
  lg: { mark: 44, name: '1.6rem', tagline: '0.82rem', gap: 12 },
}

function Mark({ size }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      aria-hidden="true"
      style={{ flexShrink: 0, display: 'block' }}
    >
      <rect width="120" height="120" rx="22" fill="#0a0a0a" />
      <path d="M18 88 L102 32" stroke="#2a2a2a" strokeWidth="34" strokeLinecap="round" />
      <path d="M18 88 L102 32" stroke="#1a1a1a" strokeWidth="22" strokeLinecap="round" />
      <path
        d="M52 88 L68 32"
        stroke="#f5a623"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray="0 14"
        strokeDashoffset="7"
      />
      <text
        x="60"
        y="78"
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="44"
        fontWeight="900"
        fill="#f5a623"
      >
        А
      </text>
    </svg>
  )
}

export default function BrandLogo({ size = 'md', showTagline = false, asLink = true, className = '' }) {
  const s = SIZES[size] || SIZES.md
  const accentIdx = BRAND_NAME.indexOf('Асфальт')
  const part1 = accentIdx > 0 ? BRAND_NAME.slice(0, accentIdx) : BRAND_NAME
  const part2 = accentIdx > 0 ? BRAND_NAME.slice(accentIdx) : ''

  const inner = (
    <div
      className={`brand-logo ${className}`.trim()}
      style={{ display: 'flex', alignItems: 'center', gap: s.gap, textDecoration: 'none' }}
    >
      <Mark size={s.mark} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: showTagline ? 2 : 0, minWidth: 0 }}>
        <div
          style={{
            fontSize: s.name,
            fontWeight: 900,
            color: 'var(--white)',
            letterSpacing: '-0.5px',
            lineHeight: 1.1,
            whiteSpace: 'nowrap',
          }}
        >
          {part2 ? (
            <>
              {part1}
              <span style={{ color: 'var(--accent)' }}>{part2}</span>
            </>
          ) : (
            BRAND_NAME
          )}
        </div>
        {showTagline && (
          <div
            style={{
              fontSize: s.tagline,
              color: 'var(--mid)',
              fontWeight: 600,
              letterSpacing: '0.02em',
              lineHeight: 1.3,
            }}
          >
            {BRAND_TAGLINE}
          </div>
        )}
      </div>
    </div>
  )

  if (asLink) {
    return (
      <Link to="/" style={{ textDecoration: 'none', flexShrink: 0 }} aria-label={BRAND_NAME}>
        {inner}
      </Link>
    )
  }
  return inner
}
