-- Enable RLS on storage objects (usually already enabled, safe to run)
alter table storage.objects enable row level security;

-- Allow authenticated users to upload files into: resources/<USER_ID>/...
drop policy if exists "resources_upload_own_folder" on storage.objects;
create policy "resources_upload_own_folder"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'resources'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to read approved files via signed URLs later
-- (Signed URLs bypass RLS checks at access time, but keep select restricted anyway)
drop policy if exists "resources_read_own_folder" on storage.objects;
create policy "resources_read_own_folder"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'resources'
  and (storage.foldername(name))[1] = auth.uid()::text
);