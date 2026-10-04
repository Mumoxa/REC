# Run Publishing Contract

## Goal

A ChatGPT/agent run should execute the requested REC sourcing channel(s), process every qualifying verified opportunity through the shared QA and candidate-intelligence pipeline, and publish the resulting structured records into the Recruitment Intelligence Workspace.

The repository remains the workflow authority. The operational database is the canonical run-result store.

## Human command pattern

Examples:

- `Use REC. Run Channel 1 and publish.`
- `Use REC. Run Channel 2 for Western Cape and publish qualified results.`
- `Use REC. Run Channel 3 across South Africa and publish.`
- `Use REC. Run all four channels and publish validated output.`

When the user asks to **publish**, persistence into REC is part of the requested task. A chat response is not publication.

## Two different completion concepts

### Source/channel coverage completion

A sourcing worker can finish searching its required source surfaces and record coverage outcomes such as `SEARCHED`, `NO_RESULTS`, `NOT_APPLICABLE` or `ACCESS_LIMITED`.

That only means the source sweep has finished.

It does **not** mean the REC recruitment run is complete.

### REC research-run completion

A run may be marked `COMPLETE` only when every qualifying verified opportunity produced by the requested scope has:

1. passed QA Gate A;
2. completed hiring-team/contact intelligence, targeting 2–10 relevant named stakeholders where the public market supports it;
3. recorded company employee-email domain/pattern intelligence and kept observed addresses separate from probable pattern-inferred addresses;
4. completed the role/client environment fingerprint;
5. passed QA Gate B;
6. completed the Tier A/B/C/D target-company map;
7. passed QA Gate C;
8. generated and executed candidate searches with recorded coverage/yield;
9. produced an evidence-backed candidate market containing the credible longlist, strongest-market layer and final Top 10 subset;
10. verified candidate identity and material claims;
11. passed QA Gate D for the client-facing set;
12. produced at least one genuinely client-submittable research `TOP_10` candidate; and
13. been persisted into REC and post-write verification has confirmed the expected vacancy/stakeholder/company-email/candidate records exist.

If discovery is finished but candidate work remains, use `RUNNING` or `PARTIAL`.

If a qualifying vacancy has zero submit-ready candidates, the run is not `COMPLETE`.

If a channel sweep finds no qualifying opportunities, record that outcome explicitly, but do not call the recruitment run `COMPLETE` merely because source searching ended.

## Client-submittable candidate definition

For the run-completion contract, a candidate is client-submittable only when:

- the candidate is attached to the same canonical vacancy;
- `marketBucket = TOP_10`;
- candidate QA is `PASS` or `PASS_WITH_UNKNOWNS`;
- `whyFit` contains an evidence-grounded Why This Person / Why This Client rationale;
- material evidence gaps and unknowns are preserved.

The engine should still aim for a credible longlist of 50+ where the market supports it, a strongest-market layer of roughly 20–25, and then up to 10 high-conviction Top-10 profiles. The Top 10 is not the full market. Those are research-depth targets, not quotas. Never pad either set.

## Meaning of "published"

"Published" means:

1. the structured payload was accepted by the REC ingestion path;
2. canonical vacancy/candidate records were persisted into the operational database; and
3. the response or a post-write database read verified persisted vacancy, candidate-assignment and submit-ready candidate counts.

The following are **not** publication:

- rendering results in ChatGPT;
- producing Markdown/HTML/PDF/CSV/Excel;
- writing a local file;
- preparing an ingestion payload without sending it;
- receiving a successful research answer with no datastore write.

An agent must not say "published" until persistence verification succeeds.

## Publication must not depend on a hand-built local environment

The absence of a local `.env`, `.env.local` or plaintext ingestion key is **not** a valid reason to stop a REC run or leave an otherwise publishable checkpoint only on disk.

From a repository checkout, use:

```bash
npm run rec:publish -- runs/<RUN-ID>/publication-payload.json
```

The canonical publisher first uses an already-supplied `INGEST_API_KEY`. If none is present, it binds the checkout to the production REC Vercel project and re-executes through `vercel env run --environment=production`, so the credential remains in the authorised process environment rather than source control.

A workstation/agent environment may require one-time Vercel OAuth authentication. That is an identity/authorization requirement, not application configuration and must not be "fixed" by weakening endpoint authentication or committing a secret.

A temporary publication-authentication problem must not terminate vacancy research or candidate mapping. Continue the run, keep it `RUNNING` or `PARTIAL`, preserve stable IDs/checkpoints, and retry publication through the authorised path.

## Publishing paths

### Preferred from connected ChatGPT

When the Supabase connector is available, the agent may write validated records directly to the configured project using the canonical database schema and must verify the write before claiming publication.

### Canonical repository publisher

Preferred for coding/research agents operating from this repository:

```bash
npm run rec:publish -- runs/<RUN-ID>/publication-payload.json
```

It publishes to `https://rec-phi-weld.vercel.app/api/ingest/run` and refuses to report success unless the ingestion response includes the required persistence verification.

### HTTP ingestion

Automated agents/services may POST to either:

- the application proxy: `POST /api/ingest/run`; or
- the Supabase Edge Function directly: `POST /functions/v1/ingest-run`.

Header:

`Authorization: Bearer <INGEST_API_KEY>`

The plaintext key is held only in trusted automation/server environments. Supabase stores only its SHA-256 hash in `ingest_tokens`.

The Edge Function owns privileged database writes using Supabase's native service-role runtime credential. The Vercel application does **not** receive or store a Supabase service-role/admin key.

## Idempotency

The publishing contract uses stable keys:

- run: `workspace_id + external_run_id`
- vacancy: `workspace_id + canonical_key`
- vacancy source: `workspace_id + vacancy_id + source_key`
- requirement: `workspace_id + vacancy_id + requirement_key`
- query: `workspace_id + vacancy_id + query_key`
- candidate: `workspace_id + canonical_key`
- candidate assignment: `workspace_id + vacancy_id + candidate_id`
- candidate claim: `workspace_id + candidate_id + claim_key`

Repeated publication should enrich/update canonical records rather than create duplicates.

## Progressive publication

A record can become visible progressively.

### Gate A / candidate mapping started

Once a qualifying vacancy passes Gate A, publish it as:

- `candidateMapStatus = IN_PROGRESS`
- `lifecycleStatus = CANDIDATE_MAPPING`
- run status `RUNNING` or `PARTIAL`

Continue enriching the same canonical vacancy.

### Candidate market grows

Upsert into the same vacancy:

- target companies;
- executed research queries;
- longlist candidates;
- candidate claims;
- candidate QA;
- strongest-market candidates;
- Top-10 candidates.

### Completion

Only after the completion contract is satisfied:

- `candidateMapStatus = READY`
- `lifecycleStatus = TOP_10_READY`
- run status `COMPLETE`

## Ingestion enforcement

The ingestion Edge Function rejects a payload that declares `run.status = COMPLETE` when any included qualifying vacancy:

- leaves `stakeholderMapStatus` at `NOT_STARTED` or `IN_PROGRESS`;
- declares `stakeholderMapStatus = READY` without at least one named stakeholder;
- declares `BLOCKED_WITH_EVIDENCE` without a specific blocker note;
- omits company email-domain/pattern intelligence;

- is not `candidateMapStatus = READY`;
- has no research `TOP_10` candidate;
- has no Top-10 candidate with QA `PASS` or `PASS_WITH_UNKNOWNS`; or
- has no evidence-grounded non-empty `whyFit`.

The function also defaults an omitted run status to `RUNNING`, never `COMPLETE`.

## Vacancy-only progressive payload example

This is a valid publication, but it is **not a completed run**:

```json
{
  "workspaceSlug": "talent-tree",
  "run": {
    "externalRunId": "RUN-20261004-001",
    "channel": "AGREED_CLIENTS",
    "status": "RUNNING",
    "specVersion": "REC-main"
  },
  "vacancies": [
    {
      "canonicalKey": "example-company-head-of-finance-cape-town",
      "title": "Head of Finance",
      "employerName": "Example Company",
      "employerStatus": "CONFIRMED",
      "location": "Cape Town",
      "region": "Western Cape",
      "roleFamily": "Finance",
      "seniority": "Head",
      "clientStatus": "AGREED_CLIENT",
      "qaStatus": "PASS",
      "candidateMapStatus": "IN_PROGRESS",
      "candidateMarketSummary": {
        "coverageStatus": "IN_PROGRESS",
        "rawProfilesReviewed": 0,
        "credibleMarketCount": 0,
        "strongestMarketCount": 0,
        "top10Count": 0,
        "executedQueryCount": 0,
        "coverageNote": "Candidate-market research has not yet produced a credible market."
      },
      "stakeholderMapStatus": "IN_PROGRESS",
      "stakeholderMapNote": "Hiring-team and company email intelligence research is underway.",
      "companyEmailIntelligence": {
        "domainStatus": "UNKNOWN",
        "observedPatternExamplesCount": 0,
        "patternStatus": "UNKNOWN_PATTERN",
        "patternBasis": [],
        "alternatePatterns": []
      },
      "stakeholders": [],
      "sources": [],
      "requirements": [],
      "researchQueries": [],
      "candidates": []
    }
  ]
}
```

## Complete payload minimum example

A complete run must contain a submit-ready candidate set:

```json
{
  "workspaceSlug": "talent-tree",
  "run": {
    "externalRunId": "RUN-20261004-001",
    "channel": "AGREED_CLIENTS",
    "status": "COMPLETE",
    "specVersion": "REC-main"
  },
  "vacancies": [
    {
      "canonicalKey": "example-company-head-of-finance-cape-town",
      "title": "Head of Finance",
      "employerName": "Example Company",
      "employerStatus": "CONFIRMED",
      "location": "Cape Town",
      "region": "Western Cape",
      "roleFamily": "Finance",
      "seniority": "Head",
      "clientStatus": "AGREED_CLIENT",
      "qaStatus": "PASS",
      "candidateMapStatus": "READY",
      "candidateMarketSummary": {
        "coverageStatus": "SCARCE_MARKET",
        "rawProfilesReviewed": 18,
        "credibleMarketCount": 1,
        "strongestMarketCount": 1,
        "top10Count": 1,
        "executedQueryCount": 1,
        "coverageNote": "Minimal structural example only. In a real run, use SCARCE_MARKET only after meaningful coverage proves the credible market is genuinely below the normal 50+ research target."
      },
      "stakeholderMapStatus": "READY",
      "companyEmailIntelligence": {
        "websiteDomain": "example.com",
        "employeeEmailDomain": "example.com",
        "domainStatus": "CONFIRMED",
        "observedPatternExamplesCount": 2,
        "observedBusinessEmailExamples": [
          "public.person@example.com",
          "another.person@example.com"
        ],
        "detectedPattern": "firstname.lastname@example.com",
        "patternStatus": "CONFIRMED_PATTERN",
        "patternBasis": [
          "Two public employee business-email examples use the same format."
        ],
        "alternatePatterns": []
      },
      "researchQueries": [
        {
          "queryKey": "candidate-search-001",
          "query": "example evidence-backed candidate search",
          "source": "GOOGLE_XRAY",
          "family": "DIRECT_TITLE",
          "executionStatus": "EXECUTED",
          "observedYield": 18,
          "candidatesSurfaced": 1
        }
      ],
      "stakeholders": [
        {
          "key": "stakeholder-001",
          "name": "Hiring Owner",
          "title": "Finance Director",
          "relevance": "PRIMARY_HIRING_OWNER",
          "reasonRelevant": "Functional finance leader likely to own the appointment.",
          "currentEmploymentStatus": "CURRENT_VERIFIED",
          "profileUrl": "https://www.linkedin.com/in/example",
          "observedBusinessEmail": null,
          "probableBusinessEmail": "hiring.owner@example.com",
          "emailStatus": "PATTERN_INFERRED",
          "emailPatternBasis": "firstname.lastname@example.com",
          "emailConfidenceNote": "Probable business email derived from the evidenced company pattern.",
          "evidenceStatus": "CONFIRMED"
        }
      ],
      "candidates": [
        {
          "canonicalKey": "opaque-candidate-key",
          "name": "Candidate Name",
          "currentTitle": "Financial Manager",
          "currentEmployer": "Comparable Employer",
          "marketBucket": "TOP_10",
          "qaStatus": "PASS",
          "whyFit": "Evidence-grounded rationale linking the candidate's verified experience to the vacancy requirements.",
          "evidenceGaps": []
        }
      ]
    }
  ]
}
```

## Successful ingestion response

A successful response must expose enough information to verify publication, including:

- run ID and external run ID;
- persisted vacancy count;
- persisted candidate count;
- persisted candidate-assignment count;
- persisted submit-ready Top-10 count;
- persisted vacancies with a fully reconciled candidate market;
- persisted stakeholder count;
- persisted vacancies with completed hiring-team intelligence;
- persisted company email-intelligence count;
- whether the completion contract was satisfied.

The caller must check these values before claiming publication.

## Evidence boundary

Agent publishing may update research/evidence tables.

Browser recruiter actions must not update those tables.

Recruiter actions write only to operational state:

- vacancy lifecycle/close state;
- candidate operational status;
- saved views.

## Run identifiers and status

Recommended format:

`RUN-YYYYMMDD-NNN`

A run ID is not a claim of completion.

Allowed run statuses remain:

- `QUEUED`
- `RUNNING`
- `COMPLETE`
- `PARTIAL`
- `FAILED`

`COMPLETE` is reserved for the submit-ready completion contract above.
