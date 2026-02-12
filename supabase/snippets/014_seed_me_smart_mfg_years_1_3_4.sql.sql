-- 014_seed_me_smart_mfg_years_1_3_4.sql
-- Seeds the courses we extracted from the study plan tables you uploaded.
-- Year 2 will be added later once you send that plan.

-- Upsert courses (safe if you run multiple times)
insert into public.courses (institution_id, code, name)
values
-- YEAR 1 (Sem 1)
('udst','AECH1201','Basic Engineering Calculations'),
('udst','CHEM1010','General Chemistry I'),
('udst','CHEM1011','General Chemistry I (Lab)'),
('udst','COMM1010','English Communication I'),
('udst','MATH1030','Calculus I'),
('udst','PHYS1020','General Physics'),
('udst','PHYS1021','General Physics (Lab)'),

-- YEAR 1 Electives (choose 1)
('udst','EFFL1001','Effective Learning'),
('udst','EFFL1002','Applied & Experiential Learning'),
('udst','EFFL1003','Experiential Learning & Entrepreneurship'),

-- YEAR 1 (Sem 2)
('udst','AECH1100','Environmental Awareness & Ethics'),
('udst','AEEL1101','Fundamentals of Electricity I'),
('udst','AEEL1201','Fundamentals of Electricity I (Lab)'),
('udst','AEMA1102','Health & Safety in the Workplace'),
('udst','AEMA1312','Engineering Graphics'),
('udst','COMM1020','English Communication II'),
('udst','MATH2010','Calculus II'),
('udst','AEEL1102','Fundamentals of Electricity II'),
('udst','AEEL1202','Fundamentals of Electricity II (Lab)'),
('udst','AEMA1113','Materials Practices'),
('udst','AEMA1213','Materials Practices (Lab)'),

-- YEAR 3 (Sem 1)  [study plan shows semester 7]
('udst','AEMA3112','Applied Differential Equations'),
('udst','AEMA3121','Applied Fluid Mechanics'),
('udst','AEMA3221','Applied Fluid Mechanics (Lab)'),
('udst','AEMA3302','Strength of Materials'),
('udst','AEMA3311','Computer Aided Design II'),
('udst','RSST3002','Probability & Statistical Analysis'),

-- YEAR 3 (Sem 2) [study plan shows semester 8]
('udst','AEMA3232','Advanced Manufacturing'),
('udst','AEMA3242','Designing & Prototyping'),
('udst','AEMA4142','Applied Heat Transfer'),
('udst','AEMA4312','Applied CNC & CAM'),

-- YEAR 3 (Sem 3) [study plan shows semester 9]
('udst','AEMA3000','Work Placement'),

-- YEAR 4 (Sem 1) [study plan shows semester 10]
('udst','AEAC4101','Robotics & Intelligent Control'),
('udst','AEAC4201','Robotics & Intelligent Control (Lab)'),
('udst','AEMA4100','Project Management'),
('udst','AEMA4301','Capstone Project I'),
('udst','AEMA4311','Machine Design'),
('udst','COMM3010','Research & Reporting'),

-- YEAR 4 (Sem 2) [study plan shows semester 11]
('udst','AEAC4202','Process Control (Lab)'),
('udst','AEMA4123','PLC'),
('udst','AEMA4223','PLC (Lab)'),
('udst','AEMA4302','Capstone Project II'),
('udst','AEMA4342','Computer-Integrated Manufacturing (CIM)')
on conflict (institution_id, code)
do update set name = excluded.name;

-- Map them to the major with year/semester + elective flags
with m as (
  select id as major_id
  from public.majors
  where institution_id='udst' and college='engineering' and slug='me-smart-manufacturing'
),
c as (
  select id as course_id, code
  from public.courses
  where institution_id='udst'
)
insert into public.major_courses (major_id, course_id, year, semester, is_elective)
select
  (select major_id from m),
  c.course_id,
  x.year,
  x.semester,
  x.is_elective
from c
join (
  values
  -- Year 1 sem 1
  ('AECH1201',1,1,false),('CHEM1010',1,1,false),('CHEM1011',1,1,false),
  ('COMM1010',1,1,false),('MATH1030',1,1,false),('PHYS1020',1,1,false),('PHYS1021',1,1,false),

  -- Year 1 elective group (user picks 1 later, but we show under year 1)
  ('EFFL1001',1,1,true),('EFFL1002',1,1,true),('EFFL1003',1,1,true),

  -- Year 1 sem 2
  ('AECH1100',1,2,false),('AEEL1101',1,2,false),('AEEL1201',1,2,false),
  ('AEMA1102',1,2,false),('AEMA1312',1,2,false),('COMM1020',1,2,false),('MATH2010',1,2,false),
  ('AEEL1102',1,2,false),('AEEL1202',1,2,false),('AEMA1113',1,2,false),('AEMA1213',1,2,false),

  -- Year 3 sem 1 / 2 / 3
  ('AEMA3112',3,1,false),('AEMA3121',3,1,false),('AEMA3221',3,1,false),
  ('AEMA3302',3,1,false),('AEMA3311',3,1,false),('RSST3002',3,1,false),

  ('AEMA3232',3,2,false),('AEMA3242',3,2,false),('AEMA4142',3,2,false),('AEMA4312',3,2,false),
  ('AEMA3000',3,3,false),

  -- Year 4 sem 1 / 2
  ('AEAC4101',4,1,false),('AEAC4201',4,1,false),('AEMA4100',4,1,false),
  ('AEMA4301',4,1,false),('AEMA4311',4,1,false),('COMM3010',4,1,false),

  ('AEAC4202',4,2,false),('AEMA4123',4,2,false),('AEMA4223',4,2,false),
  ('AEMA4302',4,2,false),('AEMA4342',4,2,false)
) as x(code, year, semester, is_elective)
on c.code = x.code
on conflict do nothing;