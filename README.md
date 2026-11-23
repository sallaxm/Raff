# Raff

A student resource exchange. Students upload notes, past papers, labs and assignments,
organised by college → major → course. Moderators approve uploads, uploaders earn credits,
downloading costs credits, and students can top up credits in QAR.

Built with Next.js 16 (App Router), React 19, Tailwind CSS 3 and Supabase (Auth, Postgres, Storage).

## Features

- Email + password accounts (any email domain), password reset
- Course-first navigation: search by course code, every course has its own page of files
- Official UDST 2026-2027 study plans for all 66 programs: bachelor, diploma, advanced diploma and master's (year → term, elective pools)
- Students set their program and pin "My courses" for one-tap access from the home page
- Uploads with automatic page counting for PDF and DOCX, 10 uploads/day, 50 MB max
- Moderator queue: review, edit metadata, set reward, approve, reject with reason, delete
- Ledger-backed credit system (see [`docs/credit-system.md`](docs/credit-system.md))
- Credit top-ups in QAR via Tap Payments (NAPS/QPay debit, Visa, Mastercard, Apple Pay)
- Light/dark theme, mobile drawer navigation

## Local setup

**Requirements:** Node.js 20+, npm, and the [Supabase CLI](https://supabase.com/docs/guides/cli)
(only needed for running the database locally or pushing migrations).

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:3000
```

### Environment variables

| Variable | Where | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | client + server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client + server | Public anon key (RLS applies) |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only** | Used by API routes for uploads, downloads and moderation |
| `NEXT_PUBLIC_SITE_URL` | client | Base URL for auth email links (defaults to the current origin) |
| `NEXT_PUBLIC_CONTACT_EMAIL` | client | Address the Feedback page opens an email to |
| `TAP_SECRET_KEY` | **server only** | Tap Payments secret key. Purchases are disabled while empty |
| `TAP_SOURCE_ID` | server | Optional, defaults to `src_all` (all methods enabled on your Tap account) |

The service role key bypasses Row Level Security. Never prefix it with `NEXT_PUBLIC_` or import
`src/lib/supabase/admin.ts` from a client component (it is marked `server-only`).

### Running Supabase locally (optional)

```bash
supabase start            # starts local Postgres, Auth, Storage
supabase db reset         # applies everything in supabase/migrations
```

`supabase start` prints a local URL and keys. Put them in `.env.local`.
If storage policies go missing after a reset, run `scripts/setup-storage.ps1`.

## Database

All schema changes live in `supabase/migrations` and are applied in filename order.
`supabase/snippets` holds scratch SQL and is **not** applied.

To apply new migrations to the hosted project:

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

Check what will run first with `supabase db push --dry-run`.

### Study plans

`supabase/migrations/*_050_seed_udst_study_plans.sql` (bachelor) and `*_051_seed_udst_diplomas_and_masters.sql` load the official UDST study plans
(programs, courses, year/term placement and elective pools). It is idempotent: re-running it
updates course titles and replaces each program's course list without touching uploads.
To refresh it for a new academic year, re-scrape the program pages linked from https://www.udst.edu.qa/admissions/all-programs and generate
a new seed migration in the same format.

### Making someone a moderator

In the Supabase SQL editor:

```sql
update public.profiles set role = 'mod' where id = '<user-uuid>';
```

(`role = 'admin'` also has moderator access.)

## Deploying

The app deploys to any Next.js host. On Vercel:

1. Import the repo and add the environment variables above (Production + Preview).
2. In Supabase → **Authentication → URL Configuration**, set **Site URL** to your production URL
   and add `https://<your-domain>/auth/callback` to the redirect URLs, so confirmation and
   password-reset links work.
3. Deploy. `npm run build` also checks for leftover merge-conflict markers.

## Payments (Qatar)

Purchases go through **[Tap Payments](https://www.tap.company/qa/en)**, whose hosted checkout
supports NAPS / QPay debit cards, Visa, Mastercard, Apple Pay and Google Pay, all in **QAR**.
Packs are defined in `src/lib/payments/packs.ts`.

1. The user picks a pack on `/credits`. `POST /api/payments/checkout` creates a `pending` row in
   `public.payments` plus a Tap charge, and redirects to Tap's hosted page.
2. Tap redirects back to `/api/payments/tap/return?tap_id=chg_…` and also calls
   `/api/payments/tap/webhook` server-to-server (covers users who close the tab early).
3. Both endpoints re-fetch the charge from Tap (never trusting query params or webhook bodies),
   check amount and currency, then call `fulfill_payment()`. That function is idempotent and can
   only be run by the service role, so credits are granted exactly once.

Going live needs a Tap merchant account (Qatar CR or freelance licence plus a Qatari bank
account). Test with an `sk_test_…` key first. The gateway code is isolated in
`src/lib/payments/`, so SkipCash or SADAD can be swapped in without touching the schema or UI.

## Styling

Shared component classes live in `src/app/globals.css`: `page`, `card`, `card-hero`,
`btn-primary`, `btn-secondary`, `btn-ghost`, `btn-danger`, `input`, `label`, `pill`,
`segmented`, `badge-*` and `notice-*`. Use these instead of repeating long Tailwind strings.

## Project layout

```
src/app/              pages and API routes (App Router)
  _components/        layout pieces: SideNav, MobileHeader, HomeSearch
  api/                server routes: upload, download, preview, moderation
  api/payments/       checkout, Tap return URL and webhook
  mod/                moderator dashboard
src/components/       shared UI (Brand, ThemeToggle)
src/lib/supabase/     browser, server and service-role clients
src/lib/payments/     credit packs, Tap client, payment service
src/lib/credits.ts    UI mirrors of the SQL credit formulas
src/lib/format.ts     cn(), timeAgo(), one(), formatQar()
src/proxy.ts          session refresh + auth guard for /upload, /credits, /mod
supabase/             config, migrations, SQL tests
docs/                 credit system notes
```

## Scripts

- `npm run dev`: start the dev server on port 3000
- `npm run build`: check for merge markers, then build for production
- `npm run start`: serve the production build
- `npm run lint`: run ESLint
