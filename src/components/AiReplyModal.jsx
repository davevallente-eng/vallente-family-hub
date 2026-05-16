import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { X, Copy, Check, Sparkles } from 'lucide-react'

// Centered modal that shows an AI reply with proper markdown rendering.
// Replaces the native window.alert that the AiButton used to fire.
// Closes on backdrop click, ESC, or the Done/X buttons.
export function AiReplyModal({ open, onClose, title, reply }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  useEffect(() => {
    if (!copied) return
    const id = setTimeout(() => setCopied(false), 1500)
    return () => clearTimeout(id)
  }, [copied])

  if (!open) return null

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(reply ?? '')
      setCopied(true)
    } catch {
      // ignore (older browsers / non-secure context)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[85vh] bg-black/90 backdrop-blur-md border border-white/15 rounded-[var(--border-radius-lg)] shadow-xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 shrink-0">
          <div className="inline-flex items-center gap-2 text-[14px] font-semibold text-[var(--color-text-primary)] min-w-0">
            <Sparkles size={14} className="text-[var(--color-accent)] shrink-0" />
            <span className="truncate">{title}</span>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] cursor-pointer p-1"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-5 py-4 overflow-y-auto text-[13px] text-[var(--color-text-secondary)] leading-relaxed">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: (props) => <p className="mb-3 last:mb-0" {...props} />,
              strong: (props) => <strong className="font-semibold text-[var(--color-text-primary)]" {...props} />,
              em: (props) => <em className="italic" {...props} />,
              ul: (props) => <ul className="list-disc pl-5 mb-3 space-y-1 marker:text-[var(--color-text-tertiary)]" {...props} />,
              ol: (props) => <ol className="list-decimal pl-5 mb-3 space-y-1 marker:text-[var(--color-text-tertiary)]" {...props} />,
              li: (props) => <li className="leading-relaxed" {...props} />,
              h1: (props) => <h1 className="text-[15px] font-semibold text-[var(--color-text-primary)] mt-4 mb-2 first:mt-0" {...props} />,
              h2: (props) => <h2 className="text-[14px] font-semibold text-[var(--color-text-primary)] mt-4 mb-2 first:mt-0" {...props} />,
              h3: (props) => <h3 className="text-[13px] font-semibold text-[var(--color-text-primary)] mt-3 mb-1 first:mt-0" {...props} />,
              a: (props) => <a className="text-[var(--color-accent)] hover:underline" target="_blank" rel="noreferrer" {...props} />,
              hr: () => <hr className="border-white/10 my-3" />,
              blockquote: (props) => <blockquote className="border-l-2 border-[var(--color-accent)] pl-3 italic my-3 text-[var(--color-text-tertiary)]" {...props} />,
              code: ({ inline, ...props }) => inline
                ? <code className="bg-white/[0.08] px-1 py-0.5 rounded text-[12px] font-mono" {...props} />
                : <code className="block bg-white/[0.08] px-3 py-2 rounded text-[12px] font-mono overflow-x-auto" {...props} />,
            }}
          >
            {reply ?? ''}
          </ReactMarkdown>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-white/10 shrink-0">
          <button
            type="button"
            onClick={copy}
            className="text-[11px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] inline-flex items-center gap-1 cursor-pointer"
          >
            {copied ? <Check size={12} className="text-[var(--color-success)]" /> : <Copy size={12} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bg-[var(--color-accent)] text-white rounded-[var(--border-radius-md)] px-3 py-1 text-xs cursor-pointer hover:bg-[var(--color-accent-strong)]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
