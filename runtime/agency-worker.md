# Runtime — Agency Discovery Worker

## Channel

**AGENCY_SITES — default priority 2**

This channel is independently runnable. No agreed-client channel run is required beforehand.

## Bootstrap

Load `manifest.yaml` and all files under `workers.agencies.load`, including `taxonomy/south_africa_locations.yaml`.

## Mission

Methodically discover commercially relevant vacancies from recruitment agencies, with mandatory exhaustive attention to PRN Staffing, Communicate Recruitment and Network Recruitment.

## Execution order

1. review the complete relevant current vacancy inventory of PRN Recruitment;
2. review the complete relevant current vacancy inventory of Communicate Recruitment;
3. review the complete relevant current vacancy inventory of Network Recruitment;
4. preserve reference numbers, consultants, dates, salary and full identifying clues;
5. attempt to establish the actual end employer;
6. scale attribution effort by seniority, scarcity and commercial importance;
7. if the end employer is an agreed client or agreed group entity, promote the vacancy immediately to the agreed-client priority workflow;
8. return clean discovery records and source-completeness evidence.

## Boundaries

- Agency != employer unless directly evidenced.
- Hidden employer is not a reason to discard a senior/high-value role.
- Scale attribution effort with commercial priority.
- Keep hypotheses explicitly labelled.

## Output

Return records conforming to `schemas/discovered-job.schema.json` plus a source-completeness summary for each mandatory agency.


## Geographic authority

Use `taxonomy/south_africa_locations.yaml` for geographic normalisation and, where geography determines search effort, preserve its P1 Western Cape → P2 Gauteng → P3 KwaZulu-Natal → P4 rest-of-South-Africa order.

Do not flatten commercial/industrial nodes into province or metro names when the source exposes the more specific location.


## Seniority search authority

Use `taxonomy/seniority_terms.yaml` to generate positive vacancy-search lanes and classify seniority.

Mandatory coverage includes:

- Executive Director;
- board, Non-Executive Director and Independent Non-Executive Director roles;
- fractional / interim / portfolio executives;
- Director, Head and senior-management titles;
- Principal / Lead / Architect roles;
- Specialist / Senior Specialist / Principal Specialist;
- Consultant / Senior Consultant / Principal Consultant / Managing Consultant;
- Partner, Practice Lead, Advisory and consulting leadership titles.

Do not require people-management for a role to be high seniority.


## Query construction authority

Use `query_templates.yaml` for query generation, fallbacks, source syntax, search budgets, deduplication, retry rules and query-performance logging.

Prefer the agency's native structured filters when available. External search/X-ray is a supplement, not a substitute for reviewing live agency inventory.


## Client-status feedback loop

Every returned vacancy must carry `client_status` and `search_channel`.

For normal agency discoveries set:

`search_channel = AGENCY_SITES`

If employer attribution establishes `AGREED_CLIENT` or `AGREED_GROUP_ENTITY`, preserve the discovery provenance but set `promote_to_agreed_client_priority = true` and route the opportunity into the agreed-client commercial-priority workflow.
