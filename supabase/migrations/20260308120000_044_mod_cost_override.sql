-- Allow moderators to override auto-calculated download cost while
-- keeping default cost synced to page_count formula.

alter table public.resources
  add column if not exists cost_override integer;

alter table public.resources
  drop constraint if exists resources_cost_override_bounds;

alter table public.resources
  add constraint resources_cost_override_bounds
  check (cost_override is null or (cost_override >= 0 and cost_override <= 100));

create or replace function public.sync_resource_cost_from_pages()
returns trigger
language plpgsql
as $$
begin
  new.cost := coalesce(new.cost_override, public.calculate_download_cost(new.page_count));
  return new;
end;
$$;

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
declare
  v_auto_cost int;
begin

  if not is_mod() then
    raise exception 'Not authorized';
  end if;

  v_auto_cost := public.calculate_download_cost(p_page_count);

  update public.resources
  set
    title = p_title,
    type = p_type,
    page_count = p_page_count,
    cost_override = case
      when p_cost is null then null
      when p_cost = v_auto_cost then null
      else p_cost
    end,
    course_id = p_course_id
  where id = p_id;

end;
$$;

grant execute on function public.update_resource_metadata(uuid, text, text, int, int, uuid) to authenticated;
