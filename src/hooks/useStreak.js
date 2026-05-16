import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase, supabaseEnabled } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { FAMILY } from '../data/family'

const isoDay = (d) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const todayKey = () => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return isoDay(d)
}

// Walks back from today day-by-day, counting consecutive days where every
// family member was present. Today is allowed to be incomplete without
// breaking the streak (it's still ticking). We stop on the first day in the
// past that's missing someone.
function computeStreak(log, family) {
  const todayStr = todayKey()
  let count = 0
  const cur = new Date()
  cur.setHours(0, 0, 0, 0)
  while (true) {
    const key = isoDay(cur)
    const present = log[key] ?? []
    const allHere = family.every(m => present.includes(m.name))
    if (allHere) {
      count++
    } else if (key !== todayStr) {
      break
    }
    cur.setDate(cur.getDate() - 1)
    if (count > 1000) break
  }
  return count
}

export function useStreak(currentName) {
  const { profile } = useAuth()
  const [log, setLog] = useState({})

  useEffect(() => {
    if (!supabaseEnabled || !profile) return
    let cancelled = false

    const doFetch = async () => {
      // Pull the last 60 days — plenty to compute current streak.
      const sinceDate = new Date()
      sinceDate.setDate(sinceDate.getDate() - 60)
      const { data } = await supabase
        .from('streak_checkins')
        .select('*')
        .gte('date', isoDay(sinceDate))
      if (cancelled) return
      const next = {}
      for (const row of data ?? []) {
        next[row.date] = next[row.date] ?? []
        next[row.date].push(row.member_name)
      }
      setLog(next)
    }

    doFetch()

    const channel = supabase
      .channel('db-streak')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'streak_checkins' }, doFetch)
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [profile])

  const checkInToday = useCallback(async () => {
    if (!supabaseEnabled || !currentName) return
    const today = todayKey()
    // Optimistic local update — realtime will confirm.
    setLog(prev => {
      const todays = prev[today] ?? []
      if (todays.includes(currentName)) return prev
      return { ...prev, [today]: [...todays, currentName] }
    })
    // Upsert is idempotent via the (date, member_name) primary key.
    await supabase
      .from('streak_checkins')
      .upsert({ date: today, member_name: currentName }, { onConflict: 'date,member_name' })
  }, [currentName])

  const todayList = log[todayKey()] ?? []
  const checkedInToday = currentName ? todayList.includes(currentName) : false
  const missingToday = FAMILY.filter(m => !todayList.includes(m.name)).map(m => m.name)
  const streak = useMemo(() => computeStreak(log, FAMILY), [log])

  return { streak, checkedInToday, missingToday, checkInToday, todayList }
}
