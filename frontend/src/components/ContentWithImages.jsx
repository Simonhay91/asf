import ReactMarkdown from 'react-markdown'

/**
 * Splits markdown content at ## headings and inserts
 * styled inline images between sections based on page style (1-7).
 */

function InlineImage({ img, style, index }) {
  const positions = ['center top', 'center center', 'center bottom', 'left center', 'right center']
  const pos = positions[index % positions.length]

  // Style 1 — full-width horizontal banner
  if (style === 1) return (
    <div style={{ margin: '40px 0', width: '100%', height: '200px', overflow: 'hidden', borderRadius: '6px' }}>
      <img src={img} alt="" loading="lazy"
        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos, display: 'block' }} />
    </div>
  )

  // Style 2 — right-aligned square
  if (style === 2) return (
    <div style={{ margin: '32px 0', display: 'flex', justifyContent: 'flex-end' }}>
      <div style={{ width: '240px', height: '240px', overflow: 'hidden', borderRadius: '8px', flexShrink: 0 }}>
        <img src={img} alt="" loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos, display: 'block' }} />
      </div>
    </div>
  )

  // Style 3 — left-aligned portrait
  if (style === 3) return (
    <div style={{ margin: '32px 0', display: 'flex', justifyContent: 'flex-start' }}>
      <div style={{ width: '180px', height: '240px', overflow: 'hidden', borderRadius: '8px', flexShrink: 0 }}>
        <img src={img} alt="" loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos, display: 'block' }} />
      </div>
    </div>
  )

  // Style 4 — cinematic wide strip
  if (style === 4) return (
    <div style={{ margin: '40px -20px', width: 'calc(100% + 40px)', height: '240px', overflow: 'hidden' }}>
      <img src={img} alt="" loading="lazy"
        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos, display: 'block' }} />
    </div>
  )

  // Style 5 — centered card, rounded
  if (style === 5) return (
    <div style={{ margin: '40px auto', width: '72%', height: '220px', overflow: 'hidden', borderRadius: '12px', border: '1px solid #2a2a2a' }}>
      <img src={img} alt="" loading="lazy"
        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos, display: 'block' }} />
    </div>
  )

  // Style 6 — full-width grayscale strip
  if (style === 6) return (
    <div style={{ margin: '40px -20px', width: 'calc(100% + 40px)', height: '180px', overflow: 'hidden' }}>
      <img src={img} alt="" loading="lazy"
        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos, display: 'block', filter: 'grayscale(100%) brightness(0.7)' }} />
    </div>
  )

  // Style 7 — image with accent overlay text
  if (style === 7) return (
    <div style={{ margin: '40px 0', position: 'relative', height: '220px', overflow: 'hidden', borderRadius: '10px' }}>
      <img src={img} alt="" loading="lazy"
        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos, display: 'block', filter: 'brightness(0.45)' }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '16px 28px' }}>
          <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '0.9rem' }}>РусскийАсфальт · Только Москва и МО</span>
        </div>
      </div>
    </div>
  )

  return null
}

export default function ContentWithImages({ content, img, style = 1 }) {
  if (!img || !content) {
    return <div className="prose"><ReactMarkdown>{content || ''}</ReactMarkdown></div>
  }

  // Split at ## headings, keeping the heading with its section
  const raw = content.split(/(?=\n## )/)
  const sections = raw.filter(s => s.trim())

  // Insert image after every 2nd section (skip first intro and last)
  const elements = []
  let imgIndex = 0

  sections.forEach((section, i) => {
    elements.push(
      <div key={`s-${i}`} className="prose">
        <ReactMarkdown>{section}</ReactMarkdown>
      </div>
    )
    // Insert image after sections 1, 3, 5... (0-indexed: after index 1, 3, 5)
    // Skip first section (intro) and last section
    if (i > 0 && i % 2 === 1 && i < sections.length - 1) {
      elements.push(
        <InlineImage key={`img-${i}`} img={img} style={style} index={imgIndex} />
      )
      imgIndex++
    }
  })

  return <>{elements}</>
}
