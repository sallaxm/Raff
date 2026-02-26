-- 042_fix_signup_trigger_resilience.sql
-- Prevent "Database error saving new user" by making signup trigger resilient.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  default_institution_id text;
begin
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
    set status = 'active';

    default_institution_id := 'open-institution';
  end if;

  insert into public.profiles(id, institution_id, credits)
  values (new.id, default_institution_id, 20)
  on conflict (id) do nothing;

  if exists (select 1 from public.profiles where id = new.id) then
    insert into public.credit_transactions(user_id, amount, kind, note)
    values (new.id, 20, 'STARTER', 'Starter credits on signup');
  end if;

  return new;
exception
  when others then
    raise warning 'handle_new_user warning for %: %', new.id, sqlerrm;
    return new;
end;
$$;

-- Ensure trigger is attached (idempotent).
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
