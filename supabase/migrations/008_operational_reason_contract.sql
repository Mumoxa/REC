-- Close/exclusion reasons are part of the operational contract, not research
-- evidence. OTHER closes need an explanation. Exclusions need a non-blank
-- reason. NOT VALID so existing rows are not rewritten; new writes are checked.

alter table public.vacancy_operations
  add column if not exists closed_reason_detail text;

alter table public.candidate_operations
  drop constraint if exists candidate_operations_excluded_reason_required;

alter table public.candidate_operations
  add constraint candidate_operations_excluded_reason_required
  check (
    operational_status <> 'EXCLUDED'
    or nullif(btrim(excluded_reason), '') is not null
  ) not valid;

alter table public.vacancy_operations
  drop constraint if exists vacancy_operations_other_reason_requires_detail;

alter table public.vacancy_operations
  add constraint vacancy_operations_other_reason_requires_detail
  check (
    closed_reason is distinct from 'OTHER'
    or nullif(btrim(closed_reason_detail), '') is not null
  ) not valid;
