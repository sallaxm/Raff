-- Migration: 004_add_is_mod_function.sql
-- Purpose: Provide a reusable helper to check if the current user
-- has moderator or admin privileges.
-- Why: Centralizes authorization logic so multiple functions
-- can enforce role-based access safely.

create or replace function public.is_mod()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role in ('mod','admin')
  );
$$;

-- Allow authenticated users to call the helper.
grant execute on function public.is_mod() to authenticated;