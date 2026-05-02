import { useEffect, useState } from 'react'

const API = '/api'
const ADMIN_KEY = 'adm_auth_v1'
const SECRET = 'Ru$$1yA$phalt#2026'

function PasswordGate({ onAuth }) {
  const [value, setValue] = useState('')
  const [shake, setShake] = useState(false)

  function attempt() {
    if (value === SECRET) {
      localStorage.setItem(ADMIN_KEY, '1')
      onAuth()
    } else {
      setShake(true)
      setValue('')
      setTimeout(() => setShake(false), 600)
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{
        background: 'var(--dark)', border: '1px solid #333', borderRadius: '10px',
        padding: '40px 32px', width: '100%', maxWidth: '360px', textAlign: 'center',
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔒</div>
        <div style={{ color: 'var(--mid)', fontSize: '0.9rem', marginBottom: '24px' }}>Доступ ограничен</div>
        <input
          type="password"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && attempt()}
          placeholder="Пароль"
          autoFocus
          style={{
            width: '100%', boxSizing: 'border-box',
            background: shake ? '#2a1010' : 'var(--gray)',
            color: 'var(--white)', border: `1px solid ${shake ? '#a33' : '#444'}`,
            borderRadius: '6px', padding: '12px 14px', fontSize: '1rem',
            marginBottom: '16px', outline: 'none',
            transition: 'background 0.2s, border-color 0.2s',
          }}
        />
        <button onClick={attempt} className="btn" style={{ width: '100%' }}>Войти</button>
      </div>
    </div>
  )
}

export default function Admin() {
  const [authed, setAuthed] = useState(() => localStorage.getItem(ADMIN_KEY) === '1')

  if (!authed) return <PasswordGate onAuth={() => setAuthed(true)} />
  const [status, setStatus] = useState(null)
  const [queue, setQueue] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [log, setLog] = useState([])
  const [locationType, setLocationType] = useState('both')
  const [regenSlug, setRegenSlug] = useState('')

  useEffect(() => {
    loadStatus()
  }, [])

  async function loadStatus() {
    try {
      const [s, q] = await Promise.all([
        fetch(`${API}/status`).then(r => r.json()),
        fetch(`${API}/next?n=10`).then(r => r.json()),
      ])
      setStatus(s)
      setQueue(q)
    } catch (e) {
      addLog('❌ Ошибка загрузки статуса')
    }
  }

  async function generate() {
    setGenerating(true)
    addLog(`⏳ Запуск генерации (${locationType})...`)
    try {
      const r = await fetch(`${API}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location_type: locationType }),
      })
      const data = await r.json()
      if (data.status === 'nothing_pending') {
        addLog('✅ Нет pending локаций')
      } else {
        const names = data.generated?.map(g => g.name).join(', ') || '?'
        addLog(`✅ Сгенерировано: ${names}`)
      }
      loadStatus()
    } catch (e) {
      addLog(`❌ Ошибка: ${e.message}`)
    } finally {
      setGenerating(false)
    }
  }

  async function regenerate() {
    if (!regenSlug.trim()) return
    setGenerating(true)
    addLog(`⏳ Регенерация: ${regenSlug}...`)
    try {
      const r = await fetch(`${API}/regenerate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: regenSlug.trim() }),
      })
      const data = await r.json()
      if (r.ok) {
        addLog(`✅ Регенерирован: ${regenSlug}`)
        setRegenSlug('')
        loadStatus()
      } else {
        addLog(`❌ ${data.detail || 'Ошибка'}`)
      }
    } catch (e) {
      addLog(`❌ ${e.message}`)
    } finally {
      setGenerating(false)
    }
  }

  function addLog(msg) {
    setLog(prev => [`[${new Date().toLocaleTimeString('ru-RU')}] ${msg}`, ...prev.slice(0, 49)])
  }

  const pct = (done, total) => total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.8rem', color: 'var(--white)', margin: 0 }}>Панель управления</h1>
        <button
          onClick={() => { localStorage.removeItem(ADMIN_KEY); setAuthed(false) }}
          style={{ background: 'transparent', border: '1px solid #444', color: '#888', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
        >
          Выйти
        </button>
      </div>

      {/* Status cards */}
      {status && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
          <StatCard label="Москва" done={status.moscow.done} total={status.moscow.total} />
          <StatCard label="Подмосковье" done={status.podmoskovye.done} total={status.podmoskovye.total} />
          <StatCard label="Всего страниц" value={status.total_pages} />
        </div>
      )}

      {/* Generate controls */}
      <div style={{ background: 'var(--dark)', border: '1px solid #333', borderRadius: '8px', padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Генерация</h2>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={locationType}
            onChange={e => setLocationType(e.target.value)}
            style={{ background: 'var(--gray)', color: 'var(--white)', border: '1px solid #444', borderRadius: '4px', padding: '10px 14px', fontSize: '0.95rem' }}
          >
            <option value="both">Москва + Подмосковье</option>
            <option value="moscow">Только Москва</option>
            <option value="podmoskovye">Только Подмосковье</option>
            <option value="blog">Блог-статья</option>
          </select>
          <button
            onClick={generate}
            disabled={generating}
            className="btn"
            style={{ opacity: generating ? 0.6 : 1 }}
          >
            {generating ? 'Генерирую...' : 'Генерировать следующий'}
          </button>
          <button onClick={loadStatus} style={{ background: 'transparent', border: '1px solid #444', color: '#aaa', padding: '10px 16px', borderRadius: '4px', cursor: 'pointer' }}>
            Обновить
          </button>
        </div>
      </div>

      {/* Regenerate */}
      <div style={{ background: 'var(--dark)', border: '1px solid #333', borderRadius: '8px', padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Регенерация по slug</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input
            value={regenSlug}
            onChange={e => setRegenSlug(e.target.value)}
            placeholder="nekrasovka"
            style={{ flex: 1, background: 'var(--gray)', color: 'var(--white)', border: '1px solid #444', borderRadius: '4px', padding: '10px 14px', fontSize: '0.95rem' }}
            onKeyDown={e => e.key === 'Enter' && regenerate()}
          />
          <button onClick={regenerate} disabled={generating || !regenSlug.trim()} className="btn" style={{ opacity: (generating || !regenSlug.trim()) ? 0.6 : 1 }}>
            Регенерировать
          </button>
        </div>
      </div>

      {/* Queue */}
      {queue && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <QueueBlock title="Москва — очередь" items={queue.moscow} />
          <QueueBlock title="Подмосковье — очередь" items={queue.podmoskovye} />
        </div>
      )}

      {/* Log */}
      {log.length > 0 && (
        <div style={{ background: '#0d0d0d', border: '1px solid #222', borderRadius: '8px', padding: '16px' }}>
          <div style={{ color: 'var(--mid)', fontSize: '0.8rem', marginBottom: '8px' }}>Лог</div>
          {log.map((line, i) => (
            <div key={i} style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#bbb', lineHeight: 1.8 }}>{line}</div>
          ))}
        </div>
      )}
    </div>
  )
}

function StatCard({ label, done, total, value }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : null
  return (
    <div style={{ background: 'var(--dark)', border: '1px solid #333', borderRadius: '8px', padding: '20px' }}>
      <div style={{ color: 'var(--mid)', fontSize: '0.85rem', marginBottom: '8px' }}>{label}</div>
      {value !== undefined ? (
        <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--accent)' }}>{value}</div>
      ) : (
        <>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--accent)' }}>{done}<span style={{ fontSize: '1rem', color: 'var(--mid)', fontWeight: 400 }}>/{total}</span></div>
          <div style={{ marginTop: '8px', background: '#222', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: 'var(--accent)', transition: 'width 0.3s' }} />
          </div>
          <div style={{ color: 'var(--mid)', fontSize: '0.8rem', marginTop: '4px' }}>{pct}%</div>
        </>
      )}
    </div>
  )
}

function QueueBlock({ title, items }) {
  return (
    <div style={{ background: 'var(--dark)', border: '1px solid #333', borderRadius: '8px', padding: '20px' }}>
      <div style={{ fontWeight: 700, marginBottom: '12px', color: 'var(--accent)', fontSize: '0.9rem' }}>{title}</div>
      {items.length === 0 ? (
        <div style={{ color: 'var(--mid)', fontSize: '0.9rem' }}>Пусто</div>
      ) : (
        <ul style={{ listStyle: 'none', color: '#bbb', fontSize: '0.9rem', lineHeight: 1.9 }}>
          {items.map((name, i) => (
            <li key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ color: 'var(--mid)', minWidth: '18px' }}>{i + 1}.</span>
              {name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
