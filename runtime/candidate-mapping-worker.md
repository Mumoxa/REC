# Runtime — Candidate Market Mapping Worker

## Architectural status

This worker is shared downstream infrastructure.

It is not a sourcing channel.

It may process a verified opportunity produced by **any one** of the four channels without requiring any other channel to have run.

## Bootstrap

Load:

- `manifest.yaml`
- `ARCHITECTURE_GUARD.md`
- `core/evidence-standard.md`
- `core/independent-qa.md`
- `core/candidate-market-mapping.md`
- `candidate_query_templates.yaml`
- `taxonomy/role_taxonomy.json`
- `taxonomy/role_taxonomy_rules.yaml`
- `taxonomy/seniority_terms.yaml`
- `taxonomy/south_africa_locations.yaml`
- `schemas/final-opportunity.schema.json`
- `schemas/role-environment-fingerprint.schema.json`
- `schemas/candidate-market-map.schema.json`
- `schemas/qa-review.schema.json`

## Input gate

Accept an opportunity only when:

- role resolution is `CONFIRMED` or `HIGH_CONFIDENCE`;
- employer resolution is `CONFIRMED` or `HIGH_CONFIDENCE`;
- vacancy/current opportunity evidence is adequate;
- qualification/commercial gates have passed or a documented agreed-client exception applies;
- QA Gate A has passed.

If not, route back to evidence resolution.

## Pipeline

1. build role/client environment fingerprint;
2. run QA Gate B;
3. map Tier A/B/C/D target companies with evidence;
4. run QA Gate C;
5. generate source-specific candidate searches;
6. execute searches across LinkedIn, Google and relevant public professional/social sources as access permits;
7. persist query/search coverage and yield;
8. build evidence-backed candidate longlist;
9. target at least 50 credible candidates without padding;
10. verify candidate identity and material claims;
11. run QA Gate D;
12. form strongest market set (normally ~20–25 where supported);
13. select Top 10 high-conviction profiles;
14. generate evidence-grounded Why This Person / Why This Client narratives;
15. return unresolved unknowns and approach-stage questions.

## Search behaviour

Search the target-company universe systematically.

Prefer:

- company-first/person-second searches;
- many small overlapping searches;
- title variants;
- qualification/designation variants;
- system-specific searches;
- environment/complexity searches;
- career-trajectory searches;
- value-chain searches;
- stronger-proving-ground searches;
- location variants.

Do not rely on one giant Boolean query.

## Passive talent

Open-to-work status is irrelevant to inclusion.

Surface proven people regardless of visible job-seeking behaviour.

## Research-depth target

`credible_longlist_target = 50`

This is not a minimum output quota.

If fewer than 50 credible candidates are found after meaningful coverage, return the smaller number and explain:

- search families run;
- target companies covered;
- access limitations;
- market scarcity;
- unresolved search gaps.

## Candidate claim discipline

Do not infer candidate experience from employer characteristics.

Unknown salary, notice, availability and motivation remain `UNKNOWN` until established.

## Stable record identity

Use the upstream `final-opportunity.canonical_job_id` as the exact `opportunity_id` in the candidate market map and role/environment fingerprint. Assign each person a stable opaque `candidate_id`; preserve it across refreshes, never derive it from personal data, and never deduplicate on name alone. Candidate workflow actions are keyed to the vacancy-candidate pair.

## Completion

Output must conform to `schemas/candidate-market-map.schema.json`.

Candidate mapping for an opportunity is complete only when it includes:

- fingerprint + evidence;
- QA Gate B;
- target-company map;
- QA Gate C;
- generated/executed search log;
- credible longlist with coverage/yield recorded;
- candidate identity and material-claim verification;
- QA Gate D;
- strongest market set;
- a client-submittable research Top 10 set;
- evidence-grounded Why This Person / Why This Client narratives;
- unknowns;
- coverage/limitations.

At least one candidate must be genuinely client-submittable for the opportunity to satisfy the REC run-completion gate. A client-submittable candidate is a research `TOP_10` candidate with candidate QA `PASS` or `PASS_WITH_UNKNOWNS` and a non-empty evidence-grounded fit rationale.

The Top 10 may contain fewer than 10 people where the evidence-backed market is smaller. The credible-longlist target remains 50 where the market supports it; never pad either set.

If zero candidates satisfy the client-submittable definition after meaningful search coverage, return the evidence-backed market result and documented scarcity/access gaps, but leave the parent REC run `RUNNING` or `PARTIAL`; do not mark it `COMPLETE`.
