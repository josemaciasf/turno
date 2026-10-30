# Turno

Scheduling, time clock and timesheets for hourly teams. Multi-tenant SaaS;
web now, iOS/Android (Expo) next. A clean-room rebuild of the core loop of
Homebase-style tools, planned in `replica/` (recon, architecture, schema,
design system).

Status: vertical slice, running on a development data store. See
`replica/build-log.md` and `replica/features.csv` (4 of 21 must-haves done,
10 partial).

## Run it

```bash
pnpm install
pnpm test                      # core time / pay / clock rules
pnpm build
TURNO_DEV_LOGIN=1 pnpm --filter @turno/web start -p 3100
```

Open http://localhost:3100, create a business, add people, put shifts on the
week and publish. `/dev/login` signs in as anyone (development only; it is
disabled in production unless `TURNO_DEV_LOGIN=1`). Data lives in
`apps/web/.data/store.json`.

End-to-end check with screenshots (needs Playwright installed globally):

```bash
cd apps/web && NODE_PATH="$(npm root -g)" node e2e/slice.mjs http://localhost:3100 ../../replica/clone-screens
```

## Layout

| path | what |
| --- | --- |
| `apps/web` | Next.js app: manager panel (schedule, team, timesheets) and the employee clock page |
| `packages/core` | time zones, overnight shifts, overtime and pay, clock-in rules; pure and tested |
| `replica/` | the plan: recon, architecture, `schema.sql`, design tokens and specs |

Design tokens live in `replica/design/tokens.json`; after editing run
`pnpm tokens` to regenerate the CSS and Tailwind preset.

## Next

1. Supabase backend (`/replica-backend`): auth by SMS code, Postgres with the
   RLS schema, notifications, Stripe.
2. Remaining must-haves: kiosk with PIN, breaks, availability and time off,
   shift edit/drag, CSV export.
3. Expo app for iOS and Android.
