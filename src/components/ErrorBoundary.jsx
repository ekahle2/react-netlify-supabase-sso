import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, message: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || 'Unknown error' }
  }

  componentDidCatch(error, info) {
    console.error('Uncaught error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', minHeight: '100vh', gap: '1rem', color: '#e0e0e0',
        }}>
          <h1 style={{ color: '#f1948a', fontSize: '1.2rem' }}>Something went wrong</h1>
          <p style={{ color: '#888', fontSize: '0.9rem' }}>
            Reload the page to try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#1a5276', color: 'white', border: 'none',
              borderRadius: '4px', padding: '0.5rem 1.2rem', cursor: 'pointer',
              fontSize: '0.9rem', fontFamily: 'inherit',
            }}
          >
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
