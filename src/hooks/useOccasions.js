import { useMemo } from 'react'
import { useSupabaseTable } from './useSupabaseTable'
import { daysUntilNextOccurrence } from '../lib/date'

// DB uses month_day + group_type; JS uses monthDay + group.
const mapRow = (r) => ({
  ...r,
  monthDay: r.month_day,
  group: r.group_type,
})

const mapInsert = (r) => {
  const out = { ...r }
  if ('monthDay' in r) { out.month_day = r.monthDay; delete out.monthDay }
  if ('group' in r) { out.group_type = r.group; delete out.group }
  return out
}

export function useOccasions() {
  const { rows: raw, insert, update, remove } = useSupabaseTable('occasions', {
    mapRow,
    mapInsert,
  })

  const occasions = useMemo(() => {
    return raw
      .map(o => ({ ...o, daysUntil: daysUntilNextOccurrence(o.monthDay) }))
      .sort((a, b) => a.daysUntil - b.daysUntil)
  }, [raw])

  return { occasions, add: insert, remove, update }
}
