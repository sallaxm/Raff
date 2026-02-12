-- Prevent non-UDST emails from getting a profile
-- This blocks signup at the database level

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin

  -- ✅ EMAIL CHECK
  if new.email not ilike '%@udst.edu.qa' then
    raise exception 'Only UDST emails are allowed';
  end if;

  insert into public.profiles(id, institution_id)
  values (new.id, 'udst');

  insert into public.credit_transactions(user_id, amount, kind)
  values (new.id, 50, 'STARTER');

  return new;
end;
$$;