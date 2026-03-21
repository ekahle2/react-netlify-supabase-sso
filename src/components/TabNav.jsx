export default function TabNav({ tabs, active, onChange }) {
  return (
    <div style={{
      display: 'flex', gap: 0, marginBottom: '1.5rem',
      borderBottom: '2px solid #1a5276',
    }}>
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          style={{
            padding: '0.6rem 1.4rem', cursor: 'pointer', fontSize: '0.9rem',
            border: 'none', background: 'none', fontFamily: 'inherit',
            color: active === t.id ? '#5dade2' : '#888',
            borderBottom: active === t.id ? '2px solid #5dade2' : '2px solid transparent',
            fontWeight: active === t.id ? 700 : 400,
            marginBottom: '-2px',
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
