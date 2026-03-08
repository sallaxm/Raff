-- Backfill safety migration: ensure quality_multiplier exists for environments
-- that missed earlier credit-system migrations.

alter table public.resources
  add column if not exists quality_multiplier numeric(6,2) not null default 1.0;

alter table public.resources
  drop constraint if exists resources_quality_multiplier_bounds;

alter table public.resources
  add constraint resources_quality_multiplier_bounds
  check (quality_multiplier >= 0 and quality_multiplier <= 5);
