import { ListChecks, Trophy, RefreshCw } from 'lucide-react'
import { Card, CardHeader, BtnPrimary } from '../components/Card'
import { AiButton } from '../components/AiButton'
import { useChores } from '../hooks/useChores'
import { useShowToast } from '../context/ToastContext'
import { FAMILY } from '../data/family'

export function Chores() {
  const { chores, toggle, resetWeek, points } = useChores()
  const show = useShowToast()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader
          title="Today's chores"
          icon={ListChecks}
          action={<BtnPrimary onClick={() => { resetWeek(); show('Chore list reset for new week') }}>Reset week</BtnPrimary>}
        />
        <div>
          {chores.map(c => {
            const m = FAMILY.find(f => f.name === c.who)
            return (
              <div key={c.id} className="flex items-center gap-2.5 py-[7px] bg-black/25 rounded-md px-2 mb-1 last:mb-0">
                <button
                  onClick={() => {
                    const wasDone = c.done
                    toggle(c.id)
                    show(wasDone ? 'Marked incomplete' : `${c.who} earned ${c.pts} pts!`)
                  }}
                  className={`w-[18px] h-[18px] rounded border flex items-center justify-center shrink-0 cursor-pointer ${
                    c.done
                      ? 'bg-[var(--color-success)] border-[var(--color-success)]'
                      : 'bg-transparent border-[var(--color-border-secondary)]'
                  }`}
                >
                  {c.done ? <span className="text-white text-[11px] leading-none">✓</span> : null}
                </button>
                <div className={`flex-1 text-[13px] ${c.done ? 'line-through text-[var(--color-text-tertiary)]' : 'text-[var(--color-text-primary)]'}`}>{c.name}</div>
                {m ? (
                  <span className="text-[11px] px-2 py-0.5 rounded-[10px] font-medium" style={{ background: m.accent, color: '#FFFFFF' }}>{c.who}</span>
                ) : null}
                <span className="text-[11px] text-[var(--color-text-tertiary)]">{c.pts} pts</span>
              </div>
            )
          })}
        </div>
      </Card>

      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader title="Points this week" icon={Trophy} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FAMILY.map(m => (
              <div key={m.id} className="bg-[var(--color-background-secondary)] rounded-[var(--border-radius-md)] p-3 text-center">
                <div className="text-[22px] font-medium text-[var(--color-text-primary)] leading-none">{points[m.name] ?? 0}</div>
                <div className="text-[11px] text-[var(--color-text-tertiary)] mt-1">{m.name}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Chore rotation" icon={RefreshCw} />
          <div className="text-xs text-[var(--color-text-secondary)] mb-2.5">Rotates every Sunday automatically</div>
          <div className="text-[13px] text-[var(--color-text-secondary)]">
            Next rotation: <span className="text-[var(--color-text-primary)] font-medium">Sunday May 17</span>
          </div>
          <AiButton
            variant="secondary"
            label="Suggest rotation plan →"
            prompt="Suggest a fair chore rotation schedule for the Vallente family (Dave, Krista, David, and Kailee). Mix age-appropriate chores. Output a weekly plan as a simple list per person."
            className="mt-2.5 w-full justify-center"
          />
        </Card>
      </div>
    </div>
  )
}
