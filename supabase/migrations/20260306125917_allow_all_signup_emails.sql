-- remove email restriction
drop trigger if exists enforce_edu_email on auth.users;
drop function if exists public.check_edu_email();

-- ensure profile auto creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, credits)
  values (new.id, 'user', 20)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();