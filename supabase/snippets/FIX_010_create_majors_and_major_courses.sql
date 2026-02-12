-- FIX_010_create_majors_and_major_courses

create extension if not exists pgcrypto;

create table if not exists public.majors (
  id uuid primary key default gen_random_uuid(),
  institution_id text not null,
  college text not null,
  slug text not null,
  name text not null,
  created_at timestamptz not null default now(),
  unique (institution_id, college, slug)
);

create table if not exists public.major_courses (
  major_id uuid not null references public.majors(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  year int,
  semester int,
  is_elective boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (major_id, course_id)
);

create unique index if not exists uq_courses_institution_code
on public.courses (institution_id, code);

create index if not exists idx_majors_institution_college
on public.majors (institution_id, college);

create index if not exists idx_major_courses_course
on public.major_courses (course_id);

create index if not exists idx_major_courses_major_year
on public.major_courses (major_id, year);