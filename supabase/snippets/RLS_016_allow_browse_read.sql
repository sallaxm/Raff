-- RLS_016_allow_browse_read
alter table public.majors enable row level security;
alter table public.major_courses enable row level security;

drop policy if exists majors_read_all on public.majors;
create policy majors_read_all
on public.majors
for select
to anon, authenticated
using (true);

drop policy if exists major_courses_read_all on public.major_courses;
create policy major_courses_read_all
on public.major_courses
for select
to anon, authenticated
using (true);