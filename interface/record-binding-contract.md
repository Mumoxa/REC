# Workspace record-binding contract

## Purpose

The workspace must join opportunity research, candidate-market maps and recruiter workflow state without creating a second record identity. This contract resolves the field-name differences that exist across the current schemas.

## Canonical vacancy identity

`schemas/final-opportunity.schema.json` is authoritative for a resolved opportunity. Its `canonical_job_id` is the canonical vacancy key.

The same opaque identifier is used in these existing fields; do not mint new identifiers at each layer:

| Record | Field | Binding |
|---|---|---|
| Final opportunity | `canonical_job_id` | Canonical key |
| Candidate market map | `opportunity_id` | Exactly the same value as `canonical_job_id` |
| Workspace view state | `selected_vacancy_id` | Exactly the same value as `canonical_job_id` |
| Workspace operational state | `vacancies[].vacancy_id` | Exactly the same value as `canonical_job_id` |
| Workspace operational state | `candidate_assignments[].vacancy_id` | Exactly the same value as `canonical_job_id` |
| Role/environment fingerprint | `opportunity_id` | Exactly the same value as `canonical_job_id` |

A source appearance is not a canonical vacancy. `source_record_ids` continue to refer to individual source records such as `discovered-job.record_id`; those source records remain attached to the canonical vacancy rather than becoming separate queue items.

## Candidate identity

Every candidate in a candidate market map has a stable, opaque `candidate_id`. The ID is the key used by `selected_candidate_id` and `candidate_assignments[].candidate_id`.

- Keep the ID stable when evidence is refreshed or the market map is rebuilt.
- Do not derive IDs from a person's name, email, profile URL or other personal data.
- Do not merge two people based on a name match alone. Identity resolution and deduplication remain evidence-led.
- Candidate assignments are vacancy-specific. The same candidate may have a distinct operational status for each canonical vacancy.
- Candidate profile/evidence data and recruiter workflow data remain separate records.

## State ownership

- Research records own source provenance, evidence confidence, contradictions, unknowns and QA.
- View state owns filters, searches, sorting, density, pane/tab selection, scroll restoration and saved-view selection.
- Operational state owns lifecycle, close reason and vacancy-specific candidate actions.
- A UI action must never edit a research claim or promote an evidence status.
- Exports are snapshots, not identity authorities.

## Required implementation checks

Before a production adapter is approved, test that:

1. one canonical job with multiple source records creates one vacancy row;
2. the row, candidate map, fingerprint and operational state resolve to the same canonical key;
3. candidate actions resolve by stable `candidate_id`, not by displayed name;
4. closing and re-opening a vacancy preserves the canonical key and historical source links;
5. a failed or missing candidate-map lookup does not create an empty or duplicate candidate record.

This is a support/data-integration contract, not a new sourcing channel or evidence source.
