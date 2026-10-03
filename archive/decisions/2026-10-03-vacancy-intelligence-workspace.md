# Decision Record — Vacancy Intelligence Workspace

Status: AUTHORITATIVE USER DECISION
Date: 2026-10-03
Repository: Mumoxa/REC

## Decision

The primary human output for Talent Tree Recruitment Intelligence is a browser-based Recruitment Intelligence Workspace, not an Excel workbook.

The job-surfacing element is housed in **VACANCIES → Inbox**, which is the default home screen.

Excel, CSV and PDF remain export formats. Structured machine-readable records remain the system of truth.

## ATS-style operating model

The primary vacancy screen uses three persistent panes:

1. Vacancy Queue — surfaced jobs;
2. Selected Vacancy Intelligence — job detail, sources, employer, requirements, stakeholders, QA and search log;
3. Relevant Candidate Market — candidates mapped/earmarked for the selected vacancy.

The recruiter should be able to work through many jobs without repeated page navigation or losing search/filter context.

## Vacancy display density

Vacancy cards support Expanded, Compact and Minimal modes. Collapse/minimise does not change lifecycle state.

Close is a separate lifecycle action and requires a reason. Closing archives rather than deletes intelligence.

## Candidate workspace

Selecting a vacancy scopes the right-hand candidate pane to people relevant to that role.

Candidate operational statuses may include SURFACED → RELEVANT → EARMARKED → TOP_10 → APPROACH → ENGAGED → SUBMITTED.

Operational status remains separate from evidence/QA status.

## Search and filtering

The UI requires global search, vacancy context search, selected-role candidate search, strong faceted filters, persistent filter state, removable filter chips, saved views, date/source/client/QA/role/geography filters and evidence-aware candidate filters.

Searching stored intelligence must be visibly distinguished from running new AI/web research.

## Candidate Focus mode

The recruiter may minimise the middle vacancy detail pane to expand candidate workspace while retaining selected-job context.

## Canonical vacancy

Multiple appearances of the same vacancy deduplicate to one canonical vacancy card while preserving every source record and provenance.

## Timestamps

Expose source posting date, first seen, last seen, last verified, last changed, closed/disappeared date, run ID and QA dates where available.

## Secondary views

Support What's New, Needs Research, Company Hiring, Candidate Maps, QA, Runs and Exports.

## Output architecture

AI research → structured records/database → browser Recruitment Intelligence Workspace → optional Excel/CSV/PDF/client packs.

A self-contained HTML file may be used as an MVP or portable snapshot, but repeated generated HTML files are not the canonical data architecture.