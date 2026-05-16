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

1. Left sidebar → **Authentication** → **Providers**
2. **Email** should already be enabled — leave it on.
3. **Confirm email** can be turned OFF (it's just the family, magic links are already the gate).

Optional but recommended for a private family app:

4. **Authentication** → **URL Configuration** → set **Site URL** to where the app will live (use `http://localhost:5173` for local dev; add your Vercel URL once deployed).

## 6. Sign in for the first time

1. Restart the dev server: `npm run dev`
2. Open `http://localhost:5173`
3. Type your email, click **Send magic link**
4. Check your inbox, click the link
5. You'll land on the profile picker. Click your name (Dave / Krista / David / Kailee) — this **claims** your slot. Only you can sign in to that slot from now on.
6. Repeat steps 3–5 from each family member's device with their email.

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
