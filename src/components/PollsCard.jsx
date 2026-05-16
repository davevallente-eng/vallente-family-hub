import { useState } from 'react'
import { MessagesSquare, Plus, X, Trash2 } from 'lucide-react'
import { Card, CardHeader, BtnSm, BtnPrimary } from './Card'
import { Avatar } from './Avatar'
import { FAMILY } from '../data/family'
import { usePolls } from '../hooks/usePolls'
import { useAuth } from '../context/AuthContext'
import { useShowToast } from '../context/ToastContext'

// "Ask the family" — list of active polls, plus an inline form to ask a new
// one. Each member can vote on one option per poll; tapping the same option
// again clears their vote. Avatars under each option make it visible who
// picked what.
export function PollsCard() {
  const { polls, add, remove, castVote } = usePolls()
  const { profile } = useAuth()
  const show = useShowToast()
  const [asking, setAsking] = useState(false)

  const onAdd = ({ question, options }) => {
    const id = add({ question, options, askedBy: profile?.name })
    if (id) {
      setAsking(false)
      show('Poll posted to the family')
    }
  }

  return (
    <Card>
      <CardHeader
        title="Ask the family"
        icon={MessagesSquare}
        action={
          asking ? (
            <BtnSm onClick={() => setAsking(false)}>
              <X size={12} className="inline -mt-0.5 mr-1" /> Cancel
            </BtnSm>
          ) : (
            <BtnPrimary onClick={() => setAsking(true)}>
              <Plus size={12} className="inline -mt-0.5 mr-1" /> Ask
            </BtnPrimary>
          )
        }
      />

      {asking ? <NewPollForm onAdd={onAdd} /> : null}

      {polls.length === 0 ? (
        <div className="text-xs text-[var(--color-text-tertiary)] py-4 text-center">
          No polls yet. Tap <span className="font-medium">Ask</span> to start one.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {polls.map(p => (
            <PollRow
              key={p.id}
              poll={p}
              currentName={profile?.name}
              onVote={(optionId) => castVote(p.id, optionId, profile?.name)}
              onRemove={() => remove(p.id)}
            />
          ))}
        </div>
      )}
    </Card>
  )
}

function PollRow({ poll, currentName, onVote, onRemove }) {
  const totalVotes = Object.keys(poll.votes ?? {}).length
  const myVote = poll.votes?.[currentName] ?? null

  return (
    <div className="border border-white/15 rounded-[var(--border-radius-md)] p-2.5 bg-white/[0.06]">
      <div className="flex items-start gap-2 mb-1.5">
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-medium text-[var(--color-text-primary)]">{poll.question}</div>
          <div className="text-[10px] text-[var(--color-text-tertiary)] mt-0.5 inline-flex items-center gap-1">
            {poll.askedBy ? (
              <>
                <span>Asked by</span>
                <Avatar name={poll.askedBy} size={12} />
                <span>{poll.askedBy}</span>
                <span>·</span>
              </>
            ) : null}
            <span>{totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}</span>
          </div>
        </div>
        <button
          onClick={onRemove}
          title="Delete poll"
          className="text-[var(--color-text-tertiary)] hover:text-[var(--color-danger)] cursor-pointer p-1"
        >
          <Trash2 size={12} />
        </button>
      </div>

      <div className="flex flex-col gap-1.5">
        {poll.options.map(opt => {
          const voters = FAMILY.filter(m => poll.votes?.[m.name] === opt.id).map(m => m.name)
          const count = voters.length
          const pct = totalVotes === 0 ? 0 : Math.round((count / totalVotes) * 100)
          const mine = myVote === opt.id
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onVote(opt.id)}
              disabled={!currentName}
              className={`w-full text-left rounded-[var(--border-radius-md)] border px-2.5 py-1.5 cursor-pointer relative overflow-hidden transition-colors ${
                mine
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/40'
                  : 'border-white/15 bg-black/20 hover:bg-black/30'
              }`}
            >
              <div
                className={`absolute inset-y-0 left-0 pointer-events-none ${mine ? 'bg-white/25' : 'bg-[var(--color-accent)]/25'}`}
                style={{ width: `${pct}%` }}
              />
              <div className="relative flex items-center gap-2">
                <span className={`text-[13px] flex-1 ${mine ? 'font-medium text-[var(--color-text-primary)]' : 'text-[var(--color-text-primary)]'}`}>
                  {opt.text}
                </span>
                <div className="flex items-center gap-1.5">
                  {voters.map(v => <Avatar key={v} name={v} size={14} />)}
                </div>
                <span className="text-[11px] text-[var(--color-text-tertiary)] tabular-nums w-[34px] text-right">
                  {count} {totalVotes > 0 ? `· ${pct}%` : ''}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function NewPollForm({ onAdd }) {
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', ''])

  const setOption = (i, val) => {
    setOptions(prev => prev.map((o, idx) => (idx === i ? val : o)))
  }
  const addOption = () => setOptions(prev => (prev.length < 6 ? [...prev, ''] : prev))
  const removeOption = (i) => setOptions(prev => (prev.length > 2 ? prev.filter((_, idx) => idx !== i) : prev))

  const onSubmit = (e) => {
    e.preventDefault()
    if (!question.trim() || options.filter(o => o.trim()).length < 2) return
    onAdd({ question, options })
  }

  return (
    <form onSubmit={onSubmit} className="bg-[var(--color-background-secondary)] rounded-[var(--border-radius-md)] p-3 mb-3 flex flex-col gap-2">
      <Field label="Question">
        <input
          value={question}
          onChange={e => setQuestion(e.target.value)}
          required
          placeholder="e.g. What's for dinner?"
          className={inputCls}
        />
      </Field>
      <Field label={`Options (2–6)`}>
        <div className="flex flex-col gap-1.5">
          {options.map((opt, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <input
                value={opt}
                onChange={e => setOption(i, e.target.value)}
                placeholder={`Option ${i + 1}`}
                className={`${inputCls} flex-1`}
              />
              {options.length > 2 ? (
                <button
                  type="button"
                  onClick={() => removeOption(i)}
                  title="Remove"
                  className="text-[var(--color-text-tertiary)] hover:text-[var(--color-danger)] cursor-pointer p-1"
                >
                  <X size={12} />
                </button>
              ) : null}
            </div>
          ))}
          {options.length < 6 ? (
            <button
              type="button"
              onClick={addOption}
              className="text-[11px] text-[var(--color-accent)] hover:underline cursor-pointer self-start inline-flex items-center gap-1"
            >
              <Plus size={11} /> Add option
            </button>
          ) : null}
        </div>
      </Field>
      <BtnPrimary type="submit" className="self-start">Post poll</BtnPrimary>
    </form>
  )
}

const inputCls =
  'px-2 py-1 border border-[var(--color-border-secondary)] rounded-[var(--border-radius-md)] text-[12px] outline-none focus:border-[var(--color-accent)] bg-white'

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-0.5">
      <span className="text-[10px] font-medium text-[var(--color-text-tertiary)] uppercase tracking-wide">{label}</span>
      {children}
    </label>
  )
}
