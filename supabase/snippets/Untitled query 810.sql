-- DEBUG_UDST_001
select slug, name from public.colleges where institution_id='udst' order by name;

-- DEBUG_UDST_002
select m.slug, m.name, c.slug as college_slug
from public.majors m
join public.colleges c on c.id = m.college_id
where m.institution_id='udst'
order by c.slug, m.name;