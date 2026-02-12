-- Migration: 007_update_approve_resource_option_a.sql
-- Purpose:
-- Mod-only approval that sets page_count + quality_tier,
-- computes download cost and uploader reward deterministically.

create or replace function public.approve_resource(
  p_resource_id uuid,
  p_page_count int,
  p_quality_tier text
)
returns void
language plpgsql
security definer
as $$
declare
  v_uploader uuid;
  v_cost int;
  v_multiplier numeric;
  v_reward int;
begin
  ----------------------------------------------------------------
  -- Authorization
  ----------------------------------------------------------------
  if not public.is_mod() then
    raise exception 'Forbidden: moderator only';
  end if;

  ----------------------------------------------------------------
  -- Validate inputs
  ----------------------------------------------------------------
  if p_page_count is null or p_page_count <= 0 then
    raise exception 'Invalid page_count';
  end if;

  if p_quality_tier not in ('ok','good','excellent') then
    raise exception 'Invalid quality_tier';
  end if;

  ----------------------------------------------------------------
  -- Fetch pending resource row (lock)
  ----------------------------------------------------------------
  select uploader_id
    into v_uploader
  from public.resources
  where id = p_resource_id
    and status = 'pending'
  for update;

  if not found then
    raise exception 'Resource not found or already approved';
  end if;

  ----------------------------------------------------------------
  -- Compute cost + reward
  -- cost = ceil(page_count / 5)
  -- reward = ceil(cost * multiplier), capped
  ----------------------------------------------------------------
  v_cost := ((p_page_count + 4) / 5); -- integer ceil division

  v_multiplier :=
    case p_quality_tier
      when 'ok' then 1.0
      when 'good' then 1.25
      when 'excellent' then 1.5
    end;

  v_reward := ceil(v_cost * v_multiplier);

  -- cap reward to prevent inflation
  if v_reward > 30 then v_reward := 30; end if;

  ----------------------------------------------------------------
  -- Update resource
  ----------------------------------------------------------------
  update public.resources
  set status = 'approved',
      page_count = p_page_count,
      quality_tier = p_quality_tier,
      cost = v_cost,
      reward_credits = v_reward
  where id = p_resource_id;

  ----------------------------------------------------------------
  -- Reward uploader + ledger
  ----------------------------------------------------------------
  update public.profiles
  set credits = credits + v_reward
  where id = v_uploader;

  insert into public.credit_transactions(user_id, resource_id, amount, kind, note)
  values (v_uploader, p_resource_id, v_reward, 'UPLOAD_REWARD', 'Upload approved (page/quality rule)');
end;
$$;

grant execute on function public.approve_resource(uuid, int, text) to authenticated;