-- 019_add_reject_reason.sql
alter table public.resources
add column if not exists rejected_reason text;

-- Optional: constrain status
alter table public.resources
add constraint resources_status_valid
check (status in ('pending','approved','rejected'));