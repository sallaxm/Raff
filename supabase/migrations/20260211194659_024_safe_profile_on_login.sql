-- 024_safe_profile_on_login.sql
-- Ensures a profile exists even if trigger didn't run (rare but happens after resets)

create or replace function public.ensure_profile()
returns void
language plpgsql
security definer
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    return;
  end if;

  insert into public.profiles (id, institution_id)
  values (v_uid, 'udst')
  on conflict (id) do nothing;
end;
$$;

grant execute on function public.ensure_profile() to authenticated;