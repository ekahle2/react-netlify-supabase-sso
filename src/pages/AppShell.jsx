import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import TabNav from '../components/TabNav'
import { useData } from '../hooks/useData'

/**
 * AppShell — auth-gated app. Replace with your application UI.
 *
 * This stub shows:
 * - how to call useAuth() for session and signOut
 * - how to call useData() for your Supabase data
 * - TabNav usage pattern
 */

const TABS = [
  { id: 'list',     label: 'List' },
  { id: 'settings', label: 'Settings' },
]

export default function AppShell() {
  const { session, signOut } = useAuth()
  const { items, loading, error } = useData()
  const [tab, setTab] = useState('list')

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem',
      }}>
        <h1 style={{ color: 'var(--accent)', fontSize: '1.25rem', fontWeight: 700 }}>
          Your App Name
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {session?.user?.email}
          </span>
          <button onClick={signOut} style={signOutStyle}>Sign out</button>
        </div>
      </div>

      <TabNav tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'list' && (
        <div>
          {loading && <p style={{ color: 'var(--text-muted)' }}>Loading...</p>}
          {error   && <p style={{ color: '#f1948a' }}>{error}</p>}
          {!loading && !error && items.length === 0 && (
            <p style={{ color: 'var(--text-muted)' }}>No items yet.</p>
          )}
          {items.map(item => (
            <div key={item.id} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: '6px', padding: '1rem', marginBottom: '0.75rem',
            }}>
              <div style={{ fontWeight: 600, color: 'var(--text)' }}>{item.title}</div>
              {item.content && (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                  {item.content}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'settings' && (
        <p style={{ color: 'var(--text-muted)' }}>Settings — replace this tab with your content.</p>
      )}
    </div>
  )
}

const signOutStyle = {
  background: 'none', border: '1px solid var(--border)', color: 'var(--text-muted)',
  borderRadius: '4px', padding: '0.3rem 0.75rem', cursor: 'pointer', fontSize: '0.82rem',
}
