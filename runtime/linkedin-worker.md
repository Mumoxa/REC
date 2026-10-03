# Runtime — LinkedIn Hidden Hiring-Signal Worker

## Bootstrap

1. Read `manifest.yaml`.
2. Load the full authoritative specification:
   `channels/linkedin/South_Africa_LinkedIn_Hidden_Hiring_Signal_Engine_MASTER.md`
3. Load `taxonomy/south_africa_locations.yaml` and treat its P1 → P4 order and internal cluster order as authoritative.
4. Load `schemas/linkedin-signal.schema.json`.
5. Treat the master as the controlling instruction for LinkedIn discovery, except that the dedicated location ontology controls geographic terms and geographic execution order where it is more specific.
6. Do not replace its search doctrine with generic LinkedIn-job search behaviour.

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
