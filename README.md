# Talent Tree Recruitment Intelligence

Version-controlled operating system for Talent Tree's South African recruitment-intelligence engine.

## Canonical architecture

The project deliberately keeps the original simple mental model:

```text
recruitment-intel/
├── core/
│   ├── ideal-client-profile.md      ← what a qualifying job looks like
│   ├── disqualifiers.md             ← what to always exclude
│   ├── scoring-rubric.md            ← how to rank/prioritise finds
│   └── output-template.md           ← exact format for every report
├── channels/
│   ├── agreed-clients.md            ← Channel 1 / Stage 1
│   ├── agency-sites.md              ← Channel 2 / Stage 2
│   ├── linkedin.md                  ← Channel 3 / Stage 3
│   └── job-boards.md                ← Channel 4 / Stage 4
└── runs/                            ← optional archive of past outputs
```

**There are exactly four sourcing channels.**

No runtime worker, schema, taxonomy, enrichment process, query engine or source registry is an additional channel.

Authority: `ARCHITECTURE_GUARD.md`.

## Mandatory source sequence

1. **Agreed Clients**
2. **Agency Sites** — PRN Recruitment, Communicate Recruitment, Network Recruitment
3. **LinkedIn**
4. **Job Boards / ATS / broader secondary sources**

This order is strict.

If a later-stage vacancy resolves to an agreed client, it is promoted immediately into the Stage 1 commercial workflow while retaining its original discovery provenance.

## What the support directories do

The repository has become more detailed underneath the canonical architecture, but those folders are implementation support:

- `runtime/` — execution instructions;
- `schemas/` — machine-readable contracts;
- `taxonomy/` — role, seniority and geography vocabularies;
- `sources/` — client/source registries and governance;
- `tests/` — regression protection;
- `archive/originals/` — preserved research/build sources;
- `query_templates.yaml` — how searches are constructed;
- `manifest.yaml` — exactly what each worker loads;
- `MASTER_INDEX.md` — map from source research into the architecture.

## Shared principles

- GitHub defines how the system should work.
- Discovery and qualification are separate.
- Every material conclusion is evidence-backed.
- Confirmed, probable, hypothesis and unknown remain distinct.
- Client status is permanent on vacancy records.
- Agreed clients receive first commercial priority.
- The engine is a hiring-intelligence system, not merely a scraper.
- Detailed implementation must map back to one of the four channels or to shared core/support infrastructure.

## Drift rule

Before adding anything new, classify it as:

- core rule;
- agreed-client channel;
- agency-sites channel;
- LinkedIn channel;
- job-boards channel;
- supporting implementation;
- run output.

If it does not fit one of those, do not silently add a new architectural concept.
