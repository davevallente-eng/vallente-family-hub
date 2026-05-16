# Deploying to Vercel

Once you're done locally, push to GitHub and hook up Vercel for free auto-deploys on every commit. The whole flow takes ~15 minutes.

## 1. Push to GitHub

If you don't already have a GitHub account: sign up at https://github.com.

1. Go to https://github.com/new
2. **Repository name**: `vallente-family-hub`
3. **Visibility**: **Private** (this is a family app — don't share publicly)
4. **Initialize**: leave everything unchecked (no README, no .gitignore — we already have those)
5. **Create repository**

GitHub shows the next steps. From the repo root, run:

```bash
git remote add origin https://github.com/YOUR_USERNAME/vallente-family-hub.git
git push -u origin main
```

GitHub may prompt you to sign in. If you've never used the GitHub CLI / Git Credential Manager, the easiest path is to install [GitHub CLI](https://cli.github.com/) and run `gh auth login` once.

## 2. Get an Anthropic API key (for the AI buttons)

Skip this step if you don't care about the "AI suggest" buttons working. Otherwise:

1. Go to https://console.anthropic.com
2. Sign up / sign in
3. **Settings** → **API Keys** → **Create Key**
4. Name it `vallente-family-hub`, copy the key (starts with `sk-ant-...`)
5. Anthropic gives ~$5 of free credit on signup — plenty for testing. For ongoing family use, set up billing with a usage cap (~$5/mo is comfortable).

## 3. Connect Vercel

1. Go to https://vercel.com → **Sign Up** with your GitHub account (free Hobby plan is fine)
2. Once in: **Add New…** → **Project**
3. Find `vallente-family-hub` in the list and click **Import**
4. **Framework Preset**: Vercel auto-detects Vite. Leave defaults.
5. **Root Directory**: `.` (the repo root)
6. Expand **Environment Variables**, add three:

| Name | Value | Where to get it |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | `https://hnlgurrdwrybvabrdioo.supabase.co` | same value as your local `.env.local` |
| `VITE_SUPABASE_ANON_KEY` | your anon JWT | same value as your local `.env.local` |
| `ANTHROPIC_API_KEY` | `sk-ant-...` | from step 2 above (skip if you don't want AI) |

7. Click **Deploy**

Vercel builds and gives you a URL like `vallente-family-hub-abc123.vercel.app` in ~1 minute.

## 4. Allow the Vercel URL in Supabase

This is required — magic-link sign-in won't work otherwise.

1. In the Supabase dashboard → **Authentication** → **URL Configuration**
2. **Site URL**: set to your Vercel URL (e.g. `https://vallente-family-hub-abc123.vercel.app`)
3. **Redirect URLs**: add the same URL plus a wildcard:
   - `https://vallente-family-hub-abc123.vercel.app/**`
   - Also keep `http://localhost:5173/**` so local dev still works
4. **Save**

## 5. Test

1. Open your Vercel URL in a fresh browser / incognito window
2. Sign in with a different email than the one you used locally
3. Pick an unclaimed slot (you probably claimed Dave locally — try Krista from this browser)
4. Verify real-time sync: open localhost in one tab + Vercel URL in another, toggle a chore in one — should flip in the other within a second
5. Try an "AI suggest" button — should pop an alert with AI-generated content. If you get `Server missing ANTHROPIC_API_KEY`, you skipped step 2.

## 6. Inviting the rest of the family

Just send them the Vercel URL. They sign in with their own email, claim an unclaimed slot, done. No other admin needed.

## 7. Custom domain (optional)

If you own a domain (e.g. `vallente.com`):

1. Vercel dashboard → your project → **Settings** → **Domains**
2. Add `family.vallente.com` (or whatever you want)
3. Vercel shows DNS records to add at your domain registrar
4. Update Supabase URL Configuration to use the new domain
5. Update the magic-link emails will now redirect to the custom domain

## 8. Future commits = auto-deploys

Every `git push` to `main` triggers a Vercel deploy. PR branches get preview deploys. Nothing else to set up.

## Troubleshooting

**`Server missing ANTHROPIC_API_KEY`** — add it in Vercel project → Settings → Environment Variables, then **Redeploy** (env var changes don't take effect on the existing deployment).

**Magic link email arrives but clicking redirects to localhost or errors** — Supabase Site URL / Redirect URLs aren't set to the Vercel URL. See step 4.

**Data is empty after sign-in** — you signed in but didn't claim a profile. RLS blocks all reads until a `profiles` row exists for your `user_id`. Go to the profile picker and pick a slot.

**Build fails on Vercel** — check the build log. Most common: a typo in an env var name (case-sensitive, must start with `VITE_` for client-side vars).
