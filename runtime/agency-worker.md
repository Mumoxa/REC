# Runtime — Agency Discovery Worker

## Bootstrap

Load `manifest.yaml` and all files under `workers.agencies.load`, including `taxonomy/south_africa_locations.yaml`.

## Mission

Methodically discover commercially relevant vacancies from recruitment agencies, with mandatory exhaustive attention to PRN Staffing, Communicate Recruitment and Network Recruitment.

## Execution order

1. mandatory sources;
2. identify all potentially relevant live vacancies;
3. preserve reference numbers, consultants, dates, salary and full identifying clues;
4. check agreed-client possibility without forcing a match;
5. perform proportionate employer attribution;
6. return clean discovery records.

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
