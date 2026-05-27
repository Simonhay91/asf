export const LOCATION_FALLBACK_IMG =
  'https://images.pexels.com/photos/1123972/pexels-photo-1123972.jpeg?auto=compress&cs=tinysrgb&w=1200'

export function slugStyle(slug) {
  let h = 0
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) | 0
  return (Math.abs(h) % 7) + 1
}

function Hero1({ title, img }) {
  return (
    <div style={{ width: '100%', height: '380px', overflow: 'hidden', position: 'relative' }}>
      <img src={img} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(10,10,10,0.78) 100%)' }} />
      <div style={{ position: 'absolute', bottom: '32px', left: 0, right: 0 }}>
        <div className="container">
          <h1 style={{ color: '#fff', fontWeight: 900, fontSize: '2.2rem', margin: 0, textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}>{title}</h1>
        </div>
      </div>
    </div>
  )
}

function Hero2({ title, img, badge = 'Асфальтирование' }) {
  return (
    <div className="hero2-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '340px', overflow: 'hidden' }}>
      <div style={{ background: 'var(--dark)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '48px 40px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--accent)', color: '#000', padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700, marginBottom: '16px', width: 'fit-content' }}>
          ⚡ {badge}
        </div>
        <h1 style={{ color: '#fff', fontWeight: 900, fontSize: '2rem', margin: '0 0 16px', lineHeight: 1.2 }}>{title}</h1>
        <p style={{ color: 'var(--mid)', margin: 0, fontSize: '0.95rem' }}>от 630 руб/м² · Гарантия 5 лет · Выезд сегодня</p>
      </div>
      <div style={{ overflow: 'hidden' }}>
        <img src={img} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
    </div>
  )
}

function Hero3({ title, img }) {
  return (
    <div style={{ position: 'relative', height: '360px', overflow: 'hidden' }}>
      <img src={img} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(10,10,10,0.9) 0%, rgba(10,10,10,0.4) 60%, transparent 100%)' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center' }}>
        <div className="container">
          <div style={{ maxWidth: '520px' }}>
            <div style={{ width: '48px', height: '4px', background: 'var(--accent)', marginBottom: '20px', borderRadius: '2px' }} />
            <h1 style={{ color: '#fff', fontWeight: 900, fontSize: '2.2rem', margin: '0 0 12px', lineHeight: 1.2 }}>{title}</h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0, fontSize: '0.95rem' }}>Профессиональное асфальтирование · от 630 руб/м²</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Hero4({ title, img }) {
  return (
    <div style={{ position: 'relative', height: '480px', overflow: 'hidden', marginBottom: '-80px' }}>
      <img src={img} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0) 30%, rgba(10,10,10,1) 100%)' }} />
      <div style={{ position: 'absolute', bottom: '100px', left: 0, right: 0 }}>
        <div className="container">
          <h1 style={{ color: '#fff', fontWeight: 900, fontSize: '2.4rem', margin: 0, textShadow: '0 2px 16px rgba(0,0,0,0.8)' }}>{title}</h1>
        </div>
      </div>
    </div>
  )
}

function Hero5({ title }) {
  return (
    <div style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #111 100%)', borderBottom: '3px solid var(--accent)', padding: '60px 0 48px' }}>
      <div className="container">
        <h1 style={{ color: '#fff', fontWeight: 900, fontSize: '2.4rem', margin: '0 0 24px', lineHeight: 1.2 }}>{title}</h1>
        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
          {[['от 630 ₽/м²', 'Цена'], ['5 лет', 'Гарантия'], ['15 лет', 'Опыт'], ['сегодня', 'Выезд']].map(([val, label]) => (
            <div key={label}>
              <div style={{ color: 'var(--accent)', fontWeight: 900, fontSize: '1.4rem' }}>{val}</div>
              <div style={{ color: 'var(--mid)', fontSize: '0.8rem' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Hero6({ title, img }) {
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ width: '100%', height: '300px', overflow: 'hidden' }}>
        <img src={img} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'brightness(0.55)' }} />
      </div>
      <div style={{ background: 'var(--accent)', padding: '16px 0' }}>
        <div className="container">
          <h1 style={{ color: '#000', fontWeight: 900, fontSize: '1.8rem', margin: 0 }}>{title}</h1>
        </div>
      </div>
    </div>
  )
}

function Hero7({ title, img }) {
  return (
    <div style={{ position: 'relative', height: '400px', overflow: 'hidden' }}>
      <img src={img} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'brightness(0.45)' }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '36px 48px', textAlign: 'center', maxWidth: '600px' }}>
          <h1 style={{ color: '#fff', fontWeight: 900, fontSize: '2rem', margin: '0 0 12px', lineHeight: 1.3 }}>{title}</h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', margin: 0, fontSize: '0.95rem' }}>от 630 руб/м² · Выезд бесплатно · Гарантия 5 лет</p>
        </div>
      </div>
    </div>
  )
}

export const LOCATION_HEROES = {
  1: Hero1,
  2: Hero2,
  3: Hero3,
  4: Hero4,
  5: Hero5,
  6: Hero6,
  7: Hero7,
}

export function LocationHero({ style, title, img, badge }) {
  const HeroComponent = LOCATION_HEROES[style] || Hero1
  if (style === 5) return <Hero5 title={title} />
  if (style === 2) return <Hero2 title={title} img={img} badge={badge} />
  return <HeroComponent title={title} img={img} />
}
