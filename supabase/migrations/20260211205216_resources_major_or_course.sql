-- Allow uploads to belong to either a course OR a major

alter table public.resources
add column if not exists major_id uuid references public.majors(id);

alter table public.resources
drop constraint if exists resources_exactly_one_target;

alter table public.resources
add constraint resources_exactly_one_target
check (
  (course_id is not null AND major_id is null)
  OR
  (course_id is null AND major_id is not null)
);

create index if not exists resources_major_id_idx
on public.resources(major_id);