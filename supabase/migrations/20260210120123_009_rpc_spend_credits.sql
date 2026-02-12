create or replace function public.spend_credits_and_log_download(
  p_resource_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_cost int;
  v_uploader uuid;
  v_status text;
  v_have int;
  v_inserted int;
begin
  if v_user is null then
    raise exception 'Not authenticated';
  end if;

  select cost, uploader_id, status
  into v_cost, v_uploader, v_status
  from public.resources
  where id = p_resource_id
  for update;

  if not found then
    raise exception 'Resource not found';
  end if;

  if v_status <> 'approved' then
    raise exception 'Resource not approved';
  end if;

  if v_uploader = v_user then
    raise exception 'Cannot download your own upload';
  end if;

  select credits
  into v_have
  from public.profiles
  where id = v_user
  for update;

  if v_have < v_cost then
    raise exception 'Insufficient credits';
  end if;

  insert into public.downloads(user_id, resource_id)
  values (v_user, p_resource_id)
  on conflict (user_id, resource_id) do nothing;

  get diagnostics v_inserted = row_count;

  if v_inserted = 0 then
    raise exception 'Already downloaded';
  end if;

  update public.profiles
  set credits = credits - v_cost
  where id = v_user;

  insert into public.credit_transactions(
    user_id,
    resource_id,
    amount,
    kind,
    note
  )
  values (
    v_user,
    p_resource_id,
    -v_cost,
    'DOWNLOAD_COST',
    'Resource download'
  );
end;
$$;

revoke execute on function public.spend_credits_and_log_download(uuid) from public;
grant execute on function public.spend_credits_and_log_download(uuid) to authenticated;