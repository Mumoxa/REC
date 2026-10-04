# REC Agent Operating Contract

This repository is the operating specification for Talent Tree Recruitment Intelligence.

These instructions are mandatory for any AI/coding/research agent operating in this repository.

## Start here

Before executing a recruitment run, read:

1. `manifest.yaml`
2. `ARCHITECTURE_GUARD.md`
3. `runtime/orchestrator.md`
4. the requested channel worker
5. `docs/RUN_PUBLISHING.md`

## The database is the work product

REC is not a report generator with a database attached.

Research must be **write-through** to the live REC workspace as meaningful stages are reached.

Publish progressive checkpoints:

- verified vacancy / QA Gate A -> REC;
- fingerprint / QA Gate B -> REC;
- target-company map / QA Gate C -> REC;
- candidate batches and evidence -> REC;
- QA Gate D / strongest market / Top 10 -> REC;
- final submit-ready state -> REC.

Do not wait until the end of a long run to make the first database write.

## A run does not stop at vacancy discovery

Finishing source coverage, writing `discovered-jobs.json`, completing QA Gate A, or preparing `publication-payload.json` is not completion.

For every qualifying verified vacancy continue through:

`Gate A -> hiring-team/contact intelligence -> fingerprint -> Gate B -> target companies -> Gate C -> broad candidate searches -> credible market (target 50+ where supported) -> candidate verification -> Gate D -> strongest market (normally ~20–25) -> final Top 10 subset -> client-submittable candidate(s) -> verified REC persistence`.

**Do not treat Top 10 as the candidate-market deliverable.** Preserve the broader credible market and strongest-market layer in REC. A run with only a Top 10 and no evidence-backed broader market/coverage is incomplete.

A run may be labelled `COMPLETE` only under the completion contract in `docs/RUN_PUBLISHING.md`.

## Missing local .env is NOT a publication stop condition

Never stop with language such as:

> "Nothing was published because only .env.example exists."

The canonical publication command is:

```bash
npm run rec:publish -- runs/<RUN-ID>/publication-payload.json
```

The publisher:

1. uses `INGEST_API_KEY` if it is already available;
2. otherwise binds the checkout to the canonical REC Vercel project;
3. executes itself through `vercel env run --environment=production`;
4. receives the production ingestion credential without writing it into source control;
5. POSTs to the live REC ingestion endpoint; and
6. checks returned persistence counts before reporting publication.

The canonical production endpoint is:

`https://rec-phi-weld.vercel.app/api/ingest/run`

Do not use the malformed `.vercel.a` hostname.

### One-time Vercel authentication

A machine that has never been authorised for the Talent Tree Vercel team may require a one-time Vercel OAuth/login step. This is authentication, not REC application configuration.

Do not create a new ingestion key, hard-code a secret, commit credentials, or disable ingestion authentication to bypass it.

If the current execution environment truly has no authorised publication path, **do not stop the research pipeline**. Continue candidate mapping and keep the run `RUNNING` or `PARTIAL`. Report the publication authentication blocker separately only after completing all research work possible in the run.

## Publication payloads are checkpoints, not deliverables

A local payload is useful for audit/retry, but it is not the final product.

After each material update, publish the same stable run/canonical vacancy keys again. Ingestion is idempotent and should enrich existing records rather than create duplicate vacancies.

## Privacy

Do not commit candidate personal data, private contact data or sensitive client/run payloads into a public repository.

The `runs/` folder is for governed local/private run artifacts and non-sensitive audit material unless repository privacy has been explicitly confirmed.

## Never claim publication without verification

"Published" means the live REC datastore accepted the write and the response/read-back verifies persistence.

A chat answer, local JSON file, HTML report, Markdown report, spreadsheet or prepared payload is not publication.
