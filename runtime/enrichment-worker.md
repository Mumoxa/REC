# Runtime — Enrichment and Consolidation Worker

## Bootstrap

Load `manifest.yaml` and all files under `workers.enrichment.load`, including `taxonomy/south_africa_locations.yaml`.

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


## Geographic normalisation

Use `taxonomy/south_africa_locations.yaml` to retain raw location wording while mapping signals to region, cluster, province/city and commercial node.

Do not discard the specific node after mapping to a broader metro.


## Seniority classification

Use `taxonomy/seniority_terms.yaml` to classify seniority after discovery.

Treat board, Executive Director, fractional/interim leadership, consultant/consulting, specialist, Principal/Lead/Architect and scarce expert roles as explicit seniority tracks.

Do not downgrade a role merely because:

- it has no direct reports;
- it is fractional or part-time;
- it is consulting/advisory;
- it uses Specialist, Principal, Lead or Architect rather than Manager;
- it is a board/non-executive appointment.

Use scarcity, remuneration, technical depth, enterprise impact, advisory scope and decision authority alongside title.


## Query construction authority

Use `query_templates.yaml` for unresolved evidence gaps such as employer attribution, contradiction testing, stakeholder resolution, current-employment checks, domain/email-pattern work, salary evidence and freshness verification.

Query generation must be state-aware: do not spend searches reconfirming facts that are already sufficiently resolved. Expensive downstream searches stop when commercial gates fail unless an agreed-client exception applies.


## Client relationship persistence

`client_status` is a permanent field and must survive normalisation, deduplication, canonicalisation and enrichment.

Allowed values:

- `AGREED_CLIENT`
- `AGREED_GROUP_ENTITY`
- `PAST_CLIENT`
- `TARGET_PROSPECT`
- `UNKNOWN`

Never downgrade or erase a confirmed agreed-client status because a duplicate source came from a later stage.

If any source resolves an opportunity to an agreed client or agreed group entity, mark `promotion_to_stage_1 = true` and treat the opportunity as immediate commercial priority.

A `PAST_CLIENT` remains outside Stage 1 until current-agreement evidence is established.
