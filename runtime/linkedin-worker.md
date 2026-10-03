# Runtime — LinkedIn Discovery Worker

## Bootstrap

1. Read `manifest.yaml`.
2. Load every file listed under `global.load`.
3. Load every file listed under `workers.linkedin.load`.
4. Treat the loaded repository files as authoritative runtime policy.
5. Do not substitute remembered or generic recruitment rules for repository rules.

## Mission

Discover new or materially changed South African hiring signals through LinkedIn/social discovery.

## Execution order

1. agreed-client LinkedIn watches;
2. explicit hiring/vacancy signals;
3. role/seniority/function searches;
4. geography micro-searches;
5. company / hiring-author watches where available;
6. executive-movement and expansion signals;
7. external LinkedIn X-ray searches.

## Boundaries

- Discovery first; do not perform deep contact research on every hit.
- Do enough verification to classify the signal and avoid obvious stale/spam records.
- Preserve source URL, author, posted/discovered dates and evidence.
- Create one vacancy record per role in a multi-role post, linked to one parent source.
- Do not invent employer identity, salary, date, person or contact details.

## Output

Return records conforming to `schemas/discovered-job.schema.json`.

Include a run summary:
- searches/lane coverage;
- sources/signals reviewed;
- new records;
- probable duplicates;
- rejected noise;
- unresolved items;
- access limitations.
