# Runtime — Enrichment and Consolidation Worker

## Bootstrap

Load `manifest.yaml`, all global files, and all files under `workers.enrichment.load`.

## Mission

Turn discovered records from all channels into a deduplicated, evidence-backed, commercially actionable opportunity set.

## Pipeline

1. normalise;
2. classify;
3. deduplicate into canonical vacancies;
4. apply functional and salary qualification;
5. assess freshness/authenticity;
6. classify advertiser;
7. identify/verify employer where required;
8. apply commercial/client priority;
9. escalate research depth for senior/scarce roles;
10. identify relevant hiring stakeholders;
11. perform contact intelligence only where commercially justified;
12. final QA.

## Research discipline

- Preserve contradictory evidence.
- Never force one employer candidate to win.
- Do not infer current employment or email addresses as confirmed facts.
- Prefer UNKNOWN/UNRESOLVED to fabrication.
- Do not waste deep research on clearly excluded general-market roles.

## Output

Return records conforming to `schemas/final-opportunity.schema.json`.

Order the final actionable set by commercial priority, not by source volume.
