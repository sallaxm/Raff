-- 018_block_direct_credit_updates.sql
-- Users can update their profile, but not change credits directly.

drop policy if exists "profile_update_own" on public.profiles;

create policy "profile_update_own_no_credit_change"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (
  auth.uid() = id
  and credits = (select credits from public.profiles p2 where p2.id = public.profiles.id)
);