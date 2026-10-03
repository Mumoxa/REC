# Runtime — Agency Discovery Worker

## Bootstrap

Load `manifest.yaml`, all global files, and all files under `workers.agencies.load`.

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
