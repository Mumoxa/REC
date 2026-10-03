# Search and Filter Contract

## Purpose

Search and filtering are first-class operating capabilities of the Recruitment Intelligence Workspace. They must work across large vacancy and candidate sets without destroying working context.

## Two search layers

### Global search

Always available. Search indexed structured fields across vacancies, employers/companies, client status, locations, role taxonomy/title, requirements, systems/ERP, qualifications, stakeholders, candidates, current/previous employers, target companies, evidence text where indexed, and source/run identifiers.

Group results by record type rather than mixing everything into one flat list.

### Context search

Each pane has a scoped search.

**Vacancy pane:** searches the currently loaded/filtered vacancy universe.

**Candidate pane:** searches candidates mapped to the selected vacancy unless the user explicitly switches to global candidate search.

Typing a candidate filter such as CA(SA) SAP must filter stored mapped candidates. It must not silently start new internet research.

## Search vs research

Make the distinction explicit:

**Search existing intelligence** = immediate query/filter of stored records.

**Run research** = invokes AI/web/source research and must be an explicit action such as Run candidate search, Research employer, Refresh vacancy, Verify current employment, or Expand target-company map.

Research actions must write to the research search log. Normal UI filtering does not.

## Filter persistence

Filters must persist while the recruiter selects vacancies, opens candidates, changes tabs, and minimises/collapses panes.

Reset only when the user clears filters, loads another saved view, or deliberately changes scope.

Active filters should be visible as removable chips.

Example: [Western Cape ×] [Finance ×] [Employer confirmed ×] [QA passed ×] [+ Filter]

## Saved views

Save the complete view state: search query, filters, sort, date window, display density and visible fields.

Useful saved views include New Western Cape Finance, Agreed Clients — New Jobs, Employer Attribution Needed, Executive Roles, Top 10 Ready, and Candidate Mapping Incomplete.

## Vacancy filters

Support at least:

- client status / commercial priority;
- channel / agency / source site;
- role family / taxonomy node / title;
- seniority;
- qualification;
- system/requirement keyword;
- geography from region to commercial node;
- posted / first seen / last seen / last verified / last changed;
- QA state;
- employer resolution;
- duplicate state;
- salary-gate state;
- candidate-map state;
- candidate count;
- Top 10 readiness;
- lifecycle state.

## Candidate filters

Support at least:

- name;
- current/previous employer;
- current/previous title;
- target-company tier;
- qualification/designation;
- system/ERP;
- geography;
- industry/value chain;
- comparable environment;
- requirement coverage;
- evidence status;
- QA state;
- operational status;
- earmarked;
- Top 10;
- approached/not approached;
- last verified.

## Evidence-aware filters

Skill/system/qualification filters must support evidence status. Example: SAP = CONFIRMED must not include candidates where SAP is only inferred from the employer.

## Sort options

Vacancies: commercial/client priority, newest first seen, oldest unresolved, last verified, QA state, candidate count, Top 10 readiness, seniority, geography.

Candidates: Top 10 order, strongest market set, environment closeness, requirement coverage, evidence completeness, target-company tier, last verified, alphabetical.

Do not present an unexplained single AI suitability score as objective truth.

## Cross-pane behaviour

Selecting a vacancy keeps vacancy filters/search active, changes the middle pane to that job, scopes the right pane to its candidate market, preserves compatible candidate filters, and visibly clears only incompatible candidate filters.

Useful explicit cross-filters:

- click SAP requirement → candidate pane filters to individually evidenced SAP;
- click Tier A → show Tier A candidates;
- click target company → show mapped candidates from that company;
- click geography → constrain candidate pane.

These are filtering actions, not new research claims.

## Auditability

Actual research queries retain query, source, search family, reason generated, execution status/date, observed yield, results/candidates surfaced, and noise/access limitation.

This log is distinct from ephemeral UI search/filter activity.

## Ergonomics

- search stored intelligence should feel immediate;
- filter changes stay on the same workspace;
- active filters are always visible;
- removing one filter does not clear all filters;
- navigation should preserve context and queue position where feasible;
- design for hundreds or thousands of records.