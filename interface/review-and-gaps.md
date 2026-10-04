# Recruitment Intelligence Workspace — code and product review

**Review scope:** repository contracts, schemas, architecture and the workspace prototype added with this review.
**Important limit:** when this review began, the repository contained no runnable frontend, API, datastore or build/test harness. The original “UI” was a Markdown specification plus JSON schemas and YAML golden cases. There was therefore no production UI implementation to inspect for runtime defects, accessibility behaviour, latency, security controls or real-record integration. The buildless prototype is an interaction reference, not evidence that those production capabilities exist.

## Executive design read

The product is not a conventional applicant-tracking system and should not be reduced to a job list or candidate-scoring dashboard. Its distinctive value is a four-channel hiring-intelligence engine that keeps one canonical vacancy connected to source lineage, employer resolution, evidence, independent QA, a role/environment fingerprint, target-company coverage and an evidence-backed candidate market. The UI must preserve that full model while making recruiter triage faster.

The design direction is a high-density, trust-first operating surface: three persistent panes; progressive density; claim-level evidence; visible unknowns and QA; explicit research actions; and separate recruiter workflow. The patch does not change the product idea, sourcing architecture, channel count, research sequence, evidence standards or 50-person non-quota target.

## Findings

### P0 — No production application or integration exists in this repository

**Evidence:** the repository's executable artifacts are schemas/configuration; before this change there was no frontend entry point, package manifest, API contract, persistence adapter, authentication boundary or automated UI test command. The interface contract itself says structured records are authoritative, but does not specify a production transport or datastore.

**Impact:** a static screen cannot prove that a recruiter can load large datasets, preserve state across devices, securely view candidate information, invoke workers, recover from failures or export canonical records. Any review claiming the ATS is production-ready would overstate what exists.

**Disposition:** the patch adds `interface/prototype/`, a buildless interaction demo explicitly labelled synthetic/local-only. Before production, choose and document the backend/API and persistence model, add authentication and authorization, connect schema-validated records, and add browser-level tests. The prototype must not be promoted as the system of record.

### P1 — Record identity did not join across the four data layers

**Evidence:** final opportunities use `canonical_job_id`; candidate maps and role fingerprints use `opportunity_id`; workspace selection and operational state use `vacancy_id`. Operational assignments require `candidate_id`, but candidate objects in the market-map schema previously had no candidate identifier.

**Impact:** an adapter could create duplicate vacancy identities, lose candidate workflow when evidence refreshes, attach an action to the wrong person or silently match people by name.

**Disposition:** resolved at the contract/schema level. `interface/record-binding-contract.md` declares `canonical_job_id` the authoritative vacancy key and defines the existing aliases. Candidate maps now require a stable opaque `candidate_id`, and the candidate-mapping instructions prohibit deriving it from personal data or deduplicating on a name alone. A production adapter still needs executable referential-integrity tests.

### P1 — Recruiter close/exclude actions were not enforceable from the operational schema

**Evidence:** the workspace contract requires a close reason, but the operational schema allowed `lifecycle_status: CLOSED` without `closed_reason` or `closed_at`. Candidate assignments allowed `EXCLUDED` without an exclusion reason.

**Impact:** records could be archived or removed from the candidate market without an auditable rationale, weakening the close/reopen and independent-review model.

**Disposition:** resolved in `schemas/workspace-operational-state.schema.json`: `CLOSED` requires a non-null reason and date-time; `OTHER` requires an explanation; `EXCLUDED` requires a reason. The UI prototype includes reason-required dialogs and preserves the research record when changing operational status.

### P1 — “Top 10” had two meanings

**Evidence:** the candidate-map schema defines an evidence-reviewed `top_10` recommendation, while operational state defines recruiter `TOP_10`; the UI specification also used “Add to Top 10” for a recruiter action.

**Impact:** a recruiter could mistake an operational shortlist change for an AI/research recommendation, or the reverse. Either interpretation risks changing a research conclusion through a workflow action.

**Disposition:** the prototype labels them **Research Top 10** (read-only market recommendation) and **Recruiter Top 10** (vacancy-specific operational action). It tells the user that changing one does not change the other. The canonical production API should preserve that semantic distinction in field names/metadata and tests, even if existing enum values must remain for compatibility.

### P1 — Candidate and stakeholder privacy is specified as a warning, not enforced as a system control

**Evidence:** the final-opportunity schema can contain named stakeholders and contact/email data; its contact description warns against putting live person-specific information in a public repository. The product also intends passive-candidate research and public-profile evidence. No production identity, authorization, retention, deletion, access logging or consent/objection model is implemented here.

**Impact:** a correct-looking evidence UI can still expose personal data to the wrong users or store it in public Git, browser storage, exports or logs. Public visibility of a profile is not, by itself, a complete privacy/compliance model.

**Disposition:** still open and production-blocking. Keep live candidate/stakeholder records out of this repository and out of browser `localStorage`. Before connecting real records, specify private storage, least-privilege roles, lawful basis and purpose, retention/deletion, source terms, audit, export controls and objection/suppression handling under the applicable South African privacy regime (including POPIA). Obtain appropriate legal/privacy review; interface copy is not a control.

### P1 — The promised History view has no durable event model

**Evidence:** the UI calls for a vacancy chronology and significant state changes. Current operational state stores a latest action timestamp and current values, not a sequence of actor-attributed before/after events. Research logs and QA records cover some events but not all recruiter actions or lifecycle transitions.

**Impact:** “who changed what and why” cannot be reconstructed after a status changes; close/reopen, approach, exclude and Top 10 changes are not reliably auditable. A static timeline can mask that gap.

**Disposition:** still open. Add an append-only workspace event contract/store for lifecycle transitions, candidate-vacancy actions, reasons, actor, timestamp, correlation/run ID and before/after values. Keep source evidence and QA events linked by their canonical IDs; do not copy or rewrite them into a second evidence store.

### P1 — Saved views were promised more completely than their schema allowed

**Evidence:** the filter contract says saved views contain search, filters, sort, date window, density and visible fields. View state previously had no date window, visible-field selection, active detail tab or saved-view object schema.

**Impact:** implementations could save only a label or filter subset, then appear to load the view while changing the recruiter’s scope or losing presentation preferences.

**Disposition:** resolved at the schema level. View state now includes a date window, visible fields, active vacancy tab and queue/candidate scroll positions; `schemas/workspace-saved-view.schema.json` defines saved-view identity, scope, snapshot and timestamps. A backend still needs ownership/sharing, conflict resolution and migration semantics.

### P2 — Filter contract is feature-rich but still not a complete query contract

**Evidence:** search/filter documentation lists many facets; view-state filter objects remain open-ended. It does not fully define multi-select operators, how unknown/missing values behave, filter-count semantics, date boundaries, query tokenization, permissions or server-side pagination.

**Impact:** two implementations can show different counts for the same saved view, accidentally drop unknowns, or return employer-level clues in a person-level confirmed filter.

**Disposition:** `interface/search-filter-contract.md` now defines OR within a multi-select facet, AND across facets, separate `UNKNOWN` and missing values, case-insensitive all-term text matching, evidence-level joins, and count semantics that do not imply a complete paged result. Production query behavior is still open: specify timezone and inclusive/exclusive date bounds, permissions, server-side sort/cursor contracts, and behavior when data is stale or only partially loaded. Test `SAP = CONFIRMED` only against candidate-level confirmed evidence, never employer-level technology.

### P2 — UI quality states and accessible operation were requirements gaps

**Evidence:** the original workspace and search contracts cover core flows but do not specify production loading, connection failure, permission denial, stale-data warning, empty-vs-filtered-empty states, focus management, keyboard access, reduced motion, contrast, narrow-screen behaviour or live-region feedback.

**Impact:** the product can be visually polished but still inaccessible or misleading when a source is unavailable, a record is empty, or a query is still running.

**Disposition:** the additive interface contract and `interface/design-system.md` now define responsive panes, WCAG 2.2 AA target, focus/keyboard/reduced-motion rules, explicit research boundaries and distinct production loading/empty/error/access-limited states. The prototype demonstrates focus, responsive pane switching, empty states and local action feedback. It is not a substitute for automated accessibility and browser testing.

### P2 — “High-volume” is a product requirement without a measured performance target

**Evidence:** the search contract calls for hundreds or thousands of records, but there are no dataset-size targets, response-time budgets, rendering limits, indexing rules or performance tests.

**Impact:** a three-pane design can become a slow, unusable dense grid when real candidate maps or evidence histories arrive.

**Recommendation:** define measurable p95 targets for initial load, vacancy selection, global search and filter application; virtualize long queue/candidate lists; use cursor pagination and indexed server search; debounce text search without delaying local feedback; and load large evidence/history sections on demand. Keep queue selection, filter chips and current record in the first paint.

### P2 — Default ordering needs explainable tie-breaks

**Evidence:** the vacancy contract lists priority tiers but does not fully state stable tie-breaks for records within a tier. It also exposes several sort modes without an explicit default date/time convention.

**Impact:** roles may appear to “jump” between visits, and recruiters can mistake commercial priority for an unexplained model score.

**Recommendation:** publish deterministic tie-breaks, for example: client relationship and explicit action need, then unresolved age, then first-seen recency, then stable canonical ID. Show why an item is near the top. Never introduce an opaque suitability score as a substitute.

## Product optimisations preserved in the prototype

- **Faster triage:** role/employer/location, relationship, source count, QA, research need, mapped-candidate count and recency appear in the queue, with three density settings.
- **Less navigation:** queue, role evidence and mapped people are shown together; the selected vacancy context persists in Candidate Focus and narrow-screen pane switching.
- **Trust by construction:** employer/role confidence, claim-level evidence, unknowns, four independent QA gates and source lineage remain visible rather than collapsed into one score.
- **No silent research:** local search filters seeded records; employer/candidate research has a separate explicit action and a Search Log view. Preview actions are marked `NOT_EXECUTED`.
- **Clearer Top 10:** Research Top 10 and Recruiter Top 10 are visibly distinct.
- **Safer lifecycle:** close requires a reason, archives rather than deletes, can be undone in the demo, and retains source/candidate/QA intelligence.
- **Reusable context:** saved views persist search, filters, sort, date window, density, active vacancy tab and visible-field settings in the local demo.
- **Honest sample data:** the banner identifies all names/claims/records as synthetic and states that no research worker or backend is connected.

## Prototype-level review fixes

During the static interaction review, the prototype was tightened without widening its implementation claim:

- Wired the explicit candidate-research action to its confirmation dialog; ordinary search remains local and never starts research.
- Made filter, save-view, close-vacancy and exclude-candidate cancellation controls non-submitting, so Cancel cannot accidentally apply a draft filter or commit a destructive action.
- Restored the saved detail tab and focus layout when loading a saved view instead of silently forcing Overview; the demo snapshots date-window and visible-field settings, but does not expose editors for them.
- Clarified that mapped-profile totals may represent a larger synthetic map than the small set of illustrative cards rendered.
- Added focus restoration after dynamic list/tab/action updates and kept intermediate-width candidate-drawer Escape behavior from closing an underlying dialog.
- Removed remote font requests; the buildless preview now uses a system-first font stack and local assets only.

These fixes are covered by the repository's Node smoke/contract checks. They are not a replacement for real-browser, screen-reader or accessibility testing.

## Release gates before a real ATS connection

1. A private API/data adapter maps final opportunities, source records, candidate maps, QA reviews, runs, view state and operational state by the identifiers in `record-binding-contract.md`.
2. Production schemas are validated at write/read boundaries, including date-time, close/exclude reasons, status transitions and unknown-value handling.
3. Privacy, permission, retention, audit and export controls are approved before any live candidate/stakeholder data is loaded.
4. An append-only activity model backs the History view and recruiter actions.
5. Browser integration tests cover the golden cases, keyboard use, responsive panes, search/research separation, persistence, close/reopen and candidate workflow/evidence separation.
6. Large-data performance and WCAG 2.2 AA are measured on realistic vacancy and candidate-map sizes.

The four-channel model, downstream candidate intelligence, evidence standards and QA sequence remain authoritative. All new interface material is a supporting presentation/operational layer, not another sourcing channel.
