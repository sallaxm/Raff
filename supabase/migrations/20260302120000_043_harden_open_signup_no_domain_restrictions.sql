-- 043_harden_open_signup_no_domain_restrictions.sql
-- Ensure signup is domain-agnostic on already-provisioned databases.
-- This migration is intentionally additive (does not rewrite old history)
-- so existing environments receive the fix when migrated.

-- Remove legacy public functions that explicitly enforce UDST-only emails.
do $$
declare
  fn record;
begin
  for fn in
    select
      n.nspname as schema_name,
      p.proname as function_name,
      pg_get_function_identity_arguments(p.oid) as args
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and (
        pg_get_functiondef(p.oid) ilike '%@udst.edu.qa%'
        or pg_get_functiondef(p.oid) ilike '%Only UDST emails are allowed%'
      )
  loop
    execute format(
      'drop function if exists %I.%I(%s) cascade',
      fn.schema_name,
      fn.function_name,
      fn.args
    );
  end loop;
end
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  default_institution_id text;
begin
  -- Explicitly no email-domain restriction.
  select id
  into default_institution_id
  from public.institutions
  where id = 'udst'
    and status = 'active'
  limit 1;

  if default_institution_id is null then
    select id
    into default_institution_id
    from public.institutions
    where status = 'active'
    order by id
    limit 1;
  end if;

  if default_institution_id is null then
    insert into public.institutions (id, name, status)
    values ('open-institution', 'Open Institution', 'active')
    on conflict (id) do update
    set name = excluded.name,
        status = excluded.status;

    default_institution_id := 'open-institution';
  end if;

  insert into public.profiles (id, institution_id, credits)
  values (new.id, default_institution_id, 20)
  on conflict (id) do nothing;

  if exists (select 1 from public.profiles where id = new.id) then
    insert into public.credit_transactions (user_id, amount, kind, note)
    values (new.id, 20, 'STARTER', 'Starter credits on signup');
  end if;

  return new;
exception
  when others then
    -- Never block auth signups because of profile/bootstrap issues.
    raise warning 'handle_new_user warning for %: %', new.id, sqlerrm;
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
