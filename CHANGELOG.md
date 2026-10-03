# Changelog

## 2026-10-03 — Conversation-to-repository sync: candidate intelligence + QA

- Preserved the four-channel architecture and channel independence.
- Added shared candidate market mapping for verified opportunities from any channel.
- Added role/client environment fingerprinting.
- Added evidence-backed Tier A/B/C/D target-company mapping.
- Added executable LinkedIn/Google/public-social candidate query templates.
- Added passive-talent doctrine and 50+ credible-candidate research-depth target.
- Explicitly defined 50 as a target, never a quota or permission to pad.
- Added candidate-level non-inference rules: company facts do not become person facts.
- Added independent adversarial QA Gates A–D.
- Added strongest-market-set and Top-10 client-facing outputs.
- Added machine-readable fingerprint, QA and candidate-market-map schemas.
- Added regression cases for product drift, channel independence and hallucination controls.
- Wired candidate mapping/QA into manifest, orchestrator, enrichment and canonical output.


## 0.10.0 — Post-Discovery Stakeholder & Email Intelligence

- Added `core/stakeholder-contact-intelligence.md` as shared post-discovery enrichment for all four channels.
- Added a hard activation gate requiring high-confidence role resolution and direct-employer resolution before deep stakeholder/contact work.
- Formalised functional hiring-owner, executive-sponsor, TA/HR and vacancy-specific stakeholder routes.
- Required current-employment verification before operational use of stakeholder records.
- Formalised employee-email-domain discovery separately from website-domain discovery.
- Added observed-address pattern research and evidence statuses for confirmed/probable/conflicting/unknown company email patterns.
- Defined probable pattern-inferred business email handling without mislabelling inferred addresses as verified.
- Added company email intelligence and role/employer resolution gates to the final-opportunity schema.
- Expanded the canonical report with a consolidated stakeholder/contact matrix.
- Added query sequencing for functional owner → executive sponsor → HR/TA → employment verification → domain → pattern → contact.
- Added regression tests for role/employer gating, stakeholder relevance, current employment, pattern evidence and public-repository privacy boundaries.


## 0.9.0 — Independent Channels, Shared Intelligence Stack

- Made all four sourcing channels independently runnable.
- Kept the default combined-run priority as Agreed Clients → Agency Sites → LinkedIn → Job Boards without using it as a prerequisite gate.
- Added `core/search-structure.md` as the mandatory search lifecycle shared by all four channels.
- Made every channel inherit the same query templates, 271-node role taxonomy, seniority ontology, geography ontology, qualification/disqualifier rules, evidence standards, scoring, deduplication, employer-attribution and output rules.
- Updated LinkedIn to load the shared role taxonomy and seniority stack while preserving its ability to retain incomplete role-agnostic social signals.
- Replaced canonical stage provenance with required `search_channel` provenance; legacy stage fields remain only for compatibility.
- Converted the orchestrator into a dispatcher supporting single-channel, selected multi-channel and full runs.
- Replaced sequential-stage regression tests with independent-channel and shared-stack regression tests.


## 0.8.0 — Four-Channel Architecture Guard

- Restored the original project mental model as the canonical human-readable architecture.
- Locked sourcing to exactly four channels: Agreed Clients, Agency Sites, LinkedIn and Job Boards.
- Added `ARCHITECTURE_GUARD.md`.
- Added canonical core facade files: ideal-client-profile, disqualifiers, scoring-rubric and output-template.
- Added canonical channel facade files at `channels/*.md`.
- Added optional `runs/` archive with privacy guardrails.
- Explicitly classified runtime, schemas, taxonomy, sources, tests, archive, query construction and enrichment as support layers rather than sourcing channels.
- Aligned detailed agency, LinkedIn and job-board strategy files to their canonical channel/stage.
- Added regression guards preventing silent introduction of a fifth sourcing channel.


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
