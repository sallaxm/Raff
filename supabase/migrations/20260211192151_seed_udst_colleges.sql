-- 022_seed_udst_colleges.sql

-- Ensure pgcrypto exists for gen_random_uuid()
create extension if not exists pgcrypto;

-- Make slugs unique per institution (helps safe seeding / upserts)
create unique index if not exists uq_colleges_institution_slug
on public.colleges (institution_id, slug);

-- Seed colleges (idempotent)
insert into public.colleges (institution_id, slug, name)
values
  ('udst', 'engineering-and-technology', 'College of Engineering and Technology'),
  ('udst', 'business', 'College of Business'),
  ('udst', 'computing-and-it', 'College of Computing and Information Technology'),
  ('udst', 'health-sciences', 'College of Health Sciences')
on conflict (institution_id, slug) do update
set name = excluded.name;