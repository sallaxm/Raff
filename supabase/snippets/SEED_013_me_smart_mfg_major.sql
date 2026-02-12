-- SEED_013_me_smart_mfg_major
insert into public.majors (institution_id, college, slug, name)
values
('udst', 'engineering', 'me-smart-manufacturing',
 'Bachelor of Science in Mechanical Engineering - Smart Manufacturing Engineering')
on conflict (institution_id, college, slug) do nothing;