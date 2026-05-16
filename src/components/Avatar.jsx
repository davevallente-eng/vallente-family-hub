import { memberByName } from '../data/family'

export function Avatar({ name, size = 26, title }) {
  const m = memberByName(name)
  if (!m) {
    return (
      <div
        title={title ?? name}
        className="rounded-full inline-flex items-center justify-center"
        style={{
          width: size,
          height: size,
          fontSize: Math.max(9, Math.round(size * 0.38)),
          background: '#eee',
          color: '#666',
        }}
      >
        ?
      </div>
    )
  }
  return (
    <div
      title={title ?? m.name}
      className="rounded-full inline-flex items-center justify-center font-medium select-none"
      style={{
        width: size,
        height: size,
        fontSize: Math.max(9, Math.round(size * 0.38)),
        background: m.accent,
        color: '#FFFFFF',
      }}
    >
      {m.initials}
    </div>
  )
}

export function WhoChips({ who, size = 18 }) {
  return (
    <div className="flex gap-[3px]">
      {who.map(n => <Avatar key={n} name={n} size={size} />)}
    </div>
  )
}
