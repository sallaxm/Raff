-- CHECK_020_counts
select 'majors' as table_name, count(*) from public.majors
union all
select 'courses', count(*) from public.courses
union all
select 'major_courses', count(*) from public.major_courses;

-- CHECK_021_courses_columns
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema='public' and table_name='courses'
order by ordinal_position;

-- CHECK_022_sample_courses
select * from public.courses limit 5;