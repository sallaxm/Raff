alter table resources
add column if not exists file_size bigint,
add column if not exists mime_type text;