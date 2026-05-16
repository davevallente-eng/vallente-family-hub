import { UtensilsCrossed, ShoppingCart, Plus } from 'lucide-react'
import { Card, CardHeader, BtnSm } from '../components/Card'
import { AiButton } from '../components/AiButton'
import { CookSpinner } from '../components/CookSpinner'
import { useGroceries } from '../hooks/useGroceries'
import { SEED_MEALS } from '../data/seed'

export function Meals() {
  const { items, toggle, add } = useGroceries()

  const onAdd = () => {
    const name = window.prompt('Add grocery item:')
    if (name && name.trim()) add(name)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader
          title="This week's meals"
          icon={UtensilsCrossed}
          action={
            <AiButton
              label="AI suggest →"
              prompt="Suggest a full week of dinner ideas for the Vallente family in Fairfield CA. Mix quick weeknight meals and one fun weekend cook. For each day Mon–Sun, output: day, meal name, one-line description, and who would be the most natural cook (Dave, Krista, David, or Kailee)."
            />
          }
        />
        <CookSpinner />
        <div>
          {SEED_MEALS.map(m => (
            <div key={m.day} className="py-1.5 bg-black/25 rounded-md px-2 mb-1 last:mb-0">
              <div className="text-[11px] font-medium text-[var(--color-text-tertiary)] uppercase tracking-wide">{m.day}</div>
              <div className="text-[13px] text-[var(--color-text-primary)]">{m.meal}</div>
              <div className="text-[11px] text-[var(--color-text-tertiary)]">Cook: {m.cook}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Grocery list"
          icon={ShoppingCart}
          action={<BtnSm onClick={onAdd}><span className="inline-flex items-center gap-1"><Plus size={12} /> Add</span></BtnSm>}
        />
        <div>
          {items.map(g => (
            <div key={g.id} className="flex items-center gap-2 py-1.5 bg-black/25 rounded-md px-2 mb-1 last:mb-0">
              <button
                onClick={() => toggle(g.id)}
                className={`w-4 h-4 rounded-[3px] border flex items-center justify-center shrink-0 cursor-pointer ${
                  g.done
                    ? 'bg-[var(--color-success)] border-[var(--color-success)]'
                    : 'bg-transparent border-[var(--color-border-secondary)]'
                }`}
              >
                {g.done ? <span className="text-white text-[10px] leading-none">✓</span> : null}
              </button>
              <div className={`flex-1 text-[13px] ${g.done ? 'line-through text-[var(--color-text-tertiary)]' : 'text-[var(--color-text-primary)]'}`}>{g.name}</div>
              <div className="text-[10px] text-[var(--color-text-tertiary)]">{g.cat}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
