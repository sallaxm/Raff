# Credit System

## Overview
This project uses a ledger-backed credit system in Supabase.

### Starter credits
- Every new user gets a `profiles` row with `20` credits.
- A corresponding `credit_transactions` entry is inserted with kind `STARTER`.

### Download cost
- Cost formula: `CEIL(page_count / 5)`.
- Cost is clamped to the range `1..20` via `public.calculate_download_cost(pages integer)`.
- `spend_credits_and_log_download` uses this computed value and logs a `DOWNLOAD` transaction.

### Upload reward
- Base reward formula: `FLOOR(download_cost * 0.60)` via `public.calculate_upload_reward(cost integer)`.
- Moderators can set per-resource:
  - `reward_override` (exact reward), or
  - `quality_multiplier` (multiplies base reward).
- Approval flow (`approve_resource`) applies either override or multiplier-based reward.

### First approved upload bonus
- On a user’s first approved resource, the system adds `+3` credits on top of reward.

### Credit sinks
- **Boosts** (`create_boost`): users spend credits to boost their own resources.
- **Bounties** (`create_bounty` + `award_bounty`): users lock credits as bounty rewards and later award them.

## Data model
- `profiles.credits` default is `20`.
- `credit_transactions` records all balances changes.
- `resources` now includes:
  - `reward_override integer null`
  - `quality_multiplier numeric(6,2) default 1.0`
- `resource_boosts` tracks boosts.
- `bounties` tracks bounty lifecycle and payouts.

## Security and integrity
- Security-definer functions are used for balance mutations.
- Exceptions return explicit business-error messages.
- Constraints enforce valid ranges and transaction kinds.
- RLS protects new tables and extends moderator visibility for transaction auditing.
