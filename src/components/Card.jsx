// Card primitive — the prototype's `.card` and `.card-hd / .card-title` rolled
// into a small, composable React surface. Keeps every page consistent without
// CSS class soup at each call site.

export function Card({ children, className = '', style }) {
  return (
    <div
      className={`bg-black/55 border border-white/15 rounded-[var(--border-radius-lg)] px-4 py-[14px] shadow-sm ${className}`}
      style={style}
    >
      {children}
    </div>
  )
}

export function CardHeader({ title, icon: Icon, action, className = '' }) {
  return (
    <div className={`flex items-center justify-between mb-3 ${className}`}>
      <div className="flex items-center gap-1.5 text-[14px] font-semibold tracking-tight text-[var(--color-text-primary)]">
        {Icon ? <Icon size={16} className="text-[var(--color-text-secondary)]" /> : null}
        <span>{title}</span>
      </div>
      {action ?? null}
    </div>
  )
}

export function BtnSm({ children, onClick, className = '', type = 'button' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`bg-transparent border border-[var(--color-border-secondary)] rounded-[var(--border-radius-md)] px-2.5 py-1 text-xs cursor-pointer text-[var(--color-text-secondary)] hover:bg-[var(--color-background-secondary)] ${className}`}
    >
      {children}
    </button>
  )
}

export function BtnPrimary({ children, onClick, className = '', type = 'button', disabled }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`bg-[var(--color-accent)] text-white border-0 rounded-[var(--border-radius-md)] px-3 py-[5px] text-xs cursor-pointer hover:bg-[var(--color-accent-strong)] disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  )
}

export function Stat({ num, label }) {
  return (
    <div className="bg-black/55 border border-white/15 rounded-[var(--border-radius-md)] p-3 text-center shadow-sm">
      <div className="text-[22px] font-medium text-[var(--color-text-primary)] leading-none">{num}</div>
      <div className="text-[11px] text-[var(--color-text-tertiary)] mt-1">{label}</div>
    </div>
  )
}
