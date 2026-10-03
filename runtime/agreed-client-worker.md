# Runtime — Agreed-Client Priority Worker

## Channel

**AGREED_CLIENTS — default priority 1**

This channel is independently runnable. It does not require any other sourcing channel to run before or after it.

## Bootstrap

Load:

1. `manifest.yaml`;
2. `sources/search-priority.yaml`;
3. `sources/agreed-clients.yaml`;
4. `query_templates.yaml`;
5. `taxonomy/role_taxonomy.json`;
6. `taxonomy/role_taxonomy_rules.yaml`;
7. `taxonomy/seniority_terms.yaml`;
8. `taxonomy/south_africa_locations.yaml`;
9. evidence, deduplication and output schemas listed in the manifest.

## Mission

Search the **entire current agreed-client universe first**.

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

## Completion gate

the agreed-client channel is complete only when **every current agreed client** has a coverage-ledger entry for every applicable channel.

Allowed channel outcomes:

- `SEARCHED`
- `NO_RESULTS`
- `NOT_APPLICABLE`
- `ACCESS_LIMITED`

A channel may not be silently skipped.

The agreed-client channel run is complete when its own coverage gate is satisfied or explicit access limitations are recorded. This does not gate execution of the other channels.

## Output

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
