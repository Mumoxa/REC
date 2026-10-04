# Talent Tree Recruitment Intelligence Workspace

## Status

This directory defines the canonical **human interface / presentation layer** for the Recruitment Intelligence engine.

It is supporting implementation, **not a sourcing channel**.

The four sourcing channels remain:

1. `AGREED_CLIENTS`
2. `AGENCY_SITES`
3. `LINKEDIN`
4. `JOB_BOARDS`

## Product model

The engine produces structured, evidence-backed records.

The workspace renders those records for human use.

```text
AI research / source workers
        ↓
strict structured records
        ↓
canonical vacancy + candidate data
        ↓
Recruitment Intelligence Workspace
        ↓
Excel / CSV / PDF / client packs
```

The browser workspace is the primary operating interface.

Excel, CSV and PDF are exports. They are not the system of record.

## Primary navigation

```text
TALENT TREE INTELLIGENCE
│
├── VACANCIES          ← default home / job-surfacing workspace
│   ├── Inbox
│   ├── New
│   ├── Agreed Clients
│   ├── Agencies
│   ├── LinkedIn
│   ├── Job Boards
│   ├── Needs Research
│   └── Closed / Archived
│
├── COMPANIES
├── CANDIDATE MAPS
├── CANDIDATES
├── TOP 10
├── QA
├── RUNS
└── EXPORTS
```

## Primary workspace

The main working screen is the ATS-style **Vacancy Intelligence Workspace** defined in:

- `interface/vacancy-intelligence-workspace.md`

Search and filter behaviour is defined in:

- `interface/search-filter-contract.md`

Identity joins across vacancy, candidate-map and operational records are defined in:

- `interface/record-binding-contract.md`

The visual system, responsive behaviour and accessibility rules are defined in:

- `interface/design-system.md`

A buildless, interactive UI prototype lives in `interface/prototype/`. It demonstrates the approved operating model using clearly marked fictional sample records; it is not a production frontend, backend, research run or source of truth.

## Data authority

The interface must consume canonical structured data from the existing schemas and workers.

It must not create a separate competing source of truth.

At minimum it uses:

- `schemas/final-opportunity.schema.json`
- `schemas/candidate-market-map.schema.json`
- `schemas/qa-review.schema.json`
- run/source provenance already produced by the engine.

UI presentation state such as filters, collapse state, date windows, visible fields and saved views is stored separately in:

- `schemas/workspace-view-state.schema.json`
- `schemas/workspace-saved-view.schema.json`

Recruiter workflow state such as vacancy close/lifecycle and candidate Earmark / Top 10 / Approach status is stored separately in:

- `schemas/workspace-operational-state.schema.json`

Neither UI state nor recruiter workflow state may overwrite research evidence or QA.

## Key principles

- one canonical vacancy may have many source records;
- duplicates collapse into one vacancy intelligence object;
- original source provenance remains visible;
- every surfaced job has first-seen / last-seen / last-verified timestamps where available;
- job surfacing is housed in the Vacancy Intelligence Inbox;
- selecting a vacancy immediately scopes the candidate pane to people relevant to that role;
- filters persist while the recruiter moves between vacancies/candidates;
- close, collapse and minimise are different actions;
- closing a vacancy archives it without destroying market intelligence;
- the interface must expose QA, evidence, search execution and unknowns rather than hide them;
- search/filtering is a first-class product capability, not an afterthought.
