-- 010_core_rls.sql

--------------------------------------------------
-- ENABLE RLS
--------------------------------------------------

alter table public.profiles enable row level security;
alter table public.resources enable row level security;
alter table public.credit_transactions enable row level security;
alter table public.downloads enable row level security;

--------------------------------------------------
-- PROFILES
--------------------------------------------------

-- Users can see their own profile
create policy "profile_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

-- Users can update their own profile (name etc.)
create policy "profile_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id);

--------------------------------------------------
-- RESOURCES
--------------------------------------------------

-- Anyone logged in can see approved resources
create policy "resources_select_approved"
on public.resources
for select
to authenticated
using (
  status = 'approved'
);

-- Uploaders can see their own pending uploads
create policy "resources_select_own"
on public.resources
for select
to authenticated
using (
  uploader_id = auth.uid()
);

-- Only uploader can insert
create policy "resources_insert_own"
on public.resources
for insert
to authenticated
with check (
  uploader_id = auth.uid()
);

--------------------------------------------------
-- MODS CAN SEE EVERYTHING
--------------------------------------------------

create policy "mods_full_resources"
on public.resources
for all
to authenticated
using (public.is_mod())
with check (public.is_mod());

--------------------------------------------------
-- CREDIT TRANSACTIONS
--------------------------------------------------

create policy "credits_select_own"
on public.credit_transactions
for select
to authenticated
using (user_id = auth.uid());

--------------------------------------------------
-- DOWNLOADS
--------------------------------------------------

create policy "downloads_select_own"
on public.downloads
for select
to authenticated
using (user_id = auth.uid());