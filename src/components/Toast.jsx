export function Toast({ message }) {
  return (
    <div
      className={`fixed bottom-5 left-1/2 -translate-x-1/2 bg-[#2C2C2A] text-[#F1EFE8] px-4 py-2 rounded-[var(--border-radius-md)] text-[13px] z-50 transition-opacity duration-300 pointer-events-none ${message ? 'opacity-100' : 'opacity-0'}`}
    >
      {message ?? ' '}
    </div>
  )
}
