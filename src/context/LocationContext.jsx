import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { HOME_LOCATION } from '../data/family'

const LocationContext = createContext(null)

const KEY = 'hub.currentLocation'

// Home stays anchored on Fairfield, CA. Current location is settable per
// device (localStorage). When the family travels, set the current location
// and the Explore page + AI prompts start pulling for that area instead.
//
// Per-device on purpose: my phone in Tahoe shouldn't change what Krista's
// laptop sees if she's still at home.
export function LocationProvider({ children }) {
  const [currentLocation, setLoc] = useState(() => {
    if (typeof window === 'undefined') return HOME_LOCATION
    try {
      const stored = window.localStorage.getItem(KEY)
      return (stored && stored.trim()) ? stored : HOME_LOCATION
    } catch {
      return HOME_LOCATION
    }
  })

  // Persist on every change.
  useEffect(() => {
    try { window.localStorage.setItem(KEY, currentLocation) } catch { /* ignore */ }
  }, [currentLocation])

  const setCurrentLocation = useCallback((loc) => {
    const cleaned = (loc ?? '').trim()
    setLoc(cleaned || HOME_LOCATION)
  }, [])

  const resetToHome = useCallback(() => setLoc(HOME_LOCATION), [])

  const isAway = currentLocation.trim().toLowerCase() !== HOME_LOCATION.trim().toLowerCase()

  return (
    <LocationContext.Provider
      value={{
        currentLocation,
        homeLocation: HOME_LOCATION,
        setCurrentLocation,
        resetToHome,
        isAway,
      }}
    >
      {children}
    </LocationContext.Provider>
  )
}

export function useLocation() {
  const ctx = useContext(LocationContext)
  if (!ctx) throw new Error('useLocation must be inside <LocationProvider>')
  return ctx
}
