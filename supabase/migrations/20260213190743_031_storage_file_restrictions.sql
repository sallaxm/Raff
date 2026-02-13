create or replace function public.validate_file_type(filename text)
returns boolean
language plpgsql
as $$
begin
  return filename ~* '\.(pdf|doc|docx|ppt|pptx|xls|xlsx|zip)$';
end;
$$;