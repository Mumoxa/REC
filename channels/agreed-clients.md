# Channel 1 — Agreed Clients

## Architectural role

This is one of exactly four sourcing channels.

It is **Stage 1** and always runs first.

## Mission

Search the complete current agreed-client universe across direct and indirect hiring channels before any external-market sourcing begins.

## Required coverage

For every current agreed client search all applicable:

- corporate careers / ATS;
- parent-company careers;
- subsidiary/divisional careers;
- LinkedIn Jobs;
- company LinkedIn posts;
- HR/TA posts;
- hiring-manager posts;
- executive / functional-leader posts;
- employee reposts;
- referral posts;
- informal hiring posts;
- recently removed/duplicated adverts;
- attributable external boards;
- attributable recruitment-agency adverts.

## Authority

- `sources/agreed-clients.yaml`
- `sources/search-priority.yaml`
- `runtime/agreed-client-worker.md`
- `schemas/client-sweep.schema.json`

## Commercial rule

A confirmed agreed-client or agreed-group vacancy enters the immediate-priority pipeline.

Past clients are not automatically Stage 1.

## Completion gate

Every current agreed client must have explicit channel coverage before Stage 2 begins.
