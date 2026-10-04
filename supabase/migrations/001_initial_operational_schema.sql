-- Talent Tree Recruitment Intelligence operational database
-- Initial schema for browser workspace + ChatGPT/agent publishing.

create extension if not exists pgcrypto;
create schema if not exists private;

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('ADMIN','RECRUITER','VIEWER')),
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table if not exists public.runs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  external_run_id text not null,
  channel text not null check (channel in ('AGREED_CLIENTS','AGENCY_SITES','LINKEDIN','JOB_BOARDS')),
  status text not null default 'COMPLETE' check (status in ('QUEUED','RUNNING','COMPLETE','FAILED','PARTIAL')),
  spec_version text,
  geography jsonb not null default '{}'::jsonb,
  metrics jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, external_run_id)
);

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  canonical_name text not null,
  client_status text not null default 'UNKNOWN' check (client_status in ('AGREED_CLIENT','AGREED_GROUP_ENTITY','PAST_CLIENT','TARGET_PROSPECT','UNKNOWN')),
  industry text,
  website_domain text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, canonical_name)
);

create table if not exists public.vacancies (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  company_id uuid references public.companies(id) on delete set null,
  canonical_key text not null,
  title text not null,
  employer_name text not null default 'Employer unresolved',
  employer_status text not null default 'UNKNOWN' check (employer_status in ('CONFIRMED','PROBABLE','HYPOTHESIS','UNKNOWN')),
  location text,
  region text,
  role_family text,
  seniority text,
  client_status text not null default 'UNKNOWN' check (client_status in ('AGREED_CLIENT','AGREED_GROUP_ENTITY','PAST_CLIENT','TARGET_PROSPECT','UNKNOWN')),
  search_channel text not null check (search_channel in ('AGREED_CLIENTS','AGENCY_SITES','LINKEDIN','JOB_BOARDS')),
  source_label text,
  qa_status text not null default 'PASS_WITH_UNKNOWNS' check (qa_status in ('PASS','PASS_WITH_UNKNOWNS','FAIL_RESEARCH_REQUIRED')),
  candidate_map_status text not null default 'NOT_STARTED' check (candidate_map_status in ('NOT_STARTED','IN_PROGRESS','READY')),
  salary_text text,
  summary text,
  first_seen timestamptz not null default now(),
  last_seen timestamptz,
  last_verified timestamptz,
  last_changed timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, canonical_key)
);

create table if not exists public.vacancy_operations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  vacancy_id uuid not null references public.vacancies(id) on delete cascade,
  lifecycle_status text not null default 'DISCOVERED' check (lifecycle_status in ('DISCOVERED','VERIFYING','QUALIFIED','EMPLOYER_RESOLVED','CANDIDATE_MAPPING','MARKET_READY','CLIENT_ACTION','CLOSED')),
  unread boolean not null default true,
  closed_reason text check (closed_reason is null or closed_reason in ('FILLED','EXPIRED','CLIENT_NO_LONGER_HIRING','NOT_COMMERCIALLY_RELEVANT','DUPLICATE','CANCELLED','OTHER')),
  closed_at timestamptz,
  last_user_action_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (workspace_id, vacancy_id)
);

create table if not exists public.vacancy_sources (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  vacancy_id uuid not null references public.vacancies(id) on delete cascade,
  run_id uuid references public.runs(id) on delete set null,
  source_key text not null,
  source_type text not null,
  source_name text not null,
  source_url text,
  evidence_status text not null default 'UNKNOWN' check (evidence_status in ('CONFIRMED','PROBABLE','HYPOTHESIS','UNKNOWN')),
  posted_at timestamptz,
  first_seen timestamptz,
  last_seen timestamptz,
  raw_title text,
  raw_employer text,
  raw_location text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (workspace_id, vacancy_id, source_key)
);

create table if not exists public.vacancy_requirements (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  vacancy_id uuid not null references public.vacancies(id) on delete cascade,
  requirement_key text not null,
  label text not null,
  value text,
  evidence_status text not null default 'UNKNOWN' check (evidence_status in ('CONFIRMED','PROBABLE','HYPOTHESIS','UNKNOWN')),
  requirement_type text not null default 'CONTEXT' check (requirement_type in ('REQUIRED','PREFERRED','CONTEXT')),
  source_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (workspace_id, vacancy_id, requirement_key)
);

create table if not exists public.stakeholders (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  vacancy_id uuid not null references public.vacancies(id) on delete cascade,
  stakeholder_key text not null,
  full_name text not null,
  current_title text,
  relevance text,
  current_employment_status text,
  profile_url text,
  business_email text,
  email_status text,
  email_pattern_basis text,
  evidence_status text not null default 'UNKNOWN' check (evidence_status in ('CONFIRMED','PROBABLE','HYPOTHESIS','UNKNOWN')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, vacancy_id, stakeholder_key)
);

create table if not exists public.target_companies (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  vacancy_id uuid not null references public.vacancies(id) on delete cascade,
  company_key text not null,
  canonical_name text not null,
  tier text not null check (tier in ('A','B','C','D')),
  reason text not null,
  evidence_status text not null default 'UNKNOWN' check (evidence_status in ('CONFIRMED','PROBABLE','HYPOTHESIS','UNKNOWN')),
  sources jsonb not null default '[]'::jsonb,
  contradictions text[] not null default '{}',
  created_at timestamptz not null default now(),
  unique (workspace_id, vacancy_id, company_key)
);

create table if not exists public.research_queries (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  vacancy_id uuid not null references public.vacancies(id) on delete cascade,
  run_id uuid references public.runs(id) on delete set null,
  query_key text not null,
  query_text text not null,
  source text not null,
  search_family text not null,
  reason_generated text,
  execution_status text not null check (execution_status in ('EXECUTED','ACCESS_LIMITED','NOT_APPLICABLE','NOT_EXECUTED')),
  executed_at timestamptz,
  observed_yield integer,
  candidates_surfaced integer,
  notes text,
  created_at timestamptz not null default now(),
  unique (workspace_id, vacancy_id, query_key)
);

create table if not exists public.candidates (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  canonical_key text not null,
  full_name text not null,
  current_title text,
  current_employer text,
  location text,
  profile_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, canonical_key)
);

create table if not exists public.candidate_assignments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  vacancy_id uuid not null references public.vacancies(id) on delete cascade,
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  market_bucket text not null default 'UNREVIEWED' check (market_bucket in ('TOP_10','STRONG_MARKET','LONGLIST','UNREVIEWED','EXCLUDED')),
  rank integer,
  comparable_tier text check (comparable_tier is null or comparable_tier in ('A','B','C','D')),
  qa_status text not null default 'PASS_WITH_UNKNOWNS' check (qa_status in ('PASS','PASS_WITH_UNKNOWNS','FAIL_RESEARCH_REQUIRED')),
  why_fit text,
  evidence_gaps text[] not null default '{}',
  last_verified timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, vacancy_id, candidate_id)
);

create table if not exists public.candidate_operations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  vacancy_id uuid not null references public.vacancies(id) on delete cascade,
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  operational_status text not null default 'SURFACED' check (operational_status in ('SURFACED','RELEVANT','EARMARKED','TOP_10','APPROACH','ENGAGED','SUBMITTED','EXCLUDED')),
  excluded_reason text,
  last_user_action_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (workspace_id, vacancy_id, candidate_id)
);

create table if not exists public.candidate_claims (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  claim_key text not null,
  claim_name text not null,
  claim_value text,
  evidence_status text not null default 'UNKNOWN' check (evidence_status in ('CONFIRMED','PROBABLE','HYPOTHESIS','UNKNOWN')),
  source_url text,
  notes text,
  created_at timestamptz not null default now(),
  unique (workspace_id, candidate_id, claim_key)
);

create table if not exists public.qa_reviews (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  vacancy_id uuid references public.vacancies(id) on delete cascade,
  candidate_id uuid references public.candidates(id) on delete cascade,
  run_id uuid references public.runs(id) on delete set null,
  gate text not null,
  reviewer_conclusion text not null check (reviewer_conclusion in ('PASS','PASS_WITH_UNKNOWNS','FAIL_RESEARCH_REQUIRED')),
  reviewed_at timestamptz not null default now(),
  summary text,
  claims_upheld text[] not null default '{}',
  claims_downgraded text[] not null default '{}',
  claims_removed text[] not null default '{}',
  contradictions text[] not null default '{}',
  unknowns text[] not null default '{}',
  next_research_actions text[] not null default '{}',
  sources_checked text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.saved_views (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  view_state jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, user_id, name)
);

create index if not exists idx_vacancies_workspace_first_seen on public.vacancies(workspace_id, first_seen desc);
create index if not exists idx_vacancies_workspace_channel on public.vacancies(workspace_id, search_channel);
create index if not exists idx_vacancy_sources_vacancy on public.vacancy_sources(vacancy_id);
create index if not exists idx_requirements_vacancy on public.vacancy_requirements(vacancy_id);
create index if not exists idx_stakeholders_vacancy on public.stakeholders(vacancy_id);
create index if not exists idx_targets_vacancy on public.target_companies(vacancy_id);
create index if not exists idx_queries_vacancy on public.research_queries(vacancy_id);
create index if not exists idx_assignments_vacancy on public.candidate_assignments(vacancy_id);
create index if not exists idx_claims_candidate on public.candidate_claims(candidate_id);
create index if not exists idx_qa_vacancy on public.qa_reviews(vacancy_id);
create index if not exists idx_runs_workspace_started on public.runs(workspace_id, started_at desc);

create or replace function private.user_workspace_ids()
returns setof uuid
language sql
security definer
set search_path = ''
stable
as $$
  select wm.workspace_id
  from public.workspace_members wm
  where wm.user_id = (select auth.uid())
$$;

create or replace function private.user_can_edit_workspace(target_workspace uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = target_workspace
      and wm.user_id = (select auth.uid())
      and wm.role in ('ADMIN','RECRUITER')
  )
$$;

revoke all on schema private from public;
grant usage on schema private to authenticated;
revoke execute on function private.user_workspace_ids() from public;
revoke execute on function private.user_can_edit_workspace(uuid) from public;
grant execute on function private.user_workspace_ids() to authenticated;
grant execute on function private.user_can_edit_workspace(uuid) to authenticated;

alter table public.workspaces enable row level security;
revoke all on table public.workspaces from anon, authenticated;
grant select on table public.workspaces to authenticated;
create policy "Members can read their workspaces."
on public.workspaces for select to authenticated
using (id in (select private.user_workspace_ids()));

alter table public.workspace_members enable row level security;
revoke all on table public.workspace_members from anon, authenticated;
grant select on table public.workspace_members to authenticated;
create policy "Members can read workspace membership."
on public.workspace_members for select to authenticated
using (workspace_id in (select private.user_workspace_ids()));

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'runs','companies','vacancies','vacancy_sources','vacancy_requirements',
    'stakeholders','target_companies','research_queries','candidates',
    'candidate_assignments','candidate_claims','qa_reviews'
  ]
  loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('revoke all on table public.%I from anon, authenticated', table_name);
    execute format('grant select on table public.%I to authenticated', table_name);
    execute format(
      'create policy "Workspace members can read." on public.%I for select to authenticated using (workspace_id in (select private.user_workspace_ids()))',
      table_name
    );
  end loop;
end
$$;

alter table public.vacancy_operations enable row level security;
revoke all on table public.vacancy_operations from anon, authenticated;
grant select, insert, update, delete on table public.vacancy_operations to authenticated;

create policy "Workspace members can read vacancy operations."
on public.vacancy_operations for select to authenticated
using (workspace_id in (select private.user_workspace_ids()));

create policy "Recruiters can create vacancy operations."
on public.vacancy_operations for insert to authenticated
with check (
  workspace_id in (select private.user_workspace_ids())
  and private.user_can_edit_workspace(workspace_id)
);

create policy "Recruiters can update vacancy operations."
on public.vacancy_operations for update to authenticated
using (
  workspace_id in (select private.user_workspace_ids())
  and private.user_can_edit_workspace(workspace_id)
)
with check (
  workspace_id in (select private.user_workspace_ids())
  and private.user_can_edit_workspace(workspace_id)
);

create policy "Recruiters can delete vacancy operations."
on public.vacancy_operations for delete to authenticated
using (
  workspace_id in (select private.user_workspace_ids())
  and private.user_can_edit_workspace(workspace_id)
);

alter table public.candidate_operations enable row level security;
revoke all on table public.candidate_operations from anon, authenticated;
grant select, insert, update, delete on table public.candidate_operations to authenticated;

create policy "Workspace members can read candidate operations."
on public.candidate_operations for select to authenticated
using (workspace_id in (select private.user_workspace_ids()));

create policy "Recruiters can create candidate operations."
on public.candidate_operations for insert to authenticated
with check (
  workspace_id in (select private.user_workspace_ids())
  and private.user_can_edit_workspace(workspace_id)
);

create policy "Recruiters can update candidate operations."
on public.candidate_operations for update to authenticated
using (
  workspace_id in (select private.user_workspace_ids())
  and private.user_can_edit_workspace(workspace_id)
)
with check (
  workspace_id in (select private.user_workspace_ids())
  and private.user_can_edit_workspace(workspace_id)
);

create policy "Recruiters can delete candidate operations."
on public.candidate_operations for delete to authenticated
using (
  workspace_id in (select private.user_workspace_ids())
  and private.user_can_edit_workspace(workspace_id)
);

alter table public.saved_views enable row level security;
revoke all on table public.saved_views from anon, authenticated;
grant select, insert, update, delete on table public.saved_views to authenticated;

create policy "Users can read their saved views."
on public.saved_views for select to authenticated
using (
  user_id = (select auth.uid())
  and workspace_id in (select private.user_workspace_ids())
);

create policy "Users can create their saved views."
on public.saved_views for insert to authenticated
with check (
  user_id = (select auth.uid())
  and workspace_id in (select private.user_workspace_ids())
);

create policy "Users can update their saved views."
on public.saved_views for update to authenticated
using (
  user_id = (select auth.uid())
  and workspace_id in (select private.user_workspace_ids())
)
with check (
  user_id = (select auth.uid())
  and workspace_id in (select private.user_workspace_ids())
);

create policy "Users can delete their saved views."
on public.saved_views for delete to authenticated
using (
  user_id = (select auth.uid())
  and workspace_id in (select private.user_workspace_ids())
);

insert into public.workspaces (slug, name)
values ('talent-tree', 'Talent Tree Recruitment Intelligence')
on conflict (slug) do update set name = excluded.name;
