# Vacancy Intelligence Workspace — ATS-Style UI Specification

## Purpose

Define the primary recruiter operating surface for jobs surfaced by the four Recruitment Intelligence channels.

The workspace is designed for high-volume vacancy triage, investigation and candidate-market work without repeatedly navigating between separate pages.

## Default landing page

The application opens to:

**VACANCIES → Inbox**

This is the front door of the system.

The user should immediately be able to answer:

- What new roles have been surfaced?
- Which agreed clients are hiring?
- Which vacancies require employer/QA research?
- Which opportunities have candidate maps ready?
- Which jobs need action now?

## Canonical three-pane layout

```text
┌───────────────────────────────────────────────────────────────────────────────────────────┐
│ Global Search    Active filter chips     Saved View     Sort     Density     More Filters │
├───────────────────┬─────────────────────────────────┬─────────────────────────────────────┤
│ VACANCY QUEUE     │ SELECTED VACANCY                │ RELEVANT CANDIDATES                 │
│                   │                                 │                                     │
│ Surfaced jobs     │ Vacancy intelligence            │ Candidate market for selected job   │
│                   │                                 │                                     │
│ Search/filter     │ Requirements / sources / QA     │ Search/filter / shortlist actions   │
│                   │                                 │                                     │
└───────────────────┴─────────────────────────────────┴─────────────────────────────────────┘
```

The three panes remain within one working context.

Selecting a job must not reset filters, scroll position or candidate-search state unless the user explicitly changes context.

# Pane 1 — Vacancy Queue

## Purpose

Persistent ATS-style list of canonical surfaced vacancies.

A canonical vacancy may aggregate several source records.

The user should not see separate jobs simply because the same vacancy appeared on multiple surfaces such as:

- company ATS;
- LinkedIn;
- job board;
- recruitment agency;
- employee repost.

Instead show one vacancy with source count and source lineage.

## Vacancy card densities

### Expanded

```text
Head of Finance
Company A
Cape Town
PRN Recruitment
First seen: Today 09:31
54 candidates · 10 Top 10
QA Passed
```

### Compact

```text
Head of Finance · Company A · Cape Town
```

### Minimal

```text
Head of Finance
```

Required controls:

- expand selected;
- collapse selected;
- compact all;
- minimal all;
- restore preferred density.

Density is display state only. It does not alter vacancy lifecycle state.

## Vacancy list indicators

Useful at-a-glance indicators include:

- client status;
- source/channel;
- employer resolution;
- QA state;
- first seen;
- last verified;
- candidate-map progress;
- candidate count;
- Top 10 count;
- new/unread status;
- research-required indicator.

Example:

```text
Head of Finance
Company A · Cape Town
57 mapped · 10 Top 10 · QA ✓
```

or:

```text
Financial Manager
Employer unresolved
Research required · 0 candidates
```

## Default ordering

Recommended initial sort:

1. agreed-client opportunities requiring action;
2. high-commercial-priority verified opportunities;
3. newly surfaced opportunities;
4. employer / QA research required;
5. candidate mapping in progress;
6. other active qualified roles.

The user can override this with explicit sort controls.

# Pane 2 — Selected Vacancy Intelligence

## Purpose

Provide the complete working context for the selected job without navigating away from the vacancy queue.

## Header

Display:

- role title;
- confirmed/probable employer;
- location;
- source channel;
- client status;
- first seen;
- last seen;
- last verified;
- current lifecycle status;
- QA status;
- candidate-map status.

## Tabs / subviews

Recommended tabs:

- Overview
- Requirements
- Sources
- Employer
- Stakeholders
- Candidate Map
- Search Log
- QA
- History

### Overview

Concise role and commercial summary.

### Requirements

Evidence-aware role requirements rather than an unstructured advert dump.

Example:

| Requirement | Status |
|---|---|
| CA(SA) | Confirmed required |
| Manufacturing | Confirmed required |
| SAP | Confirmed required |
| Team leadership | Confirmed required |
| Listed environment | Probable preference |

### Sources

Show all source records supporting the canonical vacancy.

Example:

```text
Employer careers page       CONFIRMED
Hiring-manager LinkedIn     CONFIRMED
Job-board copy              SUPPORTING
Agency advert               PROBABLE SAME VACANCY
```

### Employer

Show direct-employer resolution and competing hypotheses without overstating certainty.

Prefer:

```text
Probable employer: Company A
Alternative hypothesis: Company B
Unresolved: employing business unit
```

over artificial numeric probabilities unless a validated probability model exists.

### Stakeholders

Show only vacancy-relevant hiring architecture produced by the downstream intelligence process.

### Candidate Map

Summary of candidate-market state and coverage.

### Search Log

Expose actual searches executed, status and yield.

### QA

Show QA Gates A–D, claims challenged, downgrades, unknowns and next research actions.

### History

Show vacancy chronology and significant state changes.

# Pane 3 — Relevant Candidate Market

## Purpose

Display people relevant to the currently selected vacancy.

This pane is vacancy-contextual by default; it is not the entire candidate database.

## Default groupings

Recommended sections:

- Top 10
- Strong Market
- Longlist
- Unreviewed
- Excluded

Show counts for each.

Example:

```text
Top 10          10
Strong Market   24
Longlist        57
Unreviewed      16
Excluded         8
```

## Candidate card

Example:

```text
★ #1 Jane Smith
Financial Manager — Direct Comparable Employer

CA(SA)             CONFIRMED
Manufacturing      CONFIRMED
SAP                CONFIRMED
Team leadership    CONFIRMED
Western Cape       CONFIRMED

Tier A · QA Passed
```

Do not hide material unknowns.

## Candidate actions

One-click recruiter actions:

- Earmark;
- Add to Top 10;
- Exclude;
- Mark for approach;
- Open evidence;
- Open public profile/source where available.

## Candidate operational status

Keep operational workflow separate from evidence strength.

Suggested operational lifecycle:

```text
SURFACED
→ RELEVANT
→ EARMARKED
→ TOP_10
→ APPROACH
→ ENGAGED
→ SUBMITTED
```

Evidence/QA state remains separate.

A candidate can therefore be:

- `TOP_10` operationally;
- `PASS_WITH_UNKNOWNS` evidentially;
- `NOT_APPROACHED` commercially.

Do not collapse these concepts into one score/status.

# Collapse, minimise and close behaviour

These are distinct controls.

## Collapse vacancy card

Changes only how much vacancy information appears in the left pane.

No lifecycle change.

## Minimise selected-vacancy pane

Temporarily reduces or hides the middle details pane to give candidate research more screen width.

No lifecycle change.

## Candidate Focus mode

Recommended layout toggle:

Normal:

```text
Vacancies 25% | Job detail 35% | Candidates 40%
```

Candidate Focus:

```text
Vacancies 15% | Job context header 10% | Candidates 75%
```

The selected vacancy remains visible as a narrow context header.

## Close vacancy

Changes lifecycle state and removes the job from the default active queue.

Closing must require a reason:

- Filled
- Expired
- Client no longer hiring
- Not commercially relevant
- Duplicate
- Cancelled
- Other

Closing never deletes:

- vacancy evidence;
- source lineage;
- target-company mapping;
- candidates researched;
- Top 10;
- search logs;
- QA history.

Closed research remains searchable and reusable if the role reappears.

# Vacancy lifecycle

The UI may display workflow status such as:

```text
DISCOVERED
→ QA / VERIFY
→ QUALIFIED
→ EMPLOYER RESOLVED
→ CANDIDATE MAPPING
→ TOP 10 READY
→ CLIENT ACTION
→ CLOSED
```

This is **record lifecycle**, not sourcing-channel sequencing.

A vacancy from any single channel can enter this lifecycle directly.

# Job surfacing views

## Inbox

All active canonical vacancies subject to current filters.

## New

First seen within the selected time window.

## Agreed Clients

Current agreed-client / agreed-group vacancies.

## Agencies

PRN Recruitment, Communicate Recruitment and Network Recruitment discoveries.

## LinkedIn

LinkedIn/distributed hiring signals.

## Job Boards

Job-board / ATS / broader source discoveries.

## Needs Research

Examples:

- employer unresolved;
- salary threshold uncertain;
- vacancy freshness uncertain;
- duplicate uncertain;
- client agreement scope uncertain;
- QA failed / research required.

## Closed / Archived

Closed vacancies with all intelligence preserved.

# Company hiring view

The same canonical vacancy data should support an employer-centric view.

Example:

| Employer | Live roles | New this week | Client status |
|---|---:|---:|---|
| SATURC | 4 | 2 | Agreed |
| Company A | 7 | 3 | Prospect |
| Company B | 3 | 1 | Prospect |

Company drill-down can show:

- active vacancies;
- historical vacancies;
- hiring managers;
- hiring cadence;
- previously mapped candidates;
- source signals;
- candidate maps;
- prior outreach where available.

# What's New view

Provide a time-window summary such as:

```text
Since yesterday

31 newly surfaced opportunities
4 agreed-client jobs
6 PRN
7 Communicate
3 Network
8 LinkedIn hidden hiring signals
3 job-board/direct ATS roles

5 employer identities resolved
2 roles moved to Top-10 ready
1 vacancy disappeared
```

This is a view of structured records, not a separate research process.

# Timestamps

Where available every canonical vacancy should expose:

- source posting/publication date;
- first seen;
- last seen;
- last verified;
- last changed;
- closed/disappeared date;
- run ID;
- QA review dates.

Historical date data should support identification of repeated/reposted vacancies without automatically inferring why they were reposted.

# Export behaviour

Primary workspace: browser UI.

Exports should include:

- current vacancy view → Excel/CSV;
- filtered vacancy set → Excel/CSV;
- candidate longlist → Excel/CSV;
- Top 10 → Excel/CSV/PDF;
- target-company map → Excel/CSV;
- search log → Excel/CSV;
- QA exceptions → Excel/CSV;
- client-facing pack → PDF.

Exporting must not alter the canonical record.

A generated HTML file may be used as a lightweight prototype or portable snapshot, but per-run HTML is not the canonical data store.


# Keyboard efficiency

For high-volume processing, support optional keyboard shortcuts without making them mandatory for normal use.

Recommended actions:

- Up / Down — previous / next vacancy;
- Enter — open/select vacancy;
- / — focus search;
- F — open filters;
- E — earmark selected candidate;
- T — add selected candidate to Top 10;
- X — exclude selected candidate;
- C — collapse selected vacancy card.

Keyboard actions must respect the same permissions, evidence boundaries and lifecycle rules as visible UI controls.
