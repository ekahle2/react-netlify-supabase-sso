import { useAuth } from '../hooks/useAuth'
import { Link } from 'react-router-dom'

/**
 * Home — public landing page. No auth required.
 * Replace this with your actual public page content.
 */
export default function Home() {
  const { session } = useAuth()

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '100vh', gap: '1.5rem',
    }}>
      <h1 style={{ color: 'var(--accent)', fontSize: '2rem', fontWeight: 700 }}>
        Your App Name
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '400px', textAlign: 'center' }}>
        Replace this with your public landing page content.
      </p>
      {session ? (
        <Link to="/app" style={btnStyle}>Go to app</Link>
      ) : (
        <Link to="/app" style={btnStyle}>Sign in</Link>
      )}
    </div>
  )
}

const btnStyle = {
  padding: '0.65rem 1.5rem',
  background: 'var(--bg-card)',
  border: '1px solid var(--accent)',
  color: 'var(--accent)',
  borderRadius: '6px',
  fontSize: '0.95rem',
  fontWeight: 600,
  textDecoration: 'none',
  cursor: 'pointer',
}
