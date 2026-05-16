# Supabase setup — step by step

You're enabling cloud sync for the Vallente Family Hub. Shared data (chores, events, polls, wishlists, deliveries, etc.) will live in Postgres, scoped to the four family members via Supabase Auth.

## 1. Create the project

1. Go to **https://supabase.com** and sign in (free tier is plenty).
2. **New project** →
   - **Name**: `vallente-family-hub` (anything works)
   - **Database password**: generate one and save it in your password manager (you won't need it in code, but losing it locks you out of admin)
   - **Region**: pick one close to home — `West US (Oregon)` for Fairfield CA
   - **Plan**: Free
3. Wait ~2 minutes for provisioning.

## 2. Grab your keys

Once provisioned:

1. Left sidebar → **Project Settings** (gear icon) → **API**
2. Copy these two values:
   - **Project URL** (looks like `https://abcdefgh.supabase.co`)
   - **anon public** key (long JWT under "Project API keys")

## 3. Wire them into the app

In the repo root, create `.env.local`:

```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...your_anon_key...
```

Restart `npm run dev` after creating the file (Vite only reads env vars at startup).

## 4. Run the schema migration

1. In the Supabase dashboard, left sidebar → **SQL Editor** → **+ New query**
2. Open `supabase/migrations/0001_init.sql` from this repo
3. Copy the entire file contents into the SQL editor
4. Click **Run**

This creates 12 tables, RLS policies that only let signed-in family members touch data, realtime publications so multiple devices stay in sync, and seed data so the app isn't empty on first load.

You should see `Success. No rows returned.` at the bottom.

## 5. Configure auth

The app uses **Supabase Anonymous Sign-Ins** — every visitor automatically gets a session without needing email or password. The "who am I" is chosen by tapping a name in the profile picker (stored client-side in localStorage).

1. Left sidebar → **Authentication** → **Providers**
2. Find **Anonymous Sign-Ins** → toggle **Enable** → **Save**
3. (Optional, classic email auth can stay off — we don't use it.)

> If you've previously used the magic-link flow, the older policies still work — just run `supabase/migrations/0002_open_to_anon_users.sql` once to switch RLS over to the new model.

## 6. Use it for the first time

1. Restart the dev server: `npm run dev`
2. Open `http://localhost:5173`
3. Tap your name on the profile picker (Dave / Krista / David / Kailee)
4. You're in. The choice is saved on this device — next time you open the URL, you skip straight to the dashboard.
5. To switch profiles (or sign in as someone else on a shared device): hover/tap the avatar chip in the top-right of the nav → that's also the sign-out.

## 7. Common issues

**"Missing VITE_SUPABASE_URL"** in console → `.env.local` wasn't picked up. Stop and restart the dev server.

**Magic link not arriving** → check spam folder. Free-tier Supabase sometimes throttles. Wait 60s and try again.

**Profile picker shows all slots greyed out** → all four are already claimed and you're signing in with a new email. Use the email you originally claimed with, or delete the claim from the SQL editor: `delete from profiles where name = 'Kailee';`

**Data doesn't show up** → open the browser DevTools console. RLS denials show as 401/403. Make sure you've claimed a profile (step 6) — without one, you're signed in but can't see family data.

## What's in the schema?

| Table | What it holds |
| --- | --- |
| `profiles` | User → family member name binding (max 4 rows: Dave/Krista/David/Kailee) |
| `chores` | Weekly chore list with assignee + points + done state |
| `events` | Calendar events with who's involved |
| `groceries` | Shared grocery list |
| `occasions` | Birthdays + anniversaries (with countdown) |
| `wishlist_items` | Per-member wishlists with `share_with` array + `claimed_by` |
| `polls` + `poll_votes` | "Ask the family" polls — one vote per member per poll |
| `streak_checkins` | Daily check-ins for the family streak |
| `trips` | Trip planner entries |
| `documents` | Document vault metadata |
| `packages` | Delivery tracking |
| `simple_votes` | Legacy Trips weekend poll counter |

RLS rule on every domain table: **only authenticated users with a claimed profile can read or write**. Outside the family, nothing's reachable.
