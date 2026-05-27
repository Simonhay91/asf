import { WHY_PRICE_INTRO, WHY_PRICE_POINTS, WHY_PRICE_COMPARE } from '../constants/brand'

export default function WhyPriceBlock({ compact = false }) {
  const points = compact ? WHY_PRICE_POINTS.slice(0, 3) : WHY_PRICE_POINTS

  return (
    <section className="why-price-block">
      <h2 className="why-price-block__title">Почему от 630 ₽/м², а не «от 350»?</h2>
      <p className="why-price-block__intro">{WHY_PRICE_INTRO}</p>
      <ul className="why-price-block__list">
        {points.map(p => (
          <li key={p.title} className="why-price-block__item">
            <strong>{p.title}</strong>
            <span>{p.desc}</span>
          </li>
        ))}
      </ul>
      <p className="why-price-block__compare">{WHY_PRICE_COMPARE}</p>
    </section>
  )
}
