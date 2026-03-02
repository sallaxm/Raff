-- 044_signup_trigger_safety_and_dedupe.sql
-- Harden signup profile bootstrap while avoiding over-broad trigger changes.

-- Ensure fallback institutions exist outside of trigger runtime.
insert into public.institutions (id, name, status)
values
  ('udst', 'UDST', 'active'),
  ('open-institution', 'Open Institution', 'active')
on conflict (id) do update
set name = excluded.name,
    status = excluded.status;

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
    order by case when id = 'open-institution' then 0 else 1 end, id
    limit 1;
  end if;

  if default_institution_id is null then
    default_institution_id := 'open-institution';
  end if;

  insert into public.profiles(id, institution_id, credits)
  values (new.id, default_institution_id, 20)
  on conflict (id) do nothing;

  if exists (select 1 from public.profiles where id = new.id)
     and not exists (
       select 1
       from public.credit_transactions
       where user_id = new.id
         and kind = 'STARTER'
     ) then
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

-- Remove only public-schema custom triggers on auth.users to avoid
-- legacy conflicts while preserving Supabase internal auth triggers.
do $$
declare
  r record;
begin
  for r in
    select t.tgname
    from pg_trigger t
    join pg_proc p on p.oid = t.tgfoid
    join pg_namespace n on n.oid = p.pronamespace
    where t.tgrelid = 'auth.users'::regclass
      and not t.tgisinternal
      and n.nspname = 'public'
      and t.tgname <> 'on_auth_user_created'
  loop
    execute format('drop trigger if exists %I on auth.users;', r.tgname);
  end loop;
end $$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
