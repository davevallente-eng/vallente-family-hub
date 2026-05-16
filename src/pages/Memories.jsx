import {
  Image as ImageIcon,
  Tv,
  Mountain,
  Flame,
  Umbrella,
  Snowflake,
  Dog,
  Camera,
  Trees,
  Smile,
  Bot,
  Orbit,
  Search as SearchIcon,
  Sparkles,
} from 'lucide-react'
import { Card, CardHeader, BtnSm } from '../components/Card'
import { AiButton } from '../components/AiButton'
import { TriviaBuilder } from '../components/TriviaBuilder'
import { SEED_PHOTOS, SEED_MOVIES } from '../data/seed'
import { useShowToast } from '../context/ToastContext'

const ICONS = { Mountain, Flame, Umbrella, Snowflake, Dog, Camera, Trees, Smile, Bot, Orbit, Search: SearchIcon, Sparkles }

export function Memories() {
  const show = useShowToast()

  return (
    <div className="flex flex-col gap-3">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader
          title="Family memories"
          icon={ImageIcon}
          action={<BtnSm onClick={() => show('Upload coming soon')}>+ Upload</BtnSm>}
        />
        <div className="grid grid-cols-4 gap-1.5">
          {SEED_PHOTOS.map((iconName, i) => {
            const Icon = ICONS[iconName] ?? ImageIcon
            return (
              <div
                key={i}
                className="aspect-square rounded-[var(--border-radius-md)] bg-[var(--color-background-secondary)] flex items-center justify-center cursor-pointer border border-[var(--color-border-tertiary)]"
              >
                <Icon size={24} className="text-[var(--color-text-tertiary)]" />
              </div>
            )
          })}
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Movie & game night"
          icon={Tv}
          action={
            <AiButton
              label="AI pick →"
              prompt="Suggest 5 family movie night picks and 3 board game ideas for the Vallente family (Dave, Krista, David, Kailee — parents + two adult kids in their 20s). Mix of comedy, adventure, and a few smart picks. For movies: title + one line. For games: title + one line."
            />
          }
        />
        <div>
          {SEED_MOVIES.map(m => {
            const Icon = ICONS[m.icon] ?? Tv
            return (
              <div key={m.id} className="flex items-center gap-2.5 py-2 bg-black/25 rounded-md px-2 mb-1 last:mb-0">
                <div className="w-9 h-12 rounded bg-[var(--color-background-secondary)] flex items-center justify-center shrink-0 border border-[var(--color-border-tertiary)]">
                  <Icon size={20} className="text-[var(--color-text-tertiary)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-[var(--color-text-primary)]">{m.title}</div>
                  <div className="text-[11px] text-[var(--color-text-tertiary)] mt-0.5">{m.meta}</div>
                </div>
                <button
                  onClick={() => show('Added to watchlist!')}
                  className="w-[22px] h-[22px] rounded-full border border-[var(--color-border-secondary)] bg-transparent cursor-pointer flex items-center justify-center text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-background-secondary)]"
                >
                  +
                </button>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
    <TriviaBuilder />
    </div>
  )
}
