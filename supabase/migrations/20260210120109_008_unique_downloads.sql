-- 008_unique_downloads.sql

alter table public.downloads
add constraint downloads_user_resource_unique
unique (user_id, resource_id);