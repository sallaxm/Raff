-- 040_allow_any_domain_and_add_islamic_studies_college.sql
-- Allow signups from any email domain and ensure profiles are auto-created.
-- Also seed a non-UDST Islamic Studies college.

insert into public.institutions (id, name, status)
values ('open-institution', 'Open Institution', 'active')
on conflict (id) do update
set name = excluded.name,
    status = excluded.status;

insert into public.colleges (institution_id, slug, name)
values ('open-institution', 'islamic-studies', 'Islamic Studies')
on conflict (institution_id, slug) do update
set name = excluded.name;

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
    default_institution_id := 'open-institution';
  end if;

  insert into public.profiles(id, institution_id, credits)
  values (new.id, default_institution_id, 8)
  on conflict (id) do nothing;

  insert into public.credit_transactions(user_id, amount, kind)
  values (new.id, 8, 'STARTER');

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
