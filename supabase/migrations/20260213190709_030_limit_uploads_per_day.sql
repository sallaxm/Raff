create or replace function public.check_daily_upload_limit()
returns trigger
language plpgsql
security definer
as $$
declare
  uploads_today int;
begin

  select count(*)
  into uploads_today
  from public.resources
  where uploader_id = auth.uid()
    and created_at >= date_trunc('day', now());

  if uploads_today >= 10 then
    raise exception 'Daily upload limit reached (10). Try again tomorrow.';
  end if;

  return new;
end;
$$;


drop trigger if exists limit_daily_uploads on public.resources;

create trigger limit_daily_uploads
before insert on public.resources
for each row
execute function public.check_daily_upload_limit();