const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// "2026-05-14" → "May 14". Falls back to the raw input if it doesn't parse,
// so old free-text dates in seed data still render.
export function fmtMonthDay(iso) {
  if (!iso || typeof iso !== 'string') return ''
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
  if (!m) return iso
  const month = MONTHS[Number(m[2]) - 1]
  const day = Number(m[3])
  return month ? `${month} ${day}` : iso
}

// Returns { year, monthIndex } for the date or today's date in UTC-naive terms.
export function todayParts() {
  const d = new Date()
  return { year: d.getFullYear(), monthIndex: d.getMonth(), day: d.getDate() }
}

// Days until the next occurrence of a recurring annual date ("MM-DD"). Today
// counts as 0. Returns Infinity if the input doesn't parse.
export function daysUntilNextOccurrence(monthDay) {
  const m = /^(\d{2})-(\d{2})$/.exec(monthDay ?? '')
  if (!m) return Infinity
  const month = Number(m[1]) - 1
  const day = Number(m[2])
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  let target = new Date(now.getFullYear(), month, day)
  if (target < now) target = new Date(now.getFullYear() + 1, month, day)
  return Math.round((target - now) / 86400000)
}

// "07-04" → "Jul 4". Returns the input as-is if it doesn't parse.
export function fmtMonthDayOnly(monthDay) {
  const m = /^(\d{2})-(\d{2})$/.exec(monthDay ?? '')
  if (!m) return monthDay ?? ''
  const month = MONTHS[Number(m[1]) - 1]
  return month ? `${month} ${Number(m[2])}` : monthDay
}

// If the occasion has a year-of-birth (or wedding), figure out which milestone
// the *next* occurrence will mark — e.g. "turning 17" or "23rd anniversary".
export function nextMilestone(monthDay, year) {
  if (!year) return null
  const m = /^(\d{2})-(\d{2})$/.exec(monthDay ?? '')
  if (!m) return null
  const month = Number(m[1]) - 1
  const day = Number(m[2])
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const target = new Date(now.getFullYear(), month, day)
  const nextYear = target < now ? now.getFullYear() + 1 : now.getFullYear()
  return nextYear - year
}
