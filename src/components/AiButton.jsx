import { Sparkles } from 'lucide-react'
import { useAiChat } from '../hooks/useAiChat'
import { useShowToast } from '../context/ToastContext'

// Reusable "AI suggest" / "AI pick" button. The prototype scatters
// sendPrompt(...) all over — this is the React equivalent. Pops up the result
// as an alert for now; later this can open a modal/drawer.
export function AiButton({ label, prompt, variant = 'primary', className = '' }) {
  const { ask, loading } = useAiChat()
  const show = useShowToast()

  const baseClasses =
    variant === 'primary'
      ? 'bg-[var(--color-accent)] text-white border-0 hover:bg-[var(--color-accent-strong)]'
      : 'bg-transparent border border-[var(--color-border-secondary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-background-secondary)]'

  const onClick = async () => {
    show('Asking the AI…')
    try {
      const reply = await ask(prompt)
      if (reply) {
        // Quick MVP: surface the reply in a window.alert so the family can read
        // the full text. Swap for a modal/drawer once we know the desired UX.
        window.alert(reply)
      } else {
        show('No reply')
      }
    } catch (err) {
      show(`AI error: ${err.message}`)
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={`${baseClasses} rounded-[var(--border-radius-md)] px-3 py-[5px] text-xs cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
    >
      <Sparkles size={12} />
      <span>{loading ? 'Thinking…' : label}</span>
    </button>
  )
}
