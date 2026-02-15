-- Fix existing bad rows
update public.resources
set page_count = 1
where page_count is null;

-- Give column a default so inserts never fail
alter table public.resources
alter column page_count set default 1;

-- Keep the constraint strict
alter table public.resources
alter column page_count set not null;