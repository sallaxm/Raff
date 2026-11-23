-- 052_credit_economy_v2.sql
-- Rebalanced credit economy: reward sharing, not page counting.
--
--   Download        2 credits per file (flat; moderators can still override)
--   Uploader share  half the price (min 1) every time someone else downloads
--   Approval        +2 credits, plus +10 one-time bonus for a first approved upload
--   Signup          10 starter credits (was 20; existing balances unchanged)
--
-- Why: under the old rules a 1-5 page file earned its uploader 0 credits, a
-- popular file earned the same as an unused one, and 20 free credits per new
-- account made throwaway accounts the cheapest way to download.
-- Each default download now moves 1 credit to the uploader and removes 1,
-- so credits keep circulating without piling up.

-- ---------------------------------------------------------------------------
-- Ledger kinds
-- ---------------------------------------------------------------------------
alter table public.credit_transactions
  drop constraint if exists credit_transactions_kind_valid;

alter table public.credit_transactions
  add constraint credit_transactions_kind_valid
  check (
    kind in (
      'STARTER',
      'UPLOAD_REWARD',
      'UPLOAD_BONUS',
      'UPLOAD_EARNING',
      'DOWNLOAD',
      'ADJUSTMENT',
      'REFUND',
      'BOOST',
      'BOUNTY_CREATE',
      'BOUNTY_REFUND',
      'BOUNTY_PAYOUT',
      'PURCHASE'
    )
  );

-- ---------------------------------------------------------------------------
-- Pricing helpers
-- ---------------------------------------------------------------------------

-- Flat price per file. The pages argument is kept so existing callers
-- (sync trigger, update_resource_metadata) keep working unchanged.
create or replace function public.calculate_download_cost(pages integer)
returns integer
language sql
immutable
set search_path = public
as $$
  select 2;
$$;

-- What the uploader earns each time someone downloads their file.
create or replace function public.calculate_uploader_share(cost integer)
returns integer
language sql
immutable
set search_path = public
as $$
  select case when coalesce(cost, 0) <= 0 then 0 else greatest(1, floor(cost * 0.5)::integer) end;
$$;

-- Reward paid when a moderator approves an upload (before multiplier/override).
create or replace function public.calculate_upload_reward(cost integer)
returns integer
language sql
immutable
set search_path = public
as $$
  select 2;
$$;

revoke execute on function public.calculate_uploader_share(integer) from public, anon;

-- Re-price existing files to the flat rate (moderator overrides are kept).
update public.resources
set cost = coalesce(cost_override, public.calculate_download_cost(page_count))
where cost is distinct from coalesce(cost_override, public.calculate_download_cost(page_count));

-- ---------------------------------------------------------------------------
-- Approval: +2 (x quality multiplier, or the moderator's exact override),
--           +10 on the uploader's first approved upload
-- ---------------------------------------------------------------------------
create or replace function public.approve_resource(p_resource_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uploader uuid;
  v_pages integer;
  v_cost integer;
  v_cost_override integer;
  v_base_reward integer;
  v_reward integer;
  v_bonus integer := 0;
  v_quality_multiplier numeric(6, 2);
  v_reward_override integer;
begin
  if not public.is_mod() then
    raise exception 'Not authorized';
  end if;

  select uploader_id, page_count, cost_override, reward_override, quality_multiplier
  into v_uploader, v_pages, v_cost_override, v_reward_override, v_quality_multiplier
  from public.resources
  where id = p_resource_id
    and status = 'pending'
  for update;

  if not found then
    raise exception 'Resource not found or already reviewed';
  end if;

  v_cost := coalesce(v_cost_override, public.calculate_download_cost(v_pages));
  v_base_reward := public.calculate_upload_reward(v_cost);
  v_reward := coalesce(
    v_reward_override,
    floor(v_base_reward * coalesce(v_quality_multiplier, 1.0))::integer
  );

  if v_uploader is not null and not exists (
    select 1 from public.resources
    where uploader_id = v_uploader and status = 'approved'
  ) then
    v_bonus := 10;
  end if;

  update public.resources
  set status = 'approved',
      cost = v_cost,
      rejected_reason = null
  where id = p_resource_id;

  if v_uploader is not null and v_reward + v_bonus > 0 then
    update public.profiles
    set credits = credits + v_reward + v_bonus
    where id = v_uploader;

    insert into public.credit_transactions (user_id, amount, kind, resource_id, note)
    values (
      v_uploader,
      v_reward + v_bonus,
      'UPLOAD_REWARD',
      p_resource_id,
      format('reward=%s, base=%s, multiplier=%s, override=%s, first_upload_bonus=%s',
        v_reward, v_base_reward, coalesce(v_quality_multiplier, 1.0),
        coalesce(v_reward_override::text, 'null'), v_bonus)
    );
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- Download: charge the stored price, pay the uploader their share
-- ---------------------------------------------------------------------------
create or replace function public.spend_credits_and_log_download(p_resource_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_cost integer;
  v_share integer;
  v_title text;
  v_uploader uuid;
  v_status text;
  v_have integer;
  v_inserted integer;
begin
  if v_user is null then
    raise exception 'Not authenticated';
  end if;

  select cost, title, uploader_id, status
  into v_cost, v_title, v_uploader, v_status
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

  select credits into v_have
  from public.profiles
  where id = v_user
  for update;

  if coalesce(v_have, 0) < v_cost then
    raise exception 'Insufficient credits';
  end if;

  insert into public.downloads (user_id, resource_id)
  values (v_user, p_resource_id)
  on conflict (user_id, resource_id) do nothing;

  get diagnostics v_inserted = row_count;
  if v_inserted = 0 then
    raise exception 'Already downloaded';
  end if;

  update public.profiles
  set credits = credits - v_cost
  where id = v_user;

  insert into public.credit_transactions (user_id, resource_id, amount, kind, note)
  values (v_user, p_resource_id, -v_cost, 'DOWNLOAD', left(v_title, 120));

  -- Uploader's share (skipped if the uploader account no longer exists)
  v_share := public.calculate_uploader_share(v_cost);
  if v_uploader is not null and v_share > 0 then
    update public.profiles
    set credits = credits + v_share
    where id = v_uploader;

    if found then
      insert into public.credit_transactions (user_id, resource_id, amount, kind, note)
      values (v_uploader, p_resource_id, v_share, 'UPLOAD_EARNING', left(v_title, 120));
    end if;
  end if;
end;
$$;

grant execute on function public.approve_resource(uuid) to authenticated;
grant execute on function public.spend_credits_and_log_download(uuid) to authenticated;
revoke execute on function public.approve_resource(uuid) from public, anon;
revoke execute on function public.spend_credits_and_log_download(uuid) from public, anon;

-- ---------------------------------------------------------------------------
-- Signup: 10 starter credits
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_institution text;
  v_inserted integer;
begin
  select id into v_institution
  from public.institutions
  where status = 'active'
  order by (id = 'udst') desc, id
  limit 1;

  insert into public.profiles (id, institution_id, role, credits)
  values (new.id, v_institution, 'user', 10)
  on conflict (id) do nothing;

  get diagnostics v_inserted = row_count;
  if v_inserted > 0 then
    insert into public.credit_transactions (user_id, amount, kind, note)
    values (new.id, 10, 'STARTER', 'Starter credits on signup');
  end if;

  return new;
exception
  when others then
    raise warning 'handle_new_user warning for %: %', new.id, sqlerrm;
    return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

alter table public.profiles alter column credits set default 10;

-- ---------------------------------------------------------------------------
-- Per-file stats for uploaders: downloads and credits earned
-- ---------------------------------------------------------------------------
create or replace view public.my_upload_stats
with (security_invoker = true) as
select
  t.resource_id,
  count(*)::int as downloads,
  sum(t.amount)::int as earned
from public.credit_transactions t
where t.kind = 'UPLOAD_EARNING'
  and t.user_id = (select auth.uid())
group by t.resource_id;

revoke all on public.my_upload_stats from anon;
grant select on public.my_upload_stats to authenticated;
