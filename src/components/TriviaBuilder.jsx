import { useState } from 'react'
import { Brain, Sparkles, ChevronDown, ChevronRight } from 'lucide-react'
import { useAiChat } from '../hooks/useAiChat'
import { useShowToast } from '../context/ToastContext'
import { useLocation } from '../context/LocationContext'
import { Card, CardHeader, BtnPrimary } from './Card'

const DIFFICULTIES = ['easy', 'medium', 'hard']

// AI-powered trivia round builder for family game night. Topic + count +
// difficulty → Claude returns Q&A in a fixed format → we parse and present
// each as a collapsible card so the asker can reveal answers one at a time.
export function TriviaBuilder() {
  const [topic, setTopic] = useState('')
  const [count, setCount] = useState(8)
  const [difficulty, setDifficulty] = useState('medium')
  const [items, setItems] = useState([])
  const { ask, loading } = useAiChat()
  const show = useShowToast()
  const { currentLocation } = useLocation()

  const generate = async (e) => {
    e.preventDefault()
    if (!topic.trim()) return
    setItems([])
    const prompt = [
      `Build a trivia round for the Vallente family game night (parents + two adult kids in their 20s, currently in ${currentLocation}).`,
      ``,
      `Topic: ${topic.trim()}`,
      `Difficulty: ${difficulty}`,
      `Number of questions: ${count}`,
      ``,
      `Output format — follow this EXACTLY, one blank line between items:`,
      ``,
      `1. Q: <the question>`,
      `A: <the answer, one short line>`,
      ``,
      `2. Q: <...>`,
      `A: <...>`,
      ``,
      `Keep questions punchy, answers concise. Don't add any preamble or notes — just the numbered Q/A pairs.`,
    ].join('\n')

    try {
      const reply = await ask(prompt)
      const parsed = parseTrivia(reply).slice(0, count)
      if (parsed.length === 0) {
        show("Couldn't parse the AI reply — try again or change the topic")
        return
      }
      setItems(parsed.map(p => ({ ...p, revealed: false })))
      show(`Generated ${parsed.length} questions`)
    } catch (err) {
      show(`AI error: ${err.message}`)
    }
  }

  const toggleReveal = (i) => {
    setItems(prev => prev.map((it, idx) => (idx === i ? { ...it, revealed: !it.revealed } : it)))
  }

  return (
    <Card>
      <CardHeader title="Trivia night builder" icon={Brain} />

      <form onSubmit={generate} className="flex flex-wrap items-end gap-2 bg-[var(--color-background-secondary)] rounded-[var(--border-radius-md)] p-3 mb-3">
        <Field label="Topic" className="flex-1 min-w-[200px]">
          <input
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="e.g. 90s movies, Sonoma County, world capitals"
            required
            className={inputCls}
          />
        </Field>
        <Field label="Questions">
          <input
            type="number" min="3" max="20"
            value={count}
            onChange={e => setCount(Math.max(3, Math.min(20, Number(e.target.value) || 5)))}
            className={`${inputCls} w-[70px]`}
          />
        </Field>
        <Field label="Difficulty">
          <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className={inputCls}>
            {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </Field>
        <BtnPrimary type="submit" disabled={loading}>
          <Sparkles size={12} className="inline -mt-0.5 mr-1" />
          {loading ? 'Generating…' : items.length ? 'Regenerate' : 'Generate'}
        </BtnPrimary>
      </form>

      {items.length === 0 ? (
        <div className="text-xs text-[var(--color-text-tertiary)] py-4 text-center">
          Pick a topic and let the AI build a custom round. Great for road trips, dinner parties, or a quick night in.
        </div>
      ) : (
        <ol className="flex flex-col gap-1.5">
          {items.map((it, i) => (
            <li
              key={i}
              className="border border-white/15 rounded-[var(--border-radius-md)] p-2.5 bg-white/[0.06]"
            >
              <button
                type="button"
                onClick={() => toggleReveal(i)}
                className="w-full flex items-start gap-2 text-left cursor-pointer"
              >
                {it.revealed ? <ChevronDown size={14} className="mt-0.5 shrink-0 text-[var(--color-text-tertiary)]" /> : <ChevronRight size={14} className="mt-0.5 shrink-0 text-[var(--color-text-tertiary)]" />}
                <span className="text-[13px] text-[var(--color-text-primary)] flex-1">
                  <span className="text-[var(--color-text-tertiary)] mr-1">{i + 1}.</span>
                  {it.q}
                </span>
              </button>
              {it.revealed ? (
                <div className="mt-2 ml-5 pl-2 border-l-2 border-[var(--color-accent)] text-[13px] text-[var(--color-text-secondary)]">
                  {it.a}
                </div>
              ) : null}
            </li>
          ))}
        </ol>
      )}
    </Card>
  )
}

// Parses "1. Q: ...\nA: ..." style output. Tolerant of minor format drift
// (missing numbers, extra blank lines, "Question:" / "Answer:" variations).
function parseTrivia(text) {
  const items = []
  const lines = text.split(/\r?\n/)
  let pendingQ = null
  const qRe = /^\s*(?:\d+\s*[.):]\s*)?(?:Q(?:uestion)?)\s*[:-]\s*(.+)$/i
  const aRe = /^\s*(?:A(?:nswer)?)\s*[:-]\s*(.+)$/i
  for (const line of lines) {
    const qm = qRe.exec(line)
    if (qm) {
      pendingQ = qm[1].trim()
      continue
    }
    const am = aRe.exec(line)
    if (am && pendingQ) {
      items.push({ q: pendingQ, a: am[1].trim() })
      pendingQ = null
    }
  }
  return items
}

const inputCls =
  'px-2 py-1 border border-[var(--color-border-secondary)] rounded-[var(--border-radius-md)] text-[12px] outline-none focus:border-[var(--color-accent)] bg-white'

function Field({ label, children, className = '' }) {
  return (
    <label className={`flex flex-col gap-0.5 ${className}`}>
      <span className="text-[10px] font-medium text-[var(--color-text-tertiary)] uppercase tracking-wide">{label}</span>
      {children}
    </label>
  )
}
