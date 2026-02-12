-- Users can upload ONLY to their folder
create policy "Users upload to own folder"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'resources'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users cannot directly read files
-- Signed URLs will bypass this safely
create policy "Block direct reads"
on storage.objects
for select
to authenticated
using (false);