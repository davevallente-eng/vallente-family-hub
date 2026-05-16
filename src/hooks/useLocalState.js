import { useEffect, useRef, useState } from 'react'

// Tiny useState replacement that persists to localStorage under a stable key.
// Local-first mode for the Hub — when Supabase is wired up later, the same
// shape (state + setter) means consumers don't have to change.
export function useLocalState(key, initial) {
  const [value, setValue] = useState(() => {
    if (typeof window === 'undefined') return initial
    try {
      const raw = window.localStorage.getItem(key)
      if (raw == null) return initial
      return JSON.parse(raw)
    } catch {
      return initial
    }
  })

  const firstRun = useRef(true)
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false
      return
    }
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Quota exceeded / private mode — silently ignore. Data is still in memory.
    }
  }, [key, value])

  return [value, setValue]
}
