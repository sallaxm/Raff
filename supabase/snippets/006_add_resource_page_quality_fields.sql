-- Migration: 006_add_resource_page_quality_fields.sql
-- Purpose: Add page-based economy fields to resources safely.

------------------------------------------------------------
-- Columns (safe)
------------------------------------------------------------
alter table public.resources
  add column if not exists page_count int,
  add column if not exists quality_tier text,
  add column if not exists reward_credits int;

------------------------------------------------------------
-- Constraints (must check manually)
------------------------------------------------------------

do $$
begin

  if not exists (
    select 1
    from pg_constraint
    where conname = 'resources_page_count_positive'
  ) then
    alter table public.resources
      add constraint resources_page_count_positive
      check (page_count is null or page_count > 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'resources_quality_tier_valid'
  ) then
    alter table public.resources
      add constraint resources_quality_tier_valid
      check (quality_tier is null or quality_tier in ('ok','good','excellent'));
  end if;

end $$;