import { Link } from 'react-router-dom'
import PageMeta from '../components/PageMeta'

const SECTIONS = [
  {
    title: 'Асфальтирование',
    rows: [
      { name: 'Асфальтирование под ключ',                          unit: 'м²',    min: 630,  max: 800  },
      { name: 'Асфальтирование дворов',                            unit: 'м²',    min: 630,  max: 730  },
      { name: 'Асфальтирование парковок',                          unit: 'м²',    min: 630,  max: 730  },
      { name: 'Асфальтирование стоянок',                           unit: 'м²',    min: 630,  max: 730  },
      { name: 'Асфальтирование дорог и улиц',                      unit: 'м²',    min: 630,  max: 730  },
      { name: 'Асфальтирование придомовой территории',             unit: 'м²',    min: 630,  max: 730  },
      { name: 'Асфальтирование площадок',                          unit: 'м²',    min: 630,  max: 800  },
      { name: 'Асфальтирование дорожек и тротуаров',               unit: 'м²',    min: 630,  max: 730  },
      { name: 'Асфальтирование частного дома и участка',           unit: 'м²',    min: 630,  max: 730  },
      { name: 'Асфальтирование дачного участка',                   unit: 'м²',    min: 630,  max: 730  },
      { name: 'Асфальтирование СНТ',                               unit: 'м²',    min: 630,  max: 800  },
      { name: 'Асфальтирование территорий предприятий',            unit: 'м²',    min: 630,  max: 800  },
      { name: 'Асфальтирование малых площадей (до 100 м²)',        unit: 'м²',    min: 730,  max: 900  },
      { name: 'Укладка асфальтовой крошки',                        unit: 'м²',    min: 350,  max: 500  },
    ],
  },
  {
    title: 'Ремонт асфальта',
    rows: [
      { name: 'Ямочный ремонт асфальта',              unit: 'м²',    min: 1200, max: 2500 },
      { name: 'Ремонт трещин в асфальте',             unit: 'п.м.',  min: 300,  max: 800  },
      { name: 'Ремонт и замена асфальта',             unit: 'м²',    min: 800,  max: 1500 },
      { name: 'Резка асфальта (алмазная)',             unit: 'п.м.',  min: 250,  max: 500  },
      { name: 'Демонтаж асфальтового покрытия',       unit: 'м²',    min: 150,  max: 300  },
    ],
  },
  {
    title: 'Строительство дорог',
    rows: [
      { name: 'Строительство дорог с нуля',           unit: 'м²',    min: 900,  max: 1500 },
      { name: 'Строительство временных дорог',        unit: 'м²',    min: 500,  max: 900  },
      { name: 'Строительство дорог в СНТ',            unit: 'м²',    min: 700,  max: 1200 },
      { name: 'Строительство дачных дорог',           unit: 'м²',    min: 630,  max: 1000 },
      { name: 'Строительство грунтовых дорог',        unit: 'м²',    min: 300,  max: 600  },
      { name: 'Дорожные работы под ключ',             unit: 'м²',    min: 900,  max: 1800 },
    ],
  },
  {
    title: 'Благоустройство и отделка',
    rows: [
      { name: 'Укладка тротуарной плитки',            unit: 'м²',    min: 850,  max: 1400 },
      { name: 'Укладка брусчатки',                    unit: 'м²',    min: 900,  max: 1600 },
      { name: 'Установка бордюров и поребриков',      unit: 'п.м.',  min: 350,  max: 600  },
      { name: 'Установка лежачих полицейских',        unit: 'шт.',   min: 4500, max: 9000 },
      { name: 'Нанесение дорожной разметки',          unit: 'п.м.',  min: 80,   max: 200  },
      { name: 'Озеленение и благоустройство',         unit: 'м²',    min: 400,  max: 900  },
    ],
  },
  {
    title: 'Земляные и вспомогательные работы',
    rows: [
      { name: 'Земляные работы (срезка, планировка)', unit: 'м²',    min: 100,  max: 250  },
      { name: 'Вывоз строительного мусора',           unit: 'т',     min: 1500, max: 3000 },
      { name: 'Уборка снега и содержание дорог',      unit: 'м²',    min: 30,   max: 80   },
      { name: 'Выезд замерщика',                      unit: 'выезд', min: 0,    max: 0    },
    ],
  },
]

const META = {
  title: 'Прайс-лист на асфальтирование в Москве 2026 | от 630 ₽/м² | РусскийАсфальт',
  description: 'Прайс на асфальтирование в Москве: дворы и парковки от 630 ₽/м², ямочный ремонт от 1 200 ₽/м², крошка от 350 ₽/м². Цены с материалом. Замер бесплатно.',
  canonical: 'https://russkiyasphalt.ru/prajs-list/',
  'og:title': 'Прайс-лист на асфальтирование | от 630 ₽/м² | РусскийАсфальт',
  'og:type': 'website',
}

function formatPrice(min, max) {
  if (min === 0 && max === 0) return <span style={{ color: 'var(--accent)', fontWeight: 800 }}>Бесплатно</span>
  if (min === max) return `от ${min.toLocaleString('ru')} ₽`
  return `${min.toLocaleString('ru')} – ${max.toLocaleString('ru')} ₽`
}

export default function PriceList({ onQuoteClick }) {
  return (
    <>
      <PageMeta meta={META} jsonld={[]} />

      {/* Hero */}
      <div style={{ background: 'var(--dark)', borderBottom: '1px solid #2a2a2a', padding: '56px 20px 48px' }}>
        <div className="container">
          <div style={{ fontSize: '0.8rem', color: 'var(--mid)', marginBottom: '12px' }}>
            <Link to="/" style={{ color: 'var(--mid)' }}>Главная</Link>
            {' / '}
            <span style={{ color: 'var(--white)' }}>Прайс-лист</span>
          </div>
          <h1 style={{ fontWeight: 900, fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', marginBottom: '12px' }}>
            Прайс-лист на асфальтирование и дорожные работы
          </h1>
          <p style={{ color: 'var(--mid)', fontSize: '1rem', maxWidth: '640px', marginBottom: '28px' }}>
            Обратившись к нам, вы получите высококачественные сертифицированные материалы и долговечную работу.
            Цены актуальны для Москвы и Московской области, 2026 год.
          </p>
          <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
            {[
              { v: 'от 350 ₽/м²', l: 'минимальная цена' },
              { v: 'Бесплатно',   l: 'выезд и замер' },
              { v: '5 лет',       l: 'гарантия' },
              { v: '1 день',      l: 'выезд замерщика' },
            ].map(w => (
              <div key={w.v}>
                <div style={{ fontWeight: 900, fontSize: '1.4rem', color: 'var(--accent)' }}>{w.v}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--mid)' }}>{w.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '56px 20px' }}>

        {/* Price sections */}
        {SECTIONS.map(section => (
          <div key={section.title} style={{ marginBottom: '48px' }}>
            <h2 style={{ fontWeight: 800, fontSize: '1.25rem', marginBottom: '16px', paddingBottom: '10px', borderBottom: '2px solid var(--accent)', display: 'inline-block' }}>
              {section.title}
            </h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.93rem' }}>
                <thead>
                  <tr style={{ background: 'var(--gray)' }}>
                    <th style={TH}>Наименование работ</th>
                    <th style={{ ...TH, textAlign: 'center', width: '80px' }}>Ед.</th>
                    <th style={{ ...TH, textAlign: 'right', width: '180px' }}>Цена</th>
                  </tr>
                </thead>
                <tbody>
                  {section.rows.map((row, i) => (
                    <tr
                      key={row.name}
                      style={{ borderBottom: '1px solid #222', background: i % 2 === 0 ? 'transparent' : '#1a1a1a' }}
                    >
                      <td style={TD}>{row.name}</td>
                      <td style={{ ...TD, textAlign: 'center', color: 'var(--mid)', fontSize: '0.85rem' }}>{row.unit}</td>
                      <td style={{ ...TD, textAlign: 'right', fontWeight: 700, whiteSpace: 'nowrap' }}>
                        {formatPrice(row.min, row.max)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {/* Note */}
        <div style={{ background: 'var(--gray)', border: '1px solid #2a2a2a', borderRadius: '8px', padding: '20px 24px', marginBottom: '48px', fontSize: '0.88rem', color: 'var(--mid)', lineHeight: 1.8 }}>
          <strong style={{ color: 'var(--white)' }}>Важно:</strong> цены являются ориентировочными и могут
          варьироваться в зависимости от площади объекта, состояния основания, удалённости от МКАД и объёма работ.
          Скидки при объёме от 500 м².
          Для точного расчёта —{' '}
          <button onClick={onQuoteClick} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 700, cursor: 'pointer', padding: 0, fontSize: 'inherit' }}>
            закажите бесплатный замер
          </button>.
        </div>

        {/* Services links */}
        <h2 style={{ fontWeight: 800, fontSize: '1.25rem', marginBottom: '16px' }}>Подробнее об услугах</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '56px' }}>
          {[
            { to: '/uslugi/asfaltirovanie-dvorov/',                    label: 'Асфальтирование дворов' },
            { to: '/uslugi/asfaltirovanie-parkovok/',                  label: 'Асфальтирование парковок' },
            { to: '/uslugi/asfaltirovanie-dorog/',                     label: 'Асфальтирование дорог' },
            { to: '/uslugi/yamochnyj-remont/',                         label: 'Ямочный ремонт' },
            { to: '/uslugi/asfaltovaya-kroshka/',                      label: 'Асфальтовая крошка' },
            { to: '/uslugi/asfaltirovanie-promyshlennyh-ploshhadok/',  label: 'Промышленные площадки' },
            { to: '/uslugi/asfaltirovanie-sportivnyh-ploshhadok/',     label: 'Спортивные площадки' },
            { to: '/uslugi/kompleksnoe-blagoustrojstvo-dvora-pod-klyuch/', label: 'Благоустройство двора' },
          ].map(s => (
            <Link
              key={s.to}
              to={s.to}
              style={{ background: 'var(--gray)', border: '1px solid #2a2a2a', borderRadius: '4px', padding: '8px 16px', color: 'var(--light)', fontSize: '0.88rem', textDecoration: 'none', fontWeight: 600 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = 'var(--light)' }}
            >
              {s.label} →
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div style={{ background: 'var(--accent)', borderRadius: '8px', padding: '40px 32px', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--black)', fontWeight: 900, fontSize: '1.6rem', marginBottom: '10px' }}>
            Рассчитайте стоимость за 30 минут
          </h2>
          <p style={{ color: '#333', marginBottom: '24px', fontSize: '1rem' }}>
            Замерщик выедет в день обращения — бесплатно и без обязательств
          </p>
          <button
            onClick={onQuoteClick}
            style={{ background: 'var(--black)', color: 'var(--white)', padding: '14px 40px', borderRadius: '4px', fontWeight: 700, cursor: 'pointer', border: 'none', fontSize: '1rem' }}
          >
            Получить расчёт
          </button>
        </div>
      </div>
    </>
  )
}

const TH = { padding: '10px 16px', textAlign: 'left', fontWeight: 700, fontSize: '0.82rem', color: 'var(--mid)', textTransform: 'uppercase', letterSpacing: '0.05em' }
const TD = { padding: '13px 16px', color: 'var(--white)' }
