import { useState } from 'react'
import { Cake, Heart, Gift, PartyPopper, Plus, X, Check, Lock, Trash2 } from 'lucide-react'
import { Card, CardHeader, BtnSm, BtnPrimary } from '../components/Card'
import { Avatar } from '../components/Avatar'
import { FAMILY } from '../data/family'
import { useOccasions } from '../hooks/useOccasions'
import { useWishlist } from '../hooks/useWishlist'
import { useAuth } from '../context/AuthContext'
import { useShowToast } from '../context/ToastContext'
import { fmtMonthDayOnly, nextMilestone } from '../lib/date'

export function Celebrations() {
  const { profile } = useAuth()
  const currentName = profile?.name

  return (
    <div className="flex flex-col gap-4">
      <CountdownCard />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MyWishlistCard currentName={currentName} />
        <SharedWithMeCard currentName={currentName} />
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────────────
// Countdown
// ──────────────────────────────────────────────────────────────────────────

function CountdownCard() {
  const { occasions, add, remove } = useOccasions()
  const [adding, setAdding] = useState(false)

  return (
    <Card>
      <CardHeader
        title="Birthdays & anniversaries"
        icon={PartyPopper}
        action={
          adding ? (
            <BtnSm onClick={() => setAdding(false)}>
              <X size={12} className="inline -mt-0.5 mr-1" /> Cancel
            </BtnSm>
          ) : (
            <BtnPrimary onClick={() => setAdding(true)}>
              <Plus size={12} className="inline -mt-0.5 mr-1" /> Add
            </BtnPrimary>
          )
        }
      />

      {adding ? <AddOccasionForm onAdd={(o) => { add(o); setAdding(false) }} /> : null}

      <div>
        {occasions.length === 0 ? (
          <div className="text-xs text-[var(--color-text-tertiary)] py-4 text-center">
            No occasions yet. Add a birthday or anniversary to start the countdown.
          </div>
        ) : occasions.map(o => <OccasionRow key={o.id} occasion={o} onRemove={() => remove(o.id)} />)}
      </div>
    </Card>
  )
}

function OccasionRow({ occasion, onRemove }) {
  const Icon = occasion.type === 'anniversary' ? Heart : Cake
  const iconColor = occasion.type === 'anniversary' ? '#D4537E' : '#BA7517'
  const milestone = nextMilestone(occasion.monthDay, occasion.year)
  const days = occasion.daysUntil

  const milestoneLabel = milestone
    ? occasion.type === 'anniversary'
      ? `${milestone}${ordinalSuffix(milestone)} anniversary`
      : `turning ${milestone}`
    : null

  const daysLabel =
    days === 0 ? 'Today 🎉' :
    days === 1 ? 'Tomorrow' :
    days < 30 ? `in ${days} days` :
    `in ${days} days`

  const isSoon = days <= 14

  return (
    <div className="flex items-center gap-4 py-2 bg-black/25 rounded-md px-2 mb-1 last:mb-0">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#F5F3EC' }}>
        <Icon size={16} style={{ color: iconColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-[var(--color-text-primary)] truncate">{occasion.name}</span>
          {occasion.relation ? (
            <span className="text-[10px] text-[var(--color-text-tertiary)]">· {occasion.relation}</span>
          ) : null}
          {occasion.group === 'extended' ? (
            <span className="text-[10px] px-1.5 py-px rounded-full" style={{ background: '#F5F3EC', color: '#5C5B57' }}>extended</span>
          ) : null}
        </div>
        <div className="text-[11px] text-[var(--color-text-tertiary)]">
          {fmtMonthDayOnly(occasion.monthDay)}
          {milestoneLabel ? ` · ${milestoneLabel}` : ''}
        </div>
      </div>
      <div className={`text-[12px] font-medium ${isSoon ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-secondary)]'}`}>
        {daysLabel}
      </div>
      <button
        onClick={onRemove}
        title="Delete"
        className="text-[var(--color-text-tertiary)] hover:text-[var(--color-danger)] cursor-pointer p-1"
      >
        <Trash2 size={13} />
      </button>
    </div>
  )
}

function AddOccasionForm({ onAdd }) {
  const [name, setName] = useState('')
  const [type, setType] = useState('birthday')
  const [month, setMonth] = useState('')
  const [day, setDay] = useState('')
  const [year, setYear] = useState('')
  const [relation, setRelation] = useState('')
  const [group, setGroup] = useState('family')

  const onSubmit = (e) => {
    e.preventDefault()
    if (!name.trim() || !month || !day) return
    const mm = String(month).padStart(2, '0')
    const dd = String(day).padStart(2, '0')
    onAdd({
      name: name.trim(),
      type,
      monthDay: `${mm}-${dd}`,
      year: year ? Number(year) : undefined,
      relation: relation.trim() || undefined,
      group,
    })
  }

  return (
    <form onSubmit={onSubmit} className="bg-[var(--color-background-secondary)] rounded-[var(--border-radius-md)] p-3 mb-3 flex flex-wrap items-end gap-2">
      <Field label="Name" className="flex-1 min-w-[140px]">
        <input value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Grandma Sue" className={inputCls} />
      </Field>
      <Field label="Type">
        <select value={type} onChange={e => setType(e.target.value)} className={inputCls}>
          <option value="birthday">Birthday</option>
          <option value="anniversary">Anniversary</option>
        </select>
      </Field>
      <Field label="Month">
        <input type="number" min="1" max="12" value={month} onChange={e => setMonth(e.target.value)} required placeholder="MM" className={`${inputCls} w-[60px]`} />
      </Field>
      <Field label="Day">
        <input type="number" min="1" max="31" value={day} onChange={e => setDay(e.target.value)} required placeholder="DD" className={`${inputCls} w-[60px]`} />
      </Field>
      <Field label="Year (optional)">
        <input type="number" min="1900" max="2100" value={year} onChange={e => setYear(e.target.value)} placeholder="YYYY" className={`${inputCls} w-[80px]`} />
      </Field>
      <Field label="Relation (optional)">
        <input value={relation} onChange={e => setRelation(e.target.value)} placeholder="e.g. Aunt" className={`${inputCls} w-[120px]`} />
      </Field>
      <Field label="Group">
        <select value={group} onChange={e => setGroup(e.target.value)} className={inputCls}>
          <option value="family">Immediate family</option>
          <option value="extended">Extended / friends</option>
        </select>
      </Field>
      <BtnPrimary type="submit">Add occasion</BtnPrimary>
    </form>
  )
}

function ordinalSuffix(n) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return s[(v - 20) % 10] || s[v] || s[0]
}

// ──────────────────────────────────────────────────────────────────────────
// My wishlist
// ──────────────────────────────────────────────────────────────────────────

function MyWishlistCard({ currentName }) {
  const { myList, add, remove } = useWishlist(currentName)
  const [adding, setAdding] = useState(false)

  if (!currentName) {
    return (
      <Card>
        <CardHeader title="My wishlist" icon={Gift} />
        <div className="text-xs text-[var(--color-text-tertiary)] py-2">Sign in to manage a wishlist.</div>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader
        title={`My wishlist (${currentName})`}
        icon={Gift}
        action={
          adding ? (
            <BtnSm onClick={() => setAdding(false)}><X size={12} className="inline -mt-0.5 mr-1" /> Cancel</BtnSm>
          ) : (
            <BtnPrimary onClick={() => setAdding(true)}><Plus size={12} className="inline -mt-0.5 mr-1" /> Add item</BtnPrimary>
          )
        }
      />

      <div className="text-[11px] text-[var(--color-text-tertiary)] mb-2 inline-flex items-center gap-1">
        <Lock size={11} /> Owner view — claim status is hidden so surprises stay surprises.
      </div>

      {adding ? (
        <AddWishlistForm
          currentName={currentName}
          onAdd={(item) => { add({ ...item, owner: currentName }); setAdding(false) }}
        />
      ) : null}

      <div>
        {myList.length === 0 ? (
          <div className="text-xs text-[var(--color-text-tertiary)] py-4 text-center">
            Nothing on your list yet. Add something you'd love to receive.
          </div>
        ) : myList.map(item => (
          <MyWishlistRow key={item.id} item={item} onRemove={() => remove(item.id)} />
        ))}
      </div>
    </Card>
  )
}

function MyWishlistRow({ item, onRemove }) {
  return (
    <div className="py-2 bg-black/25 rounded-md px-2 mb-1 last:mb-0">
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-medium text-[var(--color-text-primary)]">{item.name}</div>
          {item.notes ? <div className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">{item.notes}</div> : null}
          {item.url ? (
            <a href={item.url} target="_blank" rel="noreferrer" className="text-[11px] text-[var(--color-accent)] hover:underline mt-0.5 inline-block">
              {prettyHost(item.url)}
            </a>
          ) : null}
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[10px] text-[var(--color-text-tertiary)]">Visible to:</span>
            {(item.shareWith ?? []).length === 0 ? (
              <span className="text-[10px] text-[var(--color-text-tertiary)] italic">no one yet</span>
            ) : (
              (item.shareWith ?? []).map(n => <Avatar key={n} name={n} size={14} />)
            )}
          </div>
        </div>
        <button
          onClick={onRemove}
          title="Delete"
          className="text-[var(--color-text-tertiary)] hover:text-[var(--color-danger)] cursor-pointer p-1"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}

function AddWishlistForm({ currentName, onAdd }) {
  const [name, setName] = useState('')
  const [notes, setNotes] = useState('')
  const [url, setUrl] = useState('')
  const others = FAMILY.filter(m => m.name !== currentName).map(m => m.name)
  const [shareWith, setShareWith] = useState(others)

  const toggle = (n) => {
    setShareWith(prev => (prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n]))
  }

  const onSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    onAdd({
      name: name.trim(),
      notes: notes.trim(),
      url: url.trim(),
      shareWith,
    })
    setName(''); setNotes(''); setUrl('')
  }

  return (
    <form onSubmit={onSubmit} className="bg-[var(--color-background-secondary)] rounded-[var(--border-radius-md)] p-3 mb-3 flex flex-col gap-2">
      <Field label="Item">
        <input value={name} onChange={e => setName(e.target.value)} required placeholder="What would you love to get?" className={inputCls} />
      </Field>
      <Field label="Notes (optional)">
        <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Size, color, brand, etc." className={inputCls} />
      </Field>
      <Field label="Link (optional)">
        <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://…" className={inputCls} />
      </Field>
      <Field label="Share with">
        <div className="flex gap-1.5 flex-wrap">
          {others.map(n => {
            const on = shareWith.includes(n)
            return (
              <button
                key={n}
                type="button"
                onClick={() => toggle(n)}
                className={`px-2 py-1 rounded-full text-[11px] border cursor-pointer inline-flex items-center gap-1 ${
                  on
                    ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]'
                    : 'bg-transparent text-[var(--color-text-secondary)] border-[var(--color-border-secondary)]'
                }`}
              >
                <Avatar name={n} size={14} />
                <span>{n}</span>
                {on ? <Check size={11} /> : null}
              </button>
            )
          })}
        </div>
      </Field>
      <BtnPrimary type="submit" className="self-start">Add to wishlist</BtnPrimary>
    </form>
  )
}

// ──────────────────────────────────────────────────────────────────────────
// Shared with me
// ──────────────────────────────────────────────────────────────────────────

function SharedWithMeCard({ currentName }) {
  const { sharedWithMe, claim } = useWishlist(currentName)
  const show = useShowToast()
  const owners = Object.keys(sharedWithMe)

  return (
    <Card>
      <CardHeader title="Shared with me" icon={Gift} />
      <div className="text-[11px] text-[var(--color-text-tertiary)] mb-2">
        Tap "Claim" on something you're getting for someone — others will see it's taken so no doubles.
      </div>
      {!currentName ? (
        <div className="text-xs text-[var(--color-text-tertiary)] py-2">Sign in to see shared wishlists.</div>
      ) : owners.length === 0 ? (
        <div className="text-xs text-[var(--color-text-tertiary)] py-4 text-center">
          No one has shared a wishlist with you yet.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {owners.map(owner => (
            <div key={owner}>
              <div className="flex items-center gap-2 mb-1.5">
                <Avatar name={owner} size={22} />
                <span className="text-[13px] font-medium text-[var(--color-text-primary)]">{owner}'s wishlist</span>
              </div>
              <div className="pl-1">
                {sharedWithMe[owner].map(item => (
                  <SharedItemRow
                    key={item.id}
                    item={item}
                    currentName={currentName}
                    onClaim={() => { claim(item.id, currentName); show(`Claimed for ${owner}`) }}
                    onUnclaim={() => { claim(item.id, null); show('Unclaimed') }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

function SharedItemRow({ item, currentName, onClaim, onUnclaim }) {
  const claimed = Boolean(item.claimedBy)
  const claimedByMe = item.claimedBy === currentName

  return (
    <div className={`flex items-start gap-2 py-1.5 bg-black/25 rounded-md px-2 mb-1 last:mb-0 ${claimed && !claimedByMe ? 'opacity-50' : ''}`}>
      <div className="flex-1 min-w-0">
        <div className={`text-[13px] ${claimed ? 'text-[var(--color-text-tertiary)]' : 'text-[var(--color-text-primary)]'}`}>
          {item.name}
        </div>
        {item.notes ? <div className="text-[11px] text-[var(--color-text-tertiary)]">{item.notes}</div> : null}
        {item.url ? (
          <a href={item.url} target="_blank" rel="noreferrer" className="text-[11px] text-[var(--color-accent)] hover:underline">
            {prettyHost(item.url)}
          </a>
        ) : null}
        {claimed ? (
          <div className="text-[10px] text-[var(--color-text-tertiary)] mt-0.5">
            {claimedByMe ? 'Claimed by you' : `Claimed by ${item.claimedBy}`}
          </div>
        ) : null}
      </div>
      {claimed ? (
        claimedByMe ? (
          <BtnSm onClick={onUnclaim}>Unclaim</BtnSm>
        ) : null
      ) : (
        <BtnSm onClick={onClaim}>Claim</BtnSm>
      )}
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────────────
// Tiny shared form helpers
// ──────────────────────────────────────────────────────────────────────────

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

function prettyHost(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}
