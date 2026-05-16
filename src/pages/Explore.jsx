import { useMemo, useState } from 'react'
import { MapPin, Star } from 'lucide-react'
import { BtnSm, BtnPrimary } from '../components/Card'
import { AiButton } from '../components/AiButton'
import { SEED_ACTIVITIES } from '../data/seed'
import { useShowToast } from '../context/ToastContext'
import { useLocation } from '../context/LocationContext'

const FILTERS = [
  { id: 'all',     label: 'All' },
  { id: 'outdoor', label: 'Outdoor' },
  { id: 'food',    label: 'Food & drink' },
  { id: 'kids',    label: 'Kid-friendly' },
  { id: 'free',    label: 'Free' },
]

export function Explore() {
  const [filter, setFilter] = useState('all')
  const show = useShowToast()
  const { currentLocation, isAway, homeLocation } = useLocation()

  const activities = useMemo(() => {
    if (filter === 'all') return SEED_ACTIVITIES
    return SEED_ACTIVITIES.filter(a => a.type === filter)
  }, [filter])

  return (
    <div>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="text-[13px] text-[var(--color-text-secondary)] inline-flex items-center gap-1.5">
          <MapPin size={14} />
          <span>Things to do near {currentLocation}{isAway ? <span className="text-[var(--color-text-tertiary)]"> · home: {homeLocation.split(',')[0]}</span> : null}</span>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {FILTERS.map(f =>
            f.id === filter ? (
              <BtnPrimary key={f.id} onClick={() => setFilter(f.id)}>{f.label}</BtnPrimary>
            ) : (
              <BtnSm key={f.id} onClick={() => setFilter(f.id)}>{f.label}</BtnSm>
            )
          )}
        </div>
      </div>

      <div className="mb-3 flex justify-center">
        <AiButton
          variant="primary"
          label={`Find more near ${currentLocation.split(',')[0]} →`}
          prompt={`Find more fun things to do this weekend near ${currentLocation} for the Vallente family (parents + two adult kids${isAway ? ` — they're currently visiting from Fairfield CA` : ''}). Suggest hidden gems and local events — wineries, food, outdoor, live music all fair game. Output 5 picks: name, when, where, why it's good.`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activities.map(a => (
          <div key={a.id} className="border border-white/15 rounded-[var(--border-radius-md)] px-3 py-2.5 bg-black/55 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[13px] font-medium text-[var(--color-text-primary)]">{a.title}</div>
                <div className="text-xs text-[var(--color-text-secondary)] mt-0.5">{a.meta}</div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-[10px] shrink-0" style={{ background: a.tagBg, color: a.tagTxt }}>
                {a.tag}
              </span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={12}
                    fill={i < a.stars ? '#BA7517' : 'none'}
                    color={i < a.stars ? '#BA7517' : 'var(--color-border-secondary)'}
                  />
                ))}
              </div>
              <BtnSm onClick={() => show(`"${a.title}" added to calendar!`)}>+ Calendar</BtnSm>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
