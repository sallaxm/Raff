-- 048_security_hardening.sql
-- Fixes found by the Supabase advisors and a review of the live database.
--
--  1. RLS was disabled on courses, institutions and platform_settings, so anyone
--     with the anon key could edit or delete them.
--  2. Users could UPDATE their own profile's role/banned columns (only credits
--     were guarded) and make themselves admin.
--  3. Duplicate / overlapping policies on resources and profiles.
--  4. RLS policies called auth.uid() per row (slow at scale).
--  5. SECURITY DEFINER functions were executable by anon; some lacked search_path.
--  6. approve_resource_with_reward (used by the mod panel) used an outdated
--     reward formula, and approval/download ignored moderator cost overrides.
--  7. Signup trigger regressed to granting no starter-credit ledger entry.
--  8. Missing foreign-key indexes.

-- ---------------------------------------------------------------------------
-- 1. Reference tables: everyone can read, only moderators can write
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array['institutions', 'colleges', 'majors', 'courses', 'major_courses', 'platform_settings']
  loop
    execute format('alter table public.%I enable row level security', t);

    -- drop every existing policy on the table, then recreate a clean set
    perform 1;
    execute (
      select coalesce(string_agg(format('drop policy if exists %I on public.%I;', policyname, t), ' '), 'select 1')
      from pg_policies where schemaname = 'public' and tablename = t
    );

    execute format('create policy %I on public.%I for select to anon, authenticated using (true)', t || '_read_all', t);
    execute format('create policy %I on public.%I for insert to authenticated with check ((select public.is_mod()))', t || '_insert_mod', t);
    execute format('create policy %I on public.%I for update to authenticated using ((select public.is_mod())) with check ((select public.is_mod()))', t || '_update_mod', t);
    execute format('create policy %I on public.%I for delete to authenticated using ((select public.is_mod()))', t || '_delete_mod', t);
  end loop;
end
$$;

-- ---------------------------------------------------------------------------
-- 2. Profiles: users may read their own row and edit only safe columns
-- ---------------------------------------------------------------------------
drop policy if exists "profile_select_own" on public.profiles;
drop policy if exists "profile_update_own_no_credits" on public.profiles;
drop policy if exists "profile_update_own_no_credit_change" on public.profiles;
drop policy if exists "profile_update_own" on public.profiles;
drop policy if exists "profiles_select_own_or_mod" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;

create policy "profiles_select_own_or_mod"
on public.profiles for select to authenticated
using (id = (select auth.uid()) or (select public.is_mod()));

create policy "profiles_update_own"
on public.profiles for update to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

-- Column-level privileges: role, credits, banned and institution are server-managed.
revoke insert, update, delete on public.profiles from anon, authenticated;
grant update (full_name) on public.profiles to authenticated;
do $$
begin
  -- added by 049; keep it editable if this migration is re-run afterwards
  if exists (select 1 from information_schema.columns
             where table_schema = 'public' and table_name = 'profiles' and column_name = 'major_id') then
    grant update (major_id) on public.profiles to authenticated;
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- 3. Resources: one policy per action
-- ---------------------------------------------------------------------------
do $$
begin
  execute (
    select coalesce(string_agg(format('drop policy if exists %I on public.resources;', policyname), ' '), 'select 1')
    from pg_policies where schemaname = 'public' and tablename = 'resources'
  );
end
$$;

create policy "resources_select"
on public.resources for select to anon, authenticated
using (
  status = 'approved'
  or uploader_id = (select auth.uid())
  or (select public.is_mod())
);

create policy "resources_insert_own"
on public.resources for insert to authenticated
with check (
  (select auth.uid()) is not null
  and (uploader_id = (select auth.uid()) or uploader_id is null)
  and status = 'pending'
);

create policy "resources_update_mod"
on public.resources for update to authenticated
using ((select public.is_mod()))
with check ((select public.is_mod()));

create policy "resources_delete_mod"
on public.resources for delete to authenticated
using ((select public.is_mod()));

-- ---------------------------------------------------------------------------
-- 4. Ledger / downloads: own rows (or mods), evaluated once per query
-- ---------------------------------------------------------------------------
drop policy if exists "credits_select_own" on public.credit_transactions;
drop policy if exists "credits_select_mod_all" on public.credit_transactions;
drop policy if exists "credits_select_own_or_mod" on public.credit_transactions;
create policy "credits_select_own_or_mod"
on public.credit_transactions for select to authenticated
using (user_id = (select auth.uid()) or (select public.is_mod()));

drop policy if exists "downloads_select_own" on public.downloads;
create policy "downloads_select_own"
on public.downloads for select to authenticated
using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- 5. Functions: fixed search_path; internal ones not callable over the API
-- ---------------------------------------------------------------------------
create or replace function public.is_mod()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('mod', 'admin')
  );
$$;

do $$
declare
  f record;
begin
  for f in
    select p.oid::regprocedure as sig
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.prokind = 'f'
      and p.proname in (
        'reject_resource', 'ensure_profile', 'lock_resource_file_fields',
        'update_resource_metadata', 'check_daily_upload_limit', 'validate_file_type',
        'check_uploads_enabled', 'sync_resource_cost_from_pages',
        'calculate_download_cost', 'calculate_upload_reward'
      )
  loop
    execute format('alter function %s set search_path = public', f.sig);
  end loop;

  -- Nothing in public should be callable without signing in, except is_mod()
  -- (used inside RLS policies that anon also evaluates).
  for f in
    select p.oid::regprocedure as sig, p.proname
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.prokind = 'f'
  loop
    if f.proname <> 'is_mod' then
      execute format('revoke execute on function %s from public, anon', f.sig);
    end if;
  end loop;
end
$$;

-- Trigger-only / server-only functions: not callable by signed-in users either.
do $$
declare
  f record;
begin
  for f in
    select p.oid::regprocedure as sig
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.prokind = 'f'
      and p.proname in (
        'handle_new_user', 'set_uploader_id', 'lock_resource_file_fields',
        'check_daily_upload_limit', 'check_uploads_enabled',
        'sync_resource_cost_from_pages', 'ensure_profile', 'fulfill_payment'
      )
  loop
    execute format('revoke execute on function %s from authenticated', f.sig);
  end loop;
end
$$;

-- ---------------------------------------------------------------------------
-- 6. Credit logic: respect moderator cost overrides everywhere
-- ---------------------------------------------------------------------------
create or replace function public.sync_resource_cost_from_pages()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.cost := coalesce(new.cost_override, public.calculate_download_cost(new.page_count));
  return new;
end;
$$;

drop trigger if exists trg_sync_resource_cost_from_pages on public.resources;
create trigger trg_sync_resource_cost_from_pages
before insert or update of page_count, cost_override
on public.resources
for each row
execute procedure public.sync_resource_cost_from_pages();

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

  if not exists (
    select 1 from public.resources
    where uploader_id = v_uploader and status = 'approved'
  ) then
    v_bonus := 3;
  end if;

  update public.resources
  set status = 'approved',
      cost = v_cost,
      rejected_reason = null
  where id = p_resource_id;

  if v_reward + v_bonus > 0 then
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

-- The moderator panel calls this. Keep the signature, delegate to approve_resource().
create or replace function public.approve_resource_with_reward(
  p_resource_id uuid,
  p_reward_override integer default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_mod() then
    raise exception 'Not authorized';
  end if;

  if p_reward_override is not null then
    update public.resources
    set reward_override = greatest(0, p_reward_override)
    where id = p_resource_id;
  end if;

  perform public.approve_resource(p_resource_id);
end;
$$;

-- Charge the stored cost (formula or moderator override, kept in sync by trigger).
create or replace function public.spend_credits_and_log_download(p_resource_id uuid)
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

  select cost, page_count, uploader_id, status
  into v_cost, v_pages, v_uploader, v_status
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
  values (v_user, p_resource_id, -v_cost, 'DOWNLOAD', format('Resource download (%s pages)', v_pages));
end;
$$;

grant execute on function public.approve_resource(uuid) to authenticated;
grant execute on function public.approve_resource_with_reward(uuid, integer) to authenticated;
grant execute on function public.spend_credits_and_log_download(uuid) to authenticated;
revoke execute on function public.approve_resource(uuid) from public, anon;
revoke execute on function public.approve_resource_with_reward(uuid, integer) from public, anon;
revoke execute on function public.spend_credits_and_log_download(uuid) from public, anon;

-- ---------------------------------------------------------------------------
-- 7. Signup: 20 starter credits, logged in the ledger, never blocks signup
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
  values (new.id, v_institution, 'user', 20)
  on conflict (id) do nothing;

  get diagnostics v_inserted = row_count;
  if v_inserted > 0 then
    insert into public.credit_transactions (user_id, amount, kind, note)
    values (new.id, 20, 'STARTER', 'Starter credits on signup');
  end if;

  return new;
exception
  when others then
    raise warning 'handle_new_user warning for %: %', new.id, sqlerrm;
    return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles alter column credits set default 20;

-- Backfill: accounts created while the trigger granted nothing get their starter credits.
with missing as (
  select p.id
  from public.profiles p
  where not exists (
    select 1 from public.credit_transactions t
    where t.user_id = p.id and t.kind = 'STARTER'
  )
),
credited as (
  update public.profiles p
  set credits = p.credits + 20
  from missing m
  where p.id = m.id
  returning p.id
)
insert into public.credit_transactions (user_id, amount, kind, note)
select id, 20, 'STARTER', 'Starter credits (backfilled)'
from credited;

-- ---------------------------------------------------------------------------
-- 8. Indexes for foreign keys / common lookups; drop duplicate unique indexes
-- ---------------------------------------------------------------------------
create index if not exists idx_credit_tx_resource on public.credit_transactions(resource_id);
create index if not exists idx_major_courses_course on public.major_courses(course_id);
create index if not exists idx_majors_college on public.majors(college_id);
create index if not exists idx_profiles_institution on public.profiles(institution_id);
create index if not exists idx_resources_uploader on public.resources(uploader_id);

alter table public.colleges drop constraint if exists colleges_unique_slug_per_institution;
drop index if exists public.uq_colleges_institution_slug;
