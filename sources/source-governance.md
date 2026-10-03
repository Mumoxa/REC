# Source Governance

## Four-channel model

The source registry is not a flat list.

There are exactly four independently runnable sourcing channels:

1. `AGREED_CLIENTS`
2. `AGENCY_SITES`
3. `LINKEDIN`
4. `JOB_BOARDS`

Authority:

- `ARCHITECTURE_GUARD.md`
- `core/search-structure.md`
- `sources/search-priority.yaml`

## Independent execution

Any one channel may be run on its own.

A channel does not require another channel to have completed first.

When multiple channels are run together, the default priority is:

**AGREED_CLIENTS → AGENCY_SITES → LINKEDIN → JOB_BOARDS**

This is a scheduling and budget preference, not a gate.

## Shared rules

All channels use the same:

- query construction;
- role taxonomy;
- seniority ontology;
- geography ontology;
- qualification/disqualifier rules;
- evidence standard;
- client-status vocabulary;
- scoring logic;
- output structure.

Source-specific behaviour may differ. Commercial definitions may not.

## Channel 1 — Agreed clients

Search the complete current agreed-client universe across all applicable direct and indirect hiring surfaces.

Authority:

`sources/agreed-clients.yaml`

A current agreed client or agreed group entity receives immediate commercial priority.

Past clients do not receive current agreed-client treatment unless the current agreement is verified.

## Channel 2 — Agency sites

Exhaustively review the relevant current vacancy inventory of:

1. PRN Recruitment;
2. Communicate Recruitment;
3. Network Recruitment.

Do not sample these sources.

For anonymous clients, extract evidence and attempt end-employer attribution proportionately to seniority, scarcity and commercial value.

An agreed-client match receives immediate agreed-client commercial priority while preserving agency provenance.

## Channel 3 — LinkedIn

Execute the authoritative South African LinkedIn Hidden Hiring-Signal Engine.

Geographic preference:

**Western Cape → Gauteng → KwaZulu-Natal → broader South Africa**

Use the shared role taxonomy and seniority ontology for search expansion and classification.

LinkedIn may also retain incomplete role-agnostic social signals when no exact vacancy title can yet be recovered. That is a recall rule, not a separate taxonomy.

## Channel 4 — Job boards / ATS / broader secondary sources

Search the governed broader South African source universe.

Internal source order:

1. Critical;
2. High;
3. Medium;
4. Low;
5. long-tail.

The archived source-map specification records **350 reusable sources/channels** pending compilation into a machine-readable registry.

## Client status is permanent

Every vacancy/opportunity record must carry one of:

- `AGREED_CLIENT`
- `AGREED_GROUP_ENTITY`
- `PAST_CLIENT`
- `TARGET_PROSPECT`
- `UNKNOWN`

Client status survives deduplication and enrichment.

Do not infer agreed-group status from ownership or name similarity alone.

## Search completeness

A source or source surface counts as searched only when at least one is true:

- its live vacancy inventory was reviewed;
- relevant category/location filters were reviewed;
- a defensible source-specific query/search was executed;
- it was marked not applicable;
- it was verified inaccessible/unavailable and the limitation was recorded.

Opening a homepage does not count.

## Current broader-source summary

- Total reusable secondary channels recorded in the archived source map: 350
- Critical: 36
- High: 173
- Medium: 110
- Low: 31
