-- 023_seed_udst_majors.sql
-- Seeds UDST majors and sets BOTH majors.college (slug text) and majors.college_id (uuid)

create extension if not exists pgcrypto;

create unique index if not exists uq_majors_institution_slug
on public.majors (institution_id, slug);

with c as (
  select id, slug
  from public.colleges
  where institution_id = 'udst'
),
ins as (
  -- Engineering and Technology
  select
    'udst'::text as institution_id,
    'engineering-and-technology'::text as college,
    (select id from c where slug = 'engineering-and-technology') as college_id,
    'aeronautical-engineering'::text as slug,
    'Bachelor''s in Aeronautical Engineering'::text as name
  union all
  select 'udst','engineering-and-technology',(select id from c where slug='engineering-and-technology'),
    'construction-engineering','Bachelor''s in Construction Engineering'
  union all
  select 'udst','engineering-and-technology',(select id from c where slug='engineering-and-technology'),
    'electrical-engineering-automation-control','Bachelor''s in Electrical Engineering — Automation and Control Systems'
  union all
  select 'udst','engineering-and-technology',(select id from c where slug='engineering-and-technology'),
    'electrical-engineering-power-renewable','Bachelor''s in Electrical Engineering — Electrical Power and Renewable Energy'
  union all
  select 'udst','engineering-and-technology',(select id from c where slug='engineering-and-technology'),
    'electrical-engineering-telecom-network','Bachelor''s in Electrical Engineering — Telecommunications and Network'
  union all
  select 'udst','engineering-and-technology',(select id from c where slug='engineering-and-technology'),
    'marine-engineering','Bachelor''s in Marine Engineering'
  union all
  select 'udst','engineering-and-technology',(select id from c where slug='engineering-and-technology'),
    'mechanical-engineering-maintenance','Bachelor''s in Mechanical Engineering — Maintenance'

  -- Business
  union all
  select 'udst','business',(select id from c where slug='business'),
    'bba-applied-accounting','Bachelor''s of Business Administration — Applied Accounting'
  union all
  select 'udst','business',(select id from c where slug='business'),
    'bba-banking-fintech','Bachelor''s of Business Administration — Banking and Financial Technology'
  union all
  select 'udst','business',(select id from c where slug='business'),
    'bba-digital-marketing','Bachelor''s of Business Administration — Digital Marketing'
  union all
  select 'udst','business',(select id from c where slug='business'),
    'bba-human-resource-management','Bachelor''s of Business Administration — Human Resource Management'
  union all
  select 'udst','business',(select id from c where slug='business'),
    'bba-logistics-supply-chain','Bachelor''s of Business Administration — Logistics and Supply Chain Management'
  union all
  select 'udst','business',(select id from c where slug='business'),
    'bba-healthcare-management','Bachelor''s of Business Administration — Healthcare Management'
  union all
  select 'udst','business',(select id from c where slug='business'),
    'aviation-management','Bachelor''s in Aviation Management'

  -- Computing and IT
  union all
  select 'udst','computing-and-it',(select id from c where slug='computing-and-it'),
    'data-science-ai','Bachelor''s in Data Science and AI'
  union all
  select 'udst','computing-and-it',(select id from c where slug='computing-and-it'),
    'digital-communication-media-production','Bachelor''s in Digital Communication and Media Production'
  union all
  select 'udst','computing-and-it',(select id from c where slug='computing-and-it'),
    'information-systems','Bachelor''s in Information Systems'
  union all
  select 'udst','computing-and-it',(select id from c where slug='computing-and-it'),
    'information-technology','Bachelor''s in Information Technology'
  union all
  select 'udst','computing-and-it',(select id from c where slug='computing-and-it'),
    'software-engineering','Bachelor''s in Software Engineering'

  -- Health Sciences
  union all
  select 'udst','health-sciences',(select id from c where slug='health-sciences'),
    'nursing','Bachelor''s in Nursing'
  union all
  select 'udst','health-sciences',(select id from c where slug='health-sciences'),
    'medical-radiography','Bachelor''s in Medical Radiography'
)

insert into public.majors (institution_id, college, college_id, slug, name)
select institution_id, college, college_id, slug, name
from ins
where college_id is not null
on conflict (institution_id, slug) do update
set
  name = excluded.name,
  college = excluded.college,
  college_id = excluded.college_id;