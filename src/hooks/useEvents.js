import { useSupabaseTable } from './useSupabaseTable'

export function useEvents() {
  const { rows: events, insert, remove } = useSupabaseTable('events', {
    orderBy: 'date',
  })

  return { events, add: insert, remove }
}
