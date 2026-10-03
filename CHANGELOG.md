# Changelog

## 0.7.0 — Client-First Sequential Source Priority

- Replaced equal/parallel source treatment with a strict four-stage sourcing sequence.
- Stage 1 now searches the complete current agreed-client universe across direct and indirect hiring channels.
- Stage 2 is the exhaustive relevant inventory of PRN Recruitment, Communicate Recruitment and Network Recruitment.
- Stage 3 runs the South African LinkedIn distributed hiring-intelligence engine.
- Stage 4 runs the broader 350-source/secondary-market universe.
- Added `runtime/agreed-client-worker.md` and `runtime/orchestrator.md`.
- Added `sources/search-priority.yaml` as the stage-gating authority.
- Updated the current agreed-client universe, including the expanded Pepkor entity list.
- Kept Capita, NTT Data and WNS as past clients rather than current Stage 1 clients.
- Added permanent `client_status` and `source_priority_stage` fields to vacancy/opportunity schemas.
- Added `schemas/client-sweep.schema.json` for mandatory Stage 1 channel coverage.
- Added feedback-loop promotion from later stages back into the Stage 1 commercial workflow.
- Added regression tests preventing out-of-order stage execution and loss of client status.
- Made query templates subordinate to source-stage scheduling.


## 0.6.0 — Authoritative Query Construction Engine

- Preserved the full `query_templates.yaml` build instruction under `archive/originals/`.
- Added root-level `query_templates.yaml` as the controlling query-construction configuration.
- Implemented 43 distinct query templates across vacancy, social hiring, company, agency, ATS, employer attribution/contradiction, duplicates, stakeholders, reporting lines, employment verification, contacts, salary/freshness, executive movement, expansion and source research.
- Added bounded expansion, exact-first sequencing, source profiles, fallbacks, query budgets, stop conditions, query deduplication, failed-query memory and retry rules.
- Added information-gain and commercial-yield prioritisation.
- Referenced existing role, seniority and geography authorities rather than duplicating those vocabularies.
- Wired query configuration into all four workers.
- Added `schemas/generated-query.schema.json`.
- Added query-engine regression cases.


## 0.5.0 — Authoritative Seniority Ontology

- Added `taxonomy/seniority_terms.yaml` as the controlling seniority/search-level authority.
- Added exact search coverage for Executive Director and board-level roles.
- Added Non-Executive Director and Independent Non-Executive Director search lanes.
- Added fractional, interim, portfolio, part-time and virtual executive search terms.
- Added specialist and expert individual-contributor seniority.
- Added consultant, consulting and advisory career ladders.
- Wired seniority into all discovery/enrichment workers.
- Preserved LinkedIn seniority as positive search expansion only, never as a discovery exclusion.
- Added seniority fields to signal/opportunity schemas and regression tests.


## 0.4.0 — Authoritative Role Taxonomy

- Preserved the complete Talent Tree master role taxonomy.
- Compiled all 271 role nodes into a machine-readable registry.
- Added role-taxonomy governance and boundary rules.
- Wired the taxonomy into agency, job-board/ATS and enrichment workers.
- Kept LinkedIn social discovery role-agnostic, with taxonomy filtering downstream.
- Added taxonomy node/group fields to discovery and final-opportunity schemas.
- Added regression tests for major classification boundaries and scarce-specialist priority.
- Recorded the source discrepancy between the stated grouping count and the actual named headings.


## 0.3.0 — Authoritative South Africa Location Ontology

- Added `taxonomy/south_africa_locations.yaml` as the controlling geographic ontology.
- Encoded mandatory P1 Western Cape → P2 Gauteng → P3 KwaZulu-Natal → P4 rest/national order.
- Preserved intra-region commercial/industrial cluster ordering and aliases.
- Wired the location authority into LinkedIn, agency, job-board and enrichment workers.
- Added normalized region/cluster fields to output schemas.
- Added geographic regression tests.
- Preserved user-supplied research rationale and source links in `taxonomy/south_africa_locations_research_notes.md`.


## 0.2.0 — Authoritative Hidden Hiring LinkedIn Engine

- Adopted `South_Africa_LinkedIn_Hidden_Hiring_Signal_Engine_MASTER.md` as the controlling LinkedIn discovery specification.
- Changed LinkedIn discovery to a strict role-agnostic discovery layer.
- Removed salary, role-family, client-priority and commercial filtering from the LinkedIn worker bootstrap.
- Added a dedicated LinkedIn social-signal schema.
- Added explicit conflict precedence: the current LinkedIn master governs over historical LinkedIn instructions.
- Preserved downstream qualification/enrichment as a separate worker.

## 0.1.0 — Infrastructure V1

- Initialized canonical recruitment-intelligence repository.
- Added worker manifest and source-coverage index.
- Added shared qualification, evidence, deduplication and employer-attribution modules.
- Added agreed-client registry and source-governance rules.
- Added LinkedIn, agency and job-board channel strategies.
- Added four thin runtime worker instructions.
- Added discovery and final-opportunity JSON schemas.
- Added initial regression / golden cases.
- Preserved original source specifications under `archive/originals/`.
