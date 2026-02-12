-- Merge duplicate engineering colleges safely

do $$
declare
  old_college uuid;
  new_college uuid;
begin

  -- OLD college (your earlier engineering)
  select id into old_college
  from public.colleges
  where institution_id = 'udst'
  and slug = 'engineering'
  limit 1;

  -- NEW college (the one you want)
  select id into new_college
  from public.colleges
  where institution_id = 'udst'
  and slug = 'engineering-and-technology'
  limit 1;

  if old_college is null then
    raise notice 'Old engineering college not found — skipping.';
    return;
  end if;

  if new_college is null then
    raise exception 'New engineering-and-technology college not found.';
  end if;

  -- Move majors
  update public.majors
  set college_id = new_college,
      college = 'engineering-and-technology'
  where college_id = old_college;

  -- Delete duplicate college
  delete from public.colleges
  where id = old_college;

end $$;

-- PREVENT THIS FOREVER
alter table public.colleges
add constraint colleges_unique_slug_per_institution
unique (institution_id, slug);