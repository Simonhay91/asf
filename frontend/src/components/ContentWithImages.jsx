import ReactMarkdown from 'react-markdown'

/**
 * Splits markdown content at ## headings and inserts
 * styled inline images between sections based on page style (1-7).
 */

function InlineImage({ img }) {
  return (
    <div style={{ margin: '40px 0', width: '100%', height: '220px', overflow: 'hidden', borderRadius: '8px' }}>
      <img src={img} alt="" loading="lazy"
        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }} />
    </div>
  )
}

export default function ContentWithImages({ content, img, imageUrls = [], style = 1 }) {
  // Only show section images when we have 2+ unique images (avoid repeating the same one)
  const pool = imageUrls.length >= 2 ? imageUrls : []

  if (!pool.length || !content) {
    return <div className="prose"><ReactMarkdown>{content || ''}</ReactMarkdown></div>
  }

  // Split at ## headings, keeping the heading with its section
  const sections = content.split(/(?=\n## )/).filter(s => s.trim())

  // Insert image after every 2nd section (skip first intro and last)
  const elements = []
  let imgIndex = 0

  sections.forEach((section, i) => {
    elements.push(
      <div key={`s-${i}`} className="prose">
        <ReactMarkdown>{section}</ReactMarkdown>
      </div>
    )
    if (i > 0 && i % 2 === 1 && i < sections.length - 1) {
      // Cycle through the pool so we never run out
      const src = pool[imgIndex % pool.length]
      elements.push(
        <InlineImage key={`img-${i}`} img={src} />
      )
      imgIndex++
    }
  })

  return <>{elements}</>
}
