# Credit System

Ledger-backed credits in Supabase. Every balance change happens inside a
`security definer` function and is logged in `credit_transactions`.
Rules live in `supabase/migrations/*_052_credit_economy_v2.sql`; the UI mirrors
them in `src/lib/credits.ts`.

## Rules

| Event | Credits | Ledger kind |
| --- | --- | --- |
| Sign up | +10 | `STARTER` |
| Download a file (once per file; re-opening is free) | −2 (or the moderator's price) | `DOWNLOAD` |
| Someone downloads your file | +half the price, min 1 (normally +1) | `UPLOAD_EARNING` |
| Moderator approves your upload | +2 (× quality multiplier, or an exact override) | `UPLOAD_REWARD` |
| First approved upload | +10 one-time bonus (included in `UPLOAD_REWARD`) | `UPLOAD_REWARD` |
| Buy a credit pack (QAR, via Tap) | + pack size | `PURCHASE` |

At the default price each download moves 1 credit to the uploader and removes 1,
so credits circulate without inflating. Purchases and starter credits are the
only sources of new credits besides approvals.

## Why these numbers

The previous version priced files by page count (1 credit per 5 pages) and paid
uploaders 60% of that once, at approval. Short files — the most useful past
papers — earned their uploaders 0 credits, popular files earned no more than
unused ones, and 20 free credits per new account made throwaway accounts the
cheapest way to download. See migration 052 for details.

## Functions

- `calculate_download_cost(pages)` — flat 2 (argument kept for compatibility).
- `calculate_uploader_share(cost)` — `max(1, floor(cost / 2))`, 0 for free files.
- `calculate_upload_reward(cost)` — 2.
- `approve_resource(id)` / `approve_resource_with_reward(id, override)` — moderator
  approval; applies `reward_override` or `quality_multiplier`, plus first-upload bonus.
- `spend_credits_and_log_download(id)` — charges the stored `resources.cost`,
  records the download, pays the uploader their share.
- `fulfill_payment(payment_id)` — idempotent credit purchase (service role only).

## Moderator controls (per resource)

- `cost_override` — custom price (set by entering a cost in the moderator panel).
- `reward_override` — exact approval reward.
- `quality_multiplier` — multiplies the approval reward (0–5).

## Views

- `course_resource_counts` — approved files per course.
- `my_upload_stats` — downloads and credits earned per upload, for the signed-in user.

## Also available (no UI yet)

- Boosts (`create_boost`) and bounties (`create_bounty`, `award_bounty`).
