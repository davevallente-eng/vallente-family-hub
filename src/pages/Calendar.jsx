import { useState } from 'react'
import { Calendar as CalendarIcon, List, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardHeader, BtnSm, BtnPrimary } from '../components/Card'
import { WhoChips } from '../components/Avatar'
import { useEvents } from '../hooks/useEvents'
import { fmtMonthDay, todayParts } from '../lib/date'
import { useShowToast } from '../context/ToastContext'

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export function CalendarPage() {
  const today = todayParts()
  const [{ year, monthIndex }, setMonth] = useState({ year: today.year, monthIndex: today.monthIndex })
  const { events } = useEvents()
  const show = useShowToast()

  const move = (delta) => {
    setMonth(prev => {
      let m = prev.monthIndex + delta
      let y = prev.year
      if (m < 0) { m = 11; y -= 1 }
      if (m > 11) { m = 0; y += 1 }
      return { year: y, monthIndex: m }
    })
  }

  const monthEvents = events.filter(e => {
    const m = /^(\d{4})-(\d{2})/.exec(e.date ?? '')
    if (!m) return true
    return Number(m[1]) === year && Number(m[2]) - 1 === monthIndex
  })

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader
          title={`${MONTH_NAMES[monthIndex]} ${year}`}
          icon={CalendarIcon}
          action={
            <div className="flex gap-1.5">
              <BtnSm onClick={() => move(-1)} aria-label="Previous month"><ChevronLeft size={12} /></BtnSm>
              <BtnSm onClick={() => move(1)} aria-label="Next month"><ChevronRight size={12} /></BtnSm>
              <BtnPrimary onClick={() => show('Add event coming soon')}>+ Event</BtnPrimary>
            </div>
          }
        />
        <MiniCal year={year} monthIndex={monthIndex} events={monthEvents} todayIsThisMonth={today.year === year && today.monthIndex === monthIndex} todayDay={today.day} />
      </Card>

      <Card>
        <CardHeader title="All events" icon={List} />
        <div>
          {monthEvents.length === 0 ? (
            <div className="text-xs text-[var(--color-text-tertiary)] py-4 text-center">No events this month.</div>
          ) : (
            monthEvents.map(e => (
              <div key={e.id} className="flex items-center gap-2 py-1.5 bg-black/25 rounded-md px-2 mb-1 last:mb-0">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: e.dot }} />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] text-[var(--color-text-primary)] truncate">{e.title}</div>
                  <div className="text-[11px] text-[var(--color-text-tertiary)]">{fmtMonthDay(e.date)}</div>
                </div>
                <WhoChips who={e.who} />
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}

function MiniCal({ year, monthIndex, events, todayIsThisMonth, todayDay }) {
  const firstDay = new Date(year, monthIndex, 1).getDay()
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  const eventDots = {}
  for (const e of events) {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(e.date ?? '')
    if (!m) continue
    const d = Number(m[3])
    eventDots[d] = eventDots[d] ?? []
    eventDots[d].push(e.dot)
  }

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <>
      <div className="grid grid-cols-7 mb-1.5">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <div key={d} className="text-center text-[10px] font-medium text-[var(--color-text-tertiary)] py-1 uppercase tracking-wide">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px">
        {cells.map((d, i) => {
          if (d == null) return <div key={i} className="aspect-square" />
          const isToday = todayIsThisMonth && d === todayDay
          const dots = eventDots[d] ?? []
          return (
            <div
              key={i}
              className="aspect-square flex flex-col items-center justify-center cursor-pointer rounded-[var(--border-radius-md)]"
              style={isToday ? { background: 'var(--color-accent)' } : undefined}
            >
              <span className={`text-[11px] ${isToday ? 'text-white font-medium' : 'text-[var(--color-text-primary)]'}`}>{d}</span>
              {dots.length ? (
                <div className="flex gap-0.5 mt-0.5">
                  {dots.map((c, j) => (
                    <div key={j} className="w-1 h-1 rounded-full" style={{ background: isToday ? '#fff' : c }} />
                  ))}
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </>
  )
}
