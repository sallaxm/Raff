# Raff

A student resource exchange for universities in Qatar. Students upload past papers, notes and
assignments, moderators approve them, and uploaders earn **credits**. Downloading costs credits,
and students can **top up credits in QAR**.

Built with Next.js (App Router), Supabase (Postgres, Auth, Storage) and Tailwind CSS.

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev
```

Apply database migrations with the Supabase CLI:

```bash
supabase db push
```

## Project layout

```
src/
  app/                 Routes (pages + API route handlers)
    _components/       Layout pieces: SideNav, MobileHeader, HomeSearch
    api/payments/      Checkout, Tap return URL and webhook
  components/          Shared UI (Brand, ThemeToggle)
  lib/
    supabase/          browser / server / admin (service-role) clients
    payments/          Credit packs, Tap client, payment service
    credits.ts         UI mirrors of the SQL credit formulas
    format.ts          cn(), timeAgo(), one(), formatQar()
  app/globals.css      Design system: .card, .btn-*, .input, .badge-*, .notice-* …
supabase/migrations/   Schema, RLS and RPCs (the source of truth for credits)
```

Styling lives in `globals.css` as small component classes (`card`, `btn-primary`,
`btn-secondary`, `input`, `pill`, `segmented`, `badge-*`, `notice-*`). Use those instead of
repeating long Tailwind strings.

## Credits

| Event | Credits |
| --- | --- |
| Sign up | +20 |
| Download | −1 per 5 pages (min 1, max 20) |
| Upload approved | +60% of its download cost (+3 on your first approved upload) |
| Purchase | + pack size |

All balance changes happen in `security definer` Postgres functions and are logged in
`credit_transactions`. Users can't change `profiles.credits` directly (RLS).

## Payments (Qatar)

Purchases go through **[Tap Payments](https://www.tap.company/qa/en)**. Tap is available to
Qatari businesses and its hosted checkout supports:

- **NAPS / QPay** debit cards (what most people in Qatar use)
- Visa and Mastercard
- Apple Pay and Google Pay

All prices are in **QAR**. Packs are defined in `src/lib/payments/packs.ts`.

### How it works

1. The user picks a pack on `/credits`. `POST /api/payments/checkout` creates a `pending` row in
   `public.payments` and a Tap charge, then redirects the user to Tap's hosted payment page.
2. After paying, Tap redirects to `/api/payments/tap/return?tap_id=chg_…`. Tap also calls
   `/api/payments/tap/webhook` server-to-server, which covers users who close the tab early.
3. Both endpoints re-fetch the charge from Tap's API (they never trust query params or the
   webhook body), check the amount and currency, then call `fulfill_payment()`. That function is
   idempotent, so credits are granted exactly once.

### Going live

1. Create a Tap merchant account. You'll need a Qatar CR (commercial registration) or freelance
   licence and a Qatari bank account. Ask Tap to enable **NAPS/QPay** and **Apple Pay**.
2. Put your `sk_test_…` key in `TAP_SECRET_KEY` and test with Tap's sandbox cards.
3. Set `NEXT_PUBLIC_SITE_URL` to your public HTTPS domain. Tap must be able to reach the webhook.
4. Swap to your `sk_live_…` key.

### Alternatives

The payment code is isolated in `src/lib/payments/`. To use another Qatari gateway instead
(e.g. **SkipCash** or **SADAD**), write a client like `tap.ts` and update `service.ts`. The
database schema and UI stay the same.
