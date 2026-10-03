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

## Channel execution

The four channels are independently runnable:

1. **Agreed Clients**
2. **Agency Sites** — PRN Recruitment, Communicate Recruitment, Network Recruitment
3. **LinkedIn**
4. **Job Boards / ATS / broader secondary sources**

If a full or multi-channel run is requested, that is the default priority order. It is not a prerequisite chain.

All four channels inherit the same shared search structure, role taxonomy, seniority ontology, geography, qualification rules, evidence standard, scoring logic and output rules.

If any channel resolves a vacancy to an agreed client, it receives immediate agreed-client commercial priority while retaining its original channel provenance.

## What the support directories do

The repository has become more detailed underneath the canonical architecture, but those folders are implementation support:

- `runtime/` — execution instructions;
- `schemas/` — machine-readable contracts;
- `taxonomy/` — role, seniority and geography vocabularies;
- `sources/` — client/source registries and governance;
- `tests/` — regression protection;
- `archive/originals/` — preserved research/build sources;
- `query_templates.yaml` — vacancy/employer/stakeholder search construction;
- `candidate_query_templates.yaml` — downstream passive-candidate search construction;
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
- Any independently runnable channel may feed the same downstream opportunity/candidate-intelligence process.
- Candidate market mapping targets 50+ credible evidence-backed people where the market supports it; 50 is a research-depth target, never a quota.
- Independent adversarial QA gates challenge discovery, role fingerprints, target-company maps and candidate claims.
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


## Shared downstream candidate-intelligence pipeline

A verified opportunity from **any one** of the four channels may proceed directly into:

```text
Verified opportunity
→ QA Gate A: discovery / employer / client verification
→ client + role environment fingerprint
→ QA Gate B: fingerprint challenge
→ evidence-backed target-company universe
→ QA Gate C: comparator challenge
→ generated + executed LinkedIn / Google / public-social candidate searches
→ credible passive-talent longlist (target 50+, never padded)
→ candidate evidence verification
→ QA Gate D: candidate challenge
→ strongest market set
→ Top 10 high-conviction client-facing profiles
```

Authority:

- `core/candidate-market-mapping.md`
- `core/independent-qa.md`
- `candidate_query_templates.yaml`
- `runtime/candidate-mapping-worker.md`
- `runtime/qa-review-worker.md`

This is downstream infrastructure, **not a fifth sourcing channel**.

## Normal run instructions

Examples:

- `Run AGREED_CLIENTS only and process qualifying verified opportunities through the shared downstream pipeline.`
- `Run AGENCY_SITES only; do not run other channels; process verified opportunities downstream.`
- `Run LINKEDIN only for the requested geography and process verified opportunities downstream.`
- `Run all four channels using default priority; do not treat the order as a prerequisite chain.`
