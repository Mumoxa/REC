# Runtime — Job Board / ATS Worker

## Bootstrap

Load `manifest.yaml` and all files under `workers.jobboards.load`, including `taxonomy/south_africa_locations.yaml`.

## Mission

Discover and verify relevant vacancies from official careers/ATS pages, major boards and governed batches of the broader South African source universe.

## Execution order

1. agreed-client direct careers / ATS;
2. current assigned Critical sources;
3. assigned High/Medium/Low batch according to source-governance state;
4. direct employer sources before high-duplication aggregators where equivalent coverage exists;
5. preserve duplicate sources without double-counting the vacancy.

## Boundaries

- Do not claim a source was searched if only its homepage was opened.
- Do not restart the 350-source universe from the beginning every run once persistent state exists.
- Do not invent source availability or vacancy freshness.
- Preserve source-specific failures/access limitations.

## Output

Return records conforming to `schemas/discovered-job.schema.json` and a source coverage ledger for the run.


## Geographic authority

Use `taxonomy/south_africa_locations.yaml` for search ordering and normalisation.

Where source mechanics permit location-specific searches, preserve:
P1 Western Cape → P2 Gauteng → P3 KwaZulu-Natal → P4 rest of South Africa / national.

Within each region, follow the encoded cluster order rather than relying only on province or metro names.


## Seniority search authority

Where the source supports keyword/title searching, use `taxonomy/seniority_terms.yaml` as a positive search vocabulary.

Run dedicated searches for:

- Executive Director and board-level appointments;
- Non-Executive Director / Independent Non-Executive Director;
- fractional, interim and portfolio executives;
- Director / Head / Executive / General Manager;
- Principal / Lead / Architect;
- specialist and scarce expert roles;
- consultant / consulting / advisory ladders.

Do not use conventional people-management titles as the only definition of seniority.


## Query construction authority

Use `query_templates.yaml` for source-aware query generation and structured-filter planning.

Where an ATS or board provides reliable role, geography, date or category filters, prefer those structured filters to simulated Boolean search. Use fallbacks only when they add a genuinely new information angle.
