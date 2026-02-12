alter table public.resources
add column if not exists page_count int not null default 1;