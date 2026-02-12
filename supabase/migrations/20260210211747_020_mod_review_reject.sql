-- 020_mod_review_reject.sql

-- A) Ensure statuses are consistent
alter table public.resources
add column if not exists rejected_reason text;

alter table public.resources
drop constraint if exists resources_status_valid;

alter table public.resources
add constraint resources_status_valid
check (status in ('pending','approved','rejected'));

-- B) RLS: allow public read of approved resources; mod can read all
-- (Assumes RLS is enabled already in your core RLS migration, but safe to repeat.)
alter table public.resources enable row level security;

drop policy if exists "resources_read_approved" on public.resources;
create policy "resources_read_approved"
on public.resources
for select
to anon, authenticated
using (status = 'approved');

drop policy if exists "resources_read_mod_all" on public.resources;
create policy "resources_read_mod_all"
on public.resources
for select
to authenticated
using (public.is_mod());

-- Keep writes restricted to mods (adjust if you already have an insert policy)
drop policy if exists "resources_write_mod" on public.resources;
create policy "resources_write_mod"
on public.resources
for update
to authenticated
using (public.is_mod())
with check (public.is_mod());

-- C) RPC: reject resource (mod-only)
create or replace function public.reject_resource(
  p_resource_id uuid,
  p_reason text
)
returns void
language plpgsql
security definer
as $$
begin
  if not public.is_mod() then
    raise exception 'Not authorized';
  end if;

  update public.resources
  set status = 'rejected',
      rejected_reason = left(coalesce(p_reason,''), 500)
  where id = p_resource_id
    and status = 'pending';

  if not found then
    raise exception 'Resource not found or not pending';
  end if;
end;
$$;

grant execute on function public.reject_resource(uuid, text) to authenticated;