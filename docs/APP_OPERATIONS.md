# Recruitment Intelligence App Operations

## Local/development mode

The app can run without Supabase:

```bash
NEXT_PUBLIC_DEMO_MODE=true npm run dev
```

Demo mode uses `src/lib/data/demo.ts` and allows full UI interaction without persisting recruiter actions.

## Live mode

Required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`
- `INGEST_API_KEY`
- `WORKSPACE_SLUG=talent-tree`
- `NEXT_PUBLIC_DEMO_MODE=false`

## Authentication

Live mode uses Supabase Auth magic-link login with server-side cookie handling.

Authenticated pages are protected by Next.js `proxy.ts` and Supabase JWT claim validation.

## Data flow

```text
REC instructions
  → ChatGPT / agent research run
  → validated structured payload
  → Supabase operational database
  → Next.js server repository adapter
  → Vacancy Intelligence Workspace
```

## Write boundaries

Browser:

- vacancy operational state
- candidate operational state
- saved views

Agent/service:

- runs
- canonical vacancies
- sources
- requirements
- stakeholders
- target companies
- research queries
- candidates
- candidate assignments
- candidate claims
- QA reviews

## CI

Pull requests touching the app run:

1. npm install
2. TypeScript typecheck
3. production Next.js build in demo mode

Do not merge an app change until CI passes.
