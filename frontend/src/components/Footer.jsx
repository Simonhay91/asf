export default function Footer() {
  return (
    <footer style={{ background: 'var(--dark)', borderTop: '1px solid var(--gray)', marginTop: '60px', padding: '40px 0' }}>
      <div className="container footer-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '32px', fontSize: '0.9rem' }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: '1.1rem', marginBottom: '12px' }}>
            Русский<span style={{ color: 'var(--accent)' }}>Асфальт</span>
          </div>
          <p style={{ color: 'var(--mid)', lineHeight: 1.6 }}>
            Асфальтирование в Москве и Подмосковье под ключ. 15 лет опыта.
          </p>
        </div>
        <div>
          <div style={{ fontWeight: 700, marginBottom: '12px', color: 'var(--accent)' }}>Услуги</div>
          <ul style={{ listStyle: 'none', color: 'var(--mid)', lineHeight: 2 }}>
            <li><a href="/uslugi/asfaltirovanie-dvorov/">Асфальтирование дворов</a></li>
            <li><a href="/uslugi/asfaltirovanie-parkovok/">Асфальтирование парковок</a></li>
            <li><a href="/uslugi/yamochnyj-remont/">Ямочный ремонт</a></li>
            <li><a href="/uslugi/asfaltovaya-kroshka/">Асфальтовая крошка</a></li>
          </ul>
        </div>
        <div>
          <div style={{ fontWeight: 700, marginBottom: '12px', color: 'var(--accent)' }}>Контакты</div>
          <p style={{ color: 'var(--mid)', lineHeight: 2 }}>
            <a href="tel:+79096282800">+7 909 628 28 00</a><br />
            <a href="mailto:info@russkiyasphalt.ru">info@russkiyasphalt.ru</a><br />
            Пн–Вс: 08:00–20:00
          </p>
        </div>
      </div>
      <div className="container" style={{ borderTop: '1px solid var(--gray)', marginTop: '32px', paddingTop: '20px', color: 'var(--mid)', fontSize: '0.8rem' }}>
        © 2024 РусскийАсфальт. Асфальтирование в Москве от 630 руб/м².
      </div>
    </footer>
  )
}
