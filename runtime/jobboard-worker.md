# Runtime — Job Board / ATS Worker

## Bootstrap

Load `manifest.yaml`, all global files, and all files under `workers.jobboards.load`.

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
