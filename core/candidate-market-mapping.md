# Candidate Market Mapping — Shared Downstream Authority

## Architectural status

This is shared downstream recruitment intelligence.

It is **not** a sourcing channel and must never be represented as Channel 5.

Any one of the four independently runnable sourcing channels may hand a verified opportunity directly into this process:

- `AGREED_CLIENTS`
- `AGENCY_SITES`
- `LINKEDIN`
- `JOB_BOARDS`

No channel depends on another channel having run first.

## Purpose

For every sufficiently verified, qualified vacancy, build an evidence-backed map of the actual talent market and identify the strongest people whose demonstrated background most closely mirrors the client's requirement and operating environment.

The objective is not to collect people who merely share the job title.

The objective is to demonstrate that Talent Tree understands:

- the client's company;
- industry and sub-industry;
- products/services;
- customers and suppliers;
- value chain;
- operating model;
- scale;
- geography;
- systems;
- functional complexity;
- reporting environment;
- team structure;
- regulatory/governance context;
- problems the incoming hire must solve;
- and the calibre of comparable or stronger environments in which suitable people are proven.

The final Top 10 should make the client understand why each person was surfaced.

## Activation gate

Candidate market mapping begins only when:

1. the vacancy is current enough to act on;
2. the exact role is `CONFIRMED` or `HIGH_CONFIDENCE`;
3. the direct employer is `CONFIRMED` or `HIGH_CONFIDENCE`;
4. the material client requirements are evidence-backed or explicitly marked unresolved;
5. the opportunity survives qualification, unless a documented agreed-client exception applies;
6. QA Gate A has passed.

Never invent missing role requirements to unlock candidate research.

## Stage 1 — Build the Client + Role Environment Fingerprint

Create a structured role/environment fingerprint before searching for people.

Capture, with evidence status and provenance for each material field:

- exact role title and title variants;
- functional mandate;
- reporting line;
- direct reports / team responsibility;
- required and preferred qualifications/designations;
- years/level of experience where genuinely specified;
- mandatory systems / ERP / tools;
- industry and sub-industry;
- product/service environment;
- customer type and market;
- supplier/value-chain context;
- revenue/turnover/asset/book/transaction scale where relevant;
- number of entities, branches, sites, countries or divisions;
- listed/private/PE/family ownership context;
- reporting, IFRS/regulatory/governance complexity;
- manufacturing/retail/distribution/service/technology operating model;
- inventory, costing, working-capital, debtor/creditor or other role-specific complexity;
- geography and commute/relocation constraints where evidenced;
- company maturity/growth stage;
- critical problems the person must solve;
- explicit client requirements;
- operating-environment implications that are valid inferences rather than confirmed facts.

### Evidence rule

Every fingerprint field must be one of:

- `CONFIRMED`
- `PROBABLE`
- `HYPOTHESIS`
- `UNKNOWN`

An inference must never be silently rewritten as a requirement.

## Stage 2 — Independent QA Gate B: Fingerprint Challenge

Before using the fingerprint to search for people, independently challenge it.

For every material field ask:

- What source supports this?
- Does the source say this about the role, or only about the company?
- Is this current?
- Is this explicit, inferred or unknown?
- Has a job-ad requirement been confused with a general company characteristic?
- Has an attractive assumption been added because it would make sourcing easier?
- What evidence would disprove this interpretation?

Unsupported requirements must be removed or downgraded before candidate search generation.

## Stage 3 — Build the Target-Company Universe

Search companies before people.

Each target company must carry a documented evidence-backed reason for inclusion.

### Tier A — Direct market equivalents

Prioritise:

- direct competitors;
- closest operating equivalents;
- businesses selling similar products/services;
- companies serving the same customer market;
- businesses with comparable systems and functional complexity;
- equal or greater scale environments.

### Tier B — Same value chain

Search:

- suppliers;
- customers;
- distributors;
- manufacturers/processors;
- logistics providers;
- related businesses in the same commercial ecosystem.

### Tier C — Same operating complexity

Where direct-industry supply is too small, expand to companies with comparable:

- multi-site structures;
- transaction volume;
- debtor/creditor books;
- manufacturing or distribution complexity;
- listed-company reporting;
- multi-entity consolidation;
- inventory/costing;
- branch networks;
- regulated environments;
- large operational workforces.

### Tier D — Stronger proving grounds

Include environments that are demonstrably larger or more sophisticated where experience is transferable, for example:

- greater scale;
- more entities/sites/countries;
- larger teams;
- tighter listed/governance requirements;
- more complex systems;
- higher transaction volumes;
- more sophisticated operations.

### Target-company evidence

For every target company preserve:

- company;
- target tier;
- reason for inclusion;
- supporting source(s);
- evidence status;
- relevant overlap dimensions;
- contradictions/limitations.

Never create a plausible-sounding competitor or comparator list without evidence.

## Stage 4 — Generate Candidate Search Plan

Searches must be derived from the verified fingerprint and target-company map.

The system must generate actual executable searches for:

- LinkedIn native People search;
- LinkedIn posts/activity where useful;
- Google X-ray search;
- general Google/web search;
- relevant public professional/social sources;
- company team/leadership pages;
- professional-body/public directories where legitimate and searchable;
- conference/speaker biographies;
- appointment/promotion announcements;
- industry publications;
- publicly indexed professional profiles/CVs where lawful and appropriate.

The candidate search plan is governed by `candidate_query_templates.yaml`.

### Required search families

Generate multiple overlapping search families rather than one giant Boolean string:

1. direct-title searches;
2. target-company searches;
3. qualification/designation-first searches;
4. environment/complexity searches;
5. system/ERP/tool searches;
6. previous-title/career-trajectory searches;
7. value-chain searches;
8. stronger-proving-ground searches;
9. geography/location searches;
10. candidate-verification and contradiction searches.

Every generated query must record:

- query text;
- source/surface;
- search family;
- why it was generated;
- execution status: `EXECUTED`, `ACCESS_LIMITED`, `NOT_APPLICABLE` or `NOT_EXECUTED`;
- which evidence gap or coverage target it addresses;
- target company/role where applicable;
- date executed;
- result yield;
- useful candidates surfaced;
- failure/noise notes.

## Stage 5 — Run the Searches

Generating search strings is not sufficient.

The workflow must execute the search plan as far as the available tools/access permit and retain source provenance for surfaced people.

Search company-by-company and role-family-by-role-family.

Do not stop after finding 10 attractive profiles.

Continue until the relevant market has been meaningfully searched or a documented stop condition is reached.

## Passive-talent doctrine

Assume the strongest people may show no indication that they are looking for a job.

Do not make any of the following prerequisites for inclusion:

- Open to Work;
- current applications;
- job-board CV presence;
- visible job-seeking posts;
- recent vacancy engagement.

Prioritise demonstrated competence and environment fit over job-seeking signals.

## Stage 6 — Candidate Longlist

### Research-depth target

Aim for **at least 50 credible, genuinely relevant, evidence-supported candidates per qualified vacancy** before narrowing.

This is a research-depth target, **not a quota**.

Never:

- invent a person;
- include a weak candidate merely to reach 50;
- lower evidence thresholds;
- duplicate the same person;
- turn a hypothesis into a fact;
- claim a qualification/system/team/scale that has not been evidenced.

If exhaustive searching produces only 37 credible people, report 37 and document the search coverage and market constraint.

### Typical funnel

The following is a guide, not a forced quota:

- broad raw discovery: potentially 100–200+ profiles;
- credible evidence-backed longlist: target 50+;
- strongest market set: approximately 20–25 where the evidence supports it;
- final client-facing high-conviction set: Top 10.

Scarce markets may legitimately produce smaller numbers.

## Candidate evidence record

For every candidate capture:

- full name;
- current/recent role;
- current/recent employer;
- source profile(s);
- current-employment status and last verification date;
- geography;
- qualifications/designations;
- industry/sub-industry;
- functional similarity;
- systems/ERP/tools **only where individually evidenced**;
- team leadership **only where individually evidenced**;
- scale exposure **only where individually evidenced or clearly labelled inference**;
- multi-site/multi-entity/country exposure where evidenced;
- customer/product/value-chain familiarity;
- comparable-environment tier;
- career progression;
- performance/award evidence where credible and relevant;
- reason surfaced;
- requirement coverage;
- evidence gaps;
- contradictions;
- availability: `UNKNOWN` until established;
- compensation: `UNKNOWN` until reliably established;
- notice period: `UNKNOWN` until reliably established;
- motivation/willingness to move: `UNKNOWN` until established.

## Critical non-inference rules

A company fact is not automatically a candidate fact.

Examples:

- Employer uses SAP ≠ candidate has SAP experience.
- Employer turns over R5bn ≠ candidate personally controlled R5bn.
- Employer operates in 12 countries ≠ candidate managed 12 countries.
- Employer has 300 staff ≠ candidate led 300 staff.
- Company sells to major retailers ≠ candidate personally managed those accounts.
- Job title says Finance Manager ≠ all advertised Finance Manager responsibilities were personally performed.

Where only company-level evidence exists, record the candidate-level claim as `HYPOTHESIS` or `UNKNOWN`, not `CONFIRMED`.

## Stage 7 — Independent QA Gate D: Candidate Challenge

The review pass must attempt to disprove, not preserve, the first-pass result.

Check every high-value candidate for:

- identity / namesake errors;
- stale current employer/title;
- qualification evidence;
- title accuracy;
- functional responsibility;
- system claims;
- scale claims;
- team claims;
- geographic viability;
- industry/value-chain relevance;
- dates and career chronology;
- company-level facts incorrectly attributed to the individual;
- duplicate profiles;
- contradictory evidence;
- missing requirements;
- whether a closer direct-market candidate was missed.

A candidate with unresolved material claims may remain in the market map but those claims must remain unresolved.

## Stage 8 — Narrow to the Strongest Market Set

After QA, identify the strongest evidence-backed market set, normally around 20–25 where the market supports it.

This is not a mechanical score competition.

Prioritise closeness across the combination of:

- same or closest company type;
- same industry/sub-industry;
- same customer market/value chain;
- same function;
- required qualification;
- required system where evidenced;
- same or greater scale;
- same operational complexity;
- correct career stage;
- geography;
- evidence of progression/high performance.

## Stage 9 — Top 10 Client-Facing Profiles

Select the 10 highest-conviction people from the evidence-backed market set.

For each produce a concise **Why This Person / Why This Client** narrative grounded only in verified evidence and clearly labelled inference.

The narrative should explain:

- what comparable environment they come from;
- which client requirements are directly evidenced;
- why their industry/value-chain/operational familiarity is relevant;
- what scale/complexity they have already handled;
- what transferable operating know-how they may bring;
- what remains unknown and requires approach/qualification.

## Intellectual-property boundary

Do not claim that a candidate will bring a competitor's confidential information, trade secrets, proprietary data or intellectual property.

The legitimate value proposition is:

- transferable industry knowledge;
- operating know-how;
- pattern recognition;
- market familiarity;
- experience of proven practices;
- ability to recognise problems already encountered in comparable or stronger environments.

## Completion standard

Candidate mapping is complete only when the output includes:

- verified role/client fingerprint;
- independent fingerprint QA;
- evidence-backed target-company universe;
- executed candidate-search log;
- search coverage summary;
- credible longlist;
- candidate evidence records;
- independent candidate QA;
- strongest market set;
- Top 10 client-facing profiles;
- explicit unknowns and unresolved gaps;
- source provenance.

Do not claim market exhaustion when access limitations or unrun search families remain material.
