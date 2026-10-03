# BUILD INSTRUCTION — `query_templates.yaml`

## Purpose

Create `query_templates.yaml` as the authoritative configuration controlling how the Talent Tree Recruitment Intelligence Engine converts an intelligence objective into executable search queries.

Its purpose is to answer:

> **How should the engine search for this specific piece of recruitment intelligence, on this specific source, given what is already known?**

It must support:

- vacancy discovery;
- silent/unadvertised hiring discovery;
- LinkedIn hiring-signal discovery;
- direct-employer discovery;
- agency vacancy discovery;
- anonymous-employer attribution;
- duplicate-source tracing;
- hiring-manager identification;
- organisational-structure research;
- current-employment verification;
- contact and domain intelligence;
- email-pattern discovery;
- salary verification;
- incumbent research;
- recruiter/client relationship research;
- early hiring signals;
- executive movement;
- expansion/acquisition intelligence;
- source revalidation;
- contradiction research;
- freshness verification.

`query_templates.yaml` must generate **search actions**, not business conclusions.

The file should configure the search engine.

It must not itself decide:

- whether a vacancy qualifies commercially;
- whether an employer is confirmed;
- whether a person is definitely the hiring manager;
- whether an email is verified;
- whether a vacancy is live;
- whether outreach should occur.

Those conclusions belong to their respective resolution engines.

---

# 1. CORE DESIGN PRINCIPLE

Do not store thousands of complete searches.

Store:

```text
QUERY INTENT
+
QUERY TEMPLATE
+
VARIABLES
+
EXPANSION RULES
+
SOURCE BEHAVIOUR
+
PRIORITY
+
FALLBACKS
+
STOP CONDITIONS
```

The runtime engine should dynamically construct searches.

Example:

```text
template:
"{signal_phrase}" "{role_term}" "{location_term}"
```

Runtime values:

```text
signal_phrase = "we're hiring"
role_term = "financial manager"
location_term = "Cape Town"
```

Generated query:

```text
"we're hiring" "financial manager" "Cape Town"
```

The YAML contains the **method**, not every possible final query.

---

# 2. QUERY ENGINE OPERATING MODEL

The engine should operate approximately as:

```text
RESEARCH OBJECTIVE
        ↓
SELECT QUERY FAMILY
        ↓
LOAD KNOWN INTELLIGENCE
        ↓
SELECT SOURCE
        ↓
RESOLVE VARIABLES
        ↓
EXPAND SYNONYMS / ALIASES
        ↓
APPLY SOURCE-SPECIFIC SYNTAX
        ↓
GENERATE QUERY CANDIDATES
        ↓
RANK
        ↓
DEDUPLICATE
        ↓
EXECUTE
        ↓
CAPTURE RESULTS
        ↓
MEASURE YIELD
        ↓
GENERATE FALLBACK IF NECESSARY
```

Do not regenerate searches already attempted unless retry rules permit it.

---

# 3. REQUIRED TOP-LEVEL YAML STRUCTURE

Use a structure similar to:

```yaml
version: "1.0"

defaults:
  market: ZA
  language: en
  max_query_length:
  default_recency:
  max_expansions:
  deduplicate_queries: true

query_families:
  vacancy_discovery:
  hiring_signal:
  employer_attribution:
  stakeholder_resolution:
  contact_intelligence:
  freshness_verification:
  salary_verification:
  incumbent_research:
  recruiter_client_relationship:
  executive_movement:
  expansion_signal:
  contradiction_search:
  source_revalidation:

source_profiles:
  google:
  bing:
  linkedin:
  employer_ats:
  recruitment_agency:
  job_board:
  social:
  general_web:

variables:

expansion_rules:

negative_terms:

fallback_chains:

stop_conditions:

query_metrics:
```

The exact implementation may differ, but the separation of concerns should remain.

---

# 4. QUERY OBJECT SCHEMA

Every query template should support the following conceptual fields:

```yaml
- id:
  family:
  purpose:
  enabled:
  priority:
  sources:
  template:
  required_variables:
  optional_variables:
  expansions:
  exclusions:
  recency:
  geography_mode:
  max_generated_queries:
  expected_signal:
  evidence_target:
  fallback_to:
  stop_on:
  notes:
```

Example:

```yaml
- id: linkedin_explicit_hiring_role_location
  family: hiring_signal
  purpose: Find explicit social hiring posts for a role and geography.
  enabled: true
  priority: high

  sources:
    - linkedin
    - google
    - bing

  template: '"{signal_phrase}" "{role_term}" "{location_term}"'

  required_variables:
    - signal_phrase
    - role_term

  optional_variables:
    - location_term

  expansions:
    signal_phrase: hiring_signal_phrases
    role_term: role_aliases
    location_term: location_aliases

  max_generated_queries: 30

  expected_signal:
    - CONFIRMED_VACANCY
    - PROBABLE_VACANCY

  fallback_to:
    - linkedin_explicit_hiring_role_no_location
```

---

# 5. QUERY FAMILIES

At minimum implement the following families.

```yaml
query_families:
  - VACANCY_DISCOVERY
  - SOCIAL_HIRING_DISCOVERY
  - COMPANY_HIRING_DISCOVERY
  - AGENCY_DISCOVERY
  - ATS_DISCOVERY
  - EMPLOYER_ATTRIBUTION
  - EMPLOYER_CONTRADICTION
  - JOB_DUPLICATE_DISCOVERY
  - STAKEHOLDER_DISCOVERY
  - REPORTING_LINE_DISCOVERY
  - CURRENT_EMPLOYMENT_VERIFICATION
  - INCUMBENT_DISCOVERY
  - CONTACT_DISCOVERY
  - DOMAIN_DISCOVERY
  - EMAIL_PATTERN_DISCOVERY
  - RECRUITER_CLIENT_HISTORY
  - SALARY_DISCOVERY
  - VACANCY_FRESHNESS
  - EXECUTIVE_MOVEMENT
  - BUSINESS_EXPANSION
  - SOURCE_DISCOVERY
  - SOURCE_REVALIDATION
```

Each family should be optimised independently.

---

# 6. VARIABLE LIBRARY

The query system must operate on structured variables.

Support at minimum:

```yaml
variables:
  job_title_raw:
  job_title_normalised:
  role_term:
  role_alias:
  role_family:
  function:
  seniority:
  seniority_term:
  qualification:
  designation:
  skill:
  system:
  erp:
  industry:
  subsector:
  product:
  employer:
  employer_alias:
  parent_company:
  recruiter:
  consultant:
  agency:
  person:
  person_first_name:
  person_last_name:
  stakeholder_title:
  location:
  city:
  suburb:
  metro:
  province:
  commercial_node:
  country:
  salary:
  reference_number:
  application_email:
  domain:
  rare_phrase:
  responsibility_phrase:
  signal_phrase:
  movement_phrase:
  expansion_phrase:
  reporting_phrase:
  recency_term:
```

The query file should define how variables are combined.

Their underlying vocabularies should come from the appropriate configuration source.

---

# 7. DO NOT DUPLICATE OTHER TAXONOMIES

`query_templates.yaml` should reference rather than duplicate:

```text
role_taxonomy.yaml
seniority_terms.yaml
geography_terms.yaml
hiring_signal_terms.yaml
company_aliases
source_registry
```

Example:

```yaml
expansions:
  role_term:
    source: role_taxonomy

  seniority_term:
    source: seniority_terms

  location_term:
    source: geography_terms
```

Do not maintain parallel lists that will drift apart.

---

# 8. QUERY LENGTH PRINCIPLE

Prefer:

> **MANY SMALL HIGH-PRECISION QUERIES**

over:

> **ONE MASSIVE BOOLEAN QUERY**

Long queries:

- create brittle syntax;
- get truncated;
- behave differently between engines;
- hide which term produced the result;
- reduce diagnostic value;
- complicate yield measurement.

The engine should generate controlled overlapping search slices.

---

# 9. QUERY EXPANSION CONTROL

A naive Cartesian product can create thousands of useless searches.

Example:

```text
20 signals
×
30 role aliases
×
15 locations
×
4 date variants
=
36,000 queries
```

Do not do this blindly.

Each template must support:

```yaml
max_generated_queries:
max_role_aliases:
max_signal_variants:
max_location_variants:
max_company_aliases:
```

Expansion should be ranked by expected yield.

---

# 10. EXPANSION PRIORITY

When expansion is necessary, use this order:

```text
1. Exact known term
2. High-confidence synonym
3. Common South African title variant
4. Seniority variant
5. Geographic alias
6. Industry terminology
7. Broad fallback
```

Do not begin with maximum expansion.

---

# 11. ROLE EXPANSION

A vacancy may be described using multiple title conventions.

Example:

```text
Financial Manager
Finance Manager
FM
Head of Finance
Finance Lead
```

But do not blindly treat all of these as equivalent.

Use the role taxonomy to provide:

```yaml
role_expansion:
  exact:
  close_aliases:
  adjacent_titles:
  abbreviations:
```

Query templates should normally prefer:

`exact → close aliases → adjacent`

Adjacent titles should be used only in broader discovery phases.

---

# 12. SENIORITY EXPANSION

Seniority terms should come from `seniority_terms.yaml`.

Example:

```text
Head of Finance
Finance Director
Group Finance Manager
Senior Finance Manager
```

Do not use seniority expansion when exact role intelligence already exists unless broader recall is required.

Do not let ambiguous terms such as:

`executive`

generate excessive noise.

---

# 13. SOUTH AFRICAN GEOGRAPHIC EXPANSION

Search geography at multiple levels.

Support:

```text
COUNTRY
PROVINCE
METRO
CITY
SUBURB
COMMERCIAL_NODE
INDUSTRIAL_NODE
```

Example Western Cape expansion:

```text
Western Cape
Cape Town
Cape Town CBD
Bellville
Durbanville
Brackenfell
Century City
Epping
Montague Gardens
Stellenbosch
Paarl
Somerset West
Winelands
```

Do not assume vacancies are indexed under the largest metro.

---

# 14. GEOGRAPHY PRIORITY

Where no location is known, use the Talent Tree commercial preference:

```text
1. Western Cape
2. Gauteng
3. KwaZulu-Natal
4. South Africa broader
```

This controls search ordering.

It must not cause valid South African jobs elsewhere to be discarded if they are found.

---

# 15. HIRING-SIGNAL PHRASES

Reference the hiring-signal dictionary.

High-value explicit phrases include variants of:

```text
we're hiring
we are hiring
hiring
now hiring
currently hiring
join our team
join my team
looking for
seeking
vacancy
vacancies
open role
open position
career opportunity
send your CV
send your resume
CVs to
apply now
applications open
```

Also search job-description language:

```text
minimum requirements
successful candidate
ideal candidate
reporting to
reports to
key responsibilities
minimum experience
```

---

# 16. SOCIAL HIRING QUERY TEMPLATES

Build high-precision templates such as:

```text
"{signal_phrase}" "{role_term}"
"{signal_phrase}" "{role_term}" "{location}"
"{signal_phrase}" "{function}" "{location}"
"{role_term}" "send your CV"
"{role_term}" "CVs to"
"{role_term}" "join our team"
"{role_term}" "join my team"
```

For indexed LinkedIn content:

```text
site:linkedin.com/posts "{signal_phrase}" "{role_term}"
site:linkedin.com/posts "{signal_phrase}" "{location}"
site:linkedin.com/in "{role_term}" "{employer}"
```

Actual source syntax must be configured through source profiles.

---

# 17. HIRING-GRAPHIC DISCOVERY

Searches should also target posts where text may exist primarily inside an image.

Use terms likely to surface visual posts:

```text
vacancy
we're hiring
join our team
career opportunity
applications close
send CV
```

Do not assume absence of indexed job-description text means absence of a vacancy.

When a result contains an image, PDF or carousel, trigger visual inspection.

---

# 18. COMPANY-SPECIFIC HIRING QUERIES

When employer is known:

```text
"{employer}" "{signal_phrase}"
"{employer}" "{role_term}"
"{employer}" careers "{role_term}"
"{employer}" jobs "{role_term}"
"{employer}" vacancies
site:{domain} careers
site:{domain} jobs
site:{domain} "{role_term}"
```

Also expand verified company aliases.

---

# 19. AGREED-CLIENT QUERIES

Agreed-client searches receive higher scheduling priority.

Use:

```text
company identity
aliases
legal entities
trading names
divisions
known subsidiaries
known functional leaders
```

Do not search only the commercial brand if vacancies may appear under a legal entity.

Do not extend client agreement status from one entity to another merely because both are in the same group.

---

# 20. ATS DISCOVERY

If the company's ATS is unknown, support discovery patterns such as:

```text
"{employer}" careers
"{employer}" jobs
"{employer}" vacancies
"{employer}" "apply"
"{employer}" "work with us"
"{employer}" "join us"
```

Once ATS is established, query the ATS directly where possible.

ATS knowledge should be stored against the organisation for future reuse.

---

# 21. RECRUITMENT-AGENCY DISCOVERY

Templates should support:

```text
"{agency}" "{role_term}"
"{agency}" "{location}" "{role_term}"
site:{agency_domain} "{role_term}"
site:{agency_domain} "{location}" "{role_term}"
```

Where the source provides its own search/filter interface, prefer native structured filtering over external X-ray queries.

---

# 22. ANONYMOUS EMPLOYER ATTRIBUTION

This requires a separate query family.

Do not search:

> "Who is the employer?"

Instead decompose the vacancy fingerprint.

Possible query inputs:

```text
rare phrase
ERP
location
industry
qualification
reporting line
company-scale clue
product
regulation
salary
recruiter
reference
```

---

# 23. EXACT-PHRASE ATTRIBUTION QUERIES

Rare wording is often the strongest employer-attribution clue.

Examples:

```text
"{rare_phrase}"
"{rare_phrase}" "{location}"
"{rare_phrase}" "{industry}"
"{rare_phrase}" "{role_term}"
```

Try meaningful fragments rather than copying an entire advert.

Use multiple rare phrases independently.

---

# 24. FINGERPRINT COMBINATION QUERIES

Support compact fingerprint combinations:

```text
"{role_term}" "{erp}" "{location}"
"{role_term}" "{qualification}" "{industry}"
"{role_term}" "{reporting_phrase}" "{location}"
"{industry}" "{erp}" "{location}"
"{product}" "{role_term}" "{location}"
"{designation}" "{role_term}" "{location}"
```

Limit combinations to highly discriminative features.

---

# 25. EMPLOYER-CANDIDATE TESTING

Once an employer hypothesis exists, switch from discovery to **hypothesis testing**.

Templates:

```text
"{candidate_employer}" "{role_term}"
site:{candidate_domain} "{role_term}"
"{candidate_employer}" "{rare_phrase}"
"{candidate_employer}" "{erp}"
"{candidate_employer}" "{location}" "{function}"
```

Each serious employer hypothesis must also receive contradiction searches.

---

# 26. CONTRADICTION QUERIES

Search specifically for facts that could disprove a candidate employer.

Examples:

```text
"{candidate_employer}" "{incumbent_title}"
"{candidate_employer}" "{role_term}" appointed
"{candidate_employer}" "{role_term}" new
"{candidate_employer}" leadership "{function}"
"{candidate_employer}" "{wrong_or_conflicting_system}"
```

Where useful search:

```text
"{candidate_employer}" annual report "{function}"
"{candidate_employer}" leadership team
```

Contradiction search must not be omitted merely because supporting evidence already looks strong.

---

# 27. DUPLICATE-VACANCY DISCOVERY

Search for alternative copies of a known vacancy.

Useful templates:

```text
"{exact_title}" "{location}" "{rare_phrase}"
"{reference_number}"
"{application_email}"
"{role_term}" "{salary}" "{location}"
"{consultant}" "{role_term}"
```

Alternative copies can expose:

- employer;
- salary;
- location;
- requirements;
- closing date;
- recruiter;
- application route.

---

# 28. RECRUITER/CLIENT RELATIONSHIP RESEARCH

Templates should help identify historical relationships.

Examples:

```text
"{recruiter}" "{candidate_employer}"
"{agency}" "{candidate_employer}"
site:{agency_domain} "{candidate_employer}"
"{consultant}" "{candidate_employer}"
"{agency}" "{industry}" "{location}"
```

Historical recruiter/client relationships are contextual evidence.

They do not independently prove the current anonymous client.

---

# 29. STAKEHOLDER DISCOVERY

Once the employer is sufficiently resolved, search for the hiring architecture.

Do not immediately search generic:

> Company + HR.

First ask which organisational role is likely to own the vacancy.

Templates:

```text
"{employer}" "{stakeholder_title}"
"{employer}" "{function}" director
"{employer}" "head of {function}"
"{employer}" "{business_unit}" "{function}"
site:linkedin.com/in "{employer}" "{stakeholder_title}"
```

Use likely reporting relationships derived from the vacancy.

---

# 30. FUNCTIONAL ROUTE BEFORE GENERIC HR

For a Financial Manager:

prioritise possible:

```text
CFO
Finance Director
Head of Finance
Group Financial Manager
Divisional Finance Executive
```

before collecting generic HR contacts.

Then separately resolve:

```text
HRBP
TA Partner
Internal Recruiter
Head of TA
HR Director
```

The query engine should distinguish these two search routes.

---

# 31. BUSINESS-UNIT SEARCHING

Large organisations require business-unit precision.

Templates should support:

```text
"{employer}" "{business_unit}" "{stakeholder_title}"
"{division}" "{function}" head
"{brand}" "{function}" director
```

Do not assume a Group CFO directly manages every finance vacancy in a large group.

---

# 32. CURRENT EMPLOYMENT VERIFICATION

A discovered stakeholder is not useful until current employment is checked.

Search patterns:

```text
"{person}" "{employer}"
"{person}" "{current_title}"
"{person}" "{employer}" 2026
site:{company_domain} "{person}"
site:linkedin.com/in "{person}" "{employer}"
```

Prefer recent authoritative evidence.

Old conference biographies should not independently verify current employment.

---

# 33. INCUMBENT RESEARCH

Useful for both employer attribution and stakeholder mapping.

Templates:

```text
"{employer}" "{role_term}"
"{employer}" "{role_term}" appointed
"{employer}" "{role_term}" joins
"{employer}" "{role_term}" promoted
"{employer}" "{role_term}" leaving
"{employer}" "{role_term}" resignation
```

For executive roles also search annual reports, leadership pages and announcements.

---

# 34. CONTACT INTELLIGENCE

Contact discovery must follow stakeholder relevance.

Do not collect arbitrary employee emails first.

Templates may include:

```text
"{person}" "{employer}" email
"{person}" "@{domain}"
"{person}" contact
"{person}" "{company_domain}"
```

Also inspect authoritative company pages where appropriate.

Never invent private contact information.

---

# 35. DOMAIN DISCOVERY

Determine the employee email domain separately from website domain.

Templates:

```text
"{employer}" email
"@{candidate_domain}" "{employer}"
site:{company_domain} "@{candidate_domain}"
"{employer}" contact
```

Use observed addresses as evidence.

Do not infer an employee domain solely from company name.

---

# 36. EMAIL-PATTERN DISCOVERY

Once a domain is established, search for multiple real employee addresses.

Do not search only the target person's email.

The purpose is to establish patterns such as:

```text
firstname.lastname
firstinitiallastname
firstname
firstname_lastname
```

Search multiple known employee names.

Example logic:

```text
KNOWN PERSON A
KNOWN PERSON B
KNOWN PERSON C
        ↓
OBSERVED EMAILS
        ↓
PATTERN HYPOTHESIS
        ↓
TARGET EMAIL INFERENCE
```

Require more than one independent observation where possible.

---

# 37. PHONE DISCOVERY

Where legitimate public business phone information is useful, support queries such as:

```text
"{person}" "{employer}" phone
"{employer}" switchboard
"{employer}" contact
"{employer}" "{location}" contact
```

Prefer public business contact routes.

Do not seek private personal telephone details through invasive methods.

---

# 38. SALARY VERIFICATION

If salary is unknown and commercially material:

```text
"{exact_title}" "{location}" salary
"{exact_title}" "{industry}" salary
"{role_term}" "{location}" remuneration
"{role_term}" "{location}" package
"{recruiter}" "{role_term}" "{location}"
```

Use comparable roles carefully.

Salary benchmarking evidence must remain separate from vacancy-specific salary evidence.

---

# 39. FRESHNESS VERIFICATION

When vacancy status is uncertain:

```text
"{exact_title}" "{employer}"
"{reference_number}"
"{application_url}"
site:{employer_ats_domain} "{exact_title}"
"{role_term}" "{employer}" applications
```

Search for:

```text
closed
applications closed
position filled
appointed
no longer available
expired
```

Do not interpret disappearance alone as `FILLED`.

---

# 40. EXECUTIVE-MOVEMENT QUERIES

Use movement phrase expansions.

Templates:

```text
"{employer}" "{movement_phrase}" CFO
"{person}" "{movement_phrase}"
"{employer}" "stepping down"
"{employer}" "leaving" "{function}"
"{employer}" "new chapter" "{function}"
```

Movement phrases include:

```text
last day
moving on
leaving
stepping down
farewell
new chapter
next challenge
handing over
```

These produce signals, not automatic vacancies.

---

# 41. BUSINESS-EXPANSION QUERIES

Templates:

```text
"{employer}" "{expansion_phrase}"
"{industry}" "{location}" new facility
"{company}" new warehouse
"{company}" new factory
"{company}" expansion South Africa
"{company}" acquisition South Africa
```

Expansion phrases include:

```text
new office
new factory
new warehouse
new site
new division
new business unit
investment
funding
acquisition
merger
contract award
geographic expansion
```

Do not convert general growth into invented roles.

---

# 42. SOURCE-DISCOVERY QUERIES

The engine should occasionally identify new hiring sources.

Examples:

```text
"{role_family}" jobs South Africa
"{industry}" careers South Africa
"{location}" "{role_family}" vacancies
"{specialist_function}" recruitment South Africa
```

A source should enter the permanent Source Map only after validation.

---

# 43. SOURCE-SPECIFIC PROFILES

Different search systems support different syntax.

Do not use one query grammar everywhere.

Example:

```yaml
source_profiles:
  google:
    supports:
      - quotes
      - site
      - minus
      - OR

  bing:
    supports:
      - quotes
      - site
      - minus

  linkedin:
    supports:
      - keywords
      - people
      - jobs
      - posts

  native_ats:
    prefer_structured_filters: true
```

Runtime code should render a template according to source capability.

---

# 44. LINKEDIN SEARCH LANES

Treat LinkedIn as multiple surfaces rather than one source.

Configure distinct lanes:

```yaml
linkedin_lanes:
  posts:
  people:
  companies:
  jobs:
  recruiter_posts:
  employee_posts:
  external_xray:
```

A query useful for LinkedIn Posts may be poor for LinkedIn People.

---

# 45. EXTERNAL LINKEDIN X-RAY

Support controlled external queries such as:

```text
site:linkedin.com/posts "{signal_phrase}" "{role_term}"
site:linkedin.com/posts "{employer}" hiring
site:linkedin.com/in "{employer}" "{stakeholder_title}"
```

Do not rely on X-ray indexing as complete LinkedIn coverage.

It is a supplementary lane.

---

# 46. NEGATIVE TERMS

Maintain configurable negative-term groups.

Example:

```yaml
negative_terms:
  generic_noise:
    - course
    - training
    - salary survey
    - template
    - sample job description

  irrelevant_job_families:
    - sales representative
    - financial advisor
    - receptionist
```

Use negatives carefully.

Aggressive exclusion can hide relevant results.

Prefer post-retrieval classification where query-time exclusion could reduce recall materially.

---

# 47. QUERY CONFIDENCE TIERS

Each generated query should have a predicted intent confidence.

Use:

```text
HIGH_PRECISION
BALANCED
HIGH_RECALL
EXPLORATORY
```

Example:

```text
"{rare_phrase}" "{location}"
```

= `HIGH_PRECISION`

while:

```text
finance hiring South Africa
```

= `HIGH_RECALL` or `EXPLORATORY`.

This allows the scheduler to choose appropriately.

---

# 48. DISCOVERY SEQUENCE

For most search objectives:

```text
PASS 1 — EXACT
PASS 2 — CLOSE VARIANTS
PASS 3 — STRUCTURED COMBINATIONS
PASS 4 — BROADER SYNONYMS
PASS 5 — EXPLORATORY
```

Do not begin at Pass 5.

---

# 49. FALLBACK CHAINS

Every important template family should define fallbacks.

Example:

```yaml
fallback_chains:
  employer_attribution:
    - rare_phrase_exact
    - rare_phrase_location
    - title_erp_location
    - title_industry_location
    - recruiter_client_history
    - employer_candidate_tests
```

Fallbacks should introduce a new information angle.

Do not merely reorder the same keywords.

---

# 50. ZERO-RESULT BEHAVIOUR

If no results:

1. verify query syntax;
2. remove least essential constraint;
3. try close role alias;
4. try geographic alias;
5. try alternative search engine;
6. try source-specific search;
7. broaden carefully.

Do not immediately drop all constraints.

---

# 51. TOO-MANY-RESULTS BEHAVIOUR

If results are too broad:

1. add exact role;
2. add location;
3. add seniority;
4. add employer;
5. add signal phrase;
6. add industry;
7. add rare requirement;
8. reduce date window.

Subdivide rather than browsing thousands of noisy results.

---

# 52. QUERY DEDUPLICATION

Before execution normalise and hash generated searches.

Two semantically identical searches should normally execute once per permitted retry interval.

Store:

```text
query_hash
normalised_query
source
last_run
result_count
new_result_count
```

---

# 53. FAILED-QUERY MEMORY

Maintain:

```text
query
source
date
result
failure_type
technical_or_semantic
```

Failure types:

```text
ZERO_RESULTS
NO_NEW_RESULTS
TOO_BROAD
BLOCKED
INVALID_SYNTAX
SOURCE_FAILURE
LOW_RELEVANCE
```

Do not repeat identical failures without a new reason.

---

# 54. QUERY RETRY RULES

Permit rerun when:

```text
new evidence exists
new aliases exist
new location exists
source changed
meaningful time passed
previous block cleared
query family was updated
vacancy state changed
```

Do not repeatedly hammer the same failed query.

---

# 55. QUERY METRICS

Track each template's performance.

At minimum:

```text
template_id
runs
queries_generated
results_returned
new_results
valid_signals
canonical_jobs
qualifying_jobs
employers_resolved
stakeholders_resolved
contacts_resolved
outreach_ready_jobs
false_positives
average_cost
last_used
```

---

# 56. DO NOT OPTIMISE ONLY FOR RESULT COUNT

A query yielding:

```text
500 results
100 jobs
0 commercially useful opportunities
```

is not necessarily valuable.

A query yielding:

```text
7 results
3 qualifying vacancies
2 hiring managers
1 outreach-ready opportunity
```

may be much more valuable.

Therefore calculate both:

```text
DISCOVERY_YIELD
COMMERCIAL_YIELD
```

---

# 57. QUERY PERFORMANCE FEEDBACK

Use downstream outcomes to adjust template priority.

Positive signals:

```text
job qualified
employer resolved
stakeholder resolved
contact verified
outreach ready
client responded
```

Negative signals:

```text
false positive
stale vacancy
wrong employer
wrong stakeholder
duplicate
blocked source
zero results
```

Do not allow historical performance to permanently disable mandatory searches.

---

# 58. INFORMATION-GAIN PRIORITISATION

For unresolved jobs, query selection should maximise:

> **EXPECTED REDUCTION IN THE MOST IMPORTANT UNCERTAINTY**

Example:

Known:

```text
job = high value
employer = confirmed
salary = clearly eligible
hiring manager = unknown
```

Do not spend queries reconfirming salary.

Prioritise:

`STAKEHOLDER_DISCOVERY`.

---

# 59. QUERY OBJECTIVE MUST BE EXPLICIT

Every generated query should carry:

```yaml
objective:
```

Examples:

```text
FIND_NEW_VACANCY
VERIFY_VACANCY_ACTIVE
IDENTIFY_EMPLOYER
DISPROVE_EMPLOYER
IDENTIFY_HIRING_MANAGER
VERIFY_PERSON_CURRENT
ESTABLISH_DOMAIN
ESTABLISH_EMAIL_PATTERN
FIND_CONTACT_ROUTE
VERIFY_SALARY
FIND_DUPLICATE
```

This makes query performance measurable by purpose.

---

# 60. EVIDENCE TARGET

Each template should state what evidence it expects to obtain.

Example:

```yaml
evidence_target:
  claim_type: EMPLOYER_IDENTITY
```

or:

```yaml
evidence_target:
  claim_type: CURRENT_EMPLOYMENT
```

The search engine should know why it is searching.

---

# 61. RESEARCH STATE AWARENESS

Queries must be generated from current intelligence state.

Bad:

> Search everything about Company X repeatedly.

Good:

```text
Known:
employer confirmed
CFO confirmed
domain confirmed
email pattern unknown

Next search:
email-pattern evidence only
```

---

# 62. RECENCY WINDOWS

Support configurable periods:

```yaml
recency_windows:
  breaking: 1d
  recent: 3d
  weekly: 7d
  monthly: 30d
  historical: null
```

Use shorter recency for live vacancy discovery.

Use unrestricted historical search where historical evidence is intentionally required.

---

# 63. HISTORICAL VS CURRENT SEARCHES

Every query must understand whether the objective needs:

`CURRENT`

or:

`HISTORICAL`

evidence.

Examples:

Current:

```text
Is Jane Smith still CFO?
```

Historical:

```text
Has Agency X previously recruited for Company Y?
```

Do not reject older evidence when history is the actual research target.

---

# 64. DATE TERMS

Do not excessively insert years into searches because it can suppress undated but current content.

Use explicit dates only when:

- verifying recency;
- disambiguating a person;
- searching recent movement;
- investigating historical relationships.

---

# 65. PERSON DISAMBIGUATION

When researching a person, support combinations of:

```text
full name
employer
title
location
industry
```

Example:

```text
"John Smith" "ABC Holdings" CFO
```

Do not assume two people with the same name are identical.

---

# 66. COMPANY DISAMBIGUATION

Use:

```text
legal name
brand
domain
industry
location
parent
```

to distinguish similarly named organisations.

Do not merge companies based solely on similar names.

---

# 67. REFERENCE-NUMBER QUERIES

Agency or ATS reference numbers can be extremely high-value.

If present, automatically create:

```text
"{reference_number}"
```

and source-targeted variants.

This can reveal syndicated or historical copies quickly.

---

# 68. APPLICATION-EMAIL QUERIES

If an application email exists, it can help identify:

- employer domain;
- agency;
- duplicated vacancies;
- source lineage.

Allow:

```text
"{application_email}"
"@{application_domain}" "{role_term}"
```

But do not treat email domain alone as proof of employer where an agency intermediary exists.

---

# 69. RARE-PHRASE EXTRACTION

The upstream extraction engine should identify distinctive phrases from adverts.

Good rare phrases are:

- unusual system combinations;
- distinctive responsibility wording;
- unusual reporting descriptions;
- proprietary terminology;
- specific operational scale;
- uncommon qualification combinations.

Avoid generic phrases such as:

`excellent communication skills`.

---

# 70. QUERY ESCAPING

Runtime code must escape:

- quotation marks;
- brackets;
- special operators;
- slashes;
- source-specific reserved syntax.

Do not allow malformed user/source strings to break generated queries.

---

# 71. EMPTY VARIABLES

If an optional variable is missing:

remove the corresponding token cleanly.

Do not generate:

```text
"financial manager" ""
```

Required missing variables should invalidate that template instance.

---

# 72. QUERY VALIDATION

Before execution verify:

```text
query not empty
query within source length limit
required variables resolved
syntax valid
not previously executed inside retry window
not duplicate of another generated query
source supports operators used
```

---

# 73. SEARCH BUDGET

Each research task should have limits such as:

```yaml
query_budget:
  low:
  standard:
  high:
  extensive:
  maximum:
```

Query generation must respect the research-priority engine.

Do not run 100 employer-attribution queries for a low-value Manager vacancy.

---

# 74. HIGH-VALUE ROLE PERSISTENCE

For:

```text
HEAD
DIRECTOR
EXECUTIVE
C_SUITE
scarce specialist
```

allow deeper fallback chains.

Higher value means deeper search.

It does not mean weaker evidence thresholds.

---

# 75. SOURCE SWITCHING

If one search surface stops producing information, permit another.

Example:

```text
Google
→ Bing
→ employer ATS
→ LinkedIn
→ agency archive
→ corporate documents
```

Source switching should target the same unresolved question.

---

# 76. STRUCTURED SEARCH FIRST WHERE AVAILABLE

If a source provides reliable:

- role filters;
- geography filters;
- date filters;
- category filters;
- APIs;

prefer those to simulated keyword searches.

`query_templates.yaml` should support both:

```text
text_query
structured_filter
```

---

# 77. VISUAL-INSPECTION TRIGGER

Query results containing:

```text
image
carousel
PDF
poster
graphic
screenshot
```

should be capable of triggering visual inspection.

Do not conclude:

> no vacancy information found

before inspecting relevant visual content.

---

# 78. COMMENTS / REPOST FOLLOW-UP

If a social result is strong but incomplete, query or inspect social trails only when they may resolve:

- employer;
- application route;
- location;
- hiring contact;
- original source.

Do not exhaustively process low-value comments.

---

# 79. QUERY FAMILY INTERDEPENDENCIES

Allow successful searches to trigger downstream families.

Example:

```text
VACANCY_DISCOVERY
    ↓
EMPLOYER_ATTRIBUTION
    ↓
STAKEHOLDER_DISCOVERY
    ↓
CURRENT_EMPLOYMENT
    ↓
CONTACT_INTELLIGENCE
```

Another:

```text
EXECUTIVE_MOVEMENT
    ↓
VACANCY_DISCOVERY
    ↓
WATCHLIST
```

---

# 80. DO NOT EXECUTE UNNECESSARY DOWNSTREAM SEARCHES

If a job fails the:

- functional gate;
- salary gate;
- commercial employer rule;

do not execute expensive stakeholder/contact searches unless an agreed-client exception applies.

---

# 81. CONFIGURABLE QUERY PRIORITY

Suggested levels:

```text
CRITICAL
HIGH
MEDIUM
LOW
EXPLORATORY
```

Examples:

`EXACT REFERENCE NUMBER`

may be `CRITICAL` for employer attribution.

A broad industry keyword query may be `EXPLORATORY`.

---

# 82. TEMPLATE VERSIONING

Each template should have:

```yaml
id:
version:
created_at:
updated_at:
```

Where useful.

Changes to high-impact templates should be measurable against prior performance.

---

# 83. SAFE TEMPLATE CHANGES

Do not replace a productive query family solely because a new version appears elegant.

Compare:

```text
precision
recall
commercial yield
cost
false positives
```

before retiring the old approach.

---

# 84. REQUIRED TEST FIXTURES

Test the query engine against representative scenarios.

## Scenario A — Direct finance vacancy

Known:

```text
Financial Manager
Stellenbosch
Employer known
```

System should generate:

- current vacancy verification;
- direct ATS search;
- stakeholder discovery;
- current-employment verification.

It should **not** perform employer attribution.

---

## Scenario B — Anonymous agency vacancy

Known:

```text
Financial Manager
Stellenbosch
manufacturing
SAP
CA(SA)
agency known
employer unknown
```

System should generate:

- exact phrase searches;
- fingerprint combinations;
- agency/client-history queries;
- possible direct employer copies;
- candidate-employer tests.

---

## Scenario C — LinkedIn silent hiring post

Known:

```text
"We're growing our finance team"
Cape Town
author identified
no explicit job title
```

System should:

- search author/company trail;
- inspect visual content;
- inspect relevant comments;
- search recent company vacancies;
- retain as signal if no specific vacancy emerges.

---

## Scenario D — Hiring manager unknown

Known:

```text
employer confirmed
role confirmed
business unit known
```

System should prioritise:

- functional hierarchy;
- direct manager;
- functional head;
- HRBP/TA route.

It should not spend queries rediscovering the employer.

---

## Scenario E — Email pattern unknown

Known:

```text
person confirmed
employer confirmed
employee domain confirmed
```

System should:

- identify observed addresses for multiple known employees;
- derive pattern;
- classify target address as inferred unless independently observed.

---

# 85. REQUIRED QUERY GENERATION QA

For each generated batch verify:

### Objective

- Is the unresolved question explicit?

### Precision

- Does each query have a reason to exist?

### Expansion

- Was combinatorial explosion prevented?

### Geography

- Were appropriate South African variants used?

### Role

- Were relevant aliases loaded?

### Source

- Is syntax valid for this source?

### History

- Has this exact search already failed?

### Cost

- Is the query effort proportionate to opportunity value?

### Evidence

- What claim can this search resolve?

---

# 86. EXAMPLE YAML PATTERN

The eventual file should resemble this conceptually:

```yaml
version: "1.0"

defaults:
  market: ZA
  deduplicate_queries: true
  exact_first: true
  preserve_failed_query_history: true

query_families:

  social_hiring:

    explicit_role_location:
      priority: high

      sources:
        - google
        - bing

      objective: FIND_NEW_VACANCY

      template:
        - 'site:linkedin.com/posts "{signal_phrase}" "{role_term}" "{location_term}"'

      required_variables:
        - signal_phrase
        - role_term

      optional_variables:
        - location_term

      expansions:
        signal_phrase:
          source: hiring_signal_terms
          limit: 8

        role_term:
          source: role_taxonomy
          tier: close_aliases
          limit: 6

        location_term:
          source: geography_terms
          limit: 6

      confidence_tier: HIGH_PRECISION

      max_generated_queries: 30

      fallback_to:
        - explicit_role_no_location
        - role_location_without_signal


  employer_attribution:

    rare_phrase:
      priority: critical

      objective: IDENTIFY_EMPLOYER

      sources:
        - google
        - bing

      template:
        - '"{rare_phrase}"'
        - '"{rare_phrase}" "{location}"'

      required_variables:
        - rare_phrase

      optional_variables:
        - location

      confidence_tier: HIGH_PRECISION

      max_generated_queries: 10

      stop_on:
        - AUTHORITATIVE_EMPLOYER_MATCH


  stakeholder_resolution:

    functional_head:
      priority: high

      objective: IDENTIFY_HIRING_MANAGER

      template:
        - '"{employer}" "{stakeholder_title}"'
        - 'site:linkedin.com/in "{employer}" "{stakeholder_title}"'

      required_variables:
        - employer
        - stakeholder_title

      max_generated_queries: 12
```

This is an illustrative schema, not a requirement that the final YAML use exactly these names.

---

# 87. QUERY ENGINE OUTPUT

Every generated query object should ideally return:

```yaml
query_id:
template_id:
research_task_id:
job_id:
objective:
source:
query:
confidence_tier:
priority:
variables_used:
reason:
evidence_target:
generated_at:
```

After execution add:

```yaml
executed_at:
status:
result_count:
new_result_count:
relevant_result_count:
evidence_found:
information_gain:
```

---

# 88. QUERY SELECTION RULE

When multiple templates could answer the same question, choose the one with the highest expected:

```text
INFORMATION GAIN
×
PRECISION
×
COMMERCIAL IMPORTANCE
÷
EXECUTION COST
```

The formula need not pretend to produce a statistically calibrated probability.

Its purpose is operational prioritisation.

---

# 89. WHAT `query_templates.yaml` MUST NOT BECOME

Do not turn it into:

- the complete role taxonomy;
- the complete company database;
- a list of every South African town;
- the Source Map;
- the commercial rules engine;
- the seniority classifier;
- a list of hard-coded vacancies;
- a collection of thousands of static Google searches.

It is the **query-construction configuration layer**.

---

# 90. FINAL DESIGN PRINCIPLES

`query_templates.yaml` must enforce the following:

1. Search intent must always be explicit.
2. Search known facts before guessing.
3. Exact and discriminative queries come before broad queries.
4. Small overlapping searches beat enormous Boolean strings.
5. Query expansion must be bounded.
6. Search strategy must reflect current intelligence state.
7. Do not rerun failed searches without a reason.
8. Search syntax must adapt to the source.
9. Role, seniority and geography vocabularies come from their own authoritative files.
10. Employer attribution requires both supporting and contradiction queries.
11. Functional decision-makers are searched separately from HR/TA.
12. Contact discovery begins only after stakeholder relevance.
13. Current facts and historical facts require different queries.
14. Search results must be evaluated by commercial yield, not volume.
15. Every query should target a resolvable evidence gap.
16. High-value opportunities warrant deeper fallback chains.
17. Low-value opportunities should stop earlier.
18. Search progress and failures must persist between runs.
19. Downstream outcomes should improve query prioritisation.
20. Query configuration belongs in YAML rather than being scattered through application code.

The ultimate purpose of `query_templates.yaml` is:

> **Convert each unresolved recruitment-intelligence question into the smallest, highest-value set of searches capable of resolving it.**