-- 025_lock_resource_file_fields.sql
-- Lock file path + uploader so mods can't change the file, only metadata.

create or replace function public.lock_resource_file_fields()
returns trigger
language plpgsql
as $$
begin
  if new.storage_path is distinct from old.storage_path then
    raise exception 'File cannot be changed';
  end if;

  if new.uploader_id is distinct from old.uploader_id then
    raise exception 'Uploader cannot be changed';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_lock_resource_file_fields on public.resources;

create trigger trg_lock_resource_file_fields
before update on public.resources
for each row
execute function public.lock_resource_file_fields();