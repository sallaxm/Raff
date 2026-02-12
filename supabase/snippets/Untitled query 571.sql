-- FIX_020_add_rejected_reason
alter table public.resources
add column if not exists rejected_reason text;

-- (optional but recommended)
alter table public.resources
drop constraint if exists resources_status_valid;

alter table public.resources
add constraint resources_status_valid
check (status in ('pending','approved','rejected'));