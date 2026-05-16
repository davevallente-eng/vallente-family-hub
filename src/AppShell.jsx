import { useState } from 'react'
import {
  LayoutDashboard,
  Calendar as CalendarIcon,
  ListChecks,
  UtensilsCrossed,
  MapPin,
  Plane,
  Image as ImageIcon,
  PartyPopper,
  FileText,
  Package,
} from 'lucide-react'
import { FAMILY } from './data/family'
import { Avatar } from './components/Avatar'
import { LocationPicker } from './components/LocationPicker'
import { useAuth } from './context/AuthContext'
import { Dashboard } from './pages/Dashboard'
import { CalendarPage } from './pages/Calendar'
import { Chores } from './pages/Chores'
import { Meals } from './pages/Meals'
import { Explore } from './pages/Explore'
import { Trips } from './pages/Trips'
import { Memories } from './pages/Memories'
import { Celebrations } from './pages/Celebrations'
import { Documents } from './pages/Documents'
import { Deliveries } from './pages/Deliveries'

const TABS = [
  { id: 'dashboard',    label: 'Dashboard',    icon: LayoutDashboard, Page: Dashboard },
  { id: 'calendar',     label: 'Calendar',     icon: CalendarIcon,    Page: CalendarPage },
  { id: 'celebrations', label: 'Celebrations', icon: PartyPopper,     Page: Celebrations },
  { id: 'chores',       label: 'Chores',       icon: ListChecks,      Page: Chores },
  { id: 'meals',        label: 'Meals',        icon: UtensilsCrossed, Page: Meals },
  { id: 'explore',      label: 'Explore',      icon: MapPin,          Page: Explore },
  { id: 'trips',        label: 'Trips',        icon: Plane,           Page: Trips },
  { id: 'deliveries',   label: 'Deliveries',   icon: Package,         Page: Deliveries },
  { id: 'documents',    label: 'Documents',    icon: FileText,        Page: Documents },
  { id: 'memories',     label: 'Memories',     icon: ImageIcon,       Page: Memories },
]

export function AppShell() {
  const [tab, setTab] = useState('dashboard')
  const { profile, signOut } = useAuth()
  const ActivePage = TABS.find(t => t.id === tab)?.Page ?? Dashboard

  return (
    <div className="min-h-screen">
      <TopNav tab={tab} setTab={setTab} profile={profile} onSignOut={signOut} />
      <main className="px-4 md:px-5 py-4 max-w-[1280px] mx-auto">
        <ActivePage goTo={setTab} />
      </main>
    </div>
  )
}

function TopNav({ tab, setTab, profile, onSignOut }) {
  return (
    <div className="sticky top-0 z-20 bg-black/75 backdrop-blur-sm border-b border-white/15">
      <div className="flex items-center justify-between px-4 md:px-5 h-16 max-w-[1280px] mx-auto gap-3">
        <div className="flex gap-0.5 overflow-x-auto min-w-0 flex-1 no-scrollbar">
          {TABS.map(t => {
            const Icon = t.icon
            const active = t.id === tab
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-3 md:px-[14px] h-16 flex items-center gap-1.5 text-[13px] cursor-pointer transition-colors whitespace-nowrap border-b-2 ${
                  active
                    ? 'text-[var(--color-accent)] border-[var(--color-accent)]'
                    : 'text-[var(--color-text-secondary)] border-transparent hover:text-[var(--color-text-primary)]'
                }`}
              >
                <Icon size={15} />
                <span>{t.label}</span>
              </button>
            )
          })}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <LocationPicker />
          <div className="hidden xl:flex items-center gap-1.5">
            {FAMILY.map(m => (
              <Avatar key={m.id} name={m.name} size={26} />
            ))}
          </div>
          {profile ? (
            <button
              onClick={onSignOut}
              title={`Signed in as ${profile.name} — tap to sign out`}
              className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full hover:bg-[var(--color-background-secondary)] cursor-pointer"
            >
              <Avatar name={profile.name} size={24} />
              <span className="hidden sm:inline text-xs text-[var(--color-text-tertiary)]">↩</span>
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
