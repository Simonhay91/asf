import { REVIEWS } from '../constants/reviews'
import { BRAND_WARRANTY, BRAND_EXPERIENCE } from '../constants/brand'

function Stars({ rating }) {
  return (
    <span className="price-reviews__stars" aria-label={`Оценка ${rating}`}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ color: rating >= i - 0.25 ? 'var(--accent)' : '#333' }}>★</span>
      ))}
    </span>
  )
}

export default function PriceReviewsStrip() {
  const items = REVIEWS.slice(0, 3)

  return (
    <section className="price-reviews">
      <div className="price-reviews__badges">
        <span className="price-reviews__badge">Гарантия {BRAND_WARRANTY}</span>
        <span className="price-reviews__badge">Опыт {BRAND_EXPERIENCE}</span>
        <span className="price-reviews__badge">500+ объектов</span>
      </div>
      <div className="price-reviews__grid">
        {items.map(r => (
          <blockquote key={r.name} className="price-reviews__card">
            <Stars rating={r.stars} />
            <p>«{r.text}»</p>
            <footer>— {r.name}</footer>
          </blockquote>
        ))}
      </div>
    </section>
  )
}
