# Scoring and Prioritisation Rubric

## Purpose

This file answers:

> **What should the engine work on first once opportunities have been discovered?**

This is a prioritisation rubric, not a source-discovery taxonomy.

## 1. Cross-channel default priority

The four channels are independently runnable.

When multiple channels are run together, the default priority order is:

1. `AGREED_CLIENTS`
2. `AGENCY_SITES`
3. `LINKEDIN`
4. `JOB_BOARDS`

Authority: `sources/search-priority.yaml`.

This ordering affects combined-run scheduling and budget allocation. It is not a prerequisite gate between independent channel runs.

## 2. Client relationship

Highest:
- `AGREED_CLIENT`
- `AGREED_GROUP_ENTITY`

Then:
- `PAST_CLIENT` after current-agreement verification;
- `TARGET_PROSPECT`;
- `UNKNOWN` pending attribution.

A later-stage discovery that resolves to an agreed client is promoted immediately into the Stage 1 commercial workflow.

## 3. Seniority / scarcity / value

Increase priority for:

- board / Executive Director;
- C-suite / executive;
- Director / Head / General Manager;
- Senior Manager;
- Principal / Lead / Architect;
- scarce specialist;
- senior consulting / advisory roles;
- fractional/interim executive roles;
- materially scarce or highly paid technical/professional roles.

Do not automatically rank a conventional Manager above a Principal, specialist or consultant.

## 4. Vacancy quality

Prefer:

- current/active evidence;
- direct/original source;
- named employer;
- attributable agency vacancy;
- exact role/location details;
- salary evidence;
- clear hiring ownership;
- multiple corroborating sources.

Reduce priority for:

- stale/expired evidence;
- unverifiable syndication;
- weak employer hypothesis;
- duplicates with no new information;
- broad/noisy signals with little information gain.

## 5. Research depth

Use deeper research for:

- agreed clients;
- board/executive/Head/Director roles;
- scarce specialists;
- high-value anonymous agency vacancies;
- strong but incomplete LinkedIn signals.

Stop earlier on low-value general-market roles when additional research is unlikely to change the commercial decision.

## 6. Evidence standard

Higher priority never lowers the evidence standard.

Keep separate:

- Confirmed;
- Probable;
- Hypothesis;
- Unknown.

## 7. Tie-breaker

When two actions compete for the same research budget, prefer the one with higher expected:

**information gain × precision × commercial importance ÷ execution cost**

Authority for query-level selection: `query_templates.yaml`.
