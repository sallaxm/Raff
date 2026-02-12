create or replace function public.approve_resource(p_resource_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uploader uuid;
  v_pages int;
  v_reward int;
begin

  if not public.is_mod() then
    raise exception 'Not authorized';
  end if;

  select uploader_id, page_count
  into v_uploader, v_pages
  from public.resources
  where id = p_resource_id
  and status = 'pending'
  for update;

  if not found then
    raise exception 'Resource not found or already approved';
  end if;

  v_reward := ceil(v_pages / 5.0);

  update public.resources
  set status = 'approved'
  where id = p_resource_id;

  update public.profiles
  set credits = credits + v_reward
  where id = v_uploader;

  insert into public.credit_transactions (
    user_id,
    amount,
    kind
  )
  values (
    v_uploader,
    v_reward,
    'UPLOAD_REWARD'
  );

end;
$$;

revoke execute on function public.approve_resource(uuid) from public;
grant execute on function public.approve_resource(uuid) to authenticated;