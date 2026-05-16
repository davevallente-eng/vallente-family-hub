import { useAuth } from '../context/AuthContext'
import { Avatar } from './Avatar'

// Single screen: tap your name. No emails, no magic links. The selection
// persists in localStorage on this device — future visits skip straight
// to the app.
export function AuthScreens() {
  const { needsProfile } = useAuth()
  if (!needsProfile) return null
  return <ProfilePicker />
}

function ProfilePicker() {
  const { members, claimProfile } = useAuth()

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-black/65 backdrop-blur-sm border border-white/15 rounded-[var(--border-radius-lg)] p-6 shadow-lg">
        <div className="text-center mb-1 text-[18px] font-semibold tracking-tight text-[var(--color-text-primary)]">Vallente Family Hub</div>
        <div className="text-[15px] font-medium text-[var(--color-text-primary)] text-center mt-3">Who's using the Hub?</div>
        <p className="text-[13px] text-[var(--color-text-secondary)] mb-4 text-center">Tap your name. You're in.</p>

        <div className="grid grid-cols-2 gap-3">
          {members.map(m => (
            <button
              key={m.id}
              type="button"
              onClick={() => claimProfile(m.name)}
              className="flex items-center gap-3 p-3 border border-white/20 rounded-[var(--border-radius-md)] hover:bg-white/[0.06] cursor-pointer text-left transition-colors"
            >
              <Avatar name={m.name} size={36} />
              <span className="text-[13px] font-medium text-[var(--color-text-primary)]">{m.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
