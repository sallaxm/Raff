-- 001_baseline_schema.sql

create extension if not exists pgcrypto;

-- Institutions
create table if not exists public.institutions (
  id text primary key,
  name text not null,
  status text not null default 'active'
);

insert into public.institutions (id, name, status)
values ('udst', 'UDST', 'active')
on conflict (id) do nothing;

-- Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  institution_id text not null references public.institutions(id),
  role text not null default 'user',
  credits integer not null default 8,
  created_at timestamptz not null default now()
);

-- Courses
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  institution_id text not null references public.institutions(id),
  code text not null,
  name text not null
);

-- Prevent duplicates like MATH101 twice for UDST
create unique index if not exists uq_courses_institution_code
on public.courses (institution_id, code);

-- Resources
create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  institution_id text not null references public.institutions(id),
  course_id uuid references public.courses(id),
  uploader_id uuid references auth.users(id),
  title text not null,
  type text not null,
  cost int not null default 3,
  status text not null default 'pending',
  storage_path text,
  created_at timestamptz not null default now()
);

create index if not exists idx_resources_course on public.resources(course_id);
create index if not exists idx_resources_status on public.resources(status);

-- Credit ledger
create table if not exists public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount int not null,
  kind text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_credit_tx_user on public.credit_transactions(user_id);

-- Downloads
create table if not exists public.downloads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  resource_id uuid not null references public.resources(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists idx_downloads_user on public.downloads(user_id);
create index if not exists idx_downloads_resource on public.downloads(resource_id);

-- New user handler
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles(id, institution_id, credits)
  values (new.id, 'udst', 8)
  on conflict (id) do nothing;

  insert into public.credit_transactions(user_id, amount, kind)
  values (new.id, 8, 'STARTER');

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();