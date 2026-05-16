import { useEffect, useRef, useState } from 'react'
import { Sun, MapPin, Home, X } from 'lucide-react'
import { useLocation } from '../context/LocationContext'

// Clickable weather/location pill in the top nav. Tapping opens a popover
// where the user can type a new "current location" (e.g. when traveling)
// or reset to home. Anything that's location-aware downstream — Explore
// page, AI prompts — reads from useLocation() and stays in sync.
export function LocationPicker() {
  const { currentLocation, homeLocation, setCurrentLocation, resetToHome, isAway } = useLocation()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(currentLocation)
  const wrapRef = useRef(null)

  // Close on outside click.
  useEffect(() => {
    if (!open) return
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    window.addEventListener('mousedown', onClick)
    return () => window.removeEventListener('mousedown', onClick)
  }, [open])

  const onSave = (e) => {
    e.preventDefault()
    setCurrentLocation(draft)
    setOpen(false)
  }

  const onOpen = () => {
    setDraft(currentLocation)
    setOpen(true)
  }

  const displayCity = currentLocation.split(',')[0]

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : onOpen())}
        className="hidden lg:flex items-center gap-1.5 bg-white/[0.08] border border-white/15 rounded-full px-3 py-1 text-xs text-[var(--color-text-secondary)] whitespace-nowrap hover:bg-white/[0.15] cursor-pointer"
        title={isAway ? `Current: ${currentLocation} (home: ${homeLocation})` : `At home in ${homeLocation}`}
      >
        {isAway ? (
          <MapPin size={14} className="text-[var(--color-accent)]" />
        ) : (
          <Sun size={14} className="text-[var(--color-warning)]" />
        )}
        <span>72° {displayCity}</span>
        {isAway ? <span className="text-[10px] text-[var(--color-text-tertiary)]">· away</span> : null}
      </button>

      {open ? (
        <div className="absolute top-full right-0 mt-2 w-72 bg-black/85 backdrop-blur-md border border-white/15 rounded-[var(--border-radius-md)] p-3 shadow-xl z-30">
          <form onSubmit={onSave} className="flex flex-col gap-2">
            <label className="text-[10px] font-medium text-[var(--color-text-tertiary)] uppercase tracking-wide">
              Where are you now?
            </label>
            <input
              autoFocus
              value={draft}
              onChange={e => setDraft(e.target.value)}
              placeholder="e.g. Tahoe, CA"
              className="px-2 py-1.5 border border-white/30 bg-white rounded-[var(--border-radius-md)] text-[13px] outline-none focus:border-[var(--color-accent)]"
            />
            <div className="flex items-center gap-2 mt-1">
              <button
                type="submit"
                className="bg-[var(--color-accent)] text-white rounded-[var(--border-radius-md)] px-3 py-1 text-xs cursor-pointer hover:bg-[var(--color-accent-strong)]"
              >
                Save
              </button>
              {isAway ? (
                <button
                  type="button"
                  onClick={() => { resetToHome(); setOpen(false) }}
                  className="inline-flex items-center gap-1 text-[11px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] cursor-pointer"
                >
                  <Home size={11} /> Reset to home ({homeLocation.split(',')[0]})
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="ml-auto text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] cursor-pointer"
                aria-label="Close"
              >
                <X size={14} />
              </button>
            </div>
            <div className="text-[10px] text-[var(--color-text-tertiary)] mt-1">
              Home: <span className="text-[var(--color-text-secondary)]">{homeLocation}</span>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  )
}
