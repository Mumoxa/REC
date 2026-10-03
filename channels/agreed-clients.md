# Channel 1 — Agreed Clients

## Architectural role

This is one of exactly four sourcing channels.

It has **default priority 1** in a combined run and is independently runnable.

## Mission

Search the complete current agreed-client universe across direct and indirect hiring channels. In a combined/full run this channel has default priority 1; when selected alone it runs directly and does not require any other channel.

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

Past clients are not automatically current agreed clients.

## Completion gate

Within an agreed-client channel run, every current agreed client must have explicit coverage across all applicable client hiring surfaces before that channel run is considered complete.


## Shared stack

This channel uses `core/search-structure.md` and the same role taxonomy, seniority ontology, geography, query templates, qualification rules, evidence standard, scoring rubric and output logic as all other channels.
