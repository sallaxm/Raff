alter table public.courses enable row level security;

drop policy if exists "courses_read_all" on public.courses;

create policy "courses_read_all"
on public.courses
for select
to anon, authenticated
using (true);