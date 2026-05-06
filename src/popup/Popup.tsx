import { useState, useEffect } from 'react'

const EXPERIENCE_OPTIONS = [
  { label: 'Без опыта', value: 'noExperience' },
  { label: '1–3 года', value: 'between1And3' },
  { label: '3–6 лет', value: 'between3And6' },
  { label: '6+ лет', value: 'moreThan6' },
]

export function Popup() {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<string[]>([])

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = tabs[0]?.url
      if (!url?.includes('hh.ru')) return
      const params = new URLSearchParams(new URL(url).search)
      setQuery(params.get('text') ?? '')
      setSelected(params.getAll('experience'))
    })
  }, [])

  function toggleExperience(value: string) {
    setSelected(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    )
  }

  function handleSearch() {
    const url = new URL('https://hh.ru/search/vacancy')
    if (query.trim()) url.searchParams.set('text', query.trim())
    url.searchParams.set('search_field', 'name')
    selected.forEach(v => url.searchParams.append('experience', v))

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id
      if (tabId) {
        chrome.tabs.update(tabId, { url: url.toString() })
      } else {
        chrome.tabs.create({ url: url.toString() })
      }
      window.close()
    })
  }

  return (
    <div style={{
      width: 300,
      fontFamily: "'Courier New', monospace",
      background: '#0f0f0f',
      color: '#f0f0f0',
      padding: '20px',
      boxSizing: 'border-box',
    }}>

      <div style={{ marginBottom: 20, borderBottom: '1px solid #333', paddingBottom: 12 }}>
        <div style={{ fontSize: 11, color: '#666', letterSpacing: 3, textTransform: 'uppercase' }}>
          Extension
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -1, color: '#fff' }}>
          HH<span style={{ color: '#d6001c' }}>Lens</span>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 10, color: '#666', letterSpacing: 2, marginBottom: 6, textTransform: 'uppercase' }}>
          Должность
        </div>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder="frontend, react..."
          style={{
            width: '100%',
            background: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: 4,
            padding: '8px 10px',
            color: '#f0f0f0',
            fontFamily: 'inherit',
            fontSize: 13,
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 10, color: '#666', letterSpacing: 2, marginBottom: 8, textTransform: 'uppercase' }}>
          Опыт работы
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {EXPERIENCE_OPTIONS.map(opt => {
            const isActive = selected.includes(opt.value)
            return (
              <button
                key={opt.value}
                onClick={() => toggleExperience(opt.value)}
                style={{
                  background: isActive ? '#d6001c' : '#1a1a1a',
                  border: `1px solid ${isActive ? '#d6001c' : '#333'}`,
                  borderRadius: 4,
                  padding: '8px 6px',
                  color: isActive ? '#fff' : '#999',
                  fontFamily: 'inherit',
                  fontSize: 12,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  textAlign: 'center',
                }}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>

      <button
        onClick={handleSearch}
        style={{
          width: '100%',
          background: '#d6001c',
          border: 'none',
          borderRadius: 4,
          padding: '10px',
          color: '#fff',
          fontFamily: 'inherit',
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: 1,
          textTransform: 'uppercase',
          cursor: 'pointer',
        }}
      >
        Найти →
      </button>

    </div>
  )
}