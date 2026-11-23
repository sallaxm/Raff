-- 047_credit_purchases.sql
-- Paid credit top-ups (QAR) via an external payment gateway (Tap Payments).
--
-- Flow:
--   1. Server (service role) inserts a `payments` row with status 'pending'.
--   2. User pays on the gateway's hosted page.
--   3. Server verifies the charge with the gateway API, then calls
--      fulfill_payment(), which credits the user exactly once.

-- Allow purchase transactions in the credit ledger
alter table public.credit_transactions
  drop constraint if exists credit_transactions_kind_valid;

alter table public.credit_transactions
  add constraint credit_transactions_kind_valid
  check (
    kind in (
      'STARTER',
      'UPLOAD_REWARD',
      'UPLOAD_BONUS',
      'DOWNLOAD',
      'ADJUSTMENT',
      'REFUND',
      'BOOST',
      'BOUNTY_CREATE',
      'BOUNTY_REFUND',
      'BOUNTY_PAYOUT',
      'PURCHASE'
    )
  );

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null,
  provider_ref text,                       -- gateway charge id, e.g. chg_...
  pack_id text not null,
  credits integer not null check (credits > 0),
  amount numeric(10, 2) not null check (amount > 0),
  currency text not null default 'QAR',
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'failed', 'cancelled')),
  failure_reason text,
  raw jsonb,                               -- last gateway response, for support/debugging
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  paid_at timestamptz
);

create unique index if not exists payments_provider_ref_key
  on public.payments(provider, provider_ref)
  where provider_ref is not null;

create index if not exists idx_payments_user on public.payments(user_id, created_at desc);

-- Users can read their own payments; all writes go through the service role.
alter table public.payments enable row level security;

drop policy if exists "payments_select_own_or_mod" on public.payments;
create policy "payments_select_own_or_mod"
on public.payments
for select
to authenticated
using (user_id = auth.uid() or public.is_mod());

-- Idempotently mark a payment as paid and credit the user.
-- Returns true if credits were granted by this call, false if already fulfilled.
create or replace function public.fulfill_payment(
  p_payment_id uuid,
  p_raw jsonb default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid;
  v_credits integer;
  v_status text;
  v_amount numeric(10, 2);
  v_currency text;
begin
  select user_id, credits, status, amount, currency
  into v_user, v_credits, v_status, v_amount, v_currency
  from public.payments
  where id = p_payment_id
  for update;

  if not found then
    raise exception 'Payment not found';
  end if;

  if v_status = 'paid' then
    return false;
  end if;

  update public.payments
  set status = 'paid',
      paid_at = now(),
      updated_at = now(),
      failure_reason = null,
      raw = coalesce(p_raw, raw)
  where id = p_payment_id;

  update public.profiles
  set credits = credits + v_credits
  where id = v_user;

  insert into public.credit_transactions(user_id, amount, kind, note)
  values (
    v_user,
    v_credits,
    'PURCHASE',
    format('Purchased %s credits (%s %s)', v_credits, v_amount, v_currency)
  );

  return true;
end;
$$;

-- Only the server (service role) may fulfil payments.
revoke all on function public.fulfill_payment(uuid, jsonb) from public;
revoke all on function public.fulfill_payment(uuid, jsonb) from anon, authenticated;
grant execute on function public.fulfill_payment(uuid, jsonb) to service_role;
