# Runtime — Agreed-Client Priority Worker

## Channel

**AGREED_CLIENTS — default priority 1**

This channel is independently runnable. It does not require any other sourcing channel to run before or after it.

## Bootstrap

1. Read `manifest.yaml`.
2. Load every file in `shared_channel_stack`.
3. Load the agreed-client channel-specific files listed under `workers.agreed_clients.channel_specific_load`.
4. Apply `channels/agreed-clients.md` for source-surface tactics only.

All role, seniority, geography, query, qualification, evidence, scoring and output rules come from the shared stack.

## Mission

Search the **entire current agreed-client universe**. In a combined/full run this channel has default priority 1. In a single-channel run, execute it directly without waiting for or requiring any other channel.

An agreed-client vacancy is not required to compete with a general-market vacancy for commercial priority. Once a vacancy is credibly attributable to a current agreed client or confirmed agreed group entity, route it immediately into the the agreed-client channel recruitment pipeline.

## Required channels per current agreed client

Search every applicable channel:

1. corporate careers pages and ATS;
2. parent-company careers portals;
3. subsidiary/divisional careers portals;
4. company LinkedIn Jobs;
5. company LinkedIn page posts;
6. HR / Talent Acquisition employee posts;
7. hiring-manager posts;
8. executive and functional-leader posts;
9. employee reposts;
10. referral posts;
11. unlinked "we are hiring" / growth posts;
12. recently removed or duplicated adverts that may indicate an active search;
13. external job boards where the vacancy is explicitly attributable to the client;
14. recruitment-agency adverts where evidence indicates the end client is an agreed client.

## Client relationship handling

Every vacancy record must carry one of:

- `AGREED_CLIENT`
- `AGREED_GROUP_ENTITY`
- `PAST_CLIENT`
- `TARGET_PROSPECT`
- `UNKNOWN`

Do not promote a past client to the agreed-client channel without current-agreement evidence.

Do not infer group-agreement coverage merely from ownership or name similarity.

For Old Mutual, preserve current agreed-client priority while separately recording unresolved employing-entity/business-unit agreement scope.

For Angaza, preserve current agreed-client priority while requiring exact corporate-identity verification during matching.

## Workflow

`AGREED CLIENT → VACANCY DISCOVERY → VERIFY VACANCY → IDENTIFY HIRING OWNER → CONFIRM RELATIONSHIP SCOPE → CANDIDATE MARKET MAPPING → OUTREACH / CLIENT ACTION`

Do not spend research time asking whether an agreed client is commercially accessible. That relationship already exists; research should instead resolve the vacancy, employing entity where necessary, hiring owner and action path.

## Role handling

The the agreed-client channel sweep must be comprehensive across the client universe.

Use the role taxonomy and seniority ontology for classification, prioritisation and search expansion, but retain meaningful agreed-client hiring intelligence even where a general-market role would normally require exclusion/review.

## Coverage gate

The agreed-client **source sweep** has completed its coverage obligation only when **every current agreed client** has a coverage-ledger entry for every applicable source surface.

Allowed source-surface outcomes:

- `SEARCHED`
- `NO_RESULTS`
- `NOT_APPLICABLE`
- `ACCESS_LIMITED`

A source surface may not be silently skipped.

Passing this coverage gate means discovery coverage is documented. It does **not** mean the REC recruitment run is complete.

## REC run-completion gate

For every qualifying verified agreed-client opportunity, continue immediately through the shared downstream pipeline:

`QA A → fingerprint → QA B → target companies → QA C → executed candidate searches → credible longlist → candidate verification → QA D → strongest market → Top 10`.

The agreed-client REC run may be marked `COMPLETE` only when every qualifying opportunity has at least one QA-cleared, client-submittable research `TOP_10` candidate with an evidence-grounded fit rationale and the resulting vacancy/candidate records have been successfully persisted and verified in REC.

If discovery coverage is finished but candidate work is unfinished, or any qualifying vacancy has zero client-submittable candidates, the run is `RUNNING` or `PARTIAL`, never `COMPLETE`.

The 50-candidate credible-longlist target and Top-10 size are research-depth targets, not quotas. Do not pad a market to satisfy the completion gate.

This run-completion requirement does not gate execution of the other sourcing channels; channel independence remains intact.

## Output

Every vacancy record must carry `search_channel = AGREED_CLIENTS` and the appropriate permanent `client_status`.

Return records conforming to `schemas/discovered-job.schema.json`.

Also return a client coverage ledger containing:

- canonical client;
- entity/alias searched;
- channel;
- status;
- queries/filters used;
- results reviewed;
- vacancies found;
- duplicates found;
- access limitation;
- last checked.


## Mandatory QA Gate A handoff

Before any discovered record enters shared downstream qualification or enrichment, run `A_DISCOVERY` through `runtime/qa-review-worker.md`.

The independent review must challenge vacancy existence/currentness, exact role and location, source authenticity and duplicate lineage, direct employer attribution, client relationship/agreement scope, seniority, material requirements, contradictions and unresolved unknowns.

Only `PASS` or `PASS_WITH_UNKNOWNS` records may proceed. A `FAIL_RESEARCH_REQUIRED` record returns to channel research.

Do not invent missing facts to make a record pass.


## Progressive REC publication

Channel 1 is a live REC workflow, not a local report-generation exercise.

As soon as a qualifying vacancy passes Gate A, publish it into REC as an in-progress candidate-mapping record. Re-publish the same canonical vacancy as the fingerprint, target-company universe, candidate batches, QA reviews and Top 10 are produced.

Canonical repository command:

```bash
npm run rec:publish -- runs/<RUN-ID>/publication-payload.json
```

Do not inspect the checkout, notice only `.env.example`, and conclude that publication is unavailable. The publisher can obtain the authorised production ingestion environment through the canonical Vercel project.

A publication-authentication problem does not excuse terminating Channel 1 at discovery/QA Gate A. Continue the downstream candidate work, preserve the run as `RUNNING` or `PARTIAL`, and retry publication through the authorised path.
