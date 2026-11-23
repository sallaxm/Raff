-- Allow moderators to edit quality multiplier when updating resource metadata.

create or replace function public.update_resource_metadata(
  p_id uuid,
  p_title text,
  p_type text,
  p_page_count int,
  p_cost int,
  p_quality_multiplier numeric,
  p_course_id uuid
)
returns void
language plpgsql
security definer
as $$
declare
  v_auto_cost int;
begin

  if not is_mod() then
    raise exception 'Not authorized';
  end if;

  if p_quality_multiplier is null or p_quality_multiplier < 0 or p_quality_multiplier > 5 then
    raise exception 'Quality multiplier must be between 0 and 5';
  end if;

  v_auto_cost := public.calculate_download_cost(p_page_count);

  update public.resources
  set
    title = p_title,
    type = p_type,
    page_count = p_page_count,
    quality_multiplier = p_quality_multiplier,
    cost_override = case
      when p_cost is null then null
      when p_cost = v_auto_cost then null
      else p_cost
    end,
    course_id = p_course_id
  where id = p_id;

end;
$$;

grant execute on function public.update_resource_metadata(uuid, text, text, int, int, numeric, uuid) to authenticated;
