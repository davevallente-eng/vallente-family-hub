import { useCallback } from 'react'
import { useSupabaseTable } from './useSupabaseTable'
import { supabase, supabaseEnabled } from '../lib/supabase'

// Simple weekend poll on the Trips page (separate from the richer "Ask the
// family" polls). Each option is a row with an integer counter — every tap
// just increments. Realtime keeps multiple devices in sync.
export function useVotes() {
  const { rows: votes, insert, setRows } = useSupabaseTable('simple_votes', {
    orderBy: 'created_at',
  })

  const cast = useCallback(async (id) => {
    if (!supabaseEnabled) return
    const v = votes.find(x => x.id === id)
    if (!v) return
    setRows(prev => prev.map(x => (x.id === id ? { ...x, count: x.count + 1 } : x)))
    await supabase.from('simple_votes').update({ count: v.count + 1 }).eq('id', id)
  }, [votes, setRows])

  const add = useCallback((name) => {
    const trimmed = name.trim()
    if (!trimmed) return
    insert({ name: trimmed, count: 1 })
  }, [insert])

  return { votes, cast, add }
}
