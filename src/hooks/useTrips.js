import { useSupabaseTable } from './useSupabaseTable'

export function useTrips() {
  const { rows: trips, insert, update, remove } = useSupabaseTable('trips', {
    orderBy: 'created_at',
  })

  return { trips, add: insert, update, remove }
}
