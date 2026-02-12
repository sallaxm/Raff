-- DEBUG_UDST_COUNTS
select count(*) as colleges from public.colleges where institution_id='udst';
select count(*) as majors from public.majors where institution_id='udst';