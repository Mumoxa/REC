-- First-class hiring-team and company-email intelligence.
-- Keeps observed business emails distinct from pattern-inferred probable emails.

alter table public.vacancies
  add column if not exists stakeholder_map_status text not null default 'NOT_STARTED',
  add column if not exists stakeholder_map_note text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.vacancies'::regclass
      and conname = 'vacancies_stakeholder_map_status_check'
  ) then
    alter table public.vacancies
      add constraint vacancies_stakeholder_map_status_check
      check (stakeholder_map_status in ('NOT_STARTED','IN_PROGRESS','READY','BLOCKED_WITH_EVIDENCE'));
  end if;
end
$$;

alter table public.stakeholders
  add column if not exists reason_relevant text,
  add column if not exists observed_business_email text,
  add column if not exists probable_business_email text,
  add column if not exists email_confidence_note text,
  add column if not exists last_verified timestamptz;

create table if not exists public.company_email_intelligence (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  vacancy_id uuid not null references public.vacancies(id) on delete cascade,
  company_id uuid references public.companies(id) on delete set null,
  website_domain text,
  employee_email_domain text,
  domain_status text not null default 'UNKNOWN'
    check (domain_status in ('CONFIRMED','PROBABLE','CONFLICTING','UNKNOWN')),
  observed_pattern_examples_count integer not null default 0 check (observed_pattern_examples_count >= 0),
  observed_business_email_examples text[] not null default '{}',
  detected_pattern text,
  pattern_status text not null default 'UNKNOWN_PATTERN'
    check (pattern_status in ('CONFIRMED_PATTERN','PROBABLE_PATTERN','CONFLICTING_PATTERNS','UNKNOWN_PATTERN')),
  pattern_basis text[] not null default '{}',
  alternate_patterns text[] not null default '{}',
  notes text,
  last_verified timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, vacancy_id)
);

create index if not exists idx_company_email_intelligence_vacancy
  on public.company_email_intelligence(vacancy_id);

alter table public.company_email_intelligence enable row level security;
revoke all on table public.company_email_intelligence from anon, authenticated;
grant select on table public.company_email_intelligence to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public'
      and tablename='company_email_intelligence'
      and policyname='Workspace members can read.'
  ) then
    create policy "Workspace members can read."
      on public.company_email_intelligence
      for select to authenticated
      using (workspace_id in (select private.user_workspace_ids()));
  end if;
end
$$;
