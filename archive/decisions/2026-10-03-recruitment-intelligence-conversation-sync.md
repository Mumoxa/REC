# Decision Record — 2026-10-03 Recruitment Intelligence Conversation Sync

Status: AUTHORITATIVE USER DECISIONS  
Repository: `Mumoxa/REC`

## Purpose

Preserve the architecture decisions agreed in the recruitment-intelligence conversation so they are not dependent on chat memory.

## Decisions

### 1. Four sourcing channels only

The system has exactly four sourcing channels:

1. `AGREED_CLIENTS`
2. `AGENCY_SITES` — PRN Recruitment, Communicate Recruitment, Network Recruitment
3. `LINKEDIN`
4. `JOB_BOARDS` / ATS / broader approved source universe

The channels are independent workflows.

Any one channel may run alone and then feed the shared downstream process.

A combined/full run uses the default priority order above, but the order is not a dependency chain.

### 2. Agreed clients retain commercial priority

For combined/full discovery, agreed clients are searched first.

A vacancy discovered through another channel that resolves to a current agreed client receives agreed-client commercial priority while retaining original source provenance.

Past clients are not treated as current agreed clients without current evidence.

### 3. Agency channel

PRN Recruitment, Communicate Recruitment and Network Recruitment are mandatory strategic agency sources.

Anonymous agency adverts should be investigated to identify the end employer where proportionate to role value/seniority.

Senior/executive/scarce roles justify deeper multi-angle employer attribution.

### 4. LinkedIn channel

LinkedIn is a hidden/distributed hiring-signal engine, not just LinkedIn Jobs.

Use posts, reposts, hiring-manager activity, employee amplification, referrals, company activity, comments, media and external X-ray as defined by the LinkedIn master.

### 5. Shared downstream candidate market mapping

Once a vacancy/opportunity is sufficiently verified, the system must reconstruct the client and role environment before searching people.

Candidate mapping is not Channel 5.

It is shared downstream infrastructure available to outputs from any channel.

### 6. Client + role environment fingerprint

Capture evidence-backed requirements and operating context including role mandate, qualifications, systems, scale, industry, customer/value-chain context, team, reporting complexity, multi-site/entity exposure, geography and problems to solve.

Do not invent missing requirements.

### 7. Target-company mapping

Search companies before people.

Use:

- Tier A direct equivalents/competitors;
- Tier B same value chain;
- Tier C comparable operating complexity;
- Tier D stronger proving grounds.

Every target company needs an evidence-backed reason for inclusion.

### 8. Candidate-search generation and execution

Based on the verified fingerprint and target-company map, generate and run searches across:

- LinkedIn;
- Google/X-ray;
- relevant public professional/social sources;
- company/team pages;
- professional directories where legitimate;
- conference/speaker biographies;
- industry media;
- appointment/promotion announcements;
- other relevant public professional sources.

Search families include direct title, target company, qualification, environment, systems, career trajectory, value chain, stronger proving ground, geography and person verification/contradiction.

Generating strings alone is insufficient; searches should be executed as access permits.

### 9. Passive talent is central

Do not require Open to Work, active applications or job-board presence.

The strongest candidate may be fully passive.

Prioritise demonstrated competence and environment match.

### 10. Research-depth target: 50 credible candidates

Aim for at least 50 credible, genuinely relevant, evidence-supported candidates per qualified vacancy before narrowing.

This is a research-depth target, not a quota.

If meaningful exhaustive searching surfaces fewer credible candidates, return the smaller number with coverage/limitations.

Never pad, duplicate, lower evidence thresholds or invent people to reach 50.

### 11. Strongest market set and Top 10

After evidence verification and independent review:

- form the strongest market set, normally around 20–25 where supported;
- select the Top 10 highest-conviction people;
- provide a concise evidence-grounded Why This Person / Why This Client narrative for each.

The purpose is to demonstrate that Talent Tree understands the client's market, environment and value proposition.

### 12. Knowledge transfer

Where supported by evidence, candidate relevance may include experience from comparable or stronger environments that enables transferable operating know-how, pattern recognition, proven practices and staff capability uplift/training.

Do not claim a candidate will transfer a competitor's confidential information, trade secrets or proprietary intellectual property.

### 13. Independent review gates

Independent/adversarial review is mandatory between major stages:

- Gate A — discovery/vacancy/client/employer;
- Gate B — role/client fingerprint;
- Gate C — target-company map;
- Gate D — candidate evidence.

The reviewer must challenge prior conclusions, search for contradictions where consequential, downgrade unsupported claims and preserve unknowns.

### 14. Anti-hallucination rule

No invented information.

No unsupported completion.

Every material claim must preserve source provenance and one of:

- `CONFIRMED`
- `PROBABLE`
- `HYPOTHESIS`
- `UNKNOWN`

Company facts do not automatically become candidate facts.

Unknown salary, notice period, availability, motivation, systems, team scope or personal scale remain unknown until evidence exists.

### 15. Product-drift guard

Do not introduce extra sourcing channels or channel-specific private taxonomies without explicit architecture approval.

Candidate mapping, QA, employer attribution, enrichment, stakeholder intelligence, query generation and schemas are shared support/downstream layers.

## Implementation files created/updated

See:

- `core/candidate-market-mapping.md`
- `core/independent-qa.md`
- `candidate_query_templates.yaml`
- `runtime/candidate-mapping-worker.md`
- `runtime/qa-review-worker.md`
- `schemas/role-environment-fingerprint.schema.json`
- `schemas/candidate-market-map.schema.json`
- `schemas/qa-review.schema.json`
- `tests/candidate-market-mapping-golden-cases.yaml`
- `manifest.yaml`
- `ARCHITECTURE_GUARD.md`
- `MASTER_INDEX.md`
