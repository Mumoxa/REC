# Shared Commercial Qualification Rules

## Taxonomy authority

The detailed role authority is:

- `taxonomy/Talent_Tree_Master_Recruitment_Role_Taxonomy.md`
- `taxonomy/role_taxonomy.json`
- `taxonomy/role_taxonomy_rules.yaml`

Where this summary conflicts with the detailed taxonomy, the taxonomy governs.

For LinkedIn social discovery, role filtering remains downstream of discovery.

## 1. Market

Primary market: **South Africa**.

Capture province, metro/commercial node and remote/hybrid/on-site status where available.

## 2. Salary threshold

Primary commercial focus:

> **Roles stated or reasonably estimated above R420,000 per annum.**

Do not reject a role during broad discovery only because salary is absent.

Order of operation:

1. discover;
2. classify title and seniority;
3. identify or investigate employer;
4. estimate salary where necessary using defensible evidence;
5. apply R420k threshold;
6. decide whether the role enters the commercial pipeline.

Never invent a salary to retain a vacancy.

## 3. Excluded families

For the general commercial pipeline exclude:

- Sales & Business Development;
- Customer / Client Service;
- Customer Success;
- Financial Advisors;
- Financial Planners;
- General Administration;
- Office Support;
- Executive Support.

A discovered role can still be retained in raw discovery before filtering.

### Agreed-client exception

Do not suppress intelligence about a meaningful vacancy at an agreed client merely because it falls outside the general-market taxonomy. Record it separately if it could reasonably produce recruitment work.

## 4. Seniority and scarcity

Priority rises with organisational responsibility, scarcity and commercial value.

High-interest levels include:

- C-suite / Chief;
- Executive;
- Director;
- Vice President;
- Head of Function;
- General Manager;
- Senior Manager;
- Lead / Principal;
- scarce specialist professional roles.

Classify actual responsibilities, not title keywords alone.

## 5. Commercial priority

The canonical source-stage order is controlled by `sources/search-priority.yaml`:

**AGREED_CLIENTS → AGENCY_SITES → LINKEDIN → JOB_BOARDS**

This source-stage sequence dominates scheduling.

Within the active/completed stage, use `core/scoring-rubric.md` to prioritise by client relationship, seniority, scarcity, evidence quality, freshness and expected information gain.

A later-stage vacancy that resolves to an agreed client is immediately promoted to the Stage 1 commercial workflow while retaining its original discovery provenance.

## 6. Stop rule

Once a role is clearly commercially excluded, do not spend expensive employer-attribution or stakeholder-research effort unless an agreed-client exception applies.
