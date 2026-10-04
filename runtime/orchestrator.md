# Runtime — Four-Channel Dispatcher

## Authority

Load:

- `manifest.yaml`
- `ARCHITECTURE_GUARD.md`
- `core/search-structure.md`
- `sources/search-priority.yaml`

## Purpose

Dispatch one or more of the four sourcing channels.

The four channels are independently runnable.

## Run modes

### Single-channel run

If one channel is requested, run it directly.

No prior channel completion is required.

Examples:

- `AGREED_CLIENTS` only
- `AGENCY_SITES` only
- `LINKEDIN` only
- `JOB_BOARDS` only

### Selected multi-channel run

If a subset is requested, run only those channels.

Unless an explicit order is supplied, use their relative default priority:

`AGREED_CLIENTS → AGENCY_SITES → LINKEDIN → JOB_BOARDS`

### Full run

If all four channels are requested, default to:

1. AGREED_CLIENTS
2. AGENCY_SITES
3. LINKEDIN
4. JOB_BOARDS

This is a default priority order, not a prerequisite chain.

## Shared intelligence stack

Before running any sourcing channel, load the `shared_channel_stack` from `manifest.yaml`.

Every channel uses the same:

- search structure;
- query templates;
- role taxonomy;
- role boundary rules;
- seniority ontology;
- geography ontology;
- qualification rules;
- disqualifiers;
- scoring rubric;
- evidence standard;
- deduplication;
- employer attribution;
- client-status vocabulary;
- output structure.

Channel-specific instructions may change source tactics only.

## Channel dispatch map

- `AGREED_CLIENTS` → `runtime/agreed-client-worker.md`
- `AGENCY_SITES` → `runtime/agency-worker.md`
- `LINKEDIN` → `runtime/linkedin-worker.md`
- `JOB_BOARDS` → `runtime/jobboard-worker.md`

## Cross-channel behaviour

- Preserve original source/channel provenance.
- If any channel discovers an agreed-client vacancy, give it immediate agreed-client commercial priority.
- Do not require the agreed-client channel to have run first for another channel to recognise an agreed client.
- Deduplicate across channel outputs when they are consolidated.
- Do not let one channel create different role/seniority/geography definitions.

## Enrichment

`runtime/enrichment-worker.md` may process output from any single channel or any combination of channels.

Enrichment is not a fifth sourcing channel.


## Shared downstream pipeline

After any channel produces a consolidated opportunity:

1. run QA Gate A using `runtime/qa-review-worker.md`;
2. complete/verify enrichment required for role and employer resolution;
3. complete hiring-team/contact intelligence, including company employee-email domain/pattern research, to `READY` or `BLOCKED_WITH_EVIDENCE`;
4. when activation gates pass, dispatch `runtime/candidate-mapping-worker.md`;
5. build role/client fingerprint;
6. run QA Gate B;
7. build target-company universe;
8. run QA Gate C;
9. generate and execute passive-candidate searches;
10. build evidence-backed longlist, targeting 50+ without padding;
11. verify candidate claims;
12. run QA Gate D;
13. form strongest market set and Top 10.

This pipeline can start from output of **any single channel**. It never requires another sourcing channel to have completed.

Candidate mapping and QA are not sourcing channels.


## Run completion and publication gate

Do not confuse source/channel coverage completion with REC research-run completion.

A run is `COMPLETE` only when every qualifying verified opportunity from the requested channel scope has:

1. passed QA Gate A;
2. completed hiring-team/contact intelligence with named stakeholders plus company email-domain/pattern intelligence, or an evidence-grounded `BLOCKED_WITH_EVIDENCE` outcome;
3. completed the role/client fingerprint and passed QA Gate B;
4. completed target-company mapping and passed QA Gate C;
5. executed candidate searches with recorded coverage/yield;
6. built and verified the full credible candidate market, including the longlist, strongest-market layer and final Top 10 subset;
7. passed QA Gate D for the client-facing candidate set;
8. produced at least one QA-cleared candidate in the research `TOP_10` bucket with an evidence-grounded fit rationale; and
9. been persisted into REC with the vacancy, candidate assignment(s), evidence and QA records successfully verified in the canonical datastore.

The 50+ credible-longlist depth, roughly 20–25 strongest-market depth, and Top-10 size remain research targets, not quotas. The Top 10 is never a substitute for the broader market map. A scarce market may legitimately produce fewer candidates, but zero client-submittable candidates means the run is not complete.

If channel discovery is exhausted while candidate work remains unfinished, use `RUNNING` or `PARTIAL` and report the remaining gap. Never return `COMPLETE` solely because vacancies were found and validated.

When the user asks to "publish", publication is part of the requested run. Do not claim publication until persistence succeeds and the persisted vacancy/candidate counts have been verified.


## Write-through checkpoint rule

The live REC datastore is the durable checkpoint for a run.

Do not perform an entire channel run in memory/local files and attempt the first publication only at the end. Publish progressively using the same stable run and canonical vacancy IDs after material milestones, including:

- Gate A / verified vacancy -> `RUNNING`, `CANDIDATE_MAPPING`;
- Gate B fingerprint completion;
- Gate C target-company completion;
- meaningful candidate batches / search-yield updates;
- Gate D strongest-market / Top-10 updates;
- final submit-ready state.

Use the repository publisher:

```bash
npm run rec:publish -- runs/<RUN-ID>/publication-payload.json
```

A missing local `.env` is not a stop condition. The publisher bootstraps the authorised production Vercel environment when the key is not already present.

If publication authentication is temporarily unavailable, continue downstream research rather than terminating after vacancy discovery. Keep the run `RUNNING` or `PARTIAL`, preserve the checkpoint payload privately, and retry publication. Never convert an infrastructure/authentication limitation into an artificial end of the recruitment run.
