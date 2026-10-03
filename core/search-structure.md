# Shared Search Structure — All Four Channels

## Architectural rule

All four sourcing channels use the **same intelligence framework**.

The channels differ only in **where they search and which source-specific tactics they use**.

They do not have separate role taxonomies, seniority systems, geography rules, qualification logic, evidence standards, query philosophy, scoring logic or output logic.

## Four independently runnable channels

1. `AGREED_CLIENTS`
2. `AGENCY_SITES`
3. `LINKEDIN`
4. `JOB_BOARDS`

Each channel can be launched independently.

No channel requires another channel to have run first.

When a combined/multi-channel run is requested, the default priority order remains:

**AGREED_CLIENTS → AGENCY_SITES → LINKEDIN → JOB_BOARDS**

That is a scheduling/default-priority rule, not a prerequisite gate.

## Shared authority stack

Every channel must load and honour:

### Core
- `core/ideal-client-profile.md`
- `core/disqualifiers.md`
- `core/scoring-rubric.md`
- `core/output-template.md`
- `core/qualification.md`
- `core/evidence-standard.md`
- `core/deduplication.md`
- `core/employer-attribution.md`

### Search construction
- `query_templates.yaml`

### Role authority
- `taxonomy/Talent_Tree_Master_Recruitment_Role_Taxonomy.md`
- `taxonomy/role_taxonomy.json`
- `taxonomy/role_taxonomy_rules.yaml`

### Seniority authority
- `taxonomy/seniority_terms.yaml`

### Geography authority
- `taxonomy/south_africa_locations.yaml`

### Client/source authority
- `sources/agreed-clients.yaml`
- `sources/search-priority.yaml`
- `sources/source-governance.md`

## Shared search lifecycle

Every channel follows the same logical search structure:

1. **Define research objective**
2. **Load current known intelligence**
3. **Select the channel's source surface**
4. **Generate bounded queries using `query_templates.yaml`**
5. **Expand role terms from the authoritative role taxonomy**
6. **Expand seniority terms from the authoritative seniority ontology**
7. **Expand geography from the authoritative South Africa location ontology**
8. **Execute exact/high-precision searches first**
9. **Move through close variants and controlled broader fallbacks**
10. **Capture source evidence and provenance**
11. **Normalise role, seniority, employer and geography**
12. **Assign client status**
13. **Deduplicate without losing source lineage**
14. **Apply the same qualification/disqualifier rules**
15. **Apply the same scoring/prioritisation rubric**
16. **Escalate employer/stakeholder research proportionately**
17. **Return the canonical output structure**
18. **Log coverage, failures, access limits and unresolved evidence gaps**

## Shared role-taxonomy rule

All four channels search against the same 271-node role taxonomy.

No channel may create its own abbreviated role universe.

Where an exact title is not known, use taxonomy role families, close aliases and adjacent titles according to `query_templates.yaml`.

LinkedIn may additionally discover role-agnostic hiring signals. This does not exempt LinkedIn from the shared taxonomy: when a role/title can be identified, classify and expand it against the same taxonomy. An incomplete social signal may remain unclassified rather than being discarded.

## Shared seniority rule

All four channels use the same seniority ontology.

Mandatory search coverage includes, where relevant:

- board and Executive Director;
- C-suite / executive;
- Director / Head / General Manager;
- Senior Manager;
- Principal / Lead / Architect;
- Specialist / Senior Specialist / Principal Specialist;
- Consultant / Senior Consultant / Principal Consultant / Managing Consultant;
- Partner / Practice Lead / advisory leadership;
- fractional / interim / portfolio leadership;
- experienced senior professionals.

Do not equate people-management with seniority.

## Shared geography rule

All four channels use the same South African geography ontology and preference:

**Western Cape → Gauteng → KwaZulu-Natal → broader South Africa**

Granular commercial/industrial nodes remain searchable and must not be flattened into metro-only searches.

## Shared qualification rule

All channels apply the same downstream qualification rules.

A channel may retrieve broad evidence first when recall would otherwise be damaged, but it may not invent a different commercial definition of a qualifying role.

Agreed-client exceptions are determined by `client_status`, not by inventing a separate agreed-client role taxonomy.

## Shared evidence rule

All channels preserve:

- Confirmed
- Probable
- Hypothesis
- Unknown

No channel may lower evidence thresholds because a role is high-value or because the employer is commercially attractive.

## Shared query rule

All channels use the same query engine.

Channel-specific syntax belongs in source profiles and channel tactics, not in separate query philosophies.

## Shared output rule

Every channel's actionable opportunities must be normalisable into the canonical opportunity format.

Channel-specific evidence may be retained in additional fields, for example LinkedIn repost/social-graph evidence, but the shared commercial fields must remain consistent.

## Permitted channel-specific differences

Only the following may differ by channel:

- source universe;
- native filters/search interfaces;
- source-specific syntax;
- evidence surfaces;
- traversal tactics;
- access limitations;
- channel-specific provenance fields.

Everything else is shared.

## Drift prohibition

Do not create:

- a LinkedIn-only role taxonomy;
- an agency-only seniority hierarchy;
- a job-board-only geography order;
- an agreed-client-only query philosophy;
- separate channel-specific commercial qualification rules.

If a shared rule changes, change the shared authority once and let all four channels inherit it.
