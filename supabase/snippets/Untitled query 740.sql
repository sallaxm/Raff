create or replace function public.approve_resource(p_resource_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  v_uploader uuid;
begin
  -- get uploader
  select uploader_id
  into v_uploader
  from public.resources
  where id = p_resource_id
  and status = 'pending';

  if not found then
    raise exception 'Resource not found or already approved';
  end if;

  -- approve resource
  update public.resources
  set status = 'approved'
  where id = p_resource_id;

  -- give credits
  update public.profiles
  set credits = credits + 5
  where id = v_uploader;

  -- ledger entry
  insert into public.credit_transactions (
    user_id,
    resource_id,
    amount,
    kind,
    note
  )
  values (
    v_uploader,
    p_resource_id,
    5,
    'UPLOAD_REWARD',
    'Upload approved'
  );
end;
$$;