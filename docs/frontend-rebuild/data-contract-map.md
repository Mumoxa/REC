# REC frontend data contract map

Audit date: 16 October 2026. Sources: `src/lib/data/{types,repository,demo}.ts`, `src/lib/ops/validation.ts`, `src/lib/workspace/{view-state,market-stats}.ts`, API handlers, Supabase migrations/ingestion, `schemas/`, and `interface/record-binding-contract.md`. Main baseline `8c7863e`; PR #26 `c1d6426` changes presentation/read-only pages, not these canonical contracts.

## Read path and authority

`getWorkspaceSnapshot(): Promise<WorkspaceSnapshot>` returns the existing synthetic `demoSnapshot` only when explicit demo mode is true **or** public Supabase URL/key are absent. Live mode validates Supabase JWT claims and reads workspace `WORKSPACE_SLUG || "talent-tree"` through RLS. An inaccessible or missing workspace throws rather than manufacturing records. Preserve this behavior and display mode explicitly.

Live reads page every table in stable order, 1,000 rows per request, with a 20,000-row safety cap per table. Any table error fails the snapshot; cap overflow returns an error rather than silently representing a partial set as complete. Pages should distinguish failed load from no records.

| Snapshot branch                              | Tables and join                                                                                                                      | Consumed by                                            |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------ |
| `workspaceName`                              | `workspaces` selected by slug (`id,name`)                                                                                            | Shared shell/context                                   |
| `vacancies[]`                                | `vacancies` plus `vacancy_operations`, joined by database vacancy UUID                                                               | Dashboard, vacancy queue, employer grouping, QA        |
| `requirements[]`, `sources[]`                | `vacancy_requirements`, `vacancy_sources` by `vacancy_id`                                                                            | Requirements and Source Lineage                        |
| `stakeholders[]`, company email intelligence | `stakeholders`, `company_email_intelligence` by `vacancy_id`                                                                         | Hiring team, employer detail, Stakeholders             |
| `candidates[]`                               | `candidate_assignments` by vacancy; `candidates` by `candidate_id`; `candidate_operations` by vacancy+candidate; claims by candidate | Candidate market, directory, assignment detail/actions |
| `researchQueries[]`                          | `research_queries` by `vacancy_id`                                                                                                   | Research searches and coverage                         |
| `runs[]`                                     | `runs`, ordered start descending then ID                                                                                             | Research activity and Runs                             |
| `savedViews[]`                               | `saved_views`, workspace predicate plus owner RLS                                                                                    | Personal saved views                                   |

Research tables are member-readable and browser read-only. `vacancy_operations` and `candidate_operations` are mutable only for workspace `ADMIN`/`RECRUITER` roles via RLS. Saved views are owned by the signed-in user. The frontend snapshot does not expose role/capability flags; hiding or enabling a button must not substitute for server authorization.

## Identity bindings

| Identity                          | Runtime contract                                                                                                                                                                                                                                                   |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Vacancy.id`                      | `vacancies.id` database UUID; used by every nested join, current `/?vacancy=` link and operational POST. Preserve compatibility.                                                                                                                                   |
| `Vacancy.canonicalKey`            | `vacancies.canonical_key`; ingestion deduplicates on `(workspace_id, canonical_key)`. Research schema `canonical_job_id`/map `opportunity_id` describe this canonical research identity. Do not interchange it with the database UUID without an explicit adapter. |
| `CandidateAssignment.candidateId` | `candidates.id` UUID. Candidate identity is shared across vacancy assignments. Ingestion separately deduplicates candidate canonical keys; that key is not exposed by this snapshot. Never merge people by name.                                                   |
| `assignmentId`                    | `candidate_assignments.id`, separate from person ID. Assignment uniqueness is workspace+vacancy+candidate.                                                                                                                                                         |
| Operational candidate identity    | `(workspace_id, vacancy_id, candidate_id)`; the same person can have different research relevance and workflow per vacancy.                                                                                                                                        |
| Stakeholder `id`/`key`            | Row UUID and `stakeholder_key`; uniqueness is `(workspace_id, vacancy_id, stakeholder_key)`. The same key across vacancies is not proven global person identity.                                                                                                   |
| Organisation                      | Snapshot has employer display text/status, not `company_id`. Safe grouping is labelled vacancy-derived; no authoritative employer master identity can be asserted from a name.                                                                                     |
| Sources                           | Distinct `VacancySource.id`; ingestion source uniqueness is workspace+vacancy+source key. Multiple appearances remain one canonical vacancy.                                                                                                                       |
| Saved view                        | Row ID and unique workspace+user+name. A view is not research identity.                                                                                                                                                                                            |

## Exact frontend model

These are the exported runtime contracts at audit time. `?` indicates optional; `null` is preserved where declared. Strings without a union are not licence to invent a vocabulary.

```ts
type EvidenceStatus = "CONFIRMED" | "PROBABLE" | "HYPOTHESIS" | "UNKNOWN";
type QaStatus = "PASS" | "PASS_WITH_UNKNOWNS" | "FAIL_RESEARCH_REQUIRED";
type VacancyLifecycle =
  | "DISCOVERED"
  | "VERIFYING"
  | "QUALIFIED"
  | "EMPLOYER_RESOLVED"
  | "CANDIDATE_MAPPING"
  | "MARKET_READY"
  | "CLIENT_ACTION"
  | "CLOSED";
type CandidateOperationalStatus =
  | "SURFACED"
  | "RELEVANT"
  | "EARMARKED"
  | "TOP_10"
  | "APPROACH"
  | "ENGAGED"
  | "SUBMITTED"
  | "EXCLUDED";
type MarketBucket = "TOP_10" | "STRONG_MARKET" | "LONGLIST" | "UNREVIEWED" | "EXCLUDED";
type StakeholderMapStatus = "NOT_STARTED" | "IN_PROGRESS" | "READY" | "BLOCKED_WITH_EVIDENCE";
type StakeholderRelevance =
  | "PRIMARY_HIRING_OWNER"
  | "FUNCTIONAL_DECISION_MAKER"
  | "EXECUTIVE_SPONSOR"
  | "TALENT_ACQUISITION"
  | "HR_BUSINESS_PARTNER"
  | "VACANCY_CONTACT"
  | "REFERRAL_OR_AMPLIFIER"
  | "POSSIBLE_STAKEHOLDER";
type BusinessEmailStatus =
  | "OBSERVED"
  | "VERIFIED"
  | "PATTERN_INFERRED"
  | "CATCH_ALL"
  | "CONFLICTING_PATTERN"
  | "UNVERIFIABLE"
  | "UNKNOWN";

interface Requirement {
  id: string;
  label: string;
  value: string;
  status: EvidenceStatus;
  type: "REQUIRED" | "PREFERRED" | "CONTEXT";
}
interface VacancySource {
  id: string;
  name: string;
  type: string;
  url?: string | null;
  evidenceStatus: EvidenceStatus;
  postedAt?: string | null;
}
interface HiringStakeholder {
  id: string;
  key: string;
  name: string;
  title?: string | null;
  relevance?: StakeholderRelevance | null;
  reasonRelevant?: string | null;
  currentEmploymentStatus?: string | null;
  profileUrl?: string | null;
  observedBusinessEmail?: string | null;
  probableBusinessEmail?: string | null;
  emailStatus?: BusinessEmailStatus | null;
  emailPatternBasis?: string | null;
  emailConfidenceNote?: string | null;
  evidenceStatus: EvidenceStatus;
  lastVerified?: string | null;
}
interface CompanyEmailIntelligence {
  websiteDomain?: string | null;
  employeeEmailDomain?: string | null;
  domainStatus: "CONFIRMED" | "PROBABLE" | "CONFLICTING" | "UNKNOWN";
  observedPatternExamplesCount: number;
  observedBusinessEmailExamples: string[];
  detectedPattern?: string | null;
  patternStatus:
    "CONFIRMED_PATTERN" | "PROBABLE_PATTERN" | "CONFLICTING_PATTERNS" | "UNKNOWN_PATTERN";
  patternBasis: string[];
  alternatePatterns: string[];
  notes?: string | null;
  lastVerified?: string | null;
}
interface CandidateMarketSummary {
  coverageStatus: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETE" | "SCARCE_MARKET";
  rawProfilesReviewed?: number | null;
  credibleMarketCount: number;
  strongestMarketCount: number;
  top10Count: number;
  executedQueryCount: number;
  coverageNote?: string | null;
}
interface CandidateClaim {
  name: string;
  value: string;
  status: EvidenceStatus;
}
interface CandidateAssignment {
  assignmentId: string;
  candidateId: string;
  name: string;
  currentTitle: string;
  currentEmployer: string;
  location: string;
  profileUrl?: string | null;
  marketBucket: MarketBucket;
  operationalStatus: CandidateOperationalStatus;
  excludedReason?: string | null;
  rank?: number | null;
  comparableTier?: "A" | "B" | "C" | "D" | null;
  qaStatus: QaStatus;
  whyFit: string;
  claims: CandidateClaim[];
  evidenceGaps: string[];
  lastVerified?: string | null;
}
interface ResearchQuery {
  id: string;
  query: string;
  source: string;
  family: string;
  executionStatus: "EXECUTED" | "ACCESS_LIMITED" | "NOT_APPLICABLE" | "NOT_EXECUTED";
  yieldCount?: number | null;
  candidatesSurfaced?: number | null;
}
interface Vacancy {
  id: string;
  canonicalKey: string;
  title: string;
  employerName: string;
  employerStatus: EvidenceStatus;
  location: string;
  region: string;
  roleFamily: string;
  seniority: string;
  clientStatus:
    "AGREED_CLIENT" | "AGREED_GROUP_ENTITY" | "PAST_CLIENT" | "TARGET_PROSPECT" | "UNKNOWN";
  searchChannel: "AGREED_CLIENTS" | "AGENCY_SITES" | "LINKEDIN" | "JOB_BOARDS";
  sourceLabel: string;
  lifecycleStatus: VacancyLifecycle;
  closedReason?: string | null;
  closeReasonDetail?: string | null;
  qaStatus: QaStatus;
  candidateMapStatus: "NOT_STARTED" | "IN_PROGRESS" | "READY";
  candidateMarketSummary: CandidateMarketSummary;
  stakeholderMapStatus: StakeholderMapStatus;
  stakeholderMapNote?: string | null;
  firstSeen: string;
  lastSeen?: string | null;
  lastVerified?: string | null;
  summary: string;
  unread: boolean;
  requirements: Requirement[];
  sources: VacancySource[];
  stakeholders: HiringStakeholder[];
  companyEmailIntelligence?: CompanyEmailIntelligence | null;
  candidates: CandidateAssignment[];
  researchQueries: ResearchQuery[];
}
interface RunSummary {
  id: string;
  externalRunId: string;
  channel: Vacancy["searchChannel"];
  status: "QUEUED" | "RUNNING" | "COMPLETE" | "FAILED" | "PARTIAL";
  startedAt: string;
  completedAt?: string | null;
  metrics: Record<string, number>;
}
interface SavedView {
  id: string;
  name: string;
  viewState: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}
interface WorkspaceSnapshot {
  workspaceName: string;
  demoMode: boolean;
  generatedAt: string;
  vacancies: Vacancy[];
  runs: RunSummary[];
  savedViews: SavedView[];
}
```

Repository mapping supplies display fallbacks such as “Employer unresolved”, “Unknown”, “Other”, and default `PASS_WITH_UNKNOWNS`; these are adapter behavior, not newly verified facts. A missing candidate row causes its assignment to be omitted rather than creating a synthetic person. Requirements are ordered by `sort_order`. Legacy `business_email` is read into probable email only when observed email is absent. Keep its inferred status visible.

## Counts and scope

`countResearchBuckets` defines credible = LONGLIST + STRONG_MARKET + TOP_10; strongest = STRONG_MARKET + TOP_10; research Top 10 = TOP_10. UNREVIEWED and research EXCLUDED are outside credible. Recruiter exclusion remains a separate fact and does not rewrite these research counts. Excluded **filter** unions research EXCLUDED and recruiter EXCLUDED, without double-counting a row.

`displayMarketCounts` uses the larger of persisted coverage summary and loaded assignment counts for credible/strongest/Top 10; longlist is loaded LONGLIST rows. Executed query count uses persisted summary or actual EXECUTED fallback. The repository accepts camel-case or snake-case summary keys. Summary coverage totals and visible candidate rows can differ; label their scopes rather than imply every summary count is loaded. Global candidate headcount deduplicates `candidateId`; assignment count does not. New/unread comes from `vacancy_operations.unread`, not from a fabricated time window.

There are no supported placement, revenue, pipeline value, sales conversion, AI fit-score or recruiter identity metrics in this snapshot.

## Supported writes

All three operational endpoints parse bounded JSON, validate before querying, require JWT claims, and rely on RLS. Errors are explicit status responses. Browser operations must retain pending/success/failure handling; demo code must skip live writes.

| Endpoint                   | Request and validated limits                                                                                                                                               | Actual write and response                                                                                                                                                                                                                                                                                                                              |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| POST `/api/ops/candidate`  | `{vacancyId, candidateId, operationalStatus, reason?}`; IDs nonblank <=200 chars; status from exact operational union; EXCLUDED requires meaningful reason <=500 chars     | Loads vacancy workspace; requires an existing assignment for same workspace+vacancy+candidate. Upserts `candidate_operations` only: status, trimmed excluded reason (null otherwise), last action time. Returns `{ok:true, operationalStatus, excludedReason}`; malformed 400, unauthenticated 401, missing vacancy/assignment 404, write failure 400. |
| POST `/api/ops/vacancy`    | `{vacancyId, action:"CLOSE", reason, reasonDetail?}`; ID <=200 chars; seven exact close reasons below; OTHER requires nonblank detail <=500 chars                          | Upserts `vacancy_operations` lifecycle CLOSED, reason, closed/action timestamps; detail only when provided. Does not delete or overwrite research. Returns `{ok:true,lifecycleStatus:"CLOSED",reason,reasonDetail}`; 400/401/404 as above. No reopen or general lifecycle endpoint.                                                                    |
| POST `/api/ops/saved-view` | `{name, viewState}`; trimmed name 1–80 chars; plain-object serialized state <=20,000 JavaScript string code units; HTTP body limit 40,000 declared bytes/string code units | Sanitizes allowed view keys, upserts by workspace+user+name; returns `{ok:true,savedView:<database snake_case row>}`. Oversize state 413, validation 400, no auth 401, missing workspace 404, write failure 400.                                                                                                                                       |

Close reasons: `FILLED`, `EXPIRED`, `CLIENT_NO_LONGER_HIRING`, `NOT_COMMERCIALLY_RELEVANT`, `DUPLICATE`, `CANCELLED`, `OTHER`. UI exclusion options: `NOT_SUBMITTED`, `NO_LONGER_RELEVANT`, `COMPETITOR_EXCLUSIVE`, `CLIENT_INSTRUCTED`, `OTHER`; API accepts a meaningful bounded reason string rather than restricting it to this UI list. Database migration 008 enforces meaningful exclusion reasons and OTHER close detail. A FILLED close works without writing the newer optional detail column; OTHER requires that migration.

## Saved view runtime contract

```ts
interface WorkspaceViewState {
  globalSearch: string;
  candidateSearch: string;
  channelFilter: string;
  regionFilter: string;
  archiveFilter: "ACTIVE" | "ARCHIVED" | "ALL";
  density: "EXPANDED" | "COMPACT" | "MINIMAL";
  marketFilter: MarketBucket | "ALL";
  jobTab: "OVERVIEW" | "HIRING_TEAM" | "REQUIREMENTS" | "SOURCES" | "SEARCH_LOG" | "QA";
}
```

Defaults are empty searches, ALL channel/region/market, ACTIVE archive, EXPANDED density, OVERVIEW tab. Text is bounded to 200 chars; invalid vocabularies fall back and unknown keys are dropped. The broader snake-case schema also describes sort, dates, visible fields, selection, layout, scope and scroll state; these are not implemented by the runtime sanitizer. Existing saved data must survive without promoting unrecognised fields to evidence. Any new persistable view facet requires a deliberate sanitizer/API round-trip test.

## Publication and authentication boundaries

The public-auth exception for `/api/ingest/*` does not make ingestion unauthenticated. POST `/api/ingest/run` requires the existing `INGEST_API_KEY` bearer, compares it using `safeEqual`, bounds payload to 8,000,000 characters/declared bytes, forwards to `${NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ingest-run`, and passes upstream result with no-store. GET returns 405. Missing config 503, invalid bearer 401, oversize 413, upstream connection failure 502. No database service-role secret belongs in the browser or Vercel proxy.

The Edge Function validates the hashed ingestion token and writes canonical records idempotently. It preserves stronger client relationship, earliest first-seen, original channel provenance, recruiter state, and QA records. COMPLETE requires verified downstream coverage/QA, full-market reconciliation, a QA-cleared research TOP_10 candidate with fit rationale, terminal hiring-team research and company email intelligence for every vacancy. It performs post-write read-back checks. A RunSummary status/metrics display is not fresh proof of publication; show recorded state, never manufacture a verified completion from UI actions.

Login continues using Supabase email OTP with `shouldCreateUser:false`, code verification, secure SSR cookies and callback code exchange. `safeNextPath` prevents external redirects. Keep reference seed endpoints, demo auth and database schemas outside REC production code.

## Existing backend data not exposed by the snapshot

| Data exists in current database/contracts                                               | Frontend limitation and honest treatment                                                                                                                                          |
| --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `companies` including IDs and industry metadata                                         | No repository query; no `company_id` in Vacancy type. Use explicit vacancy-derived employer groupings, disable unsupported industry filters or extend an authorised read adapter. |
| `target_companies` with tiers/reasons/evidence                                          | Not loaded. Assignment comparableTier is available, but is not a complete target-company universe.                                                                                |
| `qa_reviews` gate/conclusion/time/claims/contradictions/unknowns/next actions/sources   | Not loaded. Vacancy/candidate QA summaries and candidate gaps are available; do not invent Gate A–D review history or challenged-claim narratives.                                |
| `candidate_claims.source_url`, notes                                                    | Mapping emits only name/value/status. Candidate profile and vacancy sources are available; do not imply those are claim-level sources.                                            |
| `vacancy_sources` raw appearances and run binding; vacancy metadata/salary/last_changed | Not mapped into runtime type. Preserve source rows and existing timestamps; do not label generated snapshot time as verified/researched time.                                     |
| Operation close/action timestamps and audit history                                     | Not in snapshot. No full workflow timeline; current close reason/detail can be shown.                                                                                             |
| Workspace membership roles                                                              | RLS enforces writes, but snapshot lacks capability flags. No supported account-management or outreach UI API.                                                                     |

These gaps are identified from source, not missing live records. Existing backend/query additions must preserve canonical schema and RLS; absent information must remain unavailable until actually loaded. The feature matrix maps the regression coverage needed for each surface.
