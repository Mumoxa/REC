create table if not exists public.ingest_tokens (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  token_hash text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  last_used_at timestamptz
);

alter table public.ingest_tokens enable row level security;
revoke all on table public.ingest_tokens from anon, authenticated;
