import PageMeta from '../components/PageMeta'
import PageLayout from '../components/PageLayout'
import { ABOUT_META } from '../utils/seoMeta'
import {
  BRAND_NAME,
  BRAND_ADDRESS,
  BRAND_EMAIL,
  BRAND_MAP_URL,
  BRAND_FOUNDED,
  BRAND_INN,
  BRAND_OGRN,
  BRAND_SRO,
} from '../constants/brand'

export default function About({ onQuoteClick }) {
  return (
    <>
      <PageMeta meta={ABOUT_META} />
      <PageLayout
        onQuoteClick={onQuoteClick}
        breadcrumbs={[
          { label: 'Главная', to: '/' },
          { label: 'О компании' },
        ]}
      >
        <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '16px' }}>О компании</h1>
        <p style={{ color: 'var(--light)', lineHeight: 1.8, marginBottom: '20px' }}>
          «РусскийАсфальт» выполняет асфальтирование дворов, парковок, дорог и промышленных площадок
          в Москве и Московской области. Работаем с 2009 года, используем собственную технику и материалы.
        </p>
        <p style={{ color: 'var(--light)', lineHeight: 1.8, marginBottom: '32px' }}>
          Предоставляем гарантию 5 лет на все виды работ. Выезд замерщика бесплатно — в день обращения.
          Цены на асфальтирование от 630 руб/м² с материалом.
        </p>
        <ul style={{ color: 'var(--mid)', lineHeight: 2, marginBottom: '24px', paddingLeft: '20px' }}>
          <li>15 лет опыта на рынке Москвы и МО</li>
          <li>Собственный парк техники</li>
          <li>Гарантия 5 лет</li>
          <li>Бесплатный выезд замерщика</li>
        </ul>

        <div
          style={{
            background: 'var(--gray)',
            borderRadius: '8px',
            padding: '24px',
            marginBottom: '24px',
            border: '1px solid #2a2a2a',
          }}
        >
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '12px', color: 'var(--accent)' }}>
            Реквизиты
          </h2>
          <ul style={{ color: 'var(--light)', lineHeight: 2, margin: '0 0 12px', paddingLeft: '20px' }}>
            <li>{BRAND_NAME}</li>
            <li>На рынке с {BRAND_FOUNDED} года</li>
            {BRAND_INN && <li>ИНН: {BRAND_INN}</li>}
            {BRAND_OGRN && <li>ОГРН: {BRAND_OGRN}</li>}
            {BRAND_SRO && <li>СРО: {BRAND_SRO}</li>}
          </ul>
          {!BRAND_INN && !BRAND_OGRN && (
            <p style={{ color: 'var(--mid)', margin: 0, fontSize: '0.9rem', lineHeight: 1.6 }}>
              ИНН и ОГРН указываем в договоре. По запросу —{' '}
              <a href={`mailto:${BRAND_EMAIL}`} style={{ color: 'var(--accent)' }}>
                {BRAND_EMAIL}
              </a>
            </p>
          )}
        </div>

        <p style={{ color: 'var(--light)', lineHeight: 1.8, marginBottom: '8px' }}>
          <strong style={{ color: 'var(--accent)' }}>Адрес офиса:</strong> {BRAND_ADDRESS}
        </p>
        <p style={{ marginBottom: '32px' }}>
          <a href={BRAND_MAP_URL} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>
            Схема проезда на Яндекс.Картах →
          </a>
        </p>
        <button type="button" onClick={onQuoteClick} className="btn">
          Получить расчёт бесплатно
        </button>
      </PageLayout>
    </>
  )
}
