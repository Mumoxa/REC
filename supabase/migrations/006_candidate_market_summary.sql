-- Preserve the full researched candidate market separately from the final Top 10 subset.

alter table public.vacancies
  add column if not exists candidate_market_summary jsonb not null default '{}'::jsonb;
