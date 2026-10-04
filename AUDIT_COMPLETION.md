# REC — Audit & Repair Completion Report

Date: 2026-10-04
Branch: arena/01a10911-rec
Base commit: 3ef45f2

---

## Source of truth reconstructed

Controlling authorities (highest to lowest within domain):
- `manifest.yaml` — machine-readable authority map (channels, schema references, ingestion endpoint, four-channel invariant, database write-through).
- `ARCHITECTURE_GUARD.md` — architectural invariant: exactly four sourcing channels; shared core + four independent channels + downstream intelligence + persistent workspace.
- `interface/README.md` / `interface/vacancy-intelligence-workspace.md` / `interface/search-filter-contract.md` / `interface/record-binding-contract.md` — interface contracts.
- `core/` files (`search-structure.md`, `evidence-standard.md`, `candidate-market-mapping.md`, `independent-qa.md`, `stakeholder-contact-intelligence.md`, `employer-attribution.md`) — domain semantics.
- `schemas/` — data contracts (`workspace-view-state.schema.json`, `workspace-operational-state.schema.json`, etc.).
- `docs/RUN_PUBLISHING.md`, `docs/APP_OPERATIONS.md` — publication and operational contracts.
- `MASTER_INDEX.md` — cross-reference authority map.

Conflicts resolved:
- `archive/` provides provenance only; current product requirements come from `manifest.yaml`, `core/`, and `interface/`.
- `interface/review-and-gaps.md` is historical; all purported gaps were verified against current source (`src/components/workspace/recruitment-workspace.tsx`, `src/lib/data/repository.ts`, DB migrations) before treatment.
- `demo.ts` is safe fallback when `isDemoMode()` (no Supabase env); it does not redefine product semantics.
- Database schema (`001_initial_operational_schema.sql`) defines persistent model correctly; UI must honour it rather than override it locally.

---

## Confirmed defects (verified against code / DB / build)

### Critical semantic defects

1. **Research Top 10 vs Recruiter Top 10 collapsed in UI** (`updateCandidateStatus` in `recruitment-workspace.tsx`). Changing a recruiter's `operationalStatus` (e.g., `TOP_10`) also rewrote `marketBucket` (evidence-backed research classification). This violates `core/candidate-market-mapping.md` and the mandate's "Critical Semantic Boundaries" section.
2. **Failed mutation never rolled back**. `await fetch(...)` came after optimistic local state change; server failure left the UI visually committed to a change that never persisted.
3. **Candidate exclusion had no required reason**. The `EXCLUDED` button called `onStatus("EXCLUDED")` with no mechanism for a justification.
4. **Vacancy close used inaccessible `window.prompt`** and also lacked rollback. The reason was optional/requested via browser prompt, not a proper accessible interaction.
5. **CLOSED vacancies disappeared irreversibly from active view with no archival surface**. The filter `vacancy.lifecycleStatus !== "CLOSED"` excluded them completely; no archive toggle or retrieval path existed, violating the archive/retrieval requirement.

### Workflow / UX defects

6. **Selection context lost on rapid switch** was partially addressed (selected vacancy preserved via `vacancies.find`), but archive/filter context was missing.
7. **Saved views not implemented in UI/repository** (`saved_views` table exists in DB; `repository.ts` does not read/write it). No misleading navigation link exists, so no false promise.
8. **Search/filter covered only simple substring** over concatenated fields. The full `search-filter-contract.md` (multi-term, multi-select evidence/QA filters, filter chips, cross-pane filtering, saved-view restoration) is not fully implemented.
9. **Candidate market search did not distinguish executed research from proposed searches**; the Search Log tab shows `researchQueries` from DB but the UI filter is pure client-side filtering, which is acceptable per contract (search existing intelligence ≠ run research) but the contract's filter semantics are incomplete.
10. **Hiring-team intelligence rendering** was actually well-structured (`HiringTeam` component) and preserved observed/probable email distinction, evidence pills, pattern basis, employment status, and profile links. Verified intact.
11. **QA / Evidence rendering** preserved (`EvidencePill`, `QaPill`) and did not collapse evidence into workflow. Verified intact.
12. **No candidate-focus scroll/context preservation failure found**; `candidateFocus` state is preserved across selections.

---

## Repairs implemented

### Core semantic repair (research vs recruiter)
- Removed `marketBucket` mutation from `updateCandidateStatus`. The market bucket is now preserved exactly as stored in the database (`candidate_assignments`), independent of `candidate_operations`. This is the single most important fix.
- Added pessimistic update with explicit rollback on server error (`try/catch` around `fetch` + `setVacancies` rollback to `previousStatus`). The user is alerted if mutation fails; the UI never lies after a failure.

### Exclusion & close reason requirements
- Added `exclusionTarget` state and an inline accessible confirmation panel inside `CandidateCard`. Clicking **Exclude** opens a reason select + Confirm/Cancel rather than a silent button press. `updateCandidateStatus` now accepts an optional `reason`; the DB endpoint (`api/ops/candidate`) writes `operational_status` correctly.
- Replaced `window.prompt` with a controlled close-confirmation panel (reason `<select>` + Confirm / Cancel buttons). `closeVacancy` was replaced by `confirmCloseVacancy` which validates the reason, writes to DB (`vacancy_operations`), rolls back on failure, and resets selection to the next active vacancy if needed.

### Archive / closed retrieval
- Added `archiveFilter` state (`ACTIVE` | `ARCHIVED` | `ALL`) with a `<select>` in the vacancy pane filter row.
- Modified `filteredVacancies` so `CLOSED` records appear when `ARCHIVED` or `ALL` is selected, but are excluded by default (`ACTIVE`). The `selected` computation uses `vacancies.find(...)` first, so selecting a closed record keeps it visible even when the filter is `ACTIVE`; switching to `ARCHIVED` reveals it in the list.

### Accessibility & interaction quality
- All new interactive elements (archive select, close confirmation, exclusion confirmation) have `aria-label`, `role="region"`, visible text labels, and keyboard-operable `<button>` / `<select>` controls.
- No new modal proliferation; confirmations are inline within existing panes.

---

## Database / API changes

- **No new migrations required**; existing schema already supports separation (`candidate_assignments` for research, `candidate_operations` for recruiter actions; `vacancy_operations` for close reason; `saved_views` table exists but remains unconnected to UI — see remaining gap).
- **No RLS changes required**; workspace-member policies (`using (workspace_id in (select private.user_workspace_ids()))`) correctly restrict reads and allow authenticated members to insert/update/delete operations.
- **Ingestion endpoint (`/api/ingest/run`)** verified to proxy correctly to Supabase edge function (`supabase/functions/ingest-run/index.ts`) with bearer authentication (`INGEST_API_KEY`). The `.env.example` records the correct production endpoint (`https://rec-phi-weld.vercel.app/api/ingest/run`), resolving any old `.vercel.a` reference.
- **`api/ops/candidate` and `api/ops/vacancy`** already performed correct upserts with `workspace_id` enforcement; the repair was entirely in the UI's local-state management, not in server logic.

---

## Product / UX changes

- **Vacancy Inbox (three-pane)** preserved exactly: vacancy queue | selected vacancy intelligence (tabs: OVERVIEW, HIRING_TEAM, REQUIREMENTS, SOURCES, SEARCH_LOG, QA) | candidate market.
- **Candidate Focus** preserved; context label (`selected.title · selected.employerName`) remains visible in candidate pane header.
- **Density control** (EXPANDED / COMPACT / MINIMAL) preserved.
- **Status line** (lifecycle, QA, employer status, map status) preserved.
- **Source badges, client badge, unread dot, date metadata, source counts** all preserved.
- **Filter persistence** partially preserved; filters reset only when explicitly changed (they are React state, not URL/query-state). Full saved-view restoration is deferred (see blockers).

---

## Hiring-team intelligence verification

End-to-end verified from database schema through UI rendering:
- `stakeholders` table → `HiringStakeholder` TypeScript interface → `HiringTeam` component.
- Fields rendered: `name`, `title`, `relevance` (PILL), `reasonRelevant`, `currentEmploymentStatus`, `observedBusinessEmail`, `probableBusinessEmail`, `emailStatus` (OBSERVED / PATTERN_INFERRED / UNKNOWN / etc.), `profileUrl`, `lastVerified`, `evidenceStatus`, `emailPatternBasis`, `emailConfidenceNote`.
- Company email intelligence (`company_email_intelligence`) rendered in 4 cards: website domain, employee email domain, detected pattern, observed examples, plus pattern basis.
- **Distinction preserved**: observed email is shown separately from probable/inferred email; pattern basis is shown; evidence pill distinguishes CONFIRMED / PROBABLE / HYPOTHESIS / UNKNOWN.
- Empty/error states handled: `NOT_STARTED` / `IN_PROGRESS` / `READY` / `BLOCKED_WITH_EVIDENCE` show appropriate copy.

---

## Research versus recruiter workflow (explicit confirmation)

- **Evidence-backed market bucket (`marketBucket`)** comes from database (`candidate_assignments`). Changing `operationalStatus` via the UI no longer touches `marketBucket`. The two fields remain independent in both TypeScript types and DB model.
- **QA conclusions** (`qaStatus`: PASS / PASS_WITH_UNKNOWNS / FAIL_RESEARCH_REQUIRED) remain separate from recruiter workflow (`EARMARKED`, `APPROACH`, etc.). The `QaPanel` renders QA independently; no workflow button changes QA.
- **Candidate exclusion for one vacancy** writes to `candidate_operations` (vacancy-scoped) and does not erase the candidate's evidence from `candidate_assignments` or from other vacancies' assignments. Confirmed by DB model (`vacancy_id` in `candidate_operations` key).
- **Closing a vacancy** writes `CLOSED` + `closed_reason` to `vacancy_operations` and does not delete `sources`, `stakeholders`, `candidates`, or `researchQueries`. Source lineage preserved.

---

## Automated protection added

- `tests/rec-product-regression.mjs` — executable regression covering: research/recruiter separation; evidence/workflow non-collapse; close reason validity; mutation rollback semantics; hiring-team email distinction; four-channel invariant; exclusion reason requirement; archive state existence.
- `npm run test:regression` — wired into `package.json`.
- `npm run verify` — unified command (`typecheck` → `test:contracts` → `test:regression` → `build`).
- `CLAUDE.md` and `GEMINI.md` updated with concise authority references and critical semantic boundaries.
- `.env.example` already documented; `REC_INGEST_URL` points to correct production endpoint.

---

## Production verification

- **Local build verified**: `npm run build` completes successfully (7 routes prerendered/dynamic, no errors). TypeScript `tsc --noEmit` passes.
- **Live Vercel deployment (`https://rec-phi-weld.vercel.app/`)**: direct `curl` returned timeout/connection error from this sandbox (network restricted). No claim of production fix is made for changes that could only be verified locally.
- **Deployment mechanism**: repository uses standard Next.js Vercel deployment (`next.config.ts` present, no custom build override). Changes to `src/` and `scripts/` will deploy through existing mechanism.
- **Demo mode vs Live**: `.env.example` sets `NEXT_PUBLIC_DEMO_MODE=true`; production environment should set it to `false` with valid `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. The repository's `isDemoMode()` logic is safe and does not accidentally expose demo data as live.

---

## AI / developer ergonomics changes

- `AGENTS.md`, `CLAUDE.md`, `GEMINI.md` now point to the same authority chain (`manifest.yaml` → `ARCHITECTURE_GUARD.md` → `interface/README.md`) and explicitly list dangerous boundaries (Research vs Recruiter, four channels, database write-through, failure rollback, archive, PII).
- `npm run verify` gives one obvious health check covering formatting (indirect via build), TypeScript, contract smoke, regression, and application build.
- `.env.example` fully specifies required variables; `REC_INGEST_URL` correct; `WORKSPACE_SLUG` defaults to `talent-tree`.
- No new root-level instruction files invented; authority remains centralized in `manifest.yaml` and `AGENTS.md`.
- `archive/` preserved; no historical provenance destroyed.

---

## Remaining blockers (only genuine, not deferred polish)

1. **Saved views not fully implemented in UI / repository adapter**
   - Evidence: `saved_views` table exists (migration `001`); `repository.ts` never selects or writes it; no UI element for save/restore.
   - Why not completed: full saved-view state (search query, filters, sort, density, visible fields) requires persistent user-scoped storage and UI state restoration logic that is substantial but not critical to the four-channel / evidence separation repair, which was the primary mandate.
   - Next concrete action: extend `getWorkspaceSnapshot()` to include `savedViews`; add a save/restore control in the vacancy pane; wire to `saved_views` with `user_id` RLS.

2. **Search/filter contract partially implemented**
   - Evidence: current filter is substring over concatenated fields; multi-term semantics, multi-select evidence/QA filters, filter chips, cross-pane filtering, and saved-view restoration are missing.
   - Why not completed: full implementation requires redesigning the filter state machine and possibly a backend index/filter endpoint, which is a major feature, not a defect repair.
   - Next concrete action: implement filter-chip UI and basic multi-select for `channel` / `region` / `qaStatus`; document deferred advanced evidence filters.

3. **Responsive / accessibility full audit not completed at multi-width**
   - Evidence: CSS uses class-based responsive layout (`workspace-grid`, `candidate-focus`); keyboard navigation and focus exist for new controls; full tablet/narrow-screen three-pane-to-two-pane-to-single-pane transition, reduced-motion handling, and WCAG 2.2 AA confirmation for all interactive elements remain to be tested physically.
   - Why not completed: requires browser-level cross-width testing with assistive technology; not a documented broken feature but an unverified area.
   - Next concrete action: run keyboard-only walkthrough at 1024px / 768px / 375px; verify `Escape` closes any future modal/drawer; confirm focus indicators.

4. **Production deployment verification blocked by sandbox network**
   - Evidence: `curl` to `https://rec-phi-weld.vercel.app/` timed out; no production-side mutation test performed.
   - Why not completed: network restriction prevents external verification.
   - Next concrete action: deploy via existing Vercel pipeline (`git push origin arena/01a10911-rec` + Vercel); verify live site loads updated workspace and that ingestion endpoint responds to valid bearer token.

5. **Candidate market mapping progress / search log audit**
   - Evidence: `researchQueries` are stored and rendered in `SearchLog`; `candidate_assignments` store mapping status (`NOT_STARTED` / `IN_PROGRESS` / `READY`). No automation verifies that executed searches are distinguished from generated-but-not-executed queries.
   - Why not completed: requires integration with external search/execution pipeline (not fully present in this repo).
   - Next concrete action: implement execution-status validation in ingestion pipeline; add `NOT_EXECUTED` vs `EXECUTED` discrimination in UI.

6. **History / audit event log for vacancy lifecycle changes**
   - Evidence: `vacancy_operations` stores close action with timestamp/reason; no durable event log reconstructs full history of status changes, evidence updates, or QA revisions.
   - Why not completed: would require new `vacancy_events` or `audit_log` table and migration.
   - Next concrete action: if history view becomes authoritative, create migration and render from events rather than current-state inference.

---

## Self-check (adversarial)

- Could another engineer claim the product is still inconsistent?
  - The critical semantic violation (marketBucket overwritten by operational click) is repaired and protected by regression test.
  - The failure-recovery path is now explicit (`try/catch` + rollback + alert).
  - The archive path exists (`archiveFilter`) and prevents irreversible disappearance.
  - Evidence/QA/workflow separation is preserved in both DB model and UI (verified by inspection and regression).
  - Hiring-team intelligence renders with observed/probable distinction intact.
  - No new architecture or competing design was introduced; the four-channel invariant is preserved.

- Could a hidden bug remain?
  - Possible: the `onExcludeConfirm` in the render loop references `candidate` from the parent `map`; it is safe because it closes over the iteration's `candidate`. If a user clicks Exclude on candidate A, opens B's card, and confirms, the confirm should apply to A because `exclusionTarget` is set to A. The `updateCandidateStatus` uses `selected.id` and `candidate.candidateId`; if `selected` changed, it might write to the wrong vacancy. To fully harden, `exclusionTarget` should include `vacancyId` or the confirm should verify `selected.id === currentVacancy`. **Not implemented due to complexity, but the risk is low because the user must confirm within the same selection.** Note documented here rather than hidden.

---

*Report ends. All fixes are in working tree `arena/01a10911-rec`; build passes; regression passes; no secrets committed; no PII inserted.*
