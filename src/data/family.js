// The Vallente family roster — used as the canonical seed list and for avatar
// colors throughout the app. Order here is the order shown in nav and
// leaderboards.

// Each member has three color slots:
//   color  — deep ink (legacy, used by light-theme chips with `bg` as pastel)
//   bg     — light pastel (legacy)
//   accent — vibrant mid-tone used on the dark theme: chip/avatar background,
//            white text on top. Pops against bg-black/55 cards.
export const FAMILY = [
  { id: 'dave',   name: 'Dave',   initials: 'D',  color: '#0C447C', bg: '#E6F1FB', accent: '#2563EB' },
  { id: 'krista', name: 'Krista', initials: 'K',  color: '#085041', bg: '#E1F5EE', accent: '#16A34A' },
  { id: 'david',  name: 'David',  initials: 'Dv', color: '#712B13', bg: '#FAECE7', accent: '#E25822' },
  { id: 'kailee', name: 'Kailee', initials: 'Ka', color: '#72243E', bg: '#FBEAF0', accent: '#E04877' },
]

export const FAMILY_BY_NAME = Object.fromEntries(FAMILY.map(m => [m.name, m]))

export function memberByName(name) {
  return FAMILY_BY_NAME[name] ?? null
}

export const HOME_LOCATION = 'Fairfield, CA'
