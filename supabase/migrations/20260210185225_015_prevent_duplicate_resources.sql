-- 015_prevent_duplicate_resources.sql
-- Prevent obvious duplicates per course

create unique index if not exists uq_resources_course_title_type
on public.resources (course_id, lower(title), type)
where status in ('pending','approved');

-- Helpful browse indexes
create index if not exists idx_resources_course_status_created
on public.resources (course_id, status, created_at desc);

create index if not exists idx_resources_institution_status_created
on public.resources (institution_id, status, created_at desc);