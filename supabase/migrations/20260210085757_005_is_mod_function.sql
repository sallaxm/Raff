create or replace function public.is_mod()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
    and role in ('mod','admin')
  );
$$;