-- SEED_020_me_smart_mfg_all_years

-- 1) Upsert courses
insert into public.courses (institution_id, code, name)
values
-- YEAR 1
('udst','AECH1201','Basic Engineering Calculations'),
('udst','CHEM1010','General Chemistry I'),
('udst','CHEM1011','General Chemistry I (Lab)'),
('udst','COMM1010','English Communication I'),
('udst','MATH1030','Calculus I'),
('udst','PHYS1020','General Physics'),
('udst','PHYS1021','General Physics (Lab)'),
('udst','EFFL1001','Effective Learning'),
('udst','EFFL1002','Applied & Experiential Learning'),
('udst','EFFL1003','Experiential Learning & Entrepreneurship'),
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

-- YEAR 2
('udst','AEEP2301','Applied Programming'),
('udst','AEMA2121','Materials & Processes'),
('udst','AEMA2221','Materials & Processes (Lab)'),
('udst','AEMA2311','Computer Aided Design I'),
('udst','AEMA3111','Multivariate Calculus'),
('udst','AETN1112','Digital Electronics'),
('udst','AETN1212','Digital Electronics (Lab)'),
('udst','BIOL1001','Inquiry-Based Biology'),
('udst','BIOL1002','Introduction to Botany'),
('udst','BIOL1003','Introduction to Ecology'),
('udst','EASC1001','Soil Science'),
('udst','PHYS2001','Introduction to Nanoscience'),
('udst','CHEM3050','Principles of Atomic and Molecular Spectroscopy'),
('udst','AECH2112','Sustainability & Renewable Energy'),
('udst','AECH3302','Applied Thermodynamics'),
('udst','AEMA2113','Hydraulics & Pneumatics'),
('udst','AEMA2213','Hydraulics & Pneumatics (Lab)'),
('udst','AEMA2133','Welding & Non-Destructive Testing'),
('udst','AEMA2233','Welding & Non-Destructive Testing (Lab)'),
('udst','AEMA3301','Mechanics, Statics & Dynamics'),
('udst','AECH2103','Leadership & Management Principles'),
('udst','AECH2113','Quality Assurance'),
('udst','AEMA3333','Applied Dynamics & Kinematics'),

-- YEAR 3
('udst','AEMA3112','Applied Differential Equations'),
('udst','AEMA3121','Applied Fluid Mechanics'),
('udst','AEMA3221','Applied Fluid Mechanics (Lab)'),
('udst','AEMA3302','Strength of Materials'),
('udst','AEMA3311','Computer Aided Design II'),
('udst','RSST3002','Probability & Statistical Analysis'),
('udst','AEMA3232','Advanced Manufacturing'),
('udst','AEMA3242','Designing & Prototyping'),
('udst','AEMA4142','Applied Heat Transfer'),
('udst','AEMA4312','Applied CNC & CAM'),
('udst','AEMA3000','Work Placement'),

-- YEAR 4
('udst','AEAC4101','Robotics & Intelligent Control'),
('udst','AEAC4201','Robotics & Intelligent Control (Lab)'),
('udst','AEMA4100','Project Management'),
('udst','AEMA4301','Capstone Project I'),
('udst','AEMA4311','Machine Design'),
('udst','COMM3010','Research & Reporting'),
('udst','AEAC4202','Process Control (Lab)'),
('udst','AEMA4123','PLC'),
('udst','AEMA4223','PLC (Lab)'),
('udst','AEMA4302','Capstone Project II'),
('udst','AEMA4342','Computer-Integrated Manufacturing (CIM)')
on conflict (institution_id, code)
do update set name = excluded.name;

-- 2) Map courses into curriculum
with m as (
  select id as major_id
  from public.majors
  where institution_id='udst' and college='engineering' and slug='me-smart-manufacturing'
),
c as (
  select id as course_id, code
  from public.courses
  where institution_id='udst'
),
x as (
  select * from (values
    -- YEAR 1 sem 1
    ('AECH1201',1,1,false),('CHEM1010',1,1,false),('CHEM1011',1,1,false),
    ('COMM1010',1,1,false),('MATH1030',1,1,false),('PHYS1020',1,1,false),('PHYS1021',1,1,false),
    ('EFFL1001',1,1,true),('EFFL1002',1,1,true),('EFFL1003',1,1,true),

    -- YEAR 1 sem 2
    ('AECH1100',1,2,false),('AEEL1101',1,2,false),('AEEL1201',1,2,false),
    ('AEMA1102',1,2,false),('AEMA1312',1,2,false),('COMM1020',1,2,false),('MATH2010',1,2,false),
    ('AEEL1102',1,2,false),('AEEL1202',1,2,false),('AEMA1113',1,2,false),('AEMA1213',1,2,false),

    -- YEAR 2 sem 1
    ('AEEP2301',2,1,false),('AEMA2121',2,1,false),('AEMA2221',2,1,false),
    ('AEMA2311',2,1,false),('AEMA3111',2,1,false),('AETN1112',2,1,false),('AETN1212',2,1,false),
    ('BIOL1001',2,1,true),('BIOL1002',2,1,true),('BIOL1003',2,1,true),
    ('EASC1001',2,1,true),('PHYS2001',2,1,true),('CHEM3050',2,1,true),

    -- YEAR 2 sem 2
    ('AECH2112',2,2,false),('AECH3302',2,2,false),
    ('AEMA2113',2,2,false),('AEMA2213',2,2,false),
    ('AEMA2133',2,2,false),('AEMA2233',2,2,false),
    ('AEMA3301',2,2,false),

    -- YEAR 2 sem 3
    ('AECH2103',2,3,false),('AECH2113',2,3,false),('AEMA3333',2,3,false),

    -- YEAR 3 sem 1
    ('AEMA3112',3,1,false),('AEMA3121',3,1,false),('AEMA3221',3,1,false),
    ('AEMA3302',3,1,false),('AEMA3311',3,1,false),('RSST3002',3,1,false),

    -- YEAR 3 sem 2
    ('AEMA3232',3,2,false),('AEMA3242',3,2,false),('AEMA4142',3,2,false),('AEMA4312',3,2,false),

    -- YEAR 3 sem 3
    ('AEMA3000',3,3,false),

    -- YEAR 4 sem 1
    ('AEAC4101',4,1,false),('AEAC4201',4,1,false),('AEMA4100',4,1,false),
    ('AEMA4301',4,1,false),('AEMA4311',4,1,false),('COMM3010',4,1,false),

    -- YEAR 4 sem 2
    ('AEAC4202',4,2,false),('AEMA4123',4,2,false),('AEMA4223',4,2,false),
    ('AEMA4302',4,2,false),('AEMA4342',4,2,false)
  ) as t(code, year, semester, is_elective)
)
insert into public.major_courses (major_id, course_id, year, semester, is_elective)
select (select major_id from m), c.course_id, x.year, x.semester, x.is_elective
from x
join c on c.code = x.code
on conflict do nothing;