import { useCallback } from 'react'
import { useSupabaseTable } from './useSupabaseTable'

export function useDocuments() {
  const { rows: docs, insert, update, remove } = useSupabaseTable('documents', {
    orderBy: 'created_at',
    ascending: false,
  })

  const add = useCallback((doc) => insert(doc), [insert])

  return { docs, add, remove, update }
}
