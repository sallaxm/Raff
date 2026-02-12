-- Migration: 008_prevent_negative_credits.sql
-- Purpose:
-- Guarantee that user credits can NEVER drop below zero.
-- Protects the platform economy from bugs, race conditions,
-- and faulty RPC logic.

------------------------------------------------------------
-- Add constraint safely
------------------------------------------------------------

do $$
begin

  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_credits_non_negative'
  ) then
    
    alter table public.profiles
      add constraint profiles_credits_non_negative
      check (credits >= 0);

  end if;

end $$;