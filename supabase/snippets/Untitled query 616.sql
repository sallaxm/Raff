-- FIX_STORAGE_001_create_resources_bucket
insert into storage.buckets (id, name, public)
values ('resources', 'resources', false)
on conflict (id) do nothing;