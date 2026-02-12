# scripts/setup-storage.ps1
# Recreate local Supabase storage bucket + policies after db reset

# Ensure services are up
supabase status | Out-Null

# Create bucket (ignore if exists)
supabase storage bucket create resources --public=false 2>$null

# Apply policies using SQL (these are storage.objects policies)
$policySql = @"
alter table storage.objects enable row level security;

drop policy if exists "resources_upload_own_folder" on storage.objects;
create policy "resources_upload_own_folder"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'resources'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "resources_read_approved_or_own" on storage.objects;
create policy "resources_read_approved_or_own"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'resources'
  and (
    (storage.foldername(name))[1] = auth.uid()::text
    or exists (
      select 1
      from public.resources r
      where r.storage_path = storage.objects.name
        and r.status = 'approved'
    )
  )
);
"@

# Run SQL against local DB
supabase db query "$policySql"