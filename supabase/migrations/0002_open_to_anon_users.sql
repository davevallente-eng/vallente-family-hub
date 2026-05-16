-- =====================================================================
-- 0002 — Drop magic-link / claimed-profile gating
-- =====================================================================
-- Before: RLS required a row in `profiles` for the current auth.uid(),
--         meaning the user had to claim a slot (which required magic-link
--         sign-in) before they could read or write anything.
-- After:  RLS just requires *any* signed-in session, which includes
--         Supabase Anonymous Sign-Ins. The "who am I" is now purely a
--         client-side localStorage choice — no DB binding, no emails.
--
-- The `profiles` table is left in place (unused) for posterity. Drop it
-- with `drop table public.profiles cascade;` if you want to clean up.

create or replace function public.is_family_member()
returns boolean
language sql security definer stable as $$
  select auth.uid() is not null
$$;
