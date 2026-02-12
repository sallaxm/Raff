-- 013_enforce_credits_via_ledger.sql

-- 1) Only allow server-side functions (security definer) to change credits.
-- We'll do this by forbidding UPDATE on credits via RLS.
-- Users can still update their profile fields, just not credits.

drop policy if exists "profile_update_own" on public.profiles;

create policy "profile_update_own_no_credits"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (
  auth.uid() = id
  and credits = (select credits from public.profiles p2 where p2.id = public.profiles.id)
);

-- 2) Optional but strong: prevent negative credits at DB level (if you haven’t added it yet)
alter table public.profiles
drop constraint if exists credits_non_negative;

alter table public.profiles
add constraint credits_non_negative check (credits >= 0);