# Stakeholder & Company Email Intelligence

## Purpose

This is a **shared post-discovery enrichment layer**, not a sourcing channel.

It begins after a vacancy has been discovered by any of the four channels and the evidence is strong enough to support action.

The objective is to answer:

1. What is the actual role?
2. Who is the direct employer?
3. Who is most likely to own, influence or execute hiring for this role?
4. What is the company's observed employee email domain and address pattern?
5. What public business email addresses are observed?
6. What **probable business email address** can be suggested for each relevant stakeholder when no observed address is available?

## Hard activation gate

Do not begin deep stakeholder/contact research until both conditions are satisfied:

### Role gate

The role must be resolved with high confidence.

Preferred evidence:

- exact source title;
- detailed responsibilities consistent with the taxonomy node;
- reporting line/function evidence;
- multiple source copies that agree;
- employer careers/ATS or other direct evidence.

Record:

- raw title;
- normalised title;
- taxonomy node;
- title-suggested seniority;
- true-seniority status where resolvable;
- role-resolution status.

Allowed role-resolution states:

- `CONFIRMED`
- `HIGH_CONFIDENCE`
- `UNRESOLVED`

`HIGH_CONFIDENCE` is an operational evidence state, not a numeric probability.

### Employer gate

The direct hiring employer must also be resolved with high confidence.

Allowed employer-resolution states:

- `CONFIRMED`
- `HIGH_CONFIDENCE`
- `UNRESOLVED`

Do not run deep stakeholder/email work while the employer remains merely one of several weak hypotheses.

For anonymous agency vacancies, complete the employer-attribution protocol first.

## Activation rule

Stakeholder/contact enrichment may begin when:

```text
ROLE = CONFIRMED or HIGH_CONFIDENCE
AND
DIRECT EMPLOYER = CONFIRMED or HIGH_CONFIDENCE
```

If either is `UNRESOLVED`, continue role/employer research instead.

## Stakeholder universe

The goal is not to collect arbitrary employees.

Identify people with a plausible reason to care about receiving strong CVs for the specific vacancy.

### Route 1 — Functional hiring ownership

Search first for the likely direct or functional hiring owner:

- direct manager implied by the reporting line;
- Head of Function;
- Functional Director;
- Divisional / Business Unit leader;
- Country / Regional functional leader where relevant;
- General Manager where the role sits directly under the GM structure;
- executive functional owner for senior roles.

### Route 2 — Executive sponsor / leadership

For senior or strategically important roles identify the relevant executive sponsor.

Examples:

- Finance → CFO / Finance Director / Group CFO;
- Technology → CIO / CTO / relevant technology executive;
- Data / AI → CDO / CIO / CTO / Head of Data depending on structure;
- HR → CHRO / HR Director / People Executive;
- Legal → General Counsel / Chief Legal Officer / Company Secretary where relevant;
- Operations → COO / Operations Director;
- Procurement / Supply Chain → Chief Procurement Officer / Supply Chain Director / COO where relevant;
- Commercial / Marketing → CCO / CMO / Commercial Director;
- Risk / Compliance → CRO / Chief Compliance Officer / relevant executive;
- Investment → CIO / Investment Director / Head of Investments;
- Product → CPO / Product Director / relevant business executive.

Do not assume the CEO is the hiring manager for every senior role.

### Route 3 — Talent Acquisition / HR

Separately identify people likely to execute the hiring process:

- Talent Acquisition Partner;
- Talent Acquisition Specialist;
- Internal Recruiter;
- Recruitment Manager;
- Head of Talent Acquisition;
- HR Business Partner aligned to the function/business unit;
- HR Manager;
- HR Director / People Executive where appropriate.

### Route 4 — Vacancy-specific people

Also preserve any person directly connected to the vacancy:

- job-post author;
- hiring-manager post author;
- internal recruiter named on advert;
- agency consultant;
- application-contact person;
- employee/referral poster;
- executive who reposted or promoted the role.

A person directly evidenced in the vacancy trail can outrank a generic organisational-title search.

## Stakeholder relevance levels

Each person must be classified:

- `PRIMARY_HIRING_OWNER`
- `FUNCTIONAL_DECISION_MAKER`
- `EXECUTIVE_SPONSOR`
- `TALENT_ACQUISITION`
- `HR_BUSINESS_PARTNER`
- `VACANCY_CONTACT`
- `REFERRAL_OR_AMPLIFIER`
- `POSSIBLE_STAKEHOLDER`

Do not call somebody a hiring manager merely because they work in HR or hold a senior title.

## Current-employment verification

Before using a stakeholder operationally, verify that the person is still associated with the employer and role.

Preferred evidence:

1. current employer/leadership page;
2. current LinkedIn profile or recent LinkedIn activity;
3. recent company announcement;
4. recent authoritative corporate document;
5. other recent corroborating evidence.

Old conference bios or historical articles do not independently establish current employment.

Employment status:

- `CURRENT_VERIFIED`
- `CURRENT_PROBABLE`
- `CURRENT_UNVERIFIED`
- `FORMER`
- `CONTRADICTED`

## Company email intelligence

### Separate web domain from employee email domain

The company website domain does not automatically prove the employee email domain.

Record separately:

- website domain;
- candidate employee-email domain;
- observed employee-email domain;
- whether the email domain is confirmed or inferred.

### Research observed business emails

Use public business evidence such as:

- company contact/careers pages;
- public corporate documents;
- press releases;
- public staff/leadership pages;
- public professional profiles/pages;
- vacancy/application contacts;
- other publicly indexed business addresses.

Do not seek private/personal email addresses.

### Pattern derivation

Where possible, obtain multiple observed employee business addresses and compare them.

Common patterns include:

- `firstname.lastname@domain`
- `firstinitiallastname@domain`
- `firstname@domain`
- `firstname_lastname@domain`
- `firstnamelastname@domain`
- other evidenced organisation-specific forms.

Do not assume a pattern from the company name.

Prefer at least **two independent observed employee addresses** that demonstrate the same pattern.

Three or more consistent observations materially strengthen the pattern evidence.

### Pattern status

Use:

- `CONFIRMED_PATTERN` — multiple consistent observed employee addresses;
- `PROBABLE_PATTERN` — limited but coherent observations;
- `CONFLICTING_PATTERNS` — multiple live patterns or inconsistent evidence;
- `UNKNOWN_PATTERN`.

Record the underlying observed examples and sources.

## Suggested probable business email

For each relevant stakeholder:

1. first look for an **observed public business email**;
2. if observed, retain it as observed;
3. otherwise, if the employee domain and pattern are sufficiently established, generate a **pattern-inferred probable business email**;
4. never label a generated address as verified merely because it fits the pattern;
5. if the company uses multiple/conflicting patterns, do not force a single suggestion.

Example:

```text
Observed company pattern:
firstname.lastname@company.co.za

Stakeholder:
Jane Smith

Suggested probable business email:
jane.smith@company.co.za

Status:
PATTERN_INFERRED
```

The word **probable** is mandatory for a generated address unless independently observed or verified.

## Email/contact evidence status

Use:

- `OBSERVED` — address publicly observed for that exact person;
- `VERIFIED` — exact address independently validated by strong evidence;
- `PATTERN_INFERRED` — constructed from an evidenced company pattern;
- `CATCH_ALL` — domain accepts broadly and individual address cannot be established;
- `CONFLICTING_PATTERN`
- `UNVERIFIABLE`
- `UNKNOWN`

A guessed address with no pattern evidence is not allowed.

## Required mapping depth

For each qualifying resolved vacancy, target **2–10 named hiring stakeholders** where the public evidence and organisation size support it.

The set should normally span the actual hiring architecture rather than ten generic HR names:

- direct / functional hiring owner;
- functional decision maker or business-unit leader;
- executive sponsor where role seniority warrants it;
- Talent Acquisition / recruitment owner;
- HR Business Partner or People leader;
- vacancy contact / post author / relevant referrer where evidenced.

This is a research-depth target, not a quota. Do not pad the list with weakly relevant employees. If fewer than two credible people can be resolved, preserve the smaller set and record the research limitation explicitly.

## Consolidated stakeholder output

For each resolved vacancy provide one consolidated stakeholder table/list with:

- person name;
- current title;
- stakeholder relevance;
- reason they matter for this specific vacancy;
- current-employment status;
- public profile/source URL where available;
- observed business email, if any;
- suggested probable business email, if pattern-derived;
- email status;
- email-pattern basis;
- confidence / uncertainty;
- evidence sources.

The operational record must set `stakeholder_map_status` to one of:

- `NOT_STARTED`
- `IN_PROGRESS`
- `READY`
- `BLOCKED_WITH_EVIDENCE`

`READY` requires at least one evidence-backed hiring stakeholder. `BLOCKED_WITH_EVIDENCE` requires a specific evidence-grounded blocker note; it may not be used as a shortcut to skip research.

Also provide company-level email intelligence:

- website domain;
- employee email domain;
- domain status;
- observed business-email examples;
- detected pattern;
- pattern status;
- contradictions / alternate patterns.

## Research order after discovery

```text
DISCOVER VACANCY
    ↓
RESOLVE EXACT ROLE
    ↓
CONFIRM / HIGH-CONFIDENCE DIRECT EMPLOYER
    ↓
MAP FUNCTIONAL HIRING ARCHITECTURE
    ↓
IDENTIFY FUNCTIONAL OWNER(S)
    ↓
IDENTIFY RELEVANT EXECUTIVE SPONSOR(S)
    ↓
IDENTIFY TA / HR ROUTE
    ↓
VERIFY CURRENT EMPLOYMENT
    ↓
ESTABLISH EMPLOYEE EMAIL DOMAIN
    ↓
OBSERVE MULTIPLE REAL BUSINESS EMAILS
    ↓
DERIVE COMPANY EMAIL PATTERN
    ↓
FIND OBSERVED EMAIL FOR EACH STAKEHOLDER
    ↓
IF NOT OBSERVED, GENERATE PROBABLE PATTERN-INFERRED EMAIL
    ↓
CONSOLIDATE STAKEHOLDER + EMAIL INTELLIGENCE
```

## Research depth by role value

For board, Executive Director, C-suite, Director, Head, fractional executive, Principal, scarce specialist and senior consulting roles, perform broader stakeholder mapping.

For lower-value general-market roles, keep stakeholder research proportionate.

Agreed-client opportunities justify strong stakeholder mapping because the relationship already exists.

## Privacy and repository rule

Research **public business contact information only**.

Do not seek or infer private/personal email accounts or private telephone numbers.

The GitHub repository is an architecture/specification repository and is currently public. Do not commit live stakeholder names, person-specific email addresses, private contact data or client-sensitive run outputs into the public repository.

Store live run results only in an appropriately private operational data store/output surface.
