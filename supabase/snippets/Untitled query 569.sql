create extension if not exists pgcrypto;

create table public.institutions (
  id text primary key,
  name text not null,
  status text not null default 'active'
);

insert into public.institutions values ('udst','UDST','active');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  institution_id text not null references public.institutions(id),
  role text default 'user',
  credits integer default 8,
  created_at timestamptz default now()
);

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  institution_id text references public.institutions(id),
  code text,
  name text
);

insert into public.courses (institution_id, code, name) values
('udst','CS101','Programming Fundamentals'),
('udst','MATH101','Calculus I'),
('udst','ENG102','Academic Writing');

create table public.resources (
  id uuid primary key default gen_random_uuid(),
  institution_id text references public.institutions(id),
  course_id uuid references public.courses(id),
  uploader_id uuid references auth.users(id),
  title text,
  type text,
  cost int default 3,
  status text default 'pending',
  storage_path text,
  created_at timestamptz default now()
);

create table public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  amount int,
  kind text,
  created_at timestamptz default now()
);

create table public.downloads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  resource_id uuid references public.resources(id),
  created_at timestamptz default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles(id, institution_id)
  values(new.id,'udst');

  insert into public.credit_transactions(user_id,amount,kind)
  values(new.id,8,'STARTER');

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();