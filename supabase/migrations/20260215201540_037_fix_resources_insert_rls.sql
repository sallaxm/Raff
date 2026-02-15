-- 037_fix_resources_insert_rls.sql

-- Ensure RLS is on
alter table public.resources enable row level security;

-- Replace insert policy so uploader_id can be null on insert
drop policy if exists resources_insert_own on public.resources;

create policy resources_insert_own
on public.resources
for insert
to authenticated
with check (
  auth.uid() is not null
  and (uploader_id = auth.uid() or uploader_id is null)
);

-- Auto-fill uploader_id if client doesn't send it
create or replace function public.set_uploader_id()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.uploader_id is null then
    new.uploader_id := auth.uid();
  end if;
  return new;
end;
$$;

drop trigger if exists trg_set_uploader_id on public.resources;
create trigger trg_set_uploader_id
before insert on public.resources
for each row
execute function public.set_uploader_id();