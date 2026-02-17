-- 039_credit_system.sql

-- Starter credits for new users
alter table public.profiles
  alter column credits set default 20;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles(id, institution_id, credits)
  values (new.id, 'udst', 20)
  on conflict (id) do nothing;

  insert into public.credit_transactions(user_id, amount, kind, note)
  values (new.id, 20, 'STARTER', 'Starter credits on signup');

  return new;
exception
  when others then
    raise exception 'handle_new_user failed: %', sqlerrm;
end;
$$;

-- Credit transaction consistency
alter table public.credit_transactions
  alter column created_at set default now();

alter table public.credit_transactions
  drop constraint if exists credit_transactions_user_id_fkey;

alter table public.credit_transactions
  add constraint credit_transactions_user_id_fkey
  foreign key (user_id)
  references public.profiles(id)
  on delete cascade;

alter table public.credit_transactions
  alter column note drop not null;

alter table public.credit_transactions
  drop constraint if exists credit_transactions_kind_valid;

alter table public.credit_transactions
  add constraint credit_transactions_kind_valid
  check (
    kind in (
      'STARTER',
      'UPLOAD_REWARD',
      'UPLOAD_BONUS',
      'DOWNLOAD',
      'ADJUSTMENT',
      'REFUND',
      'BOOST',
      'BOUNTY_CREATE',
      'BOUNTY_REFUND',
      'BOUNTY_PAYOUT'
    )
  );

-- Download cost and upload reward helpers
create or replace function public.calculate_download_cost(pages integer)
returns integer
language plpgsql
immutable
as $$
declare
  v_pages integer := greatest(coalesce(pages, 0), 0);
  v_cost integer;
begin
  v_cost := ceil(v_pages / 5.0)::integer;
  return least(greatest(v_cost, 1), 20);
end;
$$;

create or replace function public.calculate_upload_reward(cost integer)
returns integer
language plpgsql
immutable
as $$
begin
  return floor(greatest(coalesce(cost, 0), 0) * 0.60)::integer;
end;
$$;

-- Moderator controls on resources
alter table public.resources
  add column if not exists reward_override integer,
  add column if not exists quality_multiplier numeric(6,2) not null default 1.0;

alter table public.resources
  drop constraint if exists resources_reward_override_non_negative;

alter table public.resources
  add constraint resources_reward_override_non_negative
  check (reward_override is null or reward_override >= 0);

alter table public.resources
  drop constraint if exists resources_quality_multiplier_bounds;

alter table public.resources
  add constraint resources_quality_multiplier_bounds
  check (quality_multiplier >= 0 and quality_multiplier <= 5);

-- Keep resource cost synced with page_count formula
create or replace function public.sync_resource_cost_from_pages()
returns trigger
language plpgsql
as $$
begin
  new.cost := public.calculate_download_cost(new.page_count);
  return new;
end;
$$;

drop trigger if exists trg_sync_resource_cost_from_pages on public.resources;
create trigger trg_sync_resource_cost_from_pages
before insert or update of page_count
on public.resources
for each row
execute procedure public.sync_resource_cost_from_pages();

-- Approval logic with first-upload bonus and moderator controls
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
  v_base_reward integer;
  v_reward integer;
  v_total_reward integer;
  v_quality_multiplier numeric(6,2);
  v_reward_override integer;
  v_approved_count integer;
begin
  if not public.is_mod() then
    raise exception 'Not authorized';
  end if;

  select uploader_id, page_count, reward_override, quality_multiplier
  into v_uploader, v_pages, v_reward_override, v_quality_multiplier
  from public.resources
  where id = p_resource_id
    and status = 'pending'
  for update;

  if not found then
    raise exception 'Resource not found or already reviewed';
  end if;

  v_cost := public.calculate_download_cost(v_pages);
  v_base_reward := public.calculate_upload_reward(v_cost);

  if v_reward_override is not null then
    v_reward := v_reward_override;
  else
    v_reward := floor(v_base_reward * coalesce(v_quality_multiplier, 1.0))::integer;
  end if;

  select count(*)
  into v_approved_count
  from public.resources
  where uploader_id = v_uploader
    and status = 'approved';

  if v_approved_count = 0 then
    v_total_reward := v_reward + 3;
  else
    v_total_reward := v_reward;
  end if;

  update public.resources
  set status = 'approved',
      cost = v_cost
  where id = p_resource_id;

  update public.profiles
  set credits = credits + v_total_reward
  where id = v_uploader;

  insert into public.credit_transactions (user_id, amount, kind, resource_id, note)
  values (
    v_uploader,
    v_total_reward,
    'UPLOAD_REWARD',
    p_resource_id,
    format(
      'reward=%s, base=%s, multiplier=%s, override=%s, first_upload_bonus=%s',
      v_total_reward,
      v_base_reward,
      coalesce(v_quality_multiplier, 1.0),
      coalesce(v_reward_override::text, 'null'),
      case when v_approved_count = 0 then 3 else 0 end
    )
  );
exception
  when others then
    raise exception 'approve_resource failed: %', sqlerrm;
end;
$$;

-- Charge download credits using formulaic cost
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
  v_cost integer;
  v_pages integer;
  v_uploader uuid;
  v_status text;
  v_have integer;
  v_inserted integer;
begin
  if v_user is null then
    raise exception 'Not authenticated';
  end if;

  select page_count, uploader_id, status
  into v_pages, v_uploader, v_status
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

  v_cost := public.calculate_download_cost(v_pages);

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

  insert into public.credit_transactions(user_id, resource_id, amount, kind, note)
  values (v_user, p_resource_id, -v_cost, 'DOWNLOAD', format('Resource download (%s pages)', v_pages));
exception
  when others then
    raise exception 'spend_credits_and_log_download failed: %', sqlerrm;
end;
$$;

-- Credit sinks: boosts and bounties
create table if not exists public.resource_boosts (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid not null references public.resources(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount integer not null check (amount > 0),
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_resource_boosts_resource on public.resource_boosts(resource_id);
create index if not exists idx_resource_boosts_user on public.resource_boosts(user_id);

create table if not exists public.bounties (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  reward_credits integer not null check (reward_credits > 0),
  status text not null default 'open' check (status in ('open', 'awarded', 'cancelled', 'expired')),
  winner_user_id uuid references public.profiles(id) on delete set null,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_bounties_creator on public.bounties(creator_id);
create index if not exists idx_bounties_status on public.bounties(status);

create or replace function public.create_boost(
  p_resource_id uuid,
  p_amount integer,
  p_days integer default 7
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_have integer;
  v_boost_id uuid;
  v_owner uuid;
begin
  if v_user is null then
    raise exception 'Not authenticated';
  end if;

  if p_amount <= 0 then
    raise exception 'Boost amount must be positive';
  end if;

  if p_days <= 0 then
    raise exception 'Boost duration must be positive';
  end if;

  select uploader_id
  into v_owner
  from public.resources
  where id = p_resource_id;

  if not found then
    raise exception 'Resource not found';
  end if;

  if v_owner <> v_user then
    raise exception 'Only uploader can boost this resource';
  end if;

  select credits into v_have
  from public.profiles
  where id = v_user
  for update;

  if v_have < p_amount then
    raise exception 'Insufficient credits';
  end if;

  update public.profiles
  set credits = credits - p_amount
  where id = v_user;

  insert into public.resource_boosts(resource_id, user_id, amount, ends_at)
  values (p_resource_id, v_user, p_amount, now() + make_interval(days => p_days))
  returning id into v_boost_id;

  insert into public.credit_transactions(user_id, amount, kind, resource_id, note)
  values (v_user, -p_amount, 'BOOST', p_resource_id, format('Boost for %s day(s)', p_days));

  return v_boost_id;
end;
$$;

create or replace function public.create_bounty(
  p_title text,
  p_description text,
  p_reward_credits integer,
  p_expires_at timestamptz default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_have integer;
  v_bounty_id uuid;
begin
  if v_user is null then
    raise exception 'Not authenticated';
  end if;

  if p_reward_credits <= 0 then
    raise exception 'Bounty reward must be positive';
  end if;

  select credits into v_have
  from public.profiles
  where id = v_user
  for update;

  if v_have < p_reward_credits then
    raise exception 'Insufficient credits';
  end if;

  update public.profiles
  set credits = credits - p_reward_credits
  where id = v_user;

  insert into public.bounties(creator_id, title, description, reward_credits, expires_at)
  values (v_user, left(trim(p_title), 180), left(coalesce(p_description, ''), 3000), p_reward_credits, p_expires_at)
  returning id into v_bounty_id;

  insert into public.credit_transactions(user_id, amount, kind, note)
  values (v_user, -p_reward_credits, 'BOUNTY_CREATE', format('Bounty %s created', v_bounty_id));

  return v_bounty_id;
end;
$$;

create or replace function public.award_bounty(
  p_bounty_id uuid,
  p_winner_user_id uuid,
  p_note text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_creator uuid;
  v_reward integer;
  v_status text;
begin
  if v_user is null then
    raise exception 'Not authenticated';
  end if;

  select creator_id, reward_credits, status
  into v_creator, v_reward, v_status
  from public.bounties
  where id = p_bounty_id
  for update;

  if not found then
    raise exception 'Bounty not found';
  end if;

  if not (v_user = v_creator or public.is_mod()) then
    raise exception 'Not authorized';
  end if;

  if v_status <> 'open' then
    raise exception 'Bounty is not open';
  end if;

  update public.bounties
  set status = 'awarded',
      winner_user_id = p_winner_user_id,
      updated_at = now()
  where id = p_bounty_id;

  update public.profiles
  set credits = credits + v_reward
  where id = p_winner_user_id;

  insert into public.credit_transactions(user_id, amount, kind, note)
  values (p_winner_user_id, v_reward, 'BOUNTY_PAYOUT', left(coalesce(p_note, format('Bounty payout %s', p_bounty_id)), 500));
end;
$$;

-- RLS for new credit sink tables
alter table public.resource_boosts enable row level security;
alter table public.bounties enable row level security;

drop policy if exists "boosts_select_own_or_mod" on public.resource_boosts;
create policy "boosts_select_own_or_mod"
on public.resource_boosts
for select
to authenticated
using (user_id = auth.uid() or public.is_mod());

drop policy if exists "bounties_select_all" on public.bounties;
create policy "bounties_select_all"
on public.bounties
for select
to authenticated
using (true);

drop policy if exists "bounties_update_creator_or_mod" on public.bounties;
create policy "bounties_update_creator_or_mod"
on public.bounties
for update
to authenticated
using (creator_id = auth.uid() or public.is_mod())
with check (creator_id = auth.uid() or public.is_mod());

-- Strengthen transaction visibility with moderator access
alter table public.credit_transactions enable row level security;
drop policy if exists "credits_select_mod_all" on public.credit_transactions;
create policy "credits_select_mod_all"
on public.credit_transactions
for select
to authenticated
using (public.is_mod());
