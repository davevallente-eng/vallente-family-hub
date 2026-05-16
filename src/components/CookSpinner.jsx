import { useRef, useState } from 'react'
import { Shuffle } from 'lucide-react'
import { FAMILY } from '../data/family'
import { Avatar } from './Avatar'
import { BtnPrimary } from './Card'

// "Who's cooking tonight?" — randomly cycles through the four family members
// for ~1.4s and lands on a pick. Plain visual animation, no real randomness
// magic. Cycling makes the result feel earned vs. just printing a name.
export function CookSpinner() {
  const [picked, setPicked] = useState(null)
  const [spinning, setSpinning] = useState(false)
  const [previewName, setPreviewName] = useState(null)
  const tickRef = useRef(null)

  const spin = () => {
    if (spinning) return
    setSpinning(true)
    setPicked(null)

    const start = performance.now()
    const duration = 1400
    let lastTick = 0
    let intervalMs = 70 // accelerates: starts fast, slows down

    const step = (now) => {
      const elapsed = now - start
      const t = elapsed / duration
      // Ease-out: longer interval as we approach the end
      intervalMs = 50 + t * 220

      if (now - lastTick >= intervalMs) {
        lastTick = now
        const next = FAMILY[Math.floor(Math.random() * FAMILY.length)]
        setPreviewName(next.name)
      }

      if (elapsed < duration) {
        tickRef.current = requestAnimationFrame(step)
      } else {
        const final = FAMILY[Math.floor(Math.random() * FAMILY.length)]
        setPreviewName(final.name)
        setPicked(final.name)
        setSpinning(false)
      }
    }

    tickRef.current = requestAnimationFrame(step)
  }

  const displayName = picked ?? previewName

  return (
    <div className="bg-[var(--color-background-secondary)] rounded-[var(--border-radius-md)] p-3 mb-3 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-medium text-[var(--color-text-tertiary)] uppercase tracking-wide">Who's cooking tonight?</div>
        {displayName ? (
          <div className={`mt-1 inline-flex items-center gap-2 ${spinning ? 'opacity-80' : ''}`}>
            <Avatar name={displayName} size={26} />
            <span className="text-[15px] font-medium text-[var(--color-text-primary)]">{displayName}</span>
            {!spinning && picked ? <span className="text-[13px]">🍳</span> : null}
          </div>
        ) : (
          <div className="text-[13px] text-[var(--color-text-secondary)] mt-1">
            Can't decide? Let the spinner pick.
          </div>
        )}
      </div>
      <BtnPrimary onClick={spin} disabled={spinning}>
        <Shuffle size={12} className="inline -mt-0.5 mr-1" />
        {spinning ? 'Spinning…' : picked ? 'Spin again' : 'Spin'}
      </BtnPrimary>
    </div>
  )
}
