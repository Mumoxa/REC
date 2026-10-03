# Run Publishing Contract

## Goal

A ChatGPT/agent run should be able to execute any REC sourcing channel, complete the shared QA/candidate workflow, then publish validated structured results into the Recruitment Intelligence Workspace.

## Human command pattern

Examples:

- `Use REC. Run Channel 1 and publish.`
- `Use REC. Run Channel 2 for Western Cape and publish qualified results.`
- `Use REC. Run Channel 3 across South Africa and publish.`
- `Use REC. Run all four channels and publish validated output.`

The repository remains the workflow authority. The operational database stores run results.

## Publishing paths

### Preferred from connected ChatGPT

When the Supabase connector is available, the agent may write validated records directly to the configured project using the canonical database schema.

### HTTP ingestion

Automated agents/services may POST to:

`POST /api/ingest/run`

Header:

`Authorization: Bearer <INGEST_API_KEY>`

The key is server-side only and must never be committed or exposed to the browser.

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

## Evidence boundary

Agent publishing may update research/evidence tables.

Browser recruiter actions must not update those tables.

Recruiter actions write only to operational state:

- vacancy lifecycle/close state;
- candidate operational status;
- saved views.

## Visibility lifecycle

A record can become visible progressively:

1. discovery published;
2. QA Gate A status visible;
3. employer/role resolution updates;
4. fingerprint/target-company work progresses;
5. candidate map grows;
6. Top 10 becomes ready.

The site should reflect the current structured state rather than wait for one giant final report.

## Example payload

```json
{
  "workspaceSlug": "talent-tree",
  "run": {
    "externalRunId": "RUN-20261004-001",
    "channel": "AGENCY_SITES",
    "status": "COMPLETE",
    "specVersion": "REC-main"
  },
  "vacancies": [
    {
      "canonicalKey": "company-role-location",
      "title": "Head of Finance",
      "employerName": "Example Company",
      "employerStatus": "CONFIRMED",
      "location": "Cape Town",
      "region": "Western Cape",
      "roleFamily": "Finance",
      "seniority": "Head",
      "clientStatus": "TARGET_PROSPECT",
      "qaStatus": "PASS",
      "candidateMapStatus": "READY",
      "sources": [],
      "requirements": [],
      "researchQueries": [],
      "candidates": []
    }
  ]
}
```

## Run identifiers

Recommended format:

`RUN-YYYYMMDD-NNN`

A run ID is not a claim of completion. The separate run status must remain one of:

- QUEUED
- RUNNING
- COMPLETE
- PARTIAL
- FAILED
