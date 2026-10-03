# Channel 4 — Job Boards / ATS / Broader Secondary Sources

## Architectural role

This is one of exactly four sourcing channels.

It has **default priority 4** in a combined run and is independently runnable.

## Mission

Search the governed broader South African vacancy universe, including:

- major job boards;
- non-client direct employer careers/ATS;
- specialist/niche boards;
- public-sector/university sources where commercially relevant;
- the broader governed source-map universe;
- validated long-tail sources.

## Internal order

**Critical → High → Medium → Low → long-tail**

## Safeguards

- high-volume public boards must not crowd out higher default-priority channels in a combined run;
- prefer original/direct source over aggregator when equivalent;
- preserve duplicate sources without double-counting the vacancy;
- if an employer resolves to an agreed client, promote immediately to agreed-client while retaining original source provenance.

## Detailed implementation

- `channels/jobboards/strategy.md`
- `runtime/jobboard-worker.md`
- `sources/source-governance.md`


## Shared stack

This channel uses `core/search-structure.md` and the same role taxonomy, seniority ontology, geography, query templates, qualification rules, evidence standard, scoring rubric and output logic as all other channels.
