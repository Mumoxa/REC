# Architecture Guard — Recruitment Intelligence

## Canonical project shape

The project must remain conceptually equivalent to:

```text
recruitment-intel/
├── core/
│   ├── ideal-client-profile.md
│   ├── disqualifiers.md
│   ├── scoring-rubric.md
│   └── output-template.md
├── channels/
│   ├── agreed-clients.md
│   ├── agency-sites.md
│   ├── linkedin.md
│   └── job-boards.md
└── runs/
```

This is the architectural invariant.

## Exactly four sourcing channels

Only these are sourcing channels:

1. `AGREED_CLIENTS`
2. `AGENCY_SITES`
3. `LINKEDIN`
4. `JOB_BOARDS`

No fifth sourcing channel may be introduced without explicit user-authorised architecture change.

## Channel execution

Each of the four channels is **independently runnable**.

| Default priority | Canonical channel | Runtime implementation |
|---|---|---|
| 1 | AGREED_CLIENTS | runtime/agreed-client-worker.md |
| 2 | AGENCY_SITES | runtime/agency-worker.md |
| 3 | LINKEDIN | runtime/linkedin-worker.md |
| 4 | JOB_BOARDS | runtime/jobboard-worker.md |

The priority order is used when a combined/full run is requested. It is not a prerequisite chain: running LinkedIn does not require the agreed-client or agency channels to have run first.

## What is NOT a channel

The following are support layers and must never be presented as additional sourcing channels:

- `runtime/` — execution instructions;
- `schemas/` — output/data contracts;
- `taxonomy/` — shared vocabularies;
- `sources/` — registries and governance;
- `tests/` — regression protection;
- `archive/` — provenance;
- `runs/` — historical outputs/state snapshots;
- enrichment — downstream processing, not sourcing;
- employer attribution — research method, not sourcing;
- stakeholder/contact intelligence — enrichment method, not sourcing;
- query generation — search-construction layer, not sourcing;
- candidate market mapping — shared downstream talent research, not sourcing;
- independent QA — shared control layer, not sourcing;
- `interface/` / Recruitment Intelligence Workspace — presentation and recruiter operating layer, not sourcing.

## Canonical facade vs detailed implementation

The root-level files under `core/` and `channels/` are the human-readable architectural facade.

Detailed implementation may live in subdirectories or machine-readable files, provided that:

1. it maps back to one canonical core concern or one of the four channels;
2. it does not create a new sourcing-channel concept;
3. it does not duplicate an authoritative vocabulary;
4. it does not override the shared search stack or four-channel priority model;
5. the facade remains sufficient to explain the whole system at a glance.

## Drift prevention rule

Before adding a new module, classify it as one of:

- CORE_RULE
- AGREED_CLIENTS_CHANNEL
- AGENCY_SITES_CHANNEL
- LINKEDIN_CHANNEL
- JOB_BOARDS_CHANNEL
- SUPPORTING_IMPLEMENTATION
- RUN_OUTPUT

If it cannot be classified cleanly, stop and require an explicit architecture decision rather than silently adding a new concept.

## Non-negotiable interpretation

The project has become more detailed, but not more conceptually complex.

**Four channels. Shared core. Optional runs. Supporting implementation underneath.**


## Shared intelligence stack

All four channels must use the same:

- search structure: `core/search-structure.md`;
- query configuration: `query_templates.yaml`;
- 271-node role taxonomy;
- role classification/boundary rules;
- seniority ontology;
- South Africa geography ontology;
- ideal-client profile;
- disqualifiers;
- scoring rubric;
- evidence standard;
- qualification rules;
- deduplication rules;
- employer-attribution rules;
- output structure;
- client-status vocabulary.

Channel-specific differences are limited to source surfaces, native filters/syntax, evidence traversal and provenance.

A channel may not fork its own role taxonomy, seniority hierarchy, geography order, commercial definition or query philosophy.


## Shared downstream candidate intelligence

After any one channel produces a sufficiently verified opportunity, that opportunity may enter the shared candidate-intelligence pipeline without requiring any other channel to have run.

Shared downstream modules include:

- `core/candidate-market-mapping.md`;
- `core/independent-qa.md`;
- `candidate_query_templates.yaml`;
- `runtime/candidate-mapping-worker.md`;
- `runtime/qa-review-worker.md`;
- candidate/QA schemas.

These modules must never be numbered or described as additional sourcing channels.

### Candidate research-depth rule

The system aims for at least 50 credible evidence-backed candidates where the market supports that depth, then narrows to a strongest-market layer normally around 20–25, and only then to the final Top 10 high-conviction subset.

This is a research target, not a quota. It must never cause list padding, lowered evidence standards or invented people/claims.

### QA invariant

Mandatory independent review gates exist after:

1. discovery / vacancy / client resolution;
2. role/client fingerprint construction;
3. target-company mapping;
4. candidate evidence construction.

A review pass must attempt to disprove unsupported claims and preserve unknowns.

### Run-completion invariant

A sourcing-channel coverage sweep and a completed REC recruitment run are different states.

A REC research run may be marked `COMPLETE` only when every qualifying verified opportunity produced by that run has completed hiring-team/contact intelligence (including company email-domain/pattern research, or an evidence-grounded blocker outcome), progressed through the shared downstream candidate-intelligence pipeline, and has at least one QA-cleared, client-submittable candidate.

For completion purposes, a client-submittable candidate must:

- be attached to the same canonical vacancy;
- have candidate QA status `PASS` or `PASS_WITH_UNKNOWNS`;
- be in the research `TOP_10` market bucket;
- have an evidence-grounded `Why This Person / Why This Client` rationale;
- preserve material evidence gaps and unknowns rather than hiding them.

The system still targets at least 50 credible longlist candidates where the market supports that depth, a strongest-market layer normally around 20–25, and then up to 10 high-conviction profiles. Top 10 is a subset, not the market. The completion invariant does not require padding to reach either number.

If discovery/coverage is finished but one or more qualifying vacancies do not yet have a client-submittable candidate set, the research run must remain `RUNNING` or be marked `PARTIAL`; it must not be labelled `COMPLETE`.

If a channel sweep finds no qualifying opportunities, record that coverage outcome explicitly, but do not call the recruitment run `COMPLETE` merely because source searching ended.

"Published" means successfully persisted into the canonical REC operational datastore and verified there. Rendering results in chat, a report, an export or a local file is not publication.


## Presentation-layer invariant

The Recruitment Intelligence Workspace is a supporting presentation/operational layer over canonical structured records.

It must not:

- become a fifth sourcing channel;
- duplicate or override research evidence;
- convert UI state into evidence;
- hide material unknowns or QA status;
- treat exports as the canonical source of truth.

The default job-surfacing interface is `VACANCIES → Inbox` using the ATS-style three-pane workspace defined under `interface/`.

Persistent workspace state is split deliberately:

- view state: filters, search, density, selected records, pane state;
- operational state: vacancy lifecycle/close state and candidate recruiter workflow state;
- research evidence: remains governed by the existing opportunity, candidate-map and QA schemas.

This separation prevents recruiter actions such as Earmark, Top 10, Close or Exclude from overwriting factual evidence.
