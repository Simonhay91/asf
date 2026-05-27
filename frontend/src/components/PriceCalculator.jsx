import { useState } from 'react'
import { CALC_TYPES } from '../constants/calculator'

export default function PriceCalculator({ onQuoteClick, className = '' }) {
  const [type, setType] = useState(0)
  const [area, setArea] = useState('')

  const selected = CALC_TYPES[type]
  const price = selected.price
  const parsedArea = parseFloat(area)
  const total = parsedArea > 0 ? Math.round(parsedArea * price) : null

  const handleQuote = () => {
    const parts = []
    if (parsedArea > 0) {
      parts.push(`Площадь: ${area} м², ${selected.label}`)
      if (total) parts.push(`ориентир ~${total.toLocaleString('ru-RU')} ₽`)
    }
    onQuoteClick?.(parts.length ? parts.join(', ') : '')
  }

  return (
    <div className={`price-calculator ${className}`.trim()}>
      <h2 className="price-calculator__title">Калькулятор стоимости</h2>
      <p className="price-calculator__sub">Примерный расчёт за 30 секунд — точная цена после бесплатного замера</p>

      <div className="price-calculator__field">
        <label className="price-calculator__label">Вид работ</label>
        <select
          value={type}
          onChange={e => setType(Number(e.target.value))}
          className="price-calculator__input"
        >
          {CALC_TYPES.map((t, i) => (
            <option key={i} value={i}>
              {t.label} — от {t.price} ₽/м²
            </option>
          ))}
        </select>
      </div>

      <div className="price-calculator__field">
        <label className="price-calculator__label">Площадь (м²)</label>
        <input
          type="number"
          min="1"
          placeholder="Например: 200"
          value={area}
          onChange={e => setArea(e.target.value)}
          className="price-calculator__input"
        />
      </div>

      {total ? (
        <div className="price-calculator__result">
          <div className="price-calculator__result-label">Примерная стоимость</div>
          <div className="price-calculator__result-value">{total.toLocaleString('ru-RU')} ₽</div>
          <div className="price-calculator__result-hint">
            {area} м² × {price} ₽/м² (без учёта основания и выезда)
          </div>
        </div>
      ) : (
        <div className="price-calculator__placeholder">Введите площадь, чтобы увидеть расчёт</div>
      )}

      <button type="button" className="btn price-calculator__cta" onClick={handleQuote}>
        Получить точный расчёт бесплатно →
      </button>
    </div>
  )
}
