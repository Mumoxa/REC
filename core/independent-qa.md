# Independent QA and Anti-Hallucination Standard

## Purpose

Independent review is a mandatory control layer throughout the Recruitment Intelligence engine.

Its purpose is to prevent:

- product drift;
- invented information;
- unsupported assumptions;
- stale facts;
- employer misattribution;
- candidate identity errors;
- company facts being converted into person facts;
- inference inflation;
- false completeness;
- attractive but weak conclusions surviving because the first researcher produced them.

## Architectural status

QA is shared support infrastructure.

It is **not** a sourcing channel.

All four independently runnable sourcing channels and all downstream candidate-intelligence stages must use the same QA doctrine.

## Core rule

**No downstream conclusion may be stronger than its underlying evidence.**

Unknown information remains unknown.

A missing field is not permission to infer a value.

## Independence requirement

A review pass must be intentionally adversarial.

The reviewer must be instructed to challenge the prior output, not rewrite it more confidently.

Where technically possible, the review should:

- re-open the primary sources;
- compare the claim against the source text;
- search for contradictory evidence;
- verify dates/currentness;
- avoid relying only on the first researcher's summary;
- explicitly state when evidence does not support the claim.

Copies or syndications of one original source are not independent corroboration.

## QA Gate A — Discovery / Vacancy / Client Review

Before a discovered opportunity proceeds downstream, independently verify:

- vacancy exists or existed recently enough to matter;
- vacancy is current/actionable where required;
- exact title;
- location;
- advertiser;
- direct employer;
- client relationship status;
- employing entity/business unit where material;
- seniority;
- duplicate/source lineage;
- core requirements;
- source date/currentness;
- agency attribution where relevant.

Challenge specifically:

- Is the employer actually identified or merely plausible?
- Is the client relationship current or historical?
- Has an agreed relationship been incorrectly extended to a parent/subsidiary/sister company?
- Is this one vacancy duplicated across many sites?
- Is a stale advert being treated as current?

## QA Gate B — Role / Client Fingerprint Review

Before candidate searches are generated, review every material fingerprint claim.

For each claim record:

- claim;
- evidence source;
- evidence excerpt/clue;
- status;
- reviewer decision;
- contradiction;
- corrected status/value if needed.

Remove or downgrade unsupported requirements.

## QA Gate C — Target-Company Map Review

Before target companies drive candidate search:

- verify the company exists and identity is correct;
- verify the claimed industry/value-chain/operating overlap;
- distinguish direct competitor from adjacent comparator;
- distinguish same industry from merely similar title populations;
- challenge scale/system/complexity assumptions;
- document why the company belongs in Tier A/B/C/D.

Do not allow a target company into the map only because it “sounds similar.”

## QA Gate D — Candidate Review

Before a candidate enters the strongest market set or Top 10, independently review:

- identity;
- current/recent employer;
- current/recent title;
- dates;
- qualification/designation;
- industry relevance;
- functional relevance;
- systems;
- team leadership;
- scale;
- geography;
- value-chain/customer/product exposure;
- progression/performance evidence;
- duplicate profile risk;
- contradictions;
- evidence gaps.

## Evidence statuses

Use exactly:

- `CONFIRMED` — directly supported by reliable evidence;
- `PROBABLE` — strong convergence but not directly established;
- `HYPOTHESIS` — plausible, untested or weakly supported;
- `UNKNOWN` — insufficient evidence.

Do not use confidence wording to hide missing evidence.

## Claim provenance

Every material claim should preserve, where available:

- source;
- URL;
- source type;
- publication/profile date;
- retrieval date;
- evidence excerpt or identifying clue;
- exact claim supported;
- whether the source is primary/secondary/supporting/lead-only.

## Source hierarchy

Prefer:

### Primary
- employer careers/ATS;
- employer/company website;
- candidate's own professional profile;
- professional/regulatory body;
- official filing/announcement.

### Strong secondary
- reputable business media;
- industry publication;
- conference biography;
- reputable recruiter advert.

### Supporting
- search-result snippets;
- social reposts;
- directories;
- archived adverts.

### Lead only
- aggregators;
- scraped profile mirrors;
- unverifiable reposts;
- inferred-contact databases.

Lead-only evidence may generate a search, but must not establish a material fact by itself.

## Required contradiction search

For consequential claims, ask:

> What evidence would make this conclusion wrong?

Examples:

- employer attribution;
- current employment;
- required qualification;
- candidate system experience;
- client agreement scope;
- direct-competitor classification.

Where reasonable, run at least one contradiction/disconfirmation search before promoting a major hypothesis to probable/confirmed.

## No-completion-by-fabrication rule

Targets such as “50 candidates” describe research depth.

They never authorise:

- fabricated people;
- padded lists;
- invented job requirements;
- inferred salaries presented as known;
- invented notice periods;
- invented availability;
- guessed systems presented as experience;
- guessed email addresses presented as observed/verified.

## QA output

Every QA pass must return:

- gate;
- record/run identifier;
- claims reviewed;
- claims upheld;
- claims downgraded;
- claims removed;
- contradictions;
- unresolved unknowns;
- sources checked;
- reviewer conclusion: `PASS`, `PASS_WITH_UNKNOWNS`, or `FAIL_RESEARCH_REQUIRED`;
- next required research actions.

## Product-drift check

At every architecture or workflow change, explicitly verify:

1. There are still exactly four sourcing channels.
2. Each channel remains independently runnable.
3. Shared downstream modules have not been turned into channels.
4. No channel has acquired a private role taxonomy, geography, seniority system or commercial definition.
5. New rules are stored at the correct shared authority.
6. Source-verified evidence remains mandatory.
