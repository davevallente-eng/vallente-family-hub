import { Flame, Check } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useStreak } from '../hooks/useStreak'
import { useShowToast } from '../context/ToastContext'
import { Avatar } from './Avatar'
import { BtnPrimary, BtnSm } from './Card'

// Slim full-width banner that lives at the top of the Dashboard. Shows the
// household streak, who hasn't checked in yet today, and a check-in button
// for the current member.
export function StreakBanner() {
  const { profile } = useAuth()
  const show = useShowToast()
  const { streak, checkedInToday, missingToday, checkInToday } = useStreak(profile?.name)

  const everyoneIn = missingToday.length === 0

  const onCheckIn = () => {
    checkInToday()
    show(`Checked in! ${everyoneIn ? '' : missingToday.length === 1 ? 'Last one needed!' : `${missingToday.length - 1} to go.`}`.trim())
  }

  return (
    <div className="flex items-center gap-3 bg-black/55 border border-white/15 rounded-[var(--border-radius-lg)] px-4 py-3 shadow-sm">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#FAEEDA' }}>
        <Flame size={20} style={{ color: '#BA7517' }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[15px] font-semibold tracking-tight text-[var(--color-text-primary)] leading-tight">
          {streak > 0 ? `${streak}-day family streak` : 'Start a family streak'}
        </div>
        <div className="text-[12px] text-[var(--color-text-secondary)] mt-0.5 flex items-center gap-1.5 flex-wrap">
          {everyoneIn ? (
            <span>Everyone's checked in today 🎉</span>
          ) : (
            <>
              <span>Still need:</span>
              {missingToday.map(name => (
                <span key={name} className="inline-flex items-center gap-1">
                  <Avatar name={name} size={14} />
                  <span>{name}</span>
                </span>
              ))}
            </>
          )}
        </div>
      </div>
      {checkedInToday ? (
        <BtnSm>
          <Check size={12} className="inline -mt-0.5 mr-1" /> Checked in
        </BtnSm>
      ) : (
        <BtnPrimary onClick={onCheckIn} disabled={!profile}>
          Check in today
        </BtnPrimary>
      )}
    </div>
  )
}
