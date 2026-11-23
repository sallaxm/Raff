# Raff

A student resource exchange. Students upload notes, past papers, labs and assignments,
organised by college → major → course. Moderators approve uploads, uploaders earn credits,
and downloading costs credits.

Built with Next.js 16 (App Router), React 19, Tailwind CSS 3 and Supabase (Auth, Postgres, Storage).

## Features

- Email + password accounts (any email domain), password reset
- Browse by college, major and course; search from the home page
- Uploads with automatic page counting for PDF and DOCX, 10 uploads/day, 50 MB max
- Moderator queue: review, edit metadata, set reward, approve, reject with reason, delete
- Ledger-backed credit system (see [`docs/credit-system.md`](docs/credit-system.md))
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

The service role key bypasses Row Level Security. Never prefix it with `NEXT_PUBLIC_` or import
`src/lib/supabase/admin.tsx` from a client component.

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

## Project layout

```
src/app/            pages and API routes (App Router)
  api/              server routes: upload, download, preview, moderation
  mod/              moderator dashboard
src/components/     shared UI (theme toggle)
src/lib/supabase/   browser, server and service-role clients
src/proxy.ts        session refresh + auth guard for /upload, /credits, /mod
supabase/           config, migrations, SQL tests
docs/               credit system notes
```

## Scripts

- `npm run dev`: start the dev server on port 3000
- `npm run build`: check for merge markers, then build for production
- `npm run start`: serve the production build
- `npm run lint`: run ESLint
