# Runtime — Source-Priority Orchestrator

## Authority

Load:

- `sources/search-priority.yaml`
- `sources/agreed-clients.yaml`
- `manifest.yaml`

The sourcing sequence is mandatory.

## Sequence

### Stage 1 — Current agreed clients

Run `runtime/agreed-client-worker.md`.

Do not release Stage 2 until every current agreed client has complete channel-ledger coverage or explicit recorded access limitations.

### Stage 2 — Strategic agencies

Run `runtime/agency-worker.md` against:

1. PRN Recruitment;
2. Communicate Recruitment;
3. Network Recruitment.

Do not release Stage 3 until all three have complete relevant current-inventory coverage.

If any agency vacancy resolves to an agreed client or agreed group entity, promote it immediately to the Stage 1 commercial workflow while preserving the agency source provenance.

### Stage 3 — LinkedIn distributed hiring intelligence

Run `runtime/linkedin-worker.md` using the authoritative LinkedIn master.

Preserve the LinkedIn geographic order:

**Western Cape → Gauteng → KwaZulu-Natal → broader South Africa**

If any LinkedIn opportunity resolves to an agreed client or agreed group entity, promote it immediately to the Stage 1 commercial workflow while preserving the LinkedIn source provenance.

### Stage 4 — Broader secondary sources

Run `runtime/jobboard-worker.md` against the governed wider source universe.

Internal order remains:

**Critical → High → Medium → Low → long-tail**

If any Stage 4 opportunity resolves to an agreed client or agreed group entity, promote it immediately to the Stage 1 commercial workflow.

## Enrichment

`runtime/enrichment-worker.md` may enrich records emitted by each completed stage.

Enrichment does not change the source-stage sequence.

## Non-negotiable controls

- Do not start broad-market discovery before Stage 1 completes.
- Do not start broader LinkedIn intelligence before Stage 2 completes.
- Do not start Stage 4 before Stage 3 completes.
- Do not let public job-board volume consume a budget reserved for earlier stages.
- Do not treat past-client history as a current agreement.
- Do not erase or downgrade confirmed client status during deduplication.
- Preserve original discovery stage even when an opportunity is commercially promoted back to Stage 1.
