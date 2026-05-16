import { useCallback } from 'react'
import { useSupabaseTable } from './useSupabaseTable'

export function useGroceries() {
  const { rows: items, insert, update, remove } = useSupabaseTable('groceries')

  const toggle = useCallback((id) => {
    const g = items.find(x => x.id === id)
    if (g) update(id, { done: !g.done })
  }, [items, update])

  const add = useCallback((name, cat = 'Other') => {
    const trimmed = name.trim()
    if (!trimmed) return
    insert({ name: trimmed, cat, done: false })
  }, [insert])

  return { items, toggle, add, remove }
}
