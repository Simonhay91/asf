import PageMeta from '../components/PageMeta'
import PageLayout from '../components/PageLayout'
import { KONTAKTY_META } from '../utils/seoMeta'
import {
  BRAND_PHONE,
  BRAND_PHONE_HREF,
  BRAND_EMAIL,
  BRAND_ADDRESS,
  BRAND_MAP_URL,
  BRAND_MAP_QUERY,
  BRAND_HOURS,
} from '../constants/brand'

export default function Kontakty({ onQuoteClick }) {
  return (
    <>
      <PageMeta meta={KONTAKTY_META} />
      <PageLayout
        onQuoteClick={onQuoteClick}
        breadcrumbs={[
          { label: 'Главная', to: '/' },
          { label: 'Контакты' },
        ]}
      >
        <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '16px' }}>Контакты</h1>
        <p style={{ color: 'var(--mid)', lineHeight: 1.7, marginBottom: '32px' }}>
          Свяжитесь с нами для расчёта стоимости асфальтирования в Москве и Московской области.
          Выезд замерщика бесплатно, работаем без выходных.
        </p>
        <div style={{ display: 'grid', gap: '20px', marginBottom: '36px' }}>
          <div style={{ background: 'var(--gray)', borderRadius: '8px', padding: '24px' }}>
            <div style={{ fontWeight: 700, marginBottom: '8px', color: 'var(--accent)' }}>Адрес</div>
            <p style={{ margin: '0 0 12px', color: 'var(--light)', lineHeight: 1.6 }}>{BRAND_ADDRESS}</p>
            <a href={BRAND_MAP_URL} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>
              Открыть на Яндекс.Картах →
            </a>
          </div>
          <div style={{ background: 'var(--gray)', borderRadius: '8px', padding: '24px' }}>
            <div style={{ fontWeight: 700, marginBottom: '8px', color: 'var(--accent)' }}>Телефон</div>
            <a href={BRAND_PHONE_HREF} style={{ fontSize: '1.25rem', fontWeight: 700 }}>{BRAND_PHONE}</a>
          </div>
          <div style={{ background: 'var(--gray)', borderRadius: '8px', padding: '24px' }}>
            <div style={{ fontWeight: 700, marginBottom: '8px', color: 'var(--accent)' }}>Email</div>
            <a href={`mailto:${BRAND_EMAIL}`}>{BRAND_EMAIL}</a>
          </div>
          <div style={{ background: 'var(--gray)', borderRadius: '8px', padding: '24px' }}>
            <div style={{ fontWeight: 700, marginBottom: '8px', color: 'var(--accent)' }}>Режим работы</div>
            <p style={{ margin: 0, color: 'var(--light)' }}>{BRAND_HOURS}</p>
          </div>
        </div>
        <div
          style={{
            borderRadius: '8px',
            overflow: 'hidden',
            marginBottom: '36px',
            border: '1px solid var(--gray)',
            height: '320px',
          }}
        >
          <iframe
            title="Офис на карте"
            src={`https://yandex.ru/map-widget/v1/?text=${encodeURIComponent(BRAND_MAP_QUERY)}&z=16&lang=ru_RU`}
            width="100%"
            height="100%"
            style={{ border: 0, display: 'block' }}
            loading="lazy"
          />
        </div>
        <button type="button" onClick={onQuoteClick} className="btn">
          Получить расчёт бесплатно
        </button>
      </PageLayout>
    </>
  )
}
