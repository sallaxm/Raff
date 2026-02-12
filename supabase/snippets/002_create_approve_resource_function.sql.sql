create extension if not exists pgcrypto;

-- Institutions
create table if not exists public.institutions (
  id text primary key,
  name text not null,
  status text not null default 'active' check (status in ('active','coming_soon'))
);

insert into public.institutions (id, name, status)
values ('udst','UDST','active')
on conflict (id) do nothing;

-- Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  institution_id text not null references public.institutions(id),
  role text not null default 'user' check (role in ('user','mod','admin')),
  credits integer not null default 0,
  created_at timestamptz not null default now()
);

-- Courses
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  institution_id text not null references public.institutions(id),
  code text not null,
  name text not null,
  unique(institution_id, code)
);

insert into public.courses (institution_id, code, name) values
('udst','CS101','Programming Fundamentals'),
('udst','MATH101','Calculus I'),
('udst','ENG102','Academic Writing')
on conflict do nothing;

-- Resources
create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  institution_id text not null references public.institutions(id),
  course_id uuid not null references public.courses(id),
  uploader_id uuid not null references auth.users(id),
  title text not null,
  type text not null check (type in ('Past Paper','Notes','Assignment','Lab','Other')),
  cost int not null default 2 check (cost >= 0),
  status text not null default 'pending' check (status in ('pending','approved','removed')),
  storage_path text not null,
  created_at timestamptz not null default now()
);

-- Downloads + ledger
create table if not exists public.downloads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  resource_id uuid not null references public.resources(id),
  created_at timestamptz not null default now(),
  unique(user_id, resource_id)
);

create table if not exists public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  resource_id uuid references public.resources(id),
  amount int not null,
  kind text not null check (kind in ('DOWNLOAD_COST','UPLOAD_REWARD','ADJUSTMENT')),
  note text,
  created_at timestamptz not null default now()
);

-- Auto-create profile on signup + starter credits
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, full_name, institution_id, role, credits)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''), 'udst', 'user', 8)
  on conflict (id) do nothing;

  insert into public.credit_transactions(user_id, amount, kind, note)
  values (new.id, 8, 'ADJUSTMENT', 'Starter credits');

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Atomic credit spend + log download
create or replace function public.spend_credits_and_log_download(p_resource_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  v_user uuid := auth.uid();
  v_cost int;
  v_uploader uuid;
  v_status text;
  v_have int;
begin
  if v_user is null then raise exception 'Not authenticated'; end if;

  select cost, uploader_id, status into v_cost, v_uploader, v_status
  from public.resources where id = p_resource_id;

  if not found then raise exception 'Resource not found'; end if;
  if v_status <> 'approved' then raise exception 'Resource not approved'; end if;
  if v_uploader = v_user then raise exception 'Cannot download your own upload'; end if;

  select credits into v_have from public.profiles where id = v_user for update;
  if v_have < v_cost then raise exception 'Insufficient credits'; end if;

  insert into public.downloads(user_id, resource_id)
  values (v_user, p_resource_id)
  on conflict (user_id, resource_id) do nothing;

  update public.profiles set credits = credits - v_cost where id = v_user;

  insert into public.credit_transactions(user_id, resource_id, amount, kind, note)
  values (v_user, p_resource_id, -v_cost, 'DOWNLOAD_COST', 'Download');
end;
$$;

-- RLS
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.resources enable row level security;
alter table public.downloads enable row level security;
alter table public.credit_transactions enable row level security;

create policy "profiles_read_own" on public.profiles for select using (auth.uid() = id);
create policy "courses_read_auth" on public.courses for select using (auth.uid() is not null);
create policy "resources_read_approved" on public.resources for select using (auth.uid() is not null and status='approved');
create policy "resources_read_own" on public.resources for select using (auth.uid() = uploader_id);
create policy "resources_insert_own" on public.resources for insert with check (auth.uid() = uploader_id);
create policy "downloads_read_own" on public.downloads for select using (auth.uid() = user_id);
create policy "ledger_read_own" on public.credit_transactions for select using (auth.uid() = user_id);