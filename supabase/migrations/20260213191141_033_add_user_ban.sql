alter table public.profiles
add column if not exists banned boolean default false;