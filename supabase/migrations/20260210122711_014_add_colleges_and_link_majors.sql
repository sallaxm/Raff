-- 014_add_colleges_and_link_majors.sql
-- Normalize colleges:
-- - create colleges table
-- - add majors.college_id FK
-- - backfill from majors.college text
-- - keep majors.college for compatibility (for now)

create table if not exists public.colleges (
  id uuid primary key default gen_random_uuid(),
  institution_id text not null references public.institutions(id),
  slug text not null,          -- e.g. 'engineering'
  name text not null,          -- e.g. 'Engineering'
  created_at timestamptz not null default now(),
  unique (institution_id, slug)
);

-- Add college_id on majors
alter table public.majors
add column if not exists college_id uuid;

-- Seed UDST Engineering (you can add more later)
insert into public.colleges (institution_id, slug, name)
values ('udst', 'engineering', 'Engineering')
on conflict (institution_id, slug) do update
set name = excluded.name;

-- Backfill majors.college_id from majors.college text (engineering, etc.)
update public.majors m
set college_id = c.id
from public.colleges c
where m.institution_id = c.institution_id
  and lower(m.college) = c.slug
  and m.college_id is null;

-- If any majors still don't have a college_id, default to engineering for UDST
update public.majors m
set college_id = c.id
from public.colleges c
where m.institution_id = 'udst'
  and c.institution_id = 'udst'
  and c.slug = 'engineering'
  and m.college_id is null;

-- Enforce not null now that we've backfilled
alter table public.majors
alter column college_id set not null;

-- Add FK constraint (idempotent-ish: safe create pattern)
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'majors_college_id_fkey'
  ) then
    alter table public.majors
    add constraint majors_college_id_fkey
    foreign key (college_id) references public.colleges(id)
    on delete restrict;
  end if;
end $$;

-- Update uniqueness: majors unique per (institution, college_id, slug)
-- Drop old unique constraint if it exists (name may differ; we search by columns)
do $$
declare
  r record;
begin
  for r in
    select conname
    from pg_constraint
    where conrelid = 'public.majors'::regclass
      and contype = 'u'
  loop
    -- If it's the old (institution_id, college, slug) unique, drop it.
    -- We'll detect by constraint definition text.
    if pg_get_constraintdef(r.conname::regclass) like '%(institution_id, college, slug)%' then
      execute format('alter table public.majors drop constraint %I', r.conname);
    end if;
  end loop;
end $$;

-- Create the new unique index (safer than constraint name guessing)
create unique index if not exists uq_majors_institution_collegeid_slug
on public.majors (institution_id, college_id, slug);

-- Helpful index for browsing
create index if not exists idx_colleges_institution
on public.colleges (institution_id);

-- RLS: allow browse (anon + authenticated) and mod write
alter table public.colleges enable row level security;

drop policy if exists "colleges_read_all" on public.colleges;
create policy "colleges_read_all"
on public.colleges
for select
to anon, authenticated
using (true);

drop policy if exists "colleges_write_mod" on public.colleges;
create policy "colleges_write_mod"
on public.colleges
for all
to authenticated
using (public.is_mod())
with check (public.is_mod());