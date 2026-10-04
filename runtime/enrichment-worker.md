# Runtime — Enrichment and Consolidation Worker

## Bootstrap

Load `manifest.yaml` and all files under `workers.enrichment.load`, including `taxonomy/south_africa_locations.yaml`.

## Mission

Turn discovered records from all channels into a deduplicated, evidence-backed, commercially actionable opportunity set.

## Pipeline

1. normalise;
2. classify the exact role against the shared role taxonomy;
3. resolve role seniority using the shared seniority ontology;
4. deduplicate into canonical vacancies;
5. apply functional and salary qualification;
6. assess freshness/authenticity;
7. classify advertiser;
8. identify/verify the direct employer where required;
9. apply commercial/client priority;
10. evaluate the post-discovery activation gate;
11. if the gate passes, map functional hiring ownership and build the evidence-backed 2–10 person hiring-team universe where the market supports it;
12. identify relevant executive sponsor(s);
13. identify TA / HR / internal recruitment routes;
14. verify current employment for each stakeholder;
15. establish the employee email domain separately from the website domain;
16. collect observed public employee business emails;
17. derive the company email pattern;
18. find an observed business email for each stakeholder where available;
19. where no observed address exists and the pattern is sufficiently evidenced, generate a probable pattern-inferred business email;
20. consolidate stakeholder and company-email intelligence;
21. verify that upstream QA Gate A has passed; if no Gate A record exists, route to `runtime/qa-review-worker.md` before proceeding;
22. if QA Gate A is `PASS` or `PASS_WITH_UNKNOWNS` and role/employer activation gates are met, hand the opportunity to `runtime/candidate-mapping-worker.md`;
23. otherwise return unresolved research actions.

Candidate mapping is shared downstream work and is not a sourcing channel.

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

If any source resolves an opportunity to an agreed client or agreed group entity, mark `promote_to_agreed_client_priority = true` and treat the opportunity as immediate commercial priority.

A `PAST_CLIENT` remains outside Stage 1 until current-agreement evidence is established.


## Post-discovery activation gate

Load and follow `core/stakeholder-contact-intelligence.md`.

Deep stakeholder/contact enrichment begins only when:

```text
role_resolution = CONFIRMED or HIGH_CONFIDENCE
AND
employer_resolution = CONFIRMED or HIGH_CONFIDENCE
```

If either the exact role or direct employer remains `UNRESOLVED`, continue resolving that uncertainty instead of researching people and emails.

Do not pretend a merely plausible employer is confirmed in order to unlock contact research.

## Stakeholder mapping

Once the activation gate passes, identify people likely to care about receiving strong CVs for the specific role.

Search in this order:

1. direct/functional hiring owner;
2. relevant functional Head / Director / business-unit leader;
3. relevant executive sponsor;
4. TA / internal recruiter / HRBP route;
5. any vacancy-specific person directly evidenced in the source trail.

For senior roles, broaden the map to the relevant executive team while keeping role relevance explicit.

Do not collect arbitrary executives or generic HR employees without a vacancy-specific reason.

## Email intelligence

Research the organisation's email structure before suggesting person-specific addresses.

Keep separate:

- website domain;
- employee email domain;
- observed employee addresses;
- email pattern;
- pattern confidence/status;
- person-specific observed email;
- person-specific probable pattern-inferred email.

Prefer multiple public observed employee business addresses before deriving a pattern.

A generated address must be labelled `PATTERN_INFERRED` and described as **probable**, never verified.

Never generate a person-specific business email when the employee domain or pattern is too weak or conflicting.

## Consolidated stakeholder output

For each relevant stakeholder return:

- name;
- current title;
- relevance category;
- reason relevant to this vacancy;
- current-employment status;
- public profile/source;
- observed business email if available;
- suggested probable business email if pattern-derived;
- email status;
- pattern basis;
- evidence/uncertainty.

Also return one company-level email-intelligence object covering domain, observed examples, pattern and contradictions.

## Privacy / public-repository boundary

Use public business contact information only.

Do not seek private personal email addresses or private phone numbers.

Do not commit live person-specific names/email addresses or client-sensitive run outputs to this public GitHub repository. The repo should contain rules, schemas and tests; live enrichment results belong in a private operational store/output.


## Candidate-mapping handoff

A final opportunity may enter candidate market mapping only when the upstream QA Gate A record is `PASS` or `PASS_WITH_UNKNOWNS` and the role/employer activation gates are satisfied.

Pass forward:

- canonical opportunity ID;
- source channel provenance;
- client status/agreement scope;
- verified vacancy evidence;
- exact role resolution;
- employer resolution;
- material job requirements with evidence;
- contradictions and unknowns;
- stakeholder/contact intelligence as a required enrichment outcome: `READY` or `BLOCKED_WITH_EVIDENCE`, never silently omitted.

Do not convert unresolved information into facts merely to unlock the next worker.
