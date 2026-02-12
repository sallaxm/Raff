-- 007_add_credit_tx_resource_note.sql

alter table public.credit_transactions
add column if not exists resource_id uuid references public.resources(id) on delete set null,
add column if not exists note text;