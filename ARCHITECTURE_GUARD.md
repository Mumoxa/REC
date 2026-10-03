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

## Stage mapping

The current execution order maps directly onto the four channels:

| Stage | Canonical channel | Runtime implementation |
|---|---|---|
| Stage 1 | AGREED_CLIENTS | runtime/agreed-client-worker.md |
| Stage 2 | AGENCY_SITES | runtime/agency-worker.md |
| Stage 3 | LINKEDIN | runtime/linkedin-worker.md |
| Stage 4 | JOB_BOARDS | runtime/jobboard-worker.md |

The stage sequence is strict, but stage and channel are not separate taxonomies. The four stages are the four sourcing channels in execution order.

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
- query generation — search-construction layer, not sourcing.

## Canonical facade vs detailed implementation

The root-level files under `core/` and `channels/` are the human-readable architectural facade.

Detailed implementation may live in subdirectories or machine-readable files, provided that:

1. it maps back to one canonical core concern or one of the four channels;
2. it does not create a new sourcing-channel concept;
3. it does not duplicate an authoritative vocabulary;
4. it does not override source priority or the four-channel sequence;
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
