import { useCallback, useEffect, useState } from 'react'
import { supabase, supabaseEnabled } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const IDENTITY = (r) => r

// Generic Supabase table sync hook used by most domain hooks.
//
//   - Initial fetch on mount (after the user has a claimed profile)
//   - Postgres realtime subscription so changes from other devices appear
//     without polling — mutations rely on realtime to refresh state
//   - Optimistic local insert/update/remove for instant UI feedback
//   - `mapRow` / `mapInsert` let callers convert DB snake_case ↔ JS camelCase
//
// Pre-Supabase, rows stay empty and mutations no-op so the UI doesn't crash.
export function useSupabaseTable(table, opts = {}) {
  const {
    orderBy = 'id',
    ascending = true,
    mapRow = IDENTITY,
    mapInsert = IDENTITY,
    select = '*',
  } = opts

  const { profile } = useAuth()
  const [rows, setRows] = useState([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!supabaseEnabled || !profile) return
    let cancelled = false

    const doFetch = async () => {
      const { data, error } = await supabase
        .from(table)
        .select(select)
        .order(orderBy, { ascending })
      if (cancelled) return
      if (error) {
        console.error(`[useSupabaseTable:${table}] fetch error`, error)
        return
      }
      setRows((data ?? []).map(r => mapRow(r)))
      setLoaded(true)
    }

    doFetch()

    const channel = supabase
      .channel(`db-${table}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, doFetch)
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [table, profile, orderBy, ascending, select, mapRow])

  const insert = useCallback(async (row) => {
    if (!supabaseEnabled) return null
    const payload = mapInsert(row)
    const { data, error } = await supabase.from(table).insert(payload).select().single()
    if (error) {
      console.error(`[useSupabaseTable:${table}] insert error`, error)
      return null
    }
    const mapped = mapRow(data)
    // Append locally for instant feedback. The realtime subscription will
    // also fire and re-fetch; the eventually-consistent state matches.
    setRows(prev => [...prev, mapped])
    return mapped
  }, [table, mapRow, mapInsert])

  const update = useCallback(async (id, patch) => {
    if (!supabaseEnabled) return
    setRows(prev => prev.map(r => (r.id === id ? { ...r, ...patch } : r)))
    const dbPatch = mapInsert(patch)
    const { error } = await supabase.from(table).update(dbPatch).eq('id', id)
    if (error) console.error(`[useSupabaseTable:${table}] update error`, error)
  }, [table, mapInsert])

  const remove = useCallback(async (id) => {
    if (!supabaseEnabled) return
    setRows(prev => prev.filter(r => r.id !== id))
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (error) console.error(`[useSupabaseTable:${table}] delete error`, error)
  }, [table])

  return { rows, loaded, insert, update, remove, setRows }
}
