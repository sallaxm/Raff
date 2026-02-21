-- 041_seed_islamic_studies_major.sql
-- Ensure Islamic Studies has a selectable major so uploads can target it.

insert into public.institutions (id, name, status)
values ('open-institution', 'Open Institution', 'active')
on conflict (id) do update
set name = excluded.name,
    status = excluded.status;

insert into public.colleges (institution_id, slug, name)
values ('open-institution', 'islamic-studies', 'Islamic Studies')
on conflict (institution_id, slug) do update
set name = excluded.name;

with islamic_college as (
  select id
  from public.colleges
  where institution_id = 'open-institution'
    and slug = 'islamic-studies'
  limit 1
)
insert into public.majors (institution_id, college, college_id, slug, name)
select
  'open-institution',
  'islamic-studies',
  islamic_college.id,
  'islamic-studies-general',
  'Islamic Studies'
from islamic_college
on conflict (institution_id, slug) do update
set college = excluded.college,
    college_id = excluded.college_id,
    name = excluded.name;
