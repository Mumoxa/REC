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
- `INGEST_API_KEY`
- `WORKSPACE_SLUG=talent-tree`
- `NEXT_PUBLIC_DEMO_MODE=false`

## Authentication

Live mode uses Supabase Auth email OTP login with server-side cookie handling. The Auth email template must include `{{ .Token }}` so users receive a visible 6-digit code rather than relying on a one-click magic link.

Authenticated pages are protected by Next.js `proxy.ts` and Supabase JWT claim validation.

## Data flow

```text
REC instructions
  → ChatGPT / agent sourcing + downstream candidate research
  → progressive structured publication
  → Supabase operational database
  → post-write persistence verification
  → Next.js server repository adapter
  → Vacancy Intelligence Workspace

A source sweep ending does not make a REC run complete. `COMPLETE` requires QA-cleared client-submittable Top-10 candidate(s) for every qualifying vacancy. "Published" requires successful persistence verification.
```

## Write boundaries

Browser:

- vacancy operational state
- candidate operational state
- saved views

Agent/service:

- publishes through the Supabase `ingest-run` Edge Function;
- the Edge Function performs privileged writes using Supabase's native service role;
- Vercel never receives a database admin/service-role secret.

Research tables written by the ingestion function include runs, canonical vacancies, sources, requirements, stakeholders, target companies, research queries, candidates, candidate assignments, candidate claims and QA reviews.

## CI

Pull requests touching the app run:

1. npm install
2. TypeScript typecheck
3. production Next.js build in demo mode

Do not merge an app change until CI passes.
