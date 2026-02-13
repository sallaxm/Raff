alter table public.resources enable row level security;

drop policy if exists "approved resources readable" on public.resources;

create policy "approved resources readable"
on public.resources
for select
to authenticated
using (
  status = 'approved'
);

create policy "mods can read all resources"
on public.resources
for select
to authenticated
using (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and profiles.role in ('mod','admin')
  )
);