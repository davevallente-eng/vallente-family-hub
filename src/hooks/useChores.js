import { useCallback, useMemo } from 'react'
import { useSupabaseTable } from './useSupabaseTable'
import { supabase, supabaseEnabled } from '../lib/supabase'
import { FAMILY } from '../data/family'

export function useChores() {
  const { rows: chores, update, setRows } = useSupabaseTable('chores')

  const toggle = useCallback((id) => {
    const c = chores.find(x => x.id === id)
    if (c) update(id, { done: !c.done })
  }, [chores, update])

  const resetWeek = useCallback(async () => {
    if (!supabaseEnabled) return
    setRows(prev => prev.map(c => ({ ...c, done: false })))
    await supabase.from('chores').update({ done: false }).eq('done', true)
  }, [setRows])

  const points = useMemo(() => {
    const out = Object.fromEntries(FAMILY.map(m => [m.name, 0]))
    for (const c of chores) if (c.done) out[c.who] = (out[c.who] ?? 0) + c.pts
    return out
  }, [chores])

  const donePct = useMemo(() => {
    if (!chores.length) return 0
    return Math.round(chores.filter(c => c.done).length / chores.length * 100)
  }, [chores])

  return { chores, toggle, resetWeek, points, donePct }
}
