import { Calendar, ListChecks, UtensilsCrossed, MapPin, Trophy } from 'lucide-react'
import { Card, CardHeader, BtnSm, Stat } from '../components/Card'
import { Avatar, WhoChips } from '../components/Avatar'
import { StreakBanner } from '../components/StreakBanner'
import { PollsCard } from '../components/PollsCard'
import { useEvents } from '../hooks/useEvents'
import { useChores } from '../hooks/useChores'
import { FAMILY } from '../data/family'
import { fmtMonthDay } from '../lib/date'

export function Dashboard({ goTo }) {
  const { events } = useEvents()
  const { chores, toggle, points, donePct } = useChores()

  const topEvents = events.slice(0, 4)
  const topChores = chores.slice(0, 4)

  return (
    <div className="flex flex-col gap-4">
      <StreakBanner />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat num={events.length} label="Events this month" />
        <Stat num={`${donePct}%`} label="Chores done today" />
        <Stat num={3} label="Meals planned" />
        <Stat num={2} label="Trips in the works" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader
            title="Upcoming events"
            icon={Calendar}
            action={<BtnSm onClick={() => goTo('calendar')}>View all</BtnSm>}
          />
          <div>
            {topEvents.map(e => (
              <div key={e.id} className="flex items-center gap-2 py-1.5 bg-black/25 rounded-md px-2 mb-1 last:mb-0">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: e.dot }} />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] text-[var(--color-text-primary)] truncate">{e.title}</div>
                  <div className="text-[11px] text-[var(--color-text-tertiary)]">{fmtMonthDay(e.date)}</div>
                </div>
                <WhoChips who={e.who} />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Today's chores"
            icon={ListChecks}
            action={<BtnSm onClick={() => goTo('chores')}>View all</BtnSm>}
          />
          <div>
            {topChores.map(c => (
              <ChoreRow key={c.id} chore={c} onToggle={() => toggle(c.id)} />
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader title="Tonight's dinner" icon={UtensilsCrossed} />
            <div className="text-[15px] font-medium text-[var(--color-text-primary)] mb-1">Taco Tuesday</div>
            <div className="text-xs text-[var(--color-text-secondary)]">Cook: Krista · 6:30 PM</div>
            <div className="mt-2.5 flex gap-1.5">
              <span className="text-[11px] px-2 py-0.5 rounded-[10px]" style={{ background: '#E1F5EE', color: '#085041' }}>Mexican</span>
              <span className="text-[11px] px-2 py-0.5 rounded-[10px]" style={{ background: '#EAF3DE', color: '#27500A' }}>30 min</span>
            </div>
          </Card>

          <Card>
            <CardHeader
              title="This weekend near you"
              icon={MapPin}
              action={<BtnSm onClick={() => goTo('explore')}>More →</BtnSm>}
            />
            <div className="text-[13px] font-medium text-[var(--color-text-primary)] mb-0.5">Suisun Waterfront District</div>
            <div className="text-xs text-[var(--color-text-secondary)] mb-1.5">Sat morning · 10 min away · Free</div>
            <div className="text-[13px] font-medium text-[var(--color-text-primary)] mb-0.5">Lake Berryessa kayaking</div>
            <div className="text-xs text-[var(--color-text-secondary)]">All weekend · 35 min · ★ 4.8</div>
          </Card>
        </div>

        <PollsCard />
      </div>

      <Card>
        <CardHeader title="Chore leaderboard this week" icon={Trophy} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {FAMILY.map(m => (
            <div key={m.id} className="bg-[var(--color-background-secondary)] rounded-[var(--border-radius-md)] p-3 text-center">
              <div className="mx-auto mb-1.5">
                <Avatar name={m.name} size={32} />
              </div>
              <div className="text-[22px] font-medium text-[var(--color-text-primary)] leading-none">{points[m.name] ?? 0}</div>
              <div className="text-[11px] text-[var(--color-text-tertiary)] mt-1">{m.name}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function ChoreRow({ chore, onToggle }) {
  const m = FAMILY.find(f => f.name === chore.who)
  return (
    <div className="flex items-center gap-2.5 py-1.5 bg-black/25 rounded-md px-2 mb-1 last:mb-0">
      <button
        onClick={onToggle}
        className={`w-[18px] h-[18px] rounded border flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
          chore.done
            ? 'bg-[var(--color-success)] border-[var(--color-success)]'
            : 'bg-transparent border-[var(--color-border-secondary)]'
        }`}
      >
        {chore.done ? <span className="text-white text-[11px] leading-none">✓</span> : null}
      </button>
      <div className={`flex-1 text-[13px] ${chore.done ? 'line-through text-[var(--color-text-tertiary)]' : 'text-[var(--color-text-primary)]'}`}>
        {chore.name}
      </div>
      {m ? (
        <span className="text-[11px] px-2 py-0.5 rounded-[10px] font-medium" style={{ background: m.accent, color: '#FFFFFF' }}>
          {chore.who}
        </span>
      ) : null}
    </div>
  )
}

