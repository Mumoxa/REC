# Runtime — LinkedIn Hidden Hiring-Signal Worker

## Channel

**LINKEDIN — default priority 3**

This channel is independently runnable. No agreed-client or agency run is required beforehand.

## Bootstrap

1. Read `manifest.yaml`.
2. Load every file in `shared_channel_stack`, including:
   - `query_templates.yaml`;
   - `taxonomy/role_taxonomy.json`;
   - `taxonomy/role_taxonomy_rules.yaml`;
   - `taxonomy/seniority_terms.yaml`;
   - `taxonomy/south_africa_locations.yaml`;
   - the shared core qualification/evidence/scoring/output rules.
3. Load the LinkedIn channel-specific files listed under `workers.linkedin.channel_specific_load`.
4. Load the full authoritative LinkedIn discovery specification:
   `channels/linkedin/South_Africa_LinkedIn_Hidden_Hiring_Signal_Engine_MASTER.md`.
5. The LinkedIn master controls LinkedIn-specific discovery surfaces and tactics. It does not create a separate role, seniority, geography or commercial taxonomy.

## Mission

Operate LinkedIn as a **South African social hiring radar**.

Surface valid South African opportunities distributed through:

- company posts;
- hiring managers;
- executives and department heads;
- internal recruiters / HR;
- employee posts and referrals;
- silent reposts;
- reposts with commentary;
- comments;
- reactions/feed surfaces;
- company mentions;
- author-company relationships;
- images, PDFs, documents and carousels;
- ATS links;
- external LinkedIn X-ray indexing;
- hiring clusters;
- company, author and amplifier expansion loops.

## Mandatory discovery doctrine

Follow the full master search order, geography priorities, phrase families, search surfaces, feed/activity logic, repost traversal, comment inspection, media inspection, expansion workflows, learning loops and social-trail preservation rules.

The master is intentionally role-agnostic.

### Do not apply in this worker

Do **not** exclude or suppress an opportunity because of:

- role family;
- seniority;
- salary;
- general commercial fit;
- JSE/employer exclusion;
- agreed-client status;
- outreach priority.

Those decisions happen downstream.

## Output

Return every valid South African opportunity/signal conforming to `schemas/linkedin-signal.schema.json`.

Preserve enough evidence for downstream qualification.

Include a run ledger covering, where execution access permits:

- geography/pass coverage;
- LinkedIn surfaces used;
- query families used;
- results reviewed;
- new signals;
- duplicates;
- new companies;
- new authors;
- new amplifiers;
- visual/media inspections;
- repost/comment/reaction expansions;
- access limitations.

If a LinkedIn surface cannot be accessed in the runtime, record the limitation explicitly rather than pretending it was searched.


## Seniority search expansion

Use `taxonomy/seniority_terms.yaml` to add positive search lanes for:

- executive director;
- board and non-executive director roles;
- fractional / interim / portfolio executives;
- consultants and consulting ladders;
- specialists and expert individual contributors;
- principal, lead and architect roles.

These searches supplement the hidden-hiring doctrine. They do not narrow discovery.


## Query construction authority

Use `query_templates.yaml` to construct bounded, source-aware search actions.

The LinkedIn hidden-hiring master still governs **what LinkedIn discovery must cover**. The query configuration governs **how individual searches are constructed, expanded, deduplicated, retried and measured**.

Do not let query templates apply commercial qualification or suppress otherwise valid LinkedIn hiring signals.


## Client-status feedback loop

Every opportunity extracted from a LinkedIn signal must carry `client_status` and `search_channel`.

For LinkedIn discoveries use:

`search_channel = LINKEDIN`

If the employer resolves to `AGREED_CLIENT` or `AGREED_GROUP_ENTITY`, give the opportunity immediate agreed-client commercial priority without changing the original LinkedIn source provenance.
