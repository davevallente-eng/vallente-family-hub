import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { supabase, supabaseEnabled } from '../lib/supabase'
import { FAMILY, FAMILY_BY_NAME } from '../data/family'

const AuthContext = createContext(null)

const LEGACY_PROFILE_KEY = 'hub.profile'

function loadLegacyProfile() {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(LEGACY_PROFILE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return FAMILY_BY_NAME[parsed?.name] ? FAMILY_BY_NAME[parsed.name] : null
  } catch {
    return null
  }
}

// Auth flow:
//   - When Supabase is configured: magic-link email sign-in. After the user
//     comes back via the magic link, we check the `profiles` table to see if
//     they've claimed a family slot. If not, AuthScreens shows the picker
//     with available slots. Claiming inserts a row tying their user.id to
//     one of the four names ('Dave' | 'Krista' | 'David' | 'Kailee').
//   - Without Supabase env vars: legacy pick-a-profile (localStorage).
//     Useful for local UI work before the backend is set up.
//
// State refresh: realtime subscription on the `profiles` table picks up
// claim/release changes from any device, so mutations don't need to manually
// trigger a refetch.
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(supabaseEnabled)
  const [profile, setProfile] = useState(() => (supabaseEnabled ? null : loadLegacyProfile()))
  const [allProfiles, setAllProfiles] = useState([])

  // Track Supabase auth session.
  useEffect(() => {
    if (!supabaseEnabled) return
    let mounted = true
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setSession(data.session)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })
    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  // Fetch profiles + my profile whenever the session changes. Live updates
  // via the realtime subscription so the picker reflects new claims from
  // other devices instantly.
  useEffect(() => {
    if (!supabaseEnabled) return
    let cancelled = false

    const doRefresh = async () => {
      const { data: all } = await supabase.from('profiles').select('user_id,name,email')
      if (cancelled) return
      const list = all ?? []
      setAllProfiles(list)
      const userId = session?.user?.id
      if (!userId) {
        setProfile(null)
      } else {
        const mine = list.find(p => p.user_id === userId)
        setProfile(mine ? (FAMILY_BY_NAME[mine.name] ?? null) : null)
      }
      setLoading(false)
    }

    doRefresh()

    if (!session) return () => { cancelled = true }

    const channel = supabase
      .channel('db-profiles')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        doRefresh,
      )
      .subscribe()
    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [session])

  const sendMagicLink = useCallback(async (email) => {
    if (!supabaseEnabled) throw new Error('Supabase not configured')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    })
    if (error) throw error
  }, [])

  const signOut = useCallback(async () => {
    if (supabaseEnabled) {
      await supabase.auth.signOut()
    } else {
      try { window.localStorage.removeItem(LEGACY_PROFILE_KEY) } catch { /* ignore */ }
    }
    setProfile(null)
  }, [])

  const claimProfile = useCallback(async (name) => {
    const member = FAMILY_BY_NAME[name]
    if (!member) return

    if (!supabaseEnabled) {
      try { window.localStorage.setItem(LEGACY_PROFILE_KEY, JSON.stringify(member)) } catch { /* ignore */ }
      setProfile(member)
      return
    }

    if (!session?.user?.id) throw new Error('Sign in first')
    const { error } = await supabase
      .from('profiles')
      .insert({ user_id: session.user.id, name, email: session.user.email })
    if (error) throw error
    // Realtime will refresh `allProfiles` and `profile`.
  }, [session])

  const releaseProfile = useCallback(async () => {
    if (!supabaseEnabled) {
      try { window.localStorage.removeItem(LEGACY_PROFILE_KEY) } catch { /* ignore */ }
      setProfile(null)
      return
    }
    if (!session?.user?.id) return
    await supabase.from('profiles').delete().eq('user_id', session.user.id)
  }, [session])

  const signedIn = supabaseEnabled ? Boolean(session) : true

  const value = {
    session,
    loading,
    signedIn,
    profile,
    members: FAMILY,
    allProfiles,
    needsProfile: signedIn && !profile,
    sendMagicLink,
    signOut,
    claimProfile,
    releaseProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
