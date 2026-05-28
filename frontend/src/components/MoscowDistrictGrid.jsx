import { Link } from 'react-router-dom'

/** Text-only district cards (no list thumbnails — avoids duplicate Wikimedia images). */
export default function MoscowDistrictGrid({ okrug, districts, generatedSlugs }) {
  return (
    <div className="moscow-district-grid">
      {districts.map(d => {
        const isDone = generatedSlugs?.has(d.slug)
        if (isDone) {
          return (
            <Link
              key={d.slug}
              to={`/moskva/${okrug}/${d.slug}/`}
              className="moscow-district-card moscow-district-card--done"
            >
              <span className="moscow-district-card__name">{d.name}</span>
              <span className="moscow-district-card__arrow" aria-hidden>→</span>
            </Link>
          )
        }
        return (
          <span key={d.slug} className="moscow-district-card moscow-district-card--pending">
            <span className="moscow-district-card__name">{d.name}</span>
            <span className="moscow-district-card__soon">скоро</span>
          </span>
        )
      })}
    </div>
  )
}
