-- 011_majors_and_curriculum.sql

create table if not exists public.majors (
  id uuid primary key default gen_random_uuid(),
  institution_id text not null references public.institutions(id),
  college text not null, -- 'engineering'
  slug text not null,
  name text not null,
  created_at timestamptz not null default now(),
  unique (institution_id, college, slug)
);

create table if not exists public.major_courses (
  major_id uuid not null references public.majors(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  year int not null,
  semester int not null,
  is_elective boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (major_id, course_id)
);

create index if not exists idx_major_courses_major_year
on public.major_courses (major_id, year, semester);

-- RLS: allow browsing majors/curriculum (anon + authenticated)
alter table public.majors enable row level security;
alter table public.major_courses enable row level security;

drop policy if exists "majors_read_all" on public.majors;
create policy "majors_read_all"
on public.majors
for select
to anon, authenticated
using (true);

drop policy if exists "major_courses_read_all" on public.major_courses;
create policy "major_courses_read_all"
on public.major_courses
for select
to anon, authenticated
using (true);

-- Only mods can edit majors/curriculum
drop policy if exists "majors_write_mod" on public.majors;
create policy "majors_write_mod"
on public.majors
for all
to authenticated
using (public.is_mod())
with check (public.is_mod());

drop policy if exists "major_courses_write_mod" on public.major_courses;
create policy "major_courses_write_mod"
on public.major_courses
for all
to authenticated
using (public.is_mod())
with check (public.is_mod());