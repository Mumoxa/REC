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
│   ├── agreed-clients.md            ← Channel 1 / default priority 1
│   ├── agency-sites.md              ← Channel 2 / default priority 2
│   ├── linkedin.md                  ← Channel 3 / default priority 3
│   └── job-boards.md                ← Channel 4 / default priority 4
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
- `interface/` — browser workspace / ATS presentation contract;
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
- A sourcing sweep finishing is not the same as a REC run completing: a run is `COMPLETE` only when every qualifying verified vacancy has at least one QA-cleared, client-submittable research Top-10 candidate and the resulting records have been persisted and verified in REC.
- Independent adversarial QA gates challenge discovery, role fingerprints, target-company maps and candidate claims.
- The default human interface is the browser-based Vacancy Intelligence Workspace; structured records remain the source of truth and Excel/CSV/PDF are exports.
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

## Agent publication

REC research is write-through. Agents should publish verified progress into the workspace throughout a run rather than wait for one final report.

Canonical repository command:

```bash
npm run rec:publish -- runs/<RUN-ID>/publication-payload.json
```

A local `.env` is not required. If `INGEST_API_KEY` is absent from the current process, the publisher uses the authorised REC Vercel project environment. A one-time Vercel login may be required on a new machine, but agents must not weaken authentication or stop candidate research because a local environment file is missing.

## Hiring-team intelligence

Every qualifying vacancy carries first-class hiring-team intelligence in REC.

The workspace separates:

- the likely direct/functional hiring owner;
- other decision-makers and executive sponsors;
- Talent Acquisition / HR stakeholders;
- vacancy contacts or relevant amplifiers;
- **observed public business email**;
- **probable pattern-inferred business email**;
- employee email domain and detected company email format;
- evidence/confidence and current-employment status.

The research target is normally **2–10 genuinely relevant stakeholders** where the public market supports it. This is not a quota and must never be padded with generic HR names.

A completed run may not silently skip this work. Each vacancy must reach stakeholder status `READY` or `BLOCKED_WITH_EVIDENCE`, and company email-pattern intelligence must be recorded.

## Candidate-market depth

REC is not a Top-10 shortlist generator. Each qualified vacancy should preserve the full researched market:

- broad raw discovery may surface 100–200+ profiles;
- credible evidence-backed candidate market: target 50+ where the market supports it;
- strongest-market layer: normally about 20–25;
- final high-conviction client-facing subset: Top 10.

These are research-depth targets, not quotas. Smaller markets are valid when coverage and scarcity are evidenced. The Top 10 must never replace the broader market map.

## Completion and publication semantics

A REC run is not complete when vacancy discovery or vacancy validation ends.

For every qualifying verified vacancy, continue through candidate mapping until there is a QA-cleared client-submittable research Top-10 candidate set. If that condition is not met, use `RUNNING` or `PARTIAL`.

"Published" is a datastore state: the structured run must be persisted into the REC operational database and the persisted vacancy/candidate counts verified. A chat response, report, export or local artifact is not publication.

## Normal run instructions

Examples:

- `Run AGREED_CLIENTS only and process qualifying verified opportunities through the shared downstream pipeline.`
- `Run AGENCY_SITES only; do not run other channels; process verified opportunities downstream.`
- `Run LINKEDIN only for the requested geography and process verified opportunities downstream.`
- `Run all four channels using default priority; do not treat the order as a prerequisite chain.`


## Human interface / job-surfacing workspace

The primary human operating surface is the browser-based **Recruitment Intelligence Workspace**.

Default home:

**VACANCIES → Inbox**

The ATS-style workspace uses:

- left: canonical surfaced vacancy queue;
- middle: selected vacancy intelligence;
- right: candidates mapped to that vacancy.

Authority:

- `interface/README.md`
- `interface/vacancy-intelligence-workspace.md`
- `interface/search-filter-contract.md`
- `interface/record-binding-contract.md`
- `interface/design-system.md`
- `schemas/workspace-view-state.schema.json`
- `schemas/workspace-saved-view.schema.json`
- `schemas/workspace-operational-state.schema.json`

Key behaviours:

- one canonical vacancy can preserve many source records;
- job cards support expanded / compact / minimal density;
- minimise/collapse does not close a vacancy;
- closing archives rather than deletes intelligence;
- filters/search persist while moving between jobs and candidates;
- global search and context search are distinct;
- searching stored intelligence is distinct from running new AI/web research;
- candidate operational status is separate from evidence/QA status;
- Excel/CSV/PDF are export surfaces, not the canonical datastore.

A buildless, interactive UI prototype is available at `interface/prototype/index.html`. It is a synthetic-data-only interaction reference, not the production frontend, canonical datastore or live research output. Product/code review and remaining production gates are documented in `interface/review-and-gaps.md`.
