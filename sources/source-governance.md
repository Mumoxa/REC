# Source Governance

## Controlling authority

The mandatory source sequence is defined in:

`sources/search-priority.yaml`

The source registry is **not a flat list** and the discovery channels are **not equal-weight**.

## Mandatory execution order

### Stage 1 — Current agreed clients

Search the complete current agreed-client universe before external-market discovery begins.

Authority:

`sources/agreed-clients.yaml`

For every current agreed client, cover all applicable direct and indirect hiring channels, including careers/ATS, parent/subsidiary portals, LinkedIn Jobs, company posts, HR/TA and hiring-manager posts, executive/functional-leader posts, employee reposts/referrals, attributable boards and attributable agency adverts.

An agreed-client vacancy receives immediate commercial priority.

Past clients do **not** receive Stage 1 status unless the current agreement is verified.

### Stage 2 — Strategic recruitment agencies

Only after Stage 1 completion, exhaustively review the relevant current vacancy inventory of:

1. PRN Recruitment;
2. Communicate Recruitment;
3. Network Recruitment.

Do not sample these sources.

The objective is not merely to collect agency adverts. Extract evidence and attempt to establish the actual hiring company.

Scale employer-attribution effort by seniority, scarcity and commercial importance.

If the employer resolves to an agreed client or confirmed agreed group entity, promote the vacancy immediately to the Stage 1 workflow.

### Stage 3 — LinkedIn distributed hiring intelligence

Only after Stages 1 and 2 are complete, execute the authoritative South African LinkedIn Hidden Hiring-Signal Engine.

LinkedIn remains role-agnostic during discovery.

Geographic order remains:

**Western Cape → Gauteng → KwaZulu-Natal → broader South Africa**

If a LinkedIn signal resolves to an agreed client, promote it immediately to the Stage 1 workflow.

### Stage 4 — Broader secondary sources

Only after Stage 3 completion, search the governed broader South African source universe.

The archived source-map specification records **350 reusable sources/channels**.

Internal order:

1. Critical;
2. High;
3. Medium;
4. Low;
5. long-tail.

High-volume public job boards must not crowd out Stages 1–3.

Within a level, prefer stronger/original employer or recruiter evidence over aggregators where equivalent coverage exists.

## Client status is permanent

Every vacancy/opportunity record must carry one of:

- `AGREED_CLIENT`
- `AGREED_GROUP_ENTITY`
- `PAST_CLIENT`
- `TARGET_PROSPECT`
- `UNKNOWN`

Client status must survive deduplication, enrichment and canonicalisation.

Do not infer agreed-group status from company ownership or name similarity alone.

## Search completeness

A source/channel counts as searched only when at least one is true:

- its live vacancy inventory was reviewed;
- relevant category/location filters were reviewed;
- a defensible source-specific query/search was executed;
- it was marked not applicable;
- it was verified inaccessible/unavailable and the limitation was recorded.

Opening a homepage does not count.

## Stage completion

A later stage may start only when the prior stage's completion gate in `sources/search-priority.yaml` is satisfied.

Access limitations may satisfy a coverage item only when explicitly recorded. Silent skipping is not permitted.

## Current source-universe summary

- Total reusable secondary channels recorded in the archived source map: 350
- Critical: 36
- High: 173
- Medium: 110
- Low: 31

The archived source map remains the detailed broader-market registry until its 350-source table is compiled into a machine-readable registry.
