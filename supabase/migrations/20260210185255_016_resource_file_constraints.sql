-- 016_resource_file_constraints.sql
alter table public.resources
add column if not exists file_ext text,
add column if not exists file_size_bytes bigint;

-- Basic sanity
alter table public.resources
add constraint resources_file_size_reasonable
check (file_size_bytes is null or (file_size_bytes > 0 and file_size_bytes <= 50*1024*1024));

alter table public.resources
add constraint resources_file_ext_reasonable
check (file_ext is null or file_ext in ('pdf','doc','docx','ppt','pptx','xls','xlsx','png','jpg','jpeg'));