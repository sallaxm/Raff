-- 049_course_access.sql
-- Course-first navigation: students pick their major, pin the courses they're
-- taking, and every course shows how many approved files it has.

-- Program metadata from the official study plans
alter table public.majors
  add column if not exists short_name text,       -- e.g. "B.Sc. ME-SME"
  add column if not exists source_url text,       -- official study plan page
  add column if not exists plan_year text;        -- e.g. "2026-2027"

alter table public.courses
  add column if not exists credits integer;

alter table public.major_courses
  add column if not exists elective_group text;   -- e.g. "Elective: select 1 of 3"

-- A student's major (optional)
alter table public.profiles
  add column if not exists major_id uuid references public.majors(id) on delete set null;

create index if not exists idx_profiles_major on public.profiles(major_id);

grant update (full_name, major_id) on public.profiles to authenticated;

-- Courses a student has pinned ("My courses")
create table if not exists public.user_courses (
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, course_id)
);

create index if not exists idx_user_courses_course on public.user_courses(course_id);

alter table public.user_courses enable row level security;

drop policy if exists "user_courses_select_own" on public.user_courses;
create policy "user_courses_select_own"
on public.user_courses for select to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "user_courses_insert_own" on public.user_courses;
create policy "user_courses_insert_own"
on public.user_courses for insert to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists "user_courses_delete_own" on public.user_courses;
create policy "user_courses_delete_own"
on public.user_courses for delete to authenticated
using (user_id = (select auth.uid()));

revoke all on public.user_courses from anon;
grant select, insert, delete on public.user_courses to authenticated;

-- Approved-file counts per course. security_invoker keeps resources RLS in force.
create or replace view public.course_resource_counts
with (security_invoker = true) as
select
  course_id,
  count(*)::int as resource_count,
  max(created_at) as last_upload_at
from public.resources
where status = 'approved'
  and course_id is not null
group by course_id;

grant select on public.course_resource_counts to anon, authenticated;

-- Fast course lookups by code / name
create index if not exists idx_resources_course_approved
  on public.resources(course_id, created_at desc)
  where status = 'approved';
