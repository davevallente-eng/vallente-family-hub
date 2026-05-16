import { useMemo, useState } from 'react'
import { FileText, Plus, X, ExternalLink, Trash2, ShieldAlert } from 'lucide-react'
import { Card, CardHeader, BtnSm, BtnPrimary } from '../components/Card'
import { Avatar } from '../components/Avatar'
import { FAMILY } from '../data/family'
import { DOCUMENT_CATEGORIES } from '../data/seed'
import { useDocuments } from '../hooks/useDocuments'
import { useShowToast } from '../context/ToastContext'

const FILTERS = ['All', ...DOCUMENT_CATEGORIES]

const CATEGORY_COLOR = {
  Insurance: { bg: '#E6F1FB', txt: '#0C447C' },
  ID:        { bg: '#FBEAF0', txt: '#72243E' },
  Vehicle:   { bg: '#FAEEDA', txt: '#633806' },
  Medical:   { bg: '#FAECE7', txt: '#712B13' },
  Financial: { bg: '#EAF3DE', txt: '#27500A' },
  Legal:     { bg: '#E1F5EE', txt: '#085041' },
  Other:     { bg: '#F1EFE8', txt: '#5C5B57' },
}

const OWNER_OPTIONS = ['Family', ...FAMILY.map(m => m.name)]

export function Documents() {
  const { docs, add, remove } = useDocuments()
  const [filter, setFilter] = useState('All')
  const [adding, setAdding] = useState(false)
  const show = useShowToast()

  const filtered = useMemo(() => {
    const list = filter === 'All' ? docs : docs.filter(d => d.category === filter)
    return [...list].sort((a, b) => a.name.localeCompare(b.name))
  }, [docs, filter])

  return (
    <Card>
      <CardHeader
        title="Document vault"
        icon={FileText}
        action={
          adding ? (
            <BtnSm onClick={() => setAdding(false)}><X size={12} className="inline -mt-0.5 mr-1" /> Cancel</BtnSm>
          ) : (
            <BtnPrimary onClick={() => setAdding(true)}><Plus size={12} className="inline -mt-0.5 mr-1" /> Add document</BtnPrimary>
          )
        }
      />

      <div className="flex items-start gap-2 bg-[var(--color-background-secondary)] rounded-[var(--border-radius-md)] p-2.5 mb-3">
        <ShieldAlert size={14} className="text-[var(--color-warning)] mt-0.5 shrink-0" />
        <p className="text-[11px] text-[var(--color-text-secondary)] leading-snug">
          This is a <span className="font-medium">metadata index</span> — name, category, expiry, and a link to where the file actually lives.
          Real file uploads land here once Supabase Storage is wired up.
        </p>
      </div>

      {adding ? <AddDocumentForm onAdd={(d) => { add(d); setAdding(false); show('Added to vault') }} /> : null}

      <div className="flex gap-1.5 flex-wrap mb-2.5">
        {FILTERS.map(f =>
          f === filter ? (
            <BtnPrimary key={f} onClick={() => setFilter(f)}>{f}</BtnPrimary>
          ) : (
            <BtnSm key={f} onClick={() => setFilter(f)}>{f}</BtnSm>
          )
        )}
      </div>

      <div>
        {filtered.length === 0 ? (
          <div className="text-xs text-[var(--color-text-tertiary)] py-4 text-center">
            Nothing in this category yet.
          </div>
        ) : filtered.map(d => <DocRow key={d.id} doc={d} onRemove={() => remove(d.id)} />)}
      </div>
    </Card>
  )
}

function DocRow({ doc, onRemove }) {
  const palette = CATEGORY_COLOR[doc.category] ?? CATEGORY_COLOR.Other
  const expiryInfo = expiryStatus(doc.expiry)
  return (
    <div className="flex items-center gap-3 py-2 bg-black/25 rounded-md px-2 mb-1 last:mb-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[13px] font-medium text-[var(--color-text-primary)] truncate">{doc.name}</span>
          <span className="text-[10px] px-1.5 py-px rounded-full" style={{ background: palette.bg, color: palette.txt }}>
            {doc.category}
          </span>
          {doc.owner && doc.owner !== 'Family' ? (
            <span className="inline-flex items-center gap-1 text-[10px] text-[var(--color-text-tertiary)]">
              <Avatar name={doc.owner} size={14} />
              <span>{doc.owner}</span>
            </span>
          ) : doc.owner === 'Family' ? (
            <span className="text-[10px] text-[var(--color-text-tertiary)]">· Family</span>
          ) : null}
        </div>
        <div className="text-[11px] text-[var(--color-text-tertiary)] mt-0.5 flex items-center gap-2 flex-wrap">
          {expiryInfo ? (
            <span style={{ color: expiryInfo.urgent ? 'var(--color-danger)' : undefined }}>{expiryInfo.label}</span>
          ) : null}
          {doc.notes ? <span>· {doc.notes}</span> : null}
        </div>
      </div>
      {doc.link ? (
        <a href={doc.link} target="_blank" rel="noreferrer" className="text-[var(--color-accent)] hover:underline text-[11px] inline-flex items-center gap-1">
          Open <ExternalLink size={11} />
        </a>
      ) : null}
      <button onClick={onRemove} title="Delete" className="text-[var(--color-text-tertiary)] hover:text-[var(--color-danger)] cursor-pointer p-1">
        <Trash2 size={13} />
      </button>
    </div>
  )
}

function expiryStatus(iso) {
  if (!iso) return null
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!m) return null
  const target = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const days = Math.round((target - now) / 86400000)
  if (days < 0) return { label: `Expired ${formatShort(iso)}`, urgent: true }
  if (days <= 60) return { label: `Expires ${formatShort(iso)} (${days} days)`, urgent: true }
  return { label: `Expires ${formatShort(iso)}`, urgent: false }
}

function formatShort(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!m) return iso
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${months[Number(m[2]) - 1]} ${Number(m[3])}, ${m[1]}`
}

function AddDocumentForm({ onAdd }) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('Insurance')
  const [owner, setOwner] = useState('Family')
  const [expiry, setExpiry] = useState('')
  const [notes, setNotes] = useState('')
  const [link, setLink] = useState('')

  const onSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    onAdd({
      name: name.trim(),
      category,
      owner,
      expiry: expiry || null,
      notes: notes.trim(),
      link: link.trim(),
    })
  }

  return (
    <form onSubmit={onSubmit} className="bg-[var(--color-background-secondary)] rounded-[var(--border-radius-md)] p-3 mb-3 flex flex-wrap items-end gap-2">
      <Field label="Document name" className="flex-1 min-w-[200px]">
        <input value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Anthem health card" className={inputCls} />
      </Field>
      <Field label="Category">
        <select value={category} onChange={e => setCategory(e.target.value)} className={inputCls}>
          {DOCUMENT_CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </Field>
      <Field label="Owner">
        <select value={owner} onChange={e => setOwner(e.target.value)} className={inputCls}>
          {OWNER_OPTIONS.map(o => <option key={o}>{o}</option>)}
        </select>
      </Field>
      <Field label="Expires (optional)">
        <input type="date" value={expiry} onChange={e => setExpiry(e.target.value)} className={inputCls} />
      </Field>
      <Field label="Link (optional)" className="min-w-[180px] flex-1">
        <input type="url" value={link} onChange={e => setLink(e.target.value)} placeholder="https://drive.google.com/..." className={inputCls} />
      </Field>
      <Field label="Notes (optional)" className="min-w-[180px] flex-1">
        <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Where it's filed, policy #, etc." className={inputCls} />
      </Field>
      <BtnPrimary type="submit">Save</BtnPrimary>
    </form>
  )
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
