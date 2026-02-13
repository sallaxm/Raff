create or replace function public.update_resource_metadata(
  p_id uuid,
  p_title text,
  p_type text,
  p_page_count int,
  p_cost int,
  p_course_id uuid
)
returns void
language plpgsql
security definer
as $$
begin

  if not is_mod() then
    raise exception 'Not authorized';
  end if;

  update public.resources
  set
    title = p_title,
    type = p_type,
    page_count = p_page_count,
    cost = p_cost,
    course_id = p_course_id
  where id = p_id;

end;
$$;

grant execute on function public.update_resource_metadata to authenticated;