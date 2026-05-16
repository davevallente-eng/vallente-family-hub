import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabaseEnabled } from '../lib/supabase'
import { BtnPrimary } from './Card'
import { Avatar } from './Avatar'

export function AuthScreens() {
  const { signedIn, needsProfile } = useAuth()
  if (!signedIn) return <MagicLinkSignIn />
  if (needsProfile) return <ProfilePicker />
  return null
}

function MagicLinkSignIn() {
  const { sendMagicLink } = useAuth()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('sending')
    setError(null)
    try {
      await sendMagicLink(email.trim())
      setStatus('sent')
    } catch (err) {
      setError(err.message)
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-black/65 backdrop-blur-sm border border-white/15 rounded-[var(--border-radius-lg)] p-6 shadow-lg">
        <img
          src="/logo.png"
          alt="Vallente Family"
          className="w-full max-w-[380px] mx-auto mb-3 select-none"
          draggable={false}
        />
        <p className="text-[13px] text-[var(--color-text-secondary)] mb-4 text-center">Sign in with your email — we'll send you a magic link.</p>

        {!supabaseEnabled ? (
          <div className="text-xs text-[var(--color-text-tertiary)] border border-white/15 rounded-[var(--border-radius-md)] p-3 mb-3">
            Supabase isn't configured yet. Add <code>VITE_SUPABASE_URL</code> and{' '}
            <code>VITE_SUPABASE_ANON_KEY</code> to <code>.env.local</code> to enable real sign-in.
            Until then, you'll be dropped straight into the profile picker.
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="flex flex-col gap-2">
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={!supabaseEnabled || status === 'sending' || status === 'sent'}
            className="px-3 py-2 border border-white/30 bg-white rounded-[var(--border-radius-md)] text-[13px] outline-none focus:border-[var(--color-accent)]"
          />
          <BtnPrimary type="submit" disabled={!supabaseEnabled || status === 'sending' || status === 'sent'}>
            {status === 'sending' ? 'Sending…' : status === 'sent' ? 'Check your inbox' : 'Send magic link'}
          </BtnPrimary>
        </form>
        {error ? <p className="text-xs text-[var(--color-danger)] mt-2">{error}</p> : null}
      </div>
    </div>
  )
}

function ProfilePicker() {
  const { members, allProfiles, claimProfile, signOut, session } = useAuth()
  const [claiming, setClaiming] = useState(null)
  const [error, setError] = useState(null)

  const onPick = async (name) => {
    setClaiming(name)
    setError(null)
    try {
      await claimProfile(name)
    } catch (err) {
      setError(err.message)
      setClaiming(null)
    }
  }

  const claimedBy = (name) => allProfiles.find(p => p.name === name)

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-black/65 backdrop-blur-sm border border-white/15 rounded-[var(--border-radius-lg)] p-6 shadow-lg">
        <img
          src="/logo.png"
          alt="Vallente Family"
          className="w-full max-w-[420px] mx-auto mb-2 select-none"
          draggable={false}
        />
        <div className="text-[15px] font-semibold text-[var(--color-text-primary)] text-center">Who's using the Hub?</div>
        <p className="text-[13px] text-[var(--color-text-secondary)] mb-4 text-center">Pick your slot. This binds your email to that family member.</p>

        <div className="grid grid-cols-2 gap-3">
          {members.map(m => {
            const claim = claimedBy(m.name)
            const takenByOther = claim && claim.user_id !== session?.user?.id
            const takenByMe = claim && claim.user_id === session?.user?.id
            const busy = claiming === m.name
            return (
              <button
                key={m.id}
                onClick={() => !takenByOther && onPick(m.name)}
                disabled={Boolean(takenByOther) || busy}
                title={takenByOther ? `Claimed by ${claim.email ?? 'another user'}` : undefined}
                className={`flex items-center gap-3 p-3 border rounded-[var(--border-radius-md)] cursor-pointer text-left transition-colors ${
                  takenByOther
                    ? 'border-white/10 opacity-40 cursor-not-allowed'
                    : takenByMe
                      ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/20'
                      : 'border-white/20 hover:bg-white/[0.06]'
                }`}
              >
                <Avatar name={m.name} size={36} />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-[var(--color-text-primary)]">{m.name}</div>
                  {takenByOther ? (
                    <div className="text-[10px] text-[var(--color-text-tertiary)] truncate">
                      Taken{claim?.email ? ` by ${claim.email}` : ''}
                    </div>
                  ) : busy ? (
                    <div className="text-[10px] text-[var(--color-text-tertiary)]">Claiming…</div>
                  ) : null}
                </div>
              </button>
            )
          })}
        </div>

        {error ? <p className="text-xs text-[var(--color-danger)] mt-3">{error}</p> : null}

        {supabaseEnabled && session?.user?.email ? (
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-[var(--color-text-tertiary)]">
            <span className="truncate">Signed in as {session.user.email}</span>
            <button onClick={signOut} className="hover:text-[var(--color-text-primary)] cursor-pointer">
              Sign out
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
