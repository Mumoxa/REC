-- Candidate-market completion is broader than the final Top 10 subset.

alter table public.vacancy_operations
  drop constraint if exists vacancy_operations_lifecycle_status_check;

update public.vacancy_operations
set lifecycle_status='MARKET_READY',
    updated_at=now()
where lifecycle_status='TOP_10_READY';

alter table public.vacancy_operations
  add constraint vacancy_operations_lifecycle_status_check
  check (lifecycle_status in (
    'DISCOVERED','VERIFYING','QUALIFIED','EMPLOYER_RESOLVED',
    'CANDIDATE_MAPPING','MARKET_READY','CLIENT_ACTION','CLOSED'
  ));
