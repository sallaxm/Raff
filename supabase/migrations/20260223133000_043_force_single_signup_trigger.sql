-- 043_force_single_signup_trigger.sql
-- Ensure signup cannot fail due to legacy/manual auth.users triggers.

-- Drop every non-internal trigger on auth.users to prevent conflicting logic
-- (for example legacy domain restrictions that raise exceptions).
do $$
declare
  r record;
begin
  for r in
    select tgname
    from pg_trigger
    where tgrelid = 'auth.users'::regclass
      and not tgisinternal
      and tgname <> 'on_auth_user_created'
  loop
    execute format('drop trigger if exists %I on auth.users;', r.tgname);
  end loop;
end $$;

-- Rebind the canonical trigger to the latest resilient handler.
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
