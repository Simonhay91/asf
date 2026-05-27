import { useState } from 'react'
import { BRAND_PHONE, BRAND_PHONE_HREF } from '../constants/brand'

export default function PriceInlineQuote({ sourceUrl = '/prajs-list/' }) {
  const [phone, setPhone] = useState('')
  const [status, setStatus] = useState('idle')

  const handleSubmit = async e => {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: '', phone, comment: 'Заявка с прайс-листа (быстрая форма)', source_url: sourceUrl }),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
      setPhone('')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="price-inline-quote price-inline-quote--success">
        <div className="price-inline-quote__icon">✅</div>
        <h3 className="price-inline-quote__title">Заявка принята</h3>
        <p className="price-inline-quote__text">Перезвоним в течение 15 минут в рабочее время.</p>
      </div>
    )
  }

  return (
    <div className="price-inline-quote">
      <h2 className="price-inline-quote__title">Быстрая заявка</h2>
      <p className="price-inline-quote__text">Оставьте телефон — перезвоним и назовём точную цену</p>
      <form onSubmit={handleSubmit} className="price-inline-quote__form">
        <input
          type="tel"
          required
          placeholder="+7 (___) ___-__-__"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          className="price-inline-quote__input"
          autoComplete="tel"
        />
        <button type="submit" className="btn price-inline-quote__submit" disabled={status === 'loading'}>
          {status === 'loading' ? 'Отправляем…' : 'Перезвоните мне'}
        </button>
      </form>
      {status === 'error' && (
        <p className="price-inline-quote__error">
          Ошибка отправки. Позвоните: <a href={BRAND_PHONE_HREF}>{BRAND_PHONE}</a>
        </p>
      )}
      <p className="price-inline-quote__or">
        или <a href={BRAND_PHONE_HREF} className="price-inline-quote__call">{BRAND_PHONE}</a>
      </p>
    </div>
  )
}
