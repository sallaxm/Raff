-- CHECK_001_tables_and_counts
select
  to_regclass('public.majors') as majors_table,
  to_regclass('public.major_courses') as major_courses_table,
  to_regclass('public.courses') as courses_table;

-- CHECK_002_row_counts
select 'majors' as table_name, count(*) from public.majors
union all
select 'major_courses', count(*) from public.major_courses
union all
select 'courses', count(*) from public.courses;