-- 013_seed_udst_me_smart_mfg_major.sql
-- Major: B.Sc. Mechanical Engineering – Smart Manufacturing Engineering

insert into public.majors (institution_id, college, slug, name)
values
('udst', 'engineering', 'me-smart-manufacturing',
 'Bachelor of Science in Mechanical Engineering - Smart Manufacturing Engineering')
on conflict (institution_id, college, slug) do nothing;