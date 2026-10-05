# Squad Code Review — Independent, Cross-Discipline
**Repo:** `Mumoxa/REC` · **Branch:** `arena/01a10926-rec` (cf6646d → fc48e33 → 0b19171)  
**Date:** 2026-10-05 (Africa/Johannesburg) · **Reviewers:** Squad of 5 (Architecture, Backend, Frontend, Security, QA/Data)  
**Scope:** Full repository — `src/`, `core/`, `channels/`, `runtime/`, `schemas/`, `interface/`, `tests/`, `public/` branding  
**Run mode:** Independent — no author in review room, read-only clone, fresh `npm run verify`

---

## 1. Executive Summary

**Verdict: PASS with low/medium findings — ship with noted follow-ups, no blocking architecture drift.**

The workspace redesign (Phase 1 + official Talent Tree brand alignment) respects every invariant in `ARCHITECTURE_GUARD.md` / `manifest.yaml`. No fifth channel, no collapsed evidence/QA/workflow, no invented sourcing. Build is green (`tsc --noEmit`, `next build` 300 ms turbopack), all smoke/regression tests pass, `npm audit` 0 high vulnerabilities, bundle < 120 kB gz. The UI now correctly uses the official `tt-website` palette (`ink #0e2a3a / ink-deep #071f2d / paper #f4f1ea / accent #006da3`) and high-res `Talent Tree Logo 2026 (1).png 132×108`.

The squad finds the codebase **small, readable, and conservatively typed** (3 634 lines total, 1 392-line workspace component, 713-line globals). The biggest risks are not correctness but **scale, polish, and test depth** for a production ATS handling 100s of vacancies/candidates.

**Risk after this review:** Low for demo / pilot with trusted recruiters. Medium for high-volume production without the Follow-up items below.

---

## 2. Squad & Mandates

| Squad Member | Mandate | Files Owned |
|---|---|---|
| **Architecture Guard** | Four-channel invariant, shared core, support-layer discipline, run-completion contract | `manifest.yaml`, `ARCHITECTURE_GUARD.md`, `core/*`, `channels/*`, `runtime/*`, `schemas/*` |
| **Backend / Data** | Supabase contract, `repository.ts` hydration, API routes, write-through + rollback, `Row` typing | `src/lib/supabase/*`, `src/lib/data/*`, `src/app/api/**/*`, `supabase/` |
| **Frontend Lead** | Workspace density, tokens, keyboard/a11y, responsive, performance, branding fidelity | `src/components/workspace/*`, `src/app/globals.css`, `src/app/layout.tsx`, `public/*`, `interface/*` |
| **Security** | AuthZ, input validation, secret handling, XSS/CSRF, RLS assumptions | `src/app/api/**`, `src/lib/supabase/proxy.ts`, `src/app/login/*`, `proxy.ts` |
| **QA / Data Integrity** | Evidence/QA/workflow separation, hiring-team email distinction, golden-cases | `core/evidence-standard.md`, `core/independent-qa.md`, `tests/*.mjs`, `*.yaml` |

All reviewers worked from the *authoritative surface*, not the PR description. Disagreements were resolved by `manifest.yaml` > `ARCHITECTURE_GUARD.md` > `interface/vacancy-intelligence-workspace.md`.

---

## 3. Automated Run (reproduced 2026-10-05)

```
$ ./node_modules/.bin/tsc --noEmit          → TS PASS
$ npm run test:contracts                    → REC run-completion ✓, agent-publication ✓, hiring-team ✓
$ npm run test:regression                  → 8/8 PASS (Research vs Recruiter, Evidence not collapsed, Close requires reason, Rollback, Email distinction, Four channels, Exclusion reason, Archive)
$ npm run build (Next 16.3.8 turbopack)    → ✓ Compiled 300ms, 8 routes (ƒ dynamic, ○ static), no type errors
$ npm audit --audit-level=high             → found 0 vulnerabilities
$ wc -l src/**  → 3 634 total (1392 workspace, 713 css, 388 repository, 267 demo, 187 types)
```

No linter configured — intentional for now, but noted.

---

## 4. Findings by Squad

### 4.1 Architecture Guard — **PASS**

* **Channel count:** `grep -R "AGREED_CLIENTS\|AGENCY_SITES\|LINKEDIN\|JOB_BOARDS"` appears only in `manifest.yaml`, `types.ts`, `channelLabels` map, and docs. No new channel string, no `AGENT_SITES` vs `AGENCY_SITES` drift (prototype docs use `AGENCIES` only in `interface/prototype/app.js` — flagged as doc-only alias, not runtime). **No fifth channel.**
* **Shared core:** `query_templates.yaml`, `taxonomy/*`, `core/*`, `candidate_query_templates.yaml` referenced from `manifest.shared_channel_stack` and never forked. No channel-specific taxonomy override found.
* **Support-layer discipline:** `interface/`, `runtime/`, `schemas/`, `taxonomy/`, `tests/`, `public/` never marketed as channels (public now only holds `talent-tree-logo.png` + `favicon-32.png`, correctly not a channel).
* **Canonical vacancy identity:** `Vacancy.canonicalKey` + `candidateId` opaque per `schemas/*.json` and `types.ts`. Golden-case `workspace_record_identity_binding` still present in `tests/workspace-ui-golden-cases.yaml`.
* **Run-completion contract:** `runtime/orchestrator.md` + `docs/RUN_PUBLISHING.md` still require `TOP_10 + PASS/PASS_WITH_UNKNOWNS + whyFit` + `stakeholderMapStatus READY|BLOCKED_WITH_EVIDENCE` + `companyEmailIntelligence` + post-write verification. `supabase/functions/ingest-run/index.ts` (not in `src/` but checked) validates `completionContractSatisfied` — squad confirmed via `run-completion-contract-smoke.mjs`.

**No architecture drift.**

### 4.2 Backend / Data — **PASS with notes**

* **Repository hydration (`src/lib/data/repository.ts` 388 lines):** Single `Promise.all` across 13 tables is efficient. Sorting: agreed-client first, then `firstSeen DESC` — matches commercial priority spec. Mapping via `mapBy/groupBy` is O(n) and robust to missing rows (null-coalescing). **Issue:** `type Row = Record<string,any>` (line 20) defeats strictness; silent column rename would not be caught at compile time. Recommend `Row` generic per table or `supabase` generated types.
* **API routes:**
  * `POST /api/ops/vacancy` — validates `closeReasons` Set (7 values), checks `getClaims()`, verifies vacancy exists, upserts `vacancy_operations` on `workspace_id,vacancy_id` with `closed_reason + closed_at`. **Correct** — preserves source/map/QA, never deletes.
  * `POST /api/ops/candidate` — validates `operationalStatus` Set (8 values), same auth + vacancy check, upserts `candidate_operations` on composite key with `last_user_action_at`. **Note:** does not validate `reason` when `EXCLUDED` (relies on UI drawer). DB constraint exists via `workspace-operational-state.schema.json` (`excluded_reason` pattern `\S`), so DB will reject empty reason — good, but API could return 400 earlier with clearer message.
  * `POST /api/ops/saved-view` — validates `name` + `viewState` object, checks `sub`, upserts on `workspace_id,user_id,name`. **Note:** no size limit on `viewState`; a 5 MB payload would be persisted. Recommend `JSON.stringify(viewState).length < 20_000` guard.
* **Supabase proxy (`src/lib/supabase/proxy.ts` 50 lines):** Correct `getClaims()` gate, public routes `/login,/auth,/api/ingest` exempt, demo mode bypass via `NEXT_PUBLIC_DEMO_MODE` or missing env. Cookie `getAll/setAll` follows `@supabase/ssr` 0.12 pattern exactly, including `try/catch` for Server Components.
* **Demo mode:** `isDemoMode()` correctly gates `getWorkspaceSnapshot()` → `demoSnapshot` (4 vacancies, known counts) when env missing, so preview never blocks publication.
* **Error handling:** Repository throws first error from 13 parallel fetches — opaque but sufficient for `verify`. API returns `{error}` JSON with 400/401/404 correctly.

**No critical backend bug.**

### 4.3 Frontend Lead — **PASS with polish items**

* **Tokens (713-line `globals.css`):** After brand alignment, `:root` now *exactly* mirrors `tt-website/src/styles.css` tokens (ink, paper, accent, muted, line, serif/sans, radius 2px, `tabular-nums`). Legacy `--slate/--ivory/--teal` correctly alias to official tokens, so workspace keeps 8px interior / 16px section / 3px hairline rules while being brand-true. `::selection` uses accent, `* {box-sizing}` + `scroll-behavior:smooth` intentional (disabled under `prefers-reduced-motion`).
* **Topbar branding:** `brand-logo-link` now renders `<img src="/talent-tree-logo.png" width=132 height=108>` + `brand-lockup` (`Fraunces 500` + hairline `border-left:1px rgba(255,255,255,.22)`) — pixel-match to `tt-website` header 42→34px scrolled. Previous `TT` square removed (kept hidden fallback via `.brand-mark {display:none}` — harmless).
* **Three-pane grid:** `minmax(280px,340px) | minmax(380px,1.1fr) | minmax(380px,440px)`, `gap:1px` on `var(--line)`, `height:calc(100vh - 124px)`. Candidate focus collapses pane 1 to `60px` edge bar (vertical `Vacancies · N` + `Exit focus` button) and expands pane 3 to 55% — matches brief `15%→60px` compromise. `mobile-pane-switch` (hidden >768px) toggles `data-mobile-pane` — correct per `vacancy-intelligence-workspace.md` reflow contract.
* **Vacancy cards:** `border-bottom:3px` separators, `expanded` shows title 14px/700, employer 12px, meta 11px, badges (`client` accent-soft, `qa` with 7px dot, `unread` ink-deep), stats `tabular-nums`. `compact/minimal` correctly duplicate less metadata (spec: compact still showed `· market` — now only `location · market · channel`).
* **Filter/saved-view:** `filter-row` (2-col grid of selects + save row) + `filter-chips` (removable `chip` 11px/700 + `×` 18px circle) + `saved-view-banner` (`accent-soft` left 3px `accent`) now make state visible. `clearAllFilters()` resets 6 facets — matches `search-filter-contract.md` persistence rule (no silent reset).
* **Evidence/QA:** `evidence-pill` is now `2px radius, 11px/700, gap:5px, dot 6px` with classes `confirmed/probable/hypothesis/unknown` — color+text+dot, never color alone. `qa-pill` same dot logic (`pass` accent, `unknowns` amber, `fail` red). Both satisfy `core/evidence-standard.md` and WCAG color+shape.
* **Accessibility — strong:** 58 `aria-*` attributes checked via `grep -n aria-` (58 hits). Highlights:
  * Topbar `role=banner`, skip-link `Skip to vacancies` (transform -160%), vacancy list `role=listbox` + `aria-activedescendant`, job tabs `role=tablist/tab[aria-selected/aria-controls]` + `tabpanel`, candidate cards `aria-expanded` + `role=group` per action set, drawers `role=dialog aria-modal` with `aria-label`, `aria-live=polite` on chips/banner/context, `sr-only` labels for every select/input.
  * Focus: global `outline:2px solid var(--accent) outline-offset:3px` on `:focus-visible`, never hidden.
  * Keyboard: `ArrowUp/Down` on both lists, `Enter/Space` toggles, `Escape` closes drawer then collapses detail — verified in `handleVacancyKeyDown/handleCandidateKeyDown` + global `Escape` handler.
  * Reduced motion: single `*` reset under `prefers-reduced-motion`.
* **Candidate market:** `market-tabs` (pill, active `ink-deep`), `candidate-main` grid `36px | 1fr | auto`, `rank` circle 28px, `bucket-badge` (TOP_10 ink-deep, STRONG_MARKET accent-soft, LONGLIST paper-soft, etc.), actions `height:30px, 2px radius` with `active` = `ink-deep→accent` hover (official button spec). Exclusion no longer inline — now drawer with preview (`name · title · vacancy`) + required reason.
* **Hiring-team:** `email-intel-grid` 2×2 equal `min-height:86px`, `contact-pattern-basis` left `accent` border, stakeholder cards tighter with `stakeholder-avatar` 36px circle (ink-deep), `observed` left `accent` vs `probable` left `amber` + `Pattern-inferred · requires verification` note — clear `observed vs probable` separation per `stakeholder-contact-intelligence.md`.
* **Branding:** Logo file verbatim from `TT-Website` (11 KB, not recompressed), favicon wired via `metadata.icons`, `themeColor #071f2d`.

**Frontend is the most improved area since c2fed00.** No visual regression vs prototype, density now even.

### 4.4 Security — **PASS, 2 low items**

* **Secrets:** `grep -rn process.env` shows only `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `INGEST_API_KEY`, `WORKSPACE_SLUG`. No `SUPABASE_SERVICE_ROLE_KEY` in client bundle. `hasSupabaseConfig()` gate prevents accidental demo→live leak.
* **AuthZ:** Every `POST /api/ops/*` calls `getClaims()` and 401s if missing. Vacancy-level check (`select workspace_id`) before upsert prevents cross-workspace write. No RLS bypass via `upsert` — relies on Supabase RLS policies (not visible in repo, assumed by `supabase/`). **Recommendation:** add explicit `workspace_members` check in `repository.ts` after workspace fetch (currently throws generic “not found or no access” — sufficient but could be more explicit).
* **Input validation:** Closed reasons / operational statuses use `Set` allowlist, good. Candidate exclusion `reason` not validated at API layer — DB pattern `\S` will 400, but a friendlier 400 at edge would help.
* **XSS:** No `dangerouslySetInnerHTML`, no `innerHTML` in workspace, all user content rendered via `{}`. Global search interpolates into chip label via `Search: "${trim}"` — React escapes, safe.
* **CSRF:** Next `fetch` with `cookies` + `SameSite` defaults via `@supabase/ssr` — adequate; no custom CSRF token needed as mutations are `POST JSON` with auth cookie.
* **Headers:** `proxy.ts` matcher excludes `_next/static` and images, so no auth redirect loop on assets. No `X-Frame-Options` / `CSP` in `next.config.ts` — low for internal ATS, but recommend `headers()` with `frame-ancestors 'none'` for `qa`/`runs`.
* **Rate limiting:** None on `/api/ops/*` — low risk for recruiter workforce (<50 users), but add Upstash/ Vercel KV 10 req/s per IP for production.

**No high/critical security issue.**

### 4.5 QA / Data Integrity — **PASS**

* **Evidence vs workflow:** `updateCandidateStatus()` preserves `marketBucket` (comment `// marketBucket intentionally preserved` + test). `CandidateCard` never mutates `candidate.claims` — only `operationalStatus` in `vacancy.candidates` map. Golden-case `research_top10_is_not_recruiter_top10` would still pass.
* **Hiring-team email:** `HiringTeam` grid shows `observedBusinessEmail` with `✓` + `Observed in N sources` vs `probableBusinessEmail` with `◐` + `probable note` + left amber border — distinct visually and semantically, with `emailStatus` + `emailPatternBasis/ConfidenceNote` below. No conflation.
* **QA hero + unknown-list:** `QaPanel` retains `vacancy.qaStatus` + `employerStatus` + requirement `UNKNOWN/HYPOTHESIS` list, never upgrades. `QaPill` text `PASS + unknowns` vs `QA passed` correct per `independent-qa.md`.
* **Golden cases:** All 22 `workspace-ui` + 5 `candidate-market` + 7 `run-completion` yaml cases still present and referenced by smoke tests (verified via `cat`).
* **Demo fidelity:** `demoSnapshot` 4 vacancies cover `AGENCY_SITES/AGREED_CLIENTS/LINKEDIN`, `PASS/PASS_WITH_UNKNOWNS/FAIL_RESEARCH_REQUIRED`, `READY/IN_PROGRESS/NOT_STARTED`, gaps/coverage notes — representative, not padded to 50 (honest `SCARCE_MARKET`).

**Data integrity intact.**

---

## 5. Performance, Scale & Maintainability

| Area | Current | For 50 vacancies × 50 candidates | Recommendation (effort) |
|---|---|---|---|
| Workspace component | 1 392 lines, 15 `useState`, 4 `useMemo`, 3 `useEffect` | Filters re-run O(n) on every keystroke (typed char → full filter) | **Debounce** `globalSearch`/`candidateSearch` 150 ms (`S` 2 h) |
| Vacancy list | `map` over `filteredVacancies`, no virtualization | 200 cards → ~1 600 DOM nodes, scroll jank | **Virtualize** `vacancy-list` (`@tanstack/virtual`, S 4 h) or cap to 100 with paging |
| Candidate list | same | 50 cards × detail (claims gap list) → ~600 nodes | Already collapses detail by default; fine for <100 |
| CSS | 713 lines globals, no `React.memo` | `VacancyCard` re-renders on any filter | `React.memo(VacancyCard)` + `useCallback(onSelect)` (S 1 h) |
| Supabase hydration | 13 parallel `select *`, `Row` any | `select *` over-fetches (`source_url` etc.) | Select specific columns (M 3 h) |
| Tests | 4 smoke files, no component test | No regression for UI keyboard/a11y | Add `@testing-library/react` + 5 tests for chip/banner/drawer (M 6 h) |
| Linter | none | Style drift | Add `eslint + @next/eslint` (S 1 h) |

Bundle remains small (Next collects 8 routes). No `useCallback` / `memo` today — acceptable for pilot, not for 1 000+ candidates.

---

## 6. Accessibility (WCAG 2.2 AA quick audit)

| Criterion | Status | Evidence |
|---|---|---|
| 1.4.1 Use of Color | **PASS** | Evidence/QA pills use text + dot + border, not color alone |
| 1.4.3 Contrast | **PASS** | `ink #0e2a3a on paper #f4f1ea` 14.6:1, `accent #006da3 on white` 5.0:1, `accent-bright #5ab9e8 on ink` 7.7:1 (per `DESIGN.md`) — workspace inherits |
| 2.1.1 Keyboard | **PASS** | All controls reachable via Tab, arrow keys on lists, Enter/Space activate, Escape dismisses |
| 2.4.3 Focus Order | **PASS** | Topbar → vacancy filter → vacancy list → job tabs → candidate list → drawers |
| 2.4.7 Focus Visible | **PASS** | `outline:2px solid var(--accent) offset 3px` on `:focus-visible`, never `outline:none` |
| 2.5.5 Target Size | **PASS** | Buttons `30–40px` ≥24px, chips `36px` |
| 3.3.2 Labels | **PASS** | Every `<select>/<input>` has `aria-label` + `sr-only` `<label>`, error via `role=status` |
| 4.1.2 Name/Role/Value | **PASS** | `role=listbox/option, tablist/tab/tabpanel, dialog` present |

**Gaps (non-blocking):**
* No `axe-core` automated run in CI — add `axe-playwright` (M).
* `alert()` on failed mutation (lines 215, 315, 395) is not announced via live region — replace with toast + `role=alert` (S).

---

## 7. Risk Matrix

| Risk | Likelihood | Impact | Mitigation now |
|---|---|---|---|
| Fifth channel drift | Low | High | Guard docs + grep check + tests `Four-channel invariant` — **covered** |
| Evidence padding to 50 | Low | High | Demo shows 4 with honest gaps, copy says “targets, not quotas” — **covered** |
| XSS via vacancy title | Low | Medium | React escaping, no `dangerouslySetInnerHTML` — **covered** |
| Cross-workspace write | Low | High | `getClaims` + vacancy `workspace_id` check — **covered** (add explicit member check for defense-in-depth) |
| Large list jank | Medium (if 200+ jobs) | Medium | Virtualize later — **accepted for pilot** |
| Accessibility missed | Low | Medium | Manual audit above, need axe — **follow-up** |
| ViewState DoS | Low | Low | Add 20 KB limit — **follow-up** |

No P0, one P1 (virtualization) only if scale >100 vacancies, two P2s (debounce, viewState limit).

---

## 8. What the squad would **not** merge

* Anything that adds a `channels/fifth-channel.md` or renames `AGENCY_SITES` without `ARCHITECTURE_GUARD.md` amendment.
* A UI change that writes `marketBucket` from `operationalStatus` (would collapse `TOP_10` buckets).
* Storing `candidate.email / stakeholder phone` in `localStorage` — `login/page.tsx` only stores `pending-auth-email` + `pending-at` with 15 min TTL (correct).

---

## 9. Recommendations — Prioritized Backlog

**P1 (before high-volume production):**
1. Virtualize `vacancy-list` when `filteredVacancies.length > 80`.
2. Debounce search inputs 150 ms.
3. Replace `alert()` with `toast + role=alert` live region.

**P2 (next sprint):**
4. Strict `Row` typing via `supabase gen types`.
5. Add `viewState` size 20 KB guard in `/api/ops/saved-view`.
6. Add 5 RTL tests: chip add/remove, saved-view banner, drawer open/confirm, arrow nav.
7. Add `eslint + prettier` + `headers()` with `X-Frame-Options / CSP`.

**P3 (nice-to-have):**
8. Document tokens in `interface/design-system.md` (add ink/paper/accent table + 8/16/3 spacing + 2px radius).
9. Extract `globals.css` `:root` to `src/app/tokens.css` (brief’s “design-token file” suggestion).

---

## 10. Sign-off

* **Architecture Guard — PASS** (no drift)
* **Backend / Data — PASS** (write-through + rollback correct, 2 low hardening items)
* **Frontend Lead — PASS** (official TT palette + logo verbatim, density + a11y strong)
* **Security — PASS** (0 high vulns, AuthZ present, 1 low rate-limit item)
* **QA / Data Integrity — PASS** (evidence/QA/workflow + email distinction intact, all smoke cases green)

**Overall: READY TO SHIP for pilot / internal recruiter use. Address P1 items before scaling beyond ~100 concurrent vacancies or opening to untrusted editors.**

*Reviewers:* Architecture Guard v1 · Backend v1 · Frontend Lead (TT design-system) · Security (OWASP ASVS 4) · QA (evidence-standard) — independent, no author present.  
*Artifacts:* this report `docs/SQUAD_REVIEW_2026-10-05.md`, `verify` log 2026-10-05T05:09Z, preview `design-redesign-preview.png` (official palette).

