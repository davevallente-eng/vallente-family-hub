import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { useAiChat } from '../hooks/useAiChat'
import { useShowToast } from '../context/ToastContext'
import { AiReplyModal } from './AiReplyModal'

// Reusable "AI suggest" / "AI pick" button. The prototype scatters
// sendPrompt(...) all over — this is the React equivalent. The AI reply
// renders into a centered markdown modal so bold / lists / headings look
// proper instead of literal asterisks in a native alert().
export function AiButton({ label, prompt, variant = 'primary', className = '', modalTitle }) {
  const { ask, loading } = useAiChat()
  const show = useShowToast()
  const [reply, setReply] = useState(null)

  const baseClasses =
    variant === 'primary'
      ? 'bg-[var(--color-accent)] text-white border-0 hover:bg-[var(--color-accent-strong)]'
      : 'bg-transparent border border-[var(--color-border-secondary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-background-secondary)]'

  const onClick = async () => {
    show('Asking the AI…')
    try {
      const result = await ask(prompt)
      if (result) {
        setReply(result)
      } else {
        show('No reply')
      }
    } catch (err) {
      show(`AI error: ${err.message}`)
    }
  }

  // Use the button label as the modal title (stripped of trailing arrows).
  const cleanTitle = modalTitle ?? (label ?? 'AI suggestion').replace(/[→↑↓←]\s*$/, '').trim()

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className={`${baseClasses} rounded-[var(--border-radius-md)] px-3 py-[5px] text-xs cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
      >
        <Sparkles size={12} />
        <span>{loading ? 'Thinking…' : label}</span>
      </button>
      <AiReplyModal
        open={Boolean(reply)}
        onClose={() => setReply(null)}
        title={cleanTitle}
        reply={reply ?? ''}
      />
    </>
  )
}
