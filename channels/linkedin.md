# Channel 3 — LinkedIn

## Architectural role

This is one of exactly four sourcing channels.

It has **default priority 3** in a combined run and is independently runnable.

## Mission

Operate LinkedIn as a South African distributed hiring-intelligence network, not merely a jobs board.

Cover:

- recruiter/internal recruiter posts;
- hiring-manager and executive posts;
- employee reposts;
- referrals;
- team-growth posts;
- informal "we're hiring" signals;
- vacancy images/documents/carousels;
- comments/reposts/reactions;
- company-page hiring;
- ATS-linked posts;
- external LinkedIn X-ray indexing;
- author/company/amplifier expansion.

## Geography order

**Western Cape → Gauteng → KwaZulu-Natal → broader South Africa**

## Role handling

LinkedIn discovery is role-agnostic.

Role/salary/commercial qualification happens downstream.

## Authority

The controlling LinkedIn doctrine remains:

`channels/linkedin/South_Africa_LinkedIn_Hidden_Hiring_Signal_Engine_MASTER.md`

Detailed routing:

`channels/linkedin/strategy.md`

Runtime:

`runtime/linkedin-worker.md`


## Shared stack

This channel uses `core/search-structure.md` and the same 271-node role taxonomy, seniority ontology, geography, query templates, qualification rules, evidence standard, scoring rubric and output logic as all other channels. Role-agnostic social signals may remain unclassified until a role becomes identifiable; this does not create a separate LinkedIn taxonomy.
