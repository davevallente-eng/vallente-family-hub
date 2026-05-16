import { Plane, ThumbsUp, Mountain, Castle } from 'lucide-react'
import { Card, CardHeader } from '../components/Card'
import { AiButton } from '../components/AiButton'
import { useTrips } from '../hooks/useTrips'
import { useVotes } from '../hooks/useVotes'
import { useLocation } from '../context/LocationContext'

const TRIP_ICONS = { Mountain, Castle }

export function Trips() {
  const { trips } = useTrips()
  const { votes, cast } = useVotes()
  const { currentLocation } = useLocation()
  const maxVote = Math.max(1, ...votes.map(v => v.count))

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader
          title="Trip planner"
          icon={Plane}
          action={
            <AiButton
              label="Plan new trip →"
              prompt={`Help plan a fun family trip from ${currentLocation}. Budget around $2000, family of 4 (parents + two adult kids). Suggest 3 distinct options: destination, length, rough cost breakdown, and one signature thing to do.`}
            />
          }
        />
        <div>
          {trips.map(t => {
            const Icon = TRIP_ICONS[t.icon] ?? Mountain
            const pct = Math.round(t.spent / t.budget * 100)
            return (
              <div key={t.id} className="flex items-center gap-2.5 py-[7px] bg-black/25 rounded-md px-2 mb-1 last:mb-0">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-white/15" style={{ background: t.bg }}>
                  <Icon size={18} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-[var(--color-text-primary)]">{t.name}</div>
                  <div className="text-[11px] text-[var(--color-text-tertiary)]">
                    {t.dates} · ${t.spent.toLocaleString()} of ${t.budget.toLocaleString()} saved
                  </div>
                  <div className="h-1 bg-[var(--color-background-secondary)] rounded-[2px] mt-1 overflow-hidden">
                    <div className="h-1 rounded-[2px] bg-[var(--color-accent)]" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      <Card>
        <CardHeader title="Weekend poll" icon={ThumbsUp} />
        <div className="text-[13px] text-[var(--color-text-secondary)] mb-2.5">What should we do this weekend?</div>
        <div className="flex flex-col gap-1.5">
          {votes.map(v => (
            <div key={v.id} className="flex items-center gap-2 py-1.5 bg-black/25 rounded-md px-2 mb-1 last:mb-0">
              <div className="text-[13px] text-[var(--color-text-primary)] min-w-[120px]">{v.name}</div>
              <div className="flex-1 h-1.5 bg-[var(--color-background-secondary)] rounded-[3px] overflow-hidden">
                <div className="h-1.5 rounded-[3px] bg-[var(--color-accent)] transition-[width] duration-300" style={{ width: `${Math.round(v.count / maxVote * 100)}%` }} />
              </div>
              <div className="text-xs text-[var(--color-text-tertiary)] min-w-[24px] text-right">{v.count}</div>
              <button
                onClick={() => cast(v.id)}
                className="w-[22px] h-[22px] rounded-full border border-[var(--color-border-secondary)] bg-transparent cursor-pointer flex items-center justify-center text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-background-secondary)]"
              >
                +
              </button>
            </div>
          ))}
        </div>
        <AiButton
          variant="secondary"
          label="Add AI suggestions →"
          prompt={`Give 4 fun weekend activity ideas near ${currentLocation} for the Vallente family. Mix outdoorsy and relaxed. For each: title and one-line why.`}
          className="mt-2.5 w-full justify-center"
        />
      </Card>
    </div>
  )
}
