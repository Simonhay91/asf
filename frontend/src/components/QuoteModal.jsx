import { useState, useEffect } from 'react'

export default function QuoteModal({ isOpen, onClose, sourceUrl = '' }) {
  const [form, setForm] = useState({ name: '', phone: '', comment: '' })
  const [status, setStatus] = useState('idle') // idle | loading | success | error

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      setStatus('idle')
      setForm({ name: '', phone: '', comment: '' })
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, source_url: sourceUrl }),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--gray)', border: '1px solid #333', borderRadius: '12px',
          padding: '36px', width: '100%', maxWidth: '480px', position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--mid)', fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1 }}
        >
          ×
        </button>

        {status === 'success' ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✅</div>
            <h3 style={{ color: 'var(--white)', fontSize: '1.3rem', marginBottom: '10px' }}>Заявка отправлена!</h3>
            <p style={{ color: 'var(--mid)' }}>Мы свяжемся с вами в течение 15 минут.</p>
            <button onClick={onClose} className="btn" style={{ marginTop: '24px' }}>Закрыть</button>
          </div>
        ) : (
          <>
            <div style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px' }}>
              Бесплатный расчёт
            </div>
            <h2 style={{ color: 'var(--white)', fontSize: '1.4rem', fontWeight: 900, marginBottom: '8px' }}>
              Получить расчёт стоимости
            </h2>
            <p style={{ color: 'var(--mid)', fontSize: '0.9rem', marginBottom: '24px' }}>
              Замерщик выедет в день обращения. Расчёт — бесплатно.
            </p>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', color: 'var(--mid)', fontSize: '0.85rem', marginBottom: '6px' }}>
                  Ваше имя
                </label>
                <input
                  type="text"
                  placeholder="Иван"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', color: 'var(--mid)', fontSize: '0.85rem', marginBottom: '6px' }}>
                  Телефон *
                </label>
                <input
                  type="tel"
                  placeholder="+7 (___) ___-__-__"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  required
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', color: 'var(--mid)', fontSize: '0.85rem', marginBottom: '6px' }}>
                  Комментарий (необязательно)
                </label>
                <textarea
                  placeholder="Площадь участка, тип объекта..."
                  value={form.comment}
                  onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }}
                />
              </div>

              {status === 'error' && (
                <div style={{ color: '#f87171', fontSize: '0.85rem', marginBottom: '16px' }}>
                  Ошибка отправки. Позвоните нам: <a href="tel:+79096282800" style={{ color: 'var(--accent)' }}>+7 909 628 28 00</a>
                </div>
              )}

              <button
                type="submit"
                className="btn"
                disabled={status === 'loading'}
                style={{ width: '100%', fontSize: '1rem', padding: '14px' }}
              >
                {status === 'loading' ? 'Отправляем...' : 'Отправить заявку'}
              </button>

              <p style={{ color: 'var(--mid)', fontSize: '0.75rem', marginTop: '12px', textAlign: 'center' }}>
                Нажимая кнопку, вы соглашаетесь на обработку персональных данных
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%',
  background: '#1a1a1a',
  border: '1px solid #333',
  borderRadius: '6px',
  padding: '10px 14px',
  color: 'var(--white)',
  fontSize: '0.95rem',
  outline: 'none',
  boxSizing: 'border-box',
}
