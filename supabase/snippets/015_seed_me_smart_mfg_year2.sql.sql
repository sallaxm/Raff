-- 015_seed_me_smart_mfg_year2.sql
-- Seeds Year 2 courses + maps them to the major curriculum.

-- Upsert courses
insert into public.courses (institution_id, code, name)
values
-- Semester 3
('udst','AEEP2301','Applied Programming'),
('udst','AEMA2121','Materials & Processes'),
('udst','AEMA2221','Materials & Processes (Lab)'),
('udst','AEMA2311','Computer Aided Design I'),
('udst','AEMA3111','Multivariate Calculus'),
('udst','AETN1112','Digital Electronics'),
('udst','AETN1212','Digital Electronics (Lab)'),

-- Electives (Math & Natural Sciences — select 1 of 6)
('udst','BIOL1001','Inquiry-Based Biology'),
('udst','BIOL1002','Introduction to Botany'),
('udst','BIOL1003','Introduction to Ecology'),
('udst','EASC1001','Soil Science'),
('udst','PHYS2001','Introduction to Nanoscience'),
('udst','CHEM3050','Principles of Atomic and Molecular Spectroscopy'),

-- Semester 4
('udst','AECH2112','Sustainability & Renewable Energy'),
('udst','AECH3302','Applied Thermodynamics'),
('udst','AEMA2113','Hydraulics & Pneumatics'),
('udst','AEMA2133','Welding & Non-Destructive Testing'),
('udst','AEMA2213','Hydraulics & Pneumatics (Lab)'),
('udst','AEMA2233','Welding & Non-Destructive Testing (Lab)'),
('udst','AEMA3301','Mechanics, Statics & Dynamics'),

-- Semester 5
('udst','AECH2103','Leadership & Management Principles'),
('udst','AECH2113','Quality Assurance'),
('udst','AEMA3333','Applied Dynamics & Kinematics')
on conflict (institution_id, code)
do update set name = excluded.name;


-- Map them into curriculum
with m as (
  select id as major_id
  from public.majors
  where slug='me-smart-manufacturing'
),
c as (
  select id as course_id, code
  from public.courses
  where institution_id='udst'
)

insert into public.major_courses
(major_id, course_id, year, semester, is_elective)

select
 (select major_id from m),
 c.course_id,
 x.year,
 x.semester,
 x.is_elective

from c
join (
values

-- YEAR 2 — Semester 1
('AEEP2301',2,1,false),
('AEMA2121',2,1,false),
('AEMA2221',2,1,false),
('AEMA2311',2,1,false),
('AEMA3111',2,1,false),
('AETN1112',2,1,false),
('AETN1212',2,1,false),

-- Electives
('BIOL1001',2,1,true),
('BIOL1002',2,1,true),
('BIOL1003',2,1,true),
('EASC1001',2,1,true),
('PHYS2001',2,1,true),
('CHEM3050',2,1,true),

-- YEAR 2 — Semester 2
('AECH2112',2,2,false),
('AECH3302',2,2,false),
('AEMA2113',2,2,false),
('AEMA2133',2,2,false),
('AEMA2213',2,2,false),
('AEMA2233',2,2,false),
('AEMA3301',2,2,false),

-- YEAR 2 — Semester 3
('AECH2103',2,3,false),
('AECH2113',2,3,false),
('AEMA3333',2,3,false)

) as x(code,year,semester,is_elective)

on c.code = x.code
on conflict do nothing;