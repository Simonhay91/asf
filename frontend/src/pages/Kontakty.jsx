import { Link } from 'react-router-dom'
import PageMeta from '../components/PageMeta'
import { KONTAKTY_META } from '../utils/seoMeta'

export default function Kontakty({ onQuoteClick }) {
  return (
    <>
      <PageMeta meta={KONTAKTY_META} />
      <div className="container" style={{ padding: '48px 20px 64px', maxWidth: '800px' }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--mid)', marginBottom: '24px' }}>
          <Link to="/" style={{ color: 'var(--mid)' }}>Главная</Link>
          {' / '}
          <span>Контакты</span>
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '16px' }}>Контакты</h1>
        <p style={{ color: 'var(--mid)', lineHeight: 1.7, marginBottom: '32px' }}>
          Свяжитесь с нами для расчёта стоимости асфальтирования в Москве и Московской области.
          Выезд замерщика бесплатно, работаем без выходных.
        </p>
        <div style={{ display: 'grid', gap: '20px', marginBottom: '36px' }}>
          <div style={{ background: 'var(--gray)', borderRadius: '8px', padding: '24px' }}>
            <div style={{ fontWeight: 700, marginBottom: '8px', color: 'var(--accent)' }}>Телефон</div>
            <a href="tel:+79096282800" style={{ fontSize: '1.25rem', fontWeight: 700 }}>+7 909 628 28 00</a>
          </div>
          <div style={{ background: 'var(--gray)', borderRadius: '8px', padding: '24px' }}>
            <div style={{ fontWeight: 700, marginBottom: '8px', color: 'var(--accent)' }}>Email</div>
            <a href="mailto:info@russkiyasphalt.ru">info@russkiyasphalt.ru</a>
          </div>
          <div style={{ background: 'var(--gray)', borderRadius: '8px', padding: '24px' }}>
            <div style={{ fontWeight: 700, marginBottom: '8px', color: 'var(--accent)' }}>Режим работы</div>
            <p style={{ margin: 0, color: 'var(--light)' }}>Понедельник — воскресенье: 08:00–20:00</p>
          </div>
        </div>
        <button type="button" onClick={onQuoteClick} className="btn">
          Получить расчёт бесплатно
        </button>
      </div>
    </>
  )
}
