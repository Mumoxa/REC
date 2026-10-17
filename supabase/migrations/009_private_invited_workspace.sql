-- Preserve current members; new access must be explicitly granted by an administrator.
-- Never grant ADMIN solely because an auth.users email matches a hardcoded address.
drop trigger if exists on_talent_tree_admin_signup on auth.users;
drop function if exists public.handle_talent_tree_admin_signup();

-- Defense in depth for the complete canonical data surface. Service-role
-- publication retains its existing privileged path; browser users retain RLS.
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'workspaces','workspace_members','runs','companies','vacancies',
    'vacancy_operations','vacancy_sources','vacancy_requirements','stakeholders',
    'company_email_intelligence','target_companies','research_queries','candidates',
    'candidate_assignments','candidate_operations','candidate_claims','qa_reviews',
    'saved_views','ingest_tokens'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('alter table public.%I force row level security', table_name);
    execute format('revoke all on table public.%I from anon', table_name);
  end loop;
end
$$;
