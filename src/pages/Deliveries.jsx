import { useMemo, useState } from 'react'
import { Package, Plus, X, ExternalLink, Check, Trash2 } from 'lucide-react'
import { Card, CardHeader, BtnSm, BtnPrimary } from '../components/Card'
import { Avatar } from '../components/Avatar'
import { FAMILY } from '../data/family'
import { CARRIERS } from '../data/seed'
import { usePackages, trackingUrl } from '../hooks/usePackages'
import { useShowToast } from '../context/ToastContext'

const CARRIER_COLOR = {
  USPS:   { bg: '#E6F1FB', txt: '#0C447C' },
  UPS:    { bg: '#FAEEDA', txt: '#633806' },
  FedEx:  { bg: '#FBEAF0', txt: '#72243E' },
  DHL:    { bg: '#FAECE7', txt: '#712B13' },
  Amazon: { bg: '#EAF3DE', txt: '#27500A' },
  Other:  { bg: '#F1EFE8', txt: '#5C5B57' },
}

export function Deliveries() {
  const { packages, add, remove, setStatus } = usePackages()
  const [adding, setAdding] = useState(false)
  const [tab, setTab] = useState('active') // active | delivered
  const show = useShowToast()

  const { active, delivered } = useMemo(() => {
    const a = []
    const d = []
    for (const p of packages) (p.status === 'delivered' ? d : a).push(p)
    a.sort((x, y) => (x.expectedDate ?? '').localeCompare(y.expectedDate ?? ''))
    d.sort((x, y) => (y.expectedDate ?? '').localeCompare(x.expectedDate ?? ''))
    return { active: a, delivered: d }
  }, [packages])

  const list = tab === 'active' ? active : delivered

  return (
    <Card>
      <CardHeader
        title="Deliveries"
        icon={Package}
        action={
          adding ? (
            <BtnSm onClick={() => setAdding(false)}><X size={12} className="inline -mt-0.5 mr-1" /> Cancel</BtnSm>
          ) : (
            <BtnPrimary onClick={() => setAdding(true)}><Plus size={12} className="inline -mt-0.5 mr-1" /> Add package</BtnPrimary>
          )
        }
      />

      {adding ? <AddPackageForm onAdd={(p) => { add(p); setAdding(false); show('Tracking added') }} /> : null}

      <div className="flex gap-1.5 mb-2.5">
        {tab === 'active'
          ? <BtnPrimary onClick={() => setTab('active')}>In transit ({active.length})</BtnPrimary>
          : <BtnSm onClick={() => setTab('active')}>In transit ({active.length})</BtnSm>}
        {tab === 'delivered'
          ? <BtnPrimary onClick={() => setTab('delivered')}>Delivered ({delivered.length})</BtnPrimary>
          : <BtnSm onClick={() => setTab('delivered')}>Delivered ({delivered.length})</BtnSm>}
      </div>

      <div>
        {list.length === 0 ? (
          <div className="text-xs text-[var(--color-text-tertiary)] py-4 text-center">
            {tab === 'active' ? 'No active packages.' : 'No delivered packages yet.'}
          </div>
        ) : list.map(p => (
          <PackageRow
            key={p.id}
            pkg={p}
            onRemove={() => remove(p.id)}
            onMarkDelivered={() => { setStatus(p.id, 'delivered'); show('Marked delivered') }}
            onMarkInTransit={() => { setStatus(p.id, 'in_transit'); show('Moved back to in-transit') }}
          />
        ))}
      </div>
    </Card>
  )
}

function PackageRow({ pkg, onRemove, onMarkDelivered, onMarkInTransit }) {
  const palette = CARRIER_COLOR[pkg.carrier] ?? CARRIER_COLOR.Other
  const url = trackingUrl(pkg.carrier, pkg.trackingNumber)
  const delivered = pkg.status === 'delivered'

  return (
    <div className={`flex items-center gap-3 py-2 bg-black/25 rounded-md px-2 mb-1 last:mb-0 ${delivered ? 'opacity-60' : ''}`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[13px] font-medium text-[var(--color-text-primary)] truncate">{pkg.description || pkg.trackingNumber}</span>
          <span className="text-[10px] px-1.5 py-px rounded-full" style={{ background: palette.bg, color: palette.txt }}>
            {pkg.carrier}
          </span>
          {pkg.recipient ? (
            <span className="inline-flex items-center gap-1 text-[10px] text-[var(--color-text-tertiary)]">
              <Avatar name={pkg.recipient} size={14} />
              <span>{pkg.recipient}</span>
            </span>
          ) : null}
        </div>
        <div className="text-[11px] text-[var(--color-text-tertiary)] mt-0.5 flex items-center gap-2 flex-wrap">
          <span className="font-mono">{pkg.trackingNumber}</span>
          {pkg.expectedDate ? <span>· ETA {formatShort(pkg.expectedDate)}</span> : null}
        </div>
      </div>
      {url ? (
        <a href={url} target="_blank" rel="noreferrer" className="text-[var(--color-accent)] hover:underline text-[11px] inline-flex items-center gap-1">
          Track <ExternalLink size={11} />
        </a>
      ) : null}
      {delivered ? (
        <BtnSm onClick={onMarkInTransit}>↻ In transit</BtnSm>
      ) : (
        <BtnSm onClick={onMarkDelivered}><Check size={11} className="inline -mt-0.5 mr-1" /> Mark delivered</BtnSm>
      )}
      <button onClick={onRemove} title="Delete" className="text-[var(--color-text-tertiary)] hover:text-[var(--color-danger)] cursor-pointer p-1">
        <Trash2 size={13} />
      </button>
    </div>
  )
}

function formatShort(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!m) return iso
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${months[Number(m[2]) - 1]} ${Number(m[3])}`
}

function AddPackageForm({ onAdd }) {
  const [trackingNumber, setTrackingNumber] = useState('')
  const [carrier, setCarrier] = useState('USPS')
  const [description, setDescription] = useState('')
  const [recipient, setRecipient] = useState(FAMILY[0].name)
  const [expectedDate, setExpectedDate] = useState('')

  const onSubmit = (e) => {
    e.preventDefault()
    if (!trackingNumber.trim()) return
    onAdd({
      trackingNumber: trackingNumber.trim(),
      carrier,
      description: description.trim(),
      recipient,
      expectedDate: expectedDate || null,
    })
  }

  return (
    <form onSubmit={onSubmit} className="bg-[var(--color-background-secondary)] rounded-[var(--border-radius-md)] p-3 mb-3 flex flex-wrap items-end gap-2">
      <Field label="Tracking number" className="flex-1 min-w-[180px]">
        <input value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} required placeholder="Paste tracking #" className={inputCls} />
      </Field>
      <Field label="Carrier">
        <select value={carrier} onChange={e => setCarrier(e.target.value)} className={inputCls}>
          {CARRIERS.map(c => <option key={c}>{c}</option>)}
        </select>
      </Field>
      <Field label="What is it?" className="min-w-[180px] flex-1">
        <input value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g. Birthday gift" className={inputCls} />
      </Field>
      <Field label="For">
        <select value={recipient} onChange={e => setRecipient(e.target.value)} className={inputCls}>
          {FAMILY.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
        </select>
      </Field>
      <Field label="Expected (optional)">
        <input type="date" value={expectedDate} onChange={e => setExpectedDate(e.target.value)} className={inputCls} />
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
