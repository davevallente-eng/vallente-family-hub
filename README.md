# Vallente Family Hub

A private dashboard for the Vallente family — calendar, chores, meal plan, grocery list, weekend ideas, trip planner, and movie night picks. PWA-installable, AI-augmented, designed for shared use across phones, tablets, and the kitchen iPad.

Sibling to [vallente-kitchen](../vallente-kitchen) (the recipe app). Same stack, separate Supabase project.

## Stack

- Vite + React 19
- Tailwind v4 (`@tailwindcss/vite`)
- Supabase (`@supabase/supabase-js`) — auth + persistence
- lucide-react — icons
- vite-plugin-pwa — installable on iOS/Android/desktop
- Vercel serverless functions in `/api/*` for AI (Anthropic Claude)

## Quick start

```bash
npm install
cp .env.example .env.local   # fill in keys (optional for first run)
npm run dev
```

Without any env vars set, the app runs in **local-first mode**:
- `localStorage` persistence for chores, groceries, votes, events, trips
- Pick-a-profile auth (tap your avatar)
- AI buttons surface a server error toast — wire up the API key to enable them

## Environment

| Var | Where | Purpose |
| --- | ----- | ------- |
| `VITE_SUPABASE_URL` | frontend | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | frontend | Supabase anon key |
| `ANTHROPIC_API_KEY` | serverless (Vercel env) | Powers `/api/ai-chat` |

## App layout

```
src/
  App.jsx              # AuthProvider + ToastProvider + gate
  AppShell.jsx         # Top nav with 7 tabs, weather pill, member avatars
  pages/               # Dashboard, Calendar, Chores, Meals, Explore, Trips, Memories
  components/          # Avatar, Card, Toast, AiButton, AuthScreens
  context/             # AuthContext, ToastContext
  hooks/               # useLocalState, useChores, useGroceries, useVotes, useEvents, useToast, useAiChat
  data/                # family.js (canonical roster), seed.js (initial data)
  lib/                 # supabase.js, date.js
api/
  ai-chat.js           # POST { prompt } → { reply } via Claude
```

## Family

Canonical roster lives in [src/data/family.js](src/data/family.js):

| Name   | Initials | Avatar |
| ------ | -------- | ------ |
| Dave   | D        | blue   |
| Krista | K        | green  |
| David  | Dv       | orange |
| Kailee | Ka       | pink   |

## Next up (not in this scaffold)

- Supabase schema + RLS for shared data (chores, events, etc.)
- Real magic-link → family-member binding (not just local profile picker)
- Push notifications for chore reminders & event countdowns
- Photo uploads (Supabase Storage) for the Memories tab
- Google Calendar import for the Calendar tab
- Weather pill wired to a real forecast API
