-- CHECK_STORAGE_001_buckets
select id, name, public, created_at
from storage.buckets
order by created_at desc;