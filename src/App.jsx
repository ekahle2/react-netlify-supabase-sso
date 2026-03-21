import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './hooks/useAuth'
import ErrorBoundary from './components/ErrorBoundary'
import LoginScreen from './components/LoginScreen'
import Home from './pages/Home'
import AppShell from './pages/AppShell'

/**
 * ProtectedRoute — wraps any route that requires authentication.
 *
 * - session === undefined: still loading, render nothing
 * - session === null:      not authenticated, show LoginScreen
 * - session object:        authenticated, render children
 */
function ProtectedRoute({ children }) {
  const { session } = useAuth()
  if (session === undefined) return null
  if (session === null) return <LoginScreen />
  return children
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes — no auth required */}
            <Route path="/" element={<Home />} />

            {/* Protected routes — Google SSO + allowlist required */}
            <Route
              path="/app/*"
              element={
                <ProtectedRoute>
                  <AppShell />
                </ProtectedRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  )
}
