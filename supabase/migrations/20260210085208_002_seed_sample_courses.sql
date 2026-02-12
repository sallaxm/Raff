-- 002_seed_sample_courses.sql

insert into public.courses (institution_id, code, name)
values
('udst','CS101','Programming Fundamentals'),
('udst','MATH101','Calculus I'),
('udst','ENG102','Academic Writing')
on conflict (institution_id, code) do update
set name = excluded.name;