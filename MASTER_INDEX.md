# Master Index and Source-Coverage Map

## Architecture guard

The canonical system model is permanently anchored by `ARCHITECTURE_GUARD.md`.

At the human-readable level the project remains:

- four shared core concerns:
  - `core/ideal-client-profile.md`
  - `core/disqualifiers.md`
  - `core/scoring-rubric.md`
  - `core/output-template.md`
- exactly four sourcing channels:
  - `channels/agreed-clients.md`
  - `channels/agency-sites.md`
  - `channels/linkedin.md`
  - `channels/job-boards.md`
- optional `runs/` archive.

Runtime, schemas, taxonomy, source registries, query configuration, enrichment and tests are implementation support and do not create extra channels.

This file prevents silent information loss during decomposition.

## Current authoritative documents

### LinkedIn discovery

`channels/linkedin/South_Africa_LinkedIn_Hidden_Hiring_Signal_Engine_MASTER.md`

This is the **current controlling LinkedIn discovery specification**. It supersedes the earlier LinkedIn engine for discovery behaviour.

Its central architectural rule is separation of discovery from qualification: LinkedIn discovery is role-agnostic and must send valid South African opportunities downstream before salary, role-family, client, commercial, employer-exclusion or outreach rules are applied.

### Source/client governance

`archive/originals/Talent_Tree_Agreed_Clients_and_Vacancy_Source_Map.md`

This remains the preserved source for agreed-client identity/source intelligence and the broader South African source universe while those tables are progressively compiled into runtime registries.

## Historical reference

`archive/originals/South_Africa_LinkedIn_Hiring_Signal_Engine.md`

This earlier LinkedIn build remains preserved for provenance but does not override the current hidden-hiring master.

## Runtime mapping

| Topic | Runtime home |
|---|---|
| LinkedIn hidden hiring doctrine | channels/linkedin/South_Africa_LinkedIn_Hidden_Hiring_Signal_Engine_MASTER.md |
| South Africa location authority | taxonomy/south_africa_locations.yaml |\n| Location research rationale | taxonomy/south_africa_locations_research_notes.md |\n| LinkedIn signal schema | schemas/linkedin-signal.schema.json |
| LinkedIn scheduled worker | runtime/linkedin-worker.md |
| Salary / commercial qualification | core/qualification.md |
| Evidence labels | core/evidence-standard.md |
| Canonical cross-channel deduplication | core/deduplication.md |
| Employer attribution | core/employer-attribution.md |
| Agreed clients | sources/agreed-clients.yaml |
| Agency discovery | channels/agencies/strategy.md |
| Job-board / ATS discovery | channels/jobboards/strategy.md |
| Final enrichment | runtime/enrichment-worker.md |
| Final opportunity schema | schemas/final-opportunity.schema.json |

## Explicitly deferred — not lost

These require persistent state and remain future data-layer work:

- query run history and yield scoring;
- watched-author history;
- amplifier graph history;
- phrase / hashtag learning history;
- ATS-domain learning;
- company high-intensity watch state;
- follow-up / reactivation state;
- canonical opportunity history;
- hiring-cluster history;
- persistent evidence graph;
- dashboard KPI history.

The current LinkedIn master defines the behaviour these future stores must support.


## Geographic authority

`taxonomy/south_africa_locations.yaml` is the controlling South Africa location ontology for all discovery and enrichment workers.

Execution order is:

**P1 Western Cape → P2 Gauteng → P3 KwaZulu-Natal → P4 rest of South Africa / national / remote.**

Within each region, the encoded cluster order is also authoritative. Country-level terms do not replace granular node searches.


## Role taxonomy authority

The controlling role taxonomy is:

- `taxonomy/Talent_Tree_Master_Recruitment_Role_Taxonomy.md` — complete preserved source.
- `taxonomy/role_taxonomy.json` — machine-readable registry containing all 271 role nodes.
- `taxonomy/role_taxonomy_rules.yaml` — application precedence, exclusions and classification boundaries.
- `taxonomy/ROLE_TAXONOMY_VALIDATION.md` — validation record, including the unresolved summary-count discrepancy.

### Application

- LinkedIn social discovery remains broad; taxonomy filtering occurs downstream.
- Agency and job-board/ATS workers use the taxonomy for search focus and classification after extraction.
- Enrichment applies the full taxonomy, economic threshold, boundary rules and priority logic.
- Market mapping and candidate sourcing use the full taxonomy.

Abbreviated role lists must not replace the 271-node registry.


## Seniority authority

`taxonomy/seniority_terms.yaml` is the controlling seniority/search-level ontology.

It explicitly includes:

- board and enterprise-governance roles;
- Executive Director and exact board-director searches;
- C-suite and executive leadership;
- fractional, interim, portfolio, part-time and virtual executive roles;
- Director / Head / senior-management titles;
- Principal / Lead / Architect individual-contributor ladders;
- specialist and expert roles;
- consultant / consulting / advisory ladders;
- experienced senior professionals.

### Critical rules

- Seniority is not equivalent to people-management.
- Executive Director must not be collapsed into generic Director.
- Board and non-executive appointments are first-class search targets.
- Fractional roles must not be downgraded because they are part-time or portfolio-based.
- Consultant and specialist titles remain subject to the role taxonomy, but are not excluded merely because of title form.
- LinkedIn uses seniority as positive search expansion only; it remains role-agnostic during signal discovery.


## Query construction authority

`query_templates.yaml` is the controlling configuration for turning unresolved recruitment-intelligence questions into executable searches.

Source provenance:
- `archive/originals/BUILD_INSTRUCTION_query_templates.md` — preserved build instruction.
- `query_templates.yaml` — runtime configuration.
- `schemas/generated-query.schema.json` — generated/executed query contract.

### Boundaries

The query layer generates **search actions**, not business conclusions.

It must not independently decide:
- commercial qualification;
- employer confirmation;
- hiring-manager confirmation;
- email verification;
- vacancy liveness;
- outreach.

### Canonical vocabulary references

Query construction references, rather than duplicates:
- `taxonomy/role_taxonomy.json`;
- `taxonomy/seniority_terms.yaml`;
- `taxonomy/south_africa_locations.yaml`;
- the authoritative LinkedIn hiring-signal master;
- agreed-client/company aliases;
- source-governance/source-registry data.

### Operating doctrine

- exact and discriminative searches before broad searches;
- small overlapping queries rather than giant Boolean strings;
- bounded expansion rather than blind Cartesian products;
- source-specific syntax and structured filters;
- state-aware query selection;
- support and contradiction searches for employer attribution;
- failed-query memory and controlled retries;
- information-gain and commercial-yield optimisation;
- deeper search for high-value opportunities without lowering evidence standards.


## Source-priority authority

The controlling sourcing order is defined in:

- `sources/search-priority.yaml` — default cross-channel priority and independent-run rules;
- `sources/agreed-clients.yaml` — current agreed-client universe and past-client distinctions;
- `runtime/orchestrator.md` — runtime stage orchestration;
- `schemas/client-sweep.schema.json` — agreed-client channel coverage ledger.

### Four independently runnable channels

1. **AGREED_CLIENTS** — default combined-run priority 1
2. **AGENCY_SITES** — default combined-run priority 2
3. **LINKEDIN** — default combined-run priority 3
4. **JOB_BOARDS** — default combined-run priority 4

Each channel can run on its own. The order above is used when a combined/full run needs a default scheduling priority; it is not a prerequisite chain.

All four channels inherit `core/search-structure.md`, the same role taxonomy, seniority ontology, geography ontology, query engine, qualification rules, evidence standard, scoring rubric and output logic.

### Permanent relationship field

Every vacancy/opportunity record must preserve one of:

- `AGREED_CLIENT`
- `AGREED_GROUP_ENTITY`
- `PAST_CLIENT`
- `TARGET_PROSPECT`
- `UNKNOWN`

A discovery from any channel that resolves to an agreed client receives immediate agreed-client commercial priority while its original channel provenance remains intact.

### Current-vs-past distinction

Capita, NTT Data and WNS are retained as `PAST_CLIENT` until a current agreement is verified. They do not receive current agreed-client treatment automatically.


## Shared channel search structure

`core/search-structure.md` is the cross-channel operating authority.

Every sourcing channel uses the same:

- query construction;
- 271-node role taxonomy;
- role-boundary rules;
- seniority ontology;
- South Africa geography ontology;
- qualification/disqualifier rules;
- evidence standard;
- scoring logic;
- deduplication;
- employer-attribution framework;
- client-status vocabulary;
- output structure.

Channel-specific strategy controls source surfaces and tactics only.


## Post-discovery stakeholder and email intelligence

Authority:

`core/stakeholder-contact-intelligence.md`

This is shared downstream enrichment for opportunities from all four sourcing channels. It is **not** a fifth channel.

### Activation gate

Deep stakeholder/contact research starts only when:

- the specific role is `CONFIRMED` or `HIGH_CONFIDENCE`; and
- the direct employer is `CONFIRMED` or `HIGH_CONFIDENCE`.

If either remains unresolved, research stays focused on resolving the role/employer.

### Stakeholder research order

1. direct / functional hiring owner;
2. relevant functional Head / Director / business-unit leader;
3. relevant executive sponsor;
4. TA / internal recruiter / HRBP;
5. vacancy-specific people evidenced in the source trail;
6. current-employment verification.

### Company email intelligence

Research:

- website domain separately from employee email domain;
- multiple observed public employee business addresses;
- company email pattern;
- conflicting/alternate patterns;
- observed person-specific business email where available.

If an exact stakeholder address is not publicly observed but the organisation's business-email domain and pattern are sufficiently evidenced, the private run output may include a **probable pattern-inferred business email**.

A pattern-derived address remains `PATTERN_INFERRED`; it is never upgraded to verified merely because the pattern fits.

### Privacy/storage boundary

The public GitHub repository stores rules, schemas and tests only.

Live stakeholder names, person-specific contact data and client-sensitive run outputs must not be committed to the public repository; they belong in a private operational output/data store.
