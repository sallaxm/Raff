-- 038b_normalize_credit_kinds.sql
-- Older databases logged downloads as 'DOWNLOAD_COST'. 039 introduces a CHECK
-- constraint that only allows 'DOWNLOAD', so normalise existing rows first.
-- No-op on fresh databases.

update public.credit_transactions
set kind = 'DOWNLOAD'
where kind = 'DOWNLOAD_COST';
