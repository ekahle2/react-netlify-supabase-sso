import { createContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// Add every Google account that should have access.
// Anyone not in this list is signed out immediately after OAuth completes.
const ALLOWED_EMAILS = [
  'you@gmail.com',
]

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined) // undefined = loading
  const [authError, setAuthError] = useState(null)

  async function enforceAllowlist(session) {
    if (!session) { setSession(null); return }
    const email = session.user?.email
    if (!ALLOWED_EMAILS.includes(email)) {
      await supabase.auth.signOut()
      setAuthError(`Access denied: ${email} is not authorized.`)
      setSession(null)
      return
    }
    setAuthError(null)
    setSession(session)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      enforceAllowlist(data.session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      enforceAllowlist(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  function signInWithGoogle() {
    setAuthError(null)
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // window.location.origin works in all environments automatically:
        // local dev (http://localhost:5173), Netlify production, and Netlify preview deploys.
        // No hardcoded URL needed — do not replace with a static value.
        redirectTo: window.location.origin,
        scopes: 'openid profile email',
      },
    })
  }

  function signOut() {
    supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ session, authError, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
