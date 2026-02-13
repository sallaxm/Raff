create table if not exists public.platform_settings (
  id boolean primary key default true,
  uploads_enabled boolean default true
);

insert into public.platform_settings (id)
values (true)
on conflict (id) do nothing;

create or replace function public.check_uploads_enabled()
returns trigger
language plpgsql
security definer
as $$
declare
  enabled boolean;
begin

  select uploads_enabled
  into enabled
  from public.platform_settings
  where id = true;

  if not enabled then
    raise exception 'Uploads are temporarily disabled.';
  end if;

  return new;
end;
$$;


drop trigger if exists block_uploads_when_disabled
on public.resources;

create trigger block_uploads_when_disabled
before insert on public.resources
for each row
execute function public.check_uploads_enabled();