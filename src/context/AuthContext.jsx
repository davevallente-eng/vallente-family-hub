import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { supabase, supabaseEnabled } from '../lib/supabase'
import { FAMILY, FAMILY_BY_NAME } from '../data/family'

const AuthContext = createContext(null)

const PROFILE_KEY = 'hub.profile'

function loadProfile() {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(PROFILE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return FAMILY_BY_NAME[parsed?.name] ?? null
  } catch {
    return null
  }
}

// Auth = tap-a-name. No emails, no magic links, no friction.
//
// Behind the scenes: we sign every visitor in as an *anonymous* Supabase
// user so RLS-gated queries work. The chosen profile (Dave/Krista/David/
// Kailee) lives in localStorage and identifies "who" you are to the
// rest of the app — it isn't bound to any DB row. Multiple devices for
// the same person? Just pick the same name on each.
//
// Trust model: anyone who has the URL is in the family. Privacy bar is
// "we don't share the URL." If that's not enough, we can re-introduce
// magic links later — the schema still supports it.
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(supabaseEnabled)
  const [profile, setProfile] = useState(() => loadProfile())

  useEffect(() => {
    if (!supabaseEnabled) return
    let mounted = true

    const init = async () => {
      const { data } = await supabase.auth.getSession()
      if (!mounted) return
      if (data.session) {
        setSession(data.session)
        setLoading(false)
        return
      }
      // No cached session → create a fresh anonymous one.
      const { data: signed, error } = await supabase.auth.signInAnonymously()
      if (!mounted) return
      if (error) {
        console.error('[auth] anonymous sign-in failed', error)
        // Surface as loading=false so the picker still renders. Queries
        // will fail until anonymous sign-ins are enabled in Supabase.
      }
      setSession(signed?.session ?? null)
      setLoading(false)
    }
    init()

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (mounted) setSession(newSession)
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const claimProfile = useCallback((name) => {
    const member = FAMILY_BY_NAME[name]
    if (!member) return
    try { window.localStorage.setItem(PROFILE_KEY, JSON.stringify(member)) } catch { /* ignore */ }
    setProfile(member)
  }, [])

  const releaseProfile = useCallback(() => {
    try { window.localStorage.removeItem(PROFILE_KEY) } catch { /* ignore */ }
    setProfile(null)
  }, [])

  // Backwards-compat aliases for the older API surface.
  const signOut = releaseProfile
  const signedIn = supabaseEnabled ? Boolean(session) : true

  const value = {
    session,
    loading,
    signedIn,
    profile,
    members: FAMILY,
    needsProfile: signedIn && !profile,
    claimProfile,
    releaseProfile,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
