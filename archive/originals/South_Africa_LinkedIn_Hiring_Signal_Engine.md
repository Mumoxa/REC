# South African LinkedIn Hiring-Signal Intelligence Engine
## Machine-Readable Build Specification for Talent Tree

**Purpose:**  
Build a repeatable, scalable vacancy-discovery system that starts with LinkedIn hiring signals rather than traditional job boards, then verifies, enriches, deduplicates and prioritises opportunities for commercial recruitment outreach.

---

# 1. Core Principle

> **Do not begin vacancy discovery with job boards. Begin with hiring signals.**

LinkedIn Posts, employee activity, company activity, executive activity, recruiter posts, team-growth signals, role announcements, leadership departures and business-expansion signals should be treated as the **primary discovery layer**.

Job boards, company careers pages and other public sources become **verification and enrichment sources**, not the only discovery source.

The objective is not merely to find published jobs. The objective is to detect:

- confirmed vacancies;
- probable vacancies;
- multi-role hiring campaigns;
- team expansion;
- executive departures;
- newly created functions;
- new offices, plants or operations;
- acquisitions and expansion that may create hiring demand;
- people who repeatedly reveal vacancies before they reach job boards.

The output should therefore function as a **South African hiring-signal radar**, not as a conventional job scraper.

---

# 2. Scope

## 2.1 Geographic Scope

Primary market:

- South Africa

Priority metros and commercial regions:

- Cape Town / Western Cape
- Johannesburg / Gauteng
- Pretoria / Tshwane
- Durban / KwaZulu-Natal
- Gqeberha / Eastern Cape
- Bloemfontein / Free State
- Mbombela / Mpumalanga
- Polokwane / Limpopo
- Rustenburg / North West
- Kimberley / Northern Cape

The system must search beyond city names and include:

- commercial nodes;
- industrial areas;
- business districts;
- suburbs strongly associated with business activity;
- old and new municipal names;
- abbreviations and colloquial names.

---

# 3. Commercial Inclusion Rules

## 3.1 Salary Threshold

Primary commercial focus:

> **Roles estimated or stated above R420,000 per annum.**

Do **not** discard a role during discovery merely because no salary is visible.

Use this order:

1. discover broadly;
2. classify title and seniority;
3. identify employer;
4. estimate salary range;
5. apply the R420k threshold;
6. decide whether the role enters the commercial pipeline.

## 3.2 Excluded Families

Exclude from the commercial recruitment pipeline:

- Sales & Business Development
- Customer / Client Service
- Customer Success
- Financial Advisors
- Financial Planners
- General Administration
- Office Support
- Executive Support

These may still appear during broad discovery but should be filtered after extraction.

---

# 4. Priority Role Families

## Priority 1 — Executive / Leadership

- Chief Executive Officer
- Chief Financial Officer
- Chief Operating Officer
- Chief Technology Officer
- Chief Information Officer
- Chief Data Officer
- Chief Risk Officer
- Managing Director
- Finance Director
- Financial Director
- Commercial Director
- Operations Director
- Engineering Director
- Technology Director
- Legal Director
- HR Director
- Procurement Director
- Supply Chain Director
- Head of Finance
- Head of Technology
- Head of Engineering
- Head of Data
- Head of AI
- Head of Legal
- Head of Risk
- Head of Procurement
- Head of Supply Chain
- Head of HR
- Head of Talent

## Priority 2 — Senior Professional / Management

- Financial Manager
- Finance Manager
- Group Financial Manager
- Financial Controller
- Group Financial Controller
- Management Accountant
- Group Accountant
- Senior Accountant
- Finance Business Partner
- Senior Finance Business Partner
- FP&A Manager
- Commercial Finance Manager
- Treasury Manager
- Tax Manager
- Internal Audit Manager
- Risk Manager
- Senior Software Engineer
- Engineering Manager
- Software Engineering Manager
- Solution Architect
- Enterprise Architect
- Cloud Architect
- DevOps Lead
- Data Engineering Lead
- Data Science Lead
- Analytics Manager
- BI Manager
- Product Owner
- Product Manager
- Procurement Manager
- Strategic Sourcing Manager
- Supply Chain Manager
- Planning Manager
- Legal Counsel
- Senior Legal Counsel
- Compliance Manager
- Governance Manager
- HR Manager
- HR Business Partner
- Talent Acquisition Manager

## Priority 3 — Other Scarce / Specialist Roles

Include where:

- compensation likely exceeds R420k;
- skills are scarce;
- employer is identifiable;
- hiring manager is reachable;
- role appears commercially worth pursuing.

---

# 5. Discovery Architecture

The system should operate as:

```text
LINKEDIN HIRING-SIGNAL ENGINE
        │
        ├── LinkedIn Posts
        │    ├── Native Job Posts
        │    ├── General Posts
        │    ├── Company Posts
        │    ├── Employee Posts
        │    ├── Executive Posts
        │    ├── Recruiter Posts
        │    ├── Reposts
        │    └── Comments / Replies
        │
        ├── External LinkedIn X-Ray
        │    ├── linkedin.com/posts
        │    ├── linkedin.com/feed/update
        │    └── search-engine indexed LinkedIn content
        │
        ├── Company Watch Lists
        │
        ├── Hiring-Signal Author Watch Lists
        │
        ├── Executive Movement Signals
        │
        └── Business Expansion Signals
                │
                ▼
        RAW SIGNAL STORE
                │
                ├── text extraction
                ├── image/document inspection
                └── metadata extraction
                │
                ▼
        VACANCY CLASSIFIER
                │
        ┌───────┼────────┐
        │       │        │
   Confirmed  Probable  Early Signal
        │       │        │
        └───────┼────────┘
                ▼
        DEDUPLICATION
                │
        EMPLOYER ATTRIBUTION
                │
        ROLE / SALARY FILTERING
                │
        COMMERCIAL PRIORITISATION
                │
        HIRING STAKEHOLDER SEARCH
                │
        CONTACT INTELLIGENCE
                │
        CRM / DASHBOARD
```

---

# 6. Hiring-Signal Dictionary

The system should never rely on one phrase such as `#hiring`.

Each signal family should run separately.

---

## H1 — Explicit Hiring

```text
"we're hiring"
"we are hiring"
"now hiring"
"hiring now"
"hiring for"
"hiring a"
"hiring an"
"currently hiring"
"actively hiring"
"we are recruiting"
"we're recruiting"
```

---

## H2 — Vacancy Language

```text
vacancy
vacancies
"open role"
"open roles"
"open position"
"open positions"
"position available"
"positions available"
"role available"
"roles available"
"job opening"
"job openings"
"career opening"
"career openings"
```

---

## H3 — Looking / Searching Language

```text
"looking for"
"we're looking for"
"we are looking for"
"on the lookout"
"searching for"
"we are searching for"
"seeking a"
"seeking an"
"we need someone"
"we need a"
"we need an"
```

---

## H4 — Join-the-Team Language

```text
"join our team"
"join my team"
"join the team"
"join us"
"come join us"
"come join the team"
"come work with us"
"work with us"
```

---

## H5 — Application CTA

```text
"send your CV"
"send CV"
"send your resume"
"CVs to"
"CV to"
"email your CV"
"email your resume"
"apply now"
"apply here"
"apply below"
"applications open"
"submit your CV"
"submit your application"
```

---

## H6 — Informal Contact CTA

```text
"DM me"
"message me"
"reach out"
"reach out to me"
"get in touch"
"contact me"
"drop me a message"
"inbox me"
"feel free to reach out"
```

---

## H7 — Team Growth

```text
"our team is growing"
"we're growing"
"we are growing"
"growing our team"
"expanding our team"
"expanding the team"
"scaling our team"
"building our team"
"building the team"
"strengthening our team"
"growing the department"
"expanding the department"
```

---

## H8 — Leadership Build / New Function

```text
"build the team"
"build out the team"
"build from scratch"
"build the function"
"lead our"
"head up"
"take ownership of"
"own the function"
"establish the function"
"create the function"
"launch the team"
```

---

## H9 — Application Timing

```text
"applications open"
"applications close"
"closing date"
"deadline to apply"
"last day to apply"
"applications are open"
"applications are closing"
```

---

## H10 — Opportunity Language

```text
"exciting opportunity"
"career opportunity"
"new opportunity"
"great opportunity"
"opportunity to join"
"opportunity available"
"opportunity within"
```

---

## H11 — Hashtag Discovery

```text
#hiring
#wearehiring
#hiringnow
#vacancy
#vacancies
#jobalert
#careers
#careeropportunity
#jobopportunity
#jobsinsouthafrica
#southafricajobs
#capetownjobs
#johannesburgjobs
#financejobs
#techjobs
#engineeringjobs
#procurementjobs
```

---

## H12 — Embedded Recruitment Language

```text
"minimum requirements"
"successful candidate"
"ideal candidate"
"the ideal candidate"
"role reports to"
"reporting to"
"responsibilities include"
"key responsibilities"
"job requirements"
"minimum experience"
"required experience"
```

---

# 7. Early-Signal Dictionary

These signals must not be classified as confirmed vacancies unless a role is also found.

---

## 7.1 Executive / Leadership Movement

```text
"time for a new challenge"
"my next chapter"
"my last day"
"moving on"
"leaving the company"
"after many years"
"after X years"
"farewell"
"next adventure"
"stepping down"
"handing over"
"moving to a new role"
"moving into a new chapter"
"leaving my role"
"leaving my position"
```

Combine with senior titles:

```text
CFO
"Chief Financial Officer"
"Finance Director"
"Financial Director"
"Head of Finance"
"Financial Manager"
COO
CTO
CIO
CEO
"Managing Director"
"Head of Legal"
"Head of Procurement"
"Head of Supply Chain"
"Head of HR"
"Head of Data"
"Head of Engineering"
```

Classification:

```text
EARLY_SIGNAL_EXECUTIVE_MOVEMENT
```

---

## 7.2 Business Expansion Signals

```text
"new office"
"new facility"
"new plant"
"new warehouse"
"new operation"
"new business unit"
"new division"
"opening in South Africa"
"expanding into South Africa"
"expanding in South Africa"
"expanding into Africa"
"Africa expansion"
"South Africa office"
"new contract"
"major contract"
"contract awarded"
"new investment"
"funding round"
"new funding"
"acquisition completed"
"acquired by"
"merged with"
"new site"
"new branch"
"new factory"
"new distribution centre"
"new distribution center"
```

Classification:

```text
EARLY_SIGNAL_BUSINESS_EXPANSION
```

---

# 8. Geographic Ontology

The system should store geography in structured clusters.

---

## 8.1 National

```text
South Africa
South African
SA
ZA
Remote South Africa
South Africa Remote
Nationwide
```

---

## 8.2 Western Cape

### Province / Metro

```text
Western Cape
Cape Town
CPT
Cape Metropole
Cape Peninsula
Winelands
Cape Winelands
```

### Commercial / Industrial Nodes

```text
Stellenbosch
Paarl
Bellville
Durbanville
Brackenfell
Kraaifontein
Century City
Montague Gardens
Epping
Epping Industria
Airport Industria
Blackheath
Atlantis
Paarden Eiland
Woodstock
Salt River
Claremont
Newlands
Constantia
Somerset West
Strand
Bellville South
Parow
Goodwood
Tokai
Westlake
Foreshore
V&A Waterfront
Waterfront
Diep River
Ottery
Maitland
Ndabeni
Retreat
Brackenfell Industrial
Saxenburg Park
Stikland
Tyger Valley
Tygervalley
Northern Suburbs
Southern Suburbs
```

---

## 8.3 Gauteng

### Province / Metro

```text
Gauteng
Johannesburg
Joburg
JHB
Pretoria
Tshwane
Ekurhuleni
East Rand
West Rand
```

### Commercial / Industrial Nodes

```text
Sandton
Rosebank
Bryanston
Fourways
Randburg
Midrand
Waterfall
Centurion
Bedfordview
Germiston
Boksburg
Kempton Park
Edenvale
Isando
Jet Park
Alberton
Roodepoort
Woodmead
Rivonia
Illovo
Melrose Arch
Parktown
Midrand
Samrand
Menlyn
Hatfield
Silver Lakes
Rosslyn
Olifantsfontein
Wadeville
Spartan
Linbro Park
Longmeadow
```

---

## 8.4 KwaZulu-Natal

```text
KwaZulu-Natal
KZN
Durban
Umhlanga
La Lucia
Pinetown
Westville
Ballito
Mount Edgecombe
Riverhorse Valley
New Germany
Prospecton
Richards Bay
Pietermaritzburg
```

---

## 8.5 Eastern Cape

```text
Eastern Cape
Gqeberha
Port Elizabeth
PE
East London
Coega
Coega IDZ
Kariega
Uitenhage
```

---

## 8.6 Free State

```text
Free State
Bloemfontein
Sasolburg
Welkom
```

---

## 8.7 Mpumalanga

```text
Mpumalanga
Mbombela
Nelspruit
Witbank
eMalahleni
Secunda
Middelburg
```

---

## 8.8 Limpopo

```text
Limpopo
Polokwane
Lephalale
Mokopane
Tzaneen
```

---

## 8.9 North West

```text
North West
Rustenburg
Brits
Potchefstroom
Klerksdorp
```

---

## 8.10 Northern Cape

```text
Northern Cape
Kimberley
Upington
Kathu
Postmasburg
```

---

# 9. Search Matrix

The core matrix is:

```text
HIRING SIGNAL
×
ROLE FAMILY
×
GEOGRAPHY
×
RECENCY
```

The engine should produce **many short overlapping searches**, not a few massive Boolean searches.

---

# 10. Search Lane A — Signal + Geography

Examples:

```text
"we're hiring" AND "Cape Town"
```

```text
"send your CV" AND Johannesburg
```

```text
"join our team" AND Stellenbosch
```

```text
"looking for" AND Sandton AND hiring
```

```text
"our team is growing" AND Durban
```

```text
"applications close" AND Gauteng
```

```text
"CVs to" AND "Western Cape"
```

```text
#hiring AND Midrand
```

Purpose:

- broad discovery;
- catch multi-role posts;
- discover unusual titles;
- discover direct-employer posts that do not match known title taxonomies.

---

# 11. Search Lane B — Role First

---

## 11.1 Executive Finance

```text
CFO
"Chief Financial Officer"
"Finance Director"
"Financial Director"
"Group Finance Director"
"Head of Finance"
"Group Head of Finance"
```

Example:

```text
("CFO" OR "Chief Financial Officer")
AND
(hiring OR vacancy OR opportunity)
```

---

## 11.2 Finance Management

```text
"Financial Manager"
"Finance Manager"
"Group Financial Manager"
"Senior Financial Manager"
"Commercial Finance Manager"
"Regional Finance Manager"
"Divisional Finance Manager"
```

Example:

```text
("Financial Manager" OR "Finance Manager")
AND
(hiring OR vacancy OR opportunity)
```

---

## 11.3 Financial Control

```text
"Financial Controller"
"Finance Controller"
"Group Financial Controller"
"Regional Financial Controller"
"Commercial Controller"
```

---

## 11.4 Accounting Leadership

```text
"Group Accountant"
"Senior Accountant"
"Management Accountant"
"Group Reporting Accountant"
"Reporting Accountant"
"Consolidations Accountant"
"Technical Accountant"
"Financial Accountant"
```

---

## 11.5 FP&A / Commercial Finance

```text
"FP&A Manager"
"Financial Planning Manager"
"Commercial Finance Manager"
"Finance Business Partner"
"Senior Finance Business Partner"
"Commercial Manager"
```

---

## 11.6 Treasury

```text
"Head of Treasury"
"Treasury Manager"
"Senior Treasury Manager"
"Group Treasurer"
```

---

## 11.7 Tax

```text
"Head of Tax"
"Tax Manager"
"Group Tax Manager"
"International Tax Manager"
```

---

## 11.8 Internal Audit / Risk

```text
"Head of Internal Audit"
"Internal Audit Manager"
"Risk Manager"
"Head of Risk"
"Chief Risk Officer"
"Governance Risk"
```

---

## 11.9 Technology

```text
"Chief Technology Officer"
CTO
"Chief Information Officer"
CIO
"Technology Director"
"Head of Technology"
"Head of Engineering"
"Engineering Manager"
"Software Engineering Manager"
"Senior Software Engineer"
"Solution Architect"
"Enterprise Architect"
"Cloud Architect"
"DevOps Lead"
"Platform Lead"
```

---

## 11.10 Data / AI / Analytics

```text
"Chief Data Officer"
"Head of Data"
"Head of AI"
"Head of Analytics"
"Data Engineering Manager"
"Data Engineering Lead"
"Data Science Manager"
"Data Science Lead"
"Analytics Manager"
"BI Manager"
"Business Intelligence Manager"
"AI Lead"
"Machine Learning Lead"
```

---

## 11.11 Procurement / Supply Chain

```text
"Chief Procurement Officer"
"Procurement Director"
"Head of Procurement"
"Procurement Manager"
"Strategic Sourcing Manager"
"Category Manager"
"Supply Chain Director"
"Head of Supply Chain"
"Supply Chain Manager"
"Planning Manager"
"Demand Planning Manager"
```

---

## 11.12 Legal / Compliance

```text
"General Counsel"
"Legal Director"
"Head of Legal"
"Senior Legal Counsel"
"Legal Counsel"
"Compliance Director"
"Head of Compliance"
"Compliance Manager"
"Governance Manager"
"Company Secretary"
```

---

## 11.13 HR / Talent Leadership

```text
"HR Director"
"People Director"
"Head of HR"
"Head of People"
"HR Manager"
"HR Business Partner"
"Head of Talent"
"Talent Acquisition Manager"
"Recruitment Manager"
```

---

# 12. Search Lane C — Seniority First

This lane is designed to catch unusual titles.

Examples:

```text
"Vice President" AND hiring
```

```text
Director AND "Cape Town" AND hiring
```

```text
"Head of" AND vacancy AND Johannesburg
```

```text
"Senior Manager" AND "join our team"
```

```text
Executive AND "we're hiring"
```

```text
Lead AND hiring AND "South Africa"
```

Senior titles to search:

```text
Chief
Executive
Director
"Vice President"
VP
"Head of"
"General Manager"
"Senior Manager"
Lead
Principal
```

---

# 13. Search Lane D — Functional Noun Search

Useful when a post contains no formal title.

## Finance

```text
finance AND hiring
accounting AND hiring
treasury AND hiring
tax AND hiring
audit AND hiring
FP&A AND hiring
"commercial finance" AND hiring
```

## Technology

```text
software AND hiring
engineering AND hiring
cloud AND hiring
DevOps AND hiring
architecture AND hiring
cybersecurity AND hiring
technology AND hiring
```

## Data

```text
data AND hiring
analytics AND hiring
AI AND hiring
"machine learning" AND hiring
"business intelligence" AND hiring
```

## Procurement / Supply Chain

```text
procurement AND hiring
purchasing AND hiring
sourcing AND hiring
"supply chain" AND hiring
planning AND hiring
```

## Legal / Governance

```text
legal AND hiring
counsel AND hiring
compliance AND hiring
governance AND hiring
risk AND hiring
```

---

# 14. Search Lane E — Company Watch

Every meaningful employer discovered should enter a watch list.

For each company, run:

```text
"[company]" AND hiring
"[company]" AND vacancy
"[company]" AND "join our team"
"[company]" AND "looking for"
"[company]" AND careers
"[company]" AND recruitment
"[company]" AND "we're growing"
"[company]" AND "applications open"
```

Watch:

- company page;
- executives;
- functional leaders;
- HR;
- talent acquisition;
- finance leadership;
- technology leadership;
- procurement leadership.

---

# 15. Search Lane F — Hiring-Signal Author Watch

Whenever a useful hiring post is discovered, capture the author.

Store:

```yaml
name:
linkedin_url:
current_company:
current_title:
function:
industry:
location:
author_type:
  - internal_recruiter
  - executive
  - department_head
  - employee
  - external_recruiter
  - agency
frequency_of_hiring_posts:
roles_posted:
last_hiring_post_date:
useful_posts_count:
priority:
```

### Tier A — Strong Sensor

Repeatedly posts genuine vacancies.

Typical examples:

- HR Director
- Talent Acquisition Manager
- Internal Recruiter
- CFO
- CIO
- CTO
- Finance Director
- Head of Engineering
- Head of Data
- Head of Procurement

### Tier B — Occasional Sensor

Department heads or employees who occasionally amplify jobs.

### Tier C — Noise

- applicants;
- people commenting “interested”;
- generic engagement;
- unrelated recruitment content.

---

# 16. Search Lane G — External LinkedIn X-Ray

Use public search engines as an independent LinkedIn index.

Examples:

```text
site:linkedin.com/posts "we're hiring" "South Africa"
```

```text
site:linkedin.com/posts "we are hiring" "Cape Town"
```

```text
site:linkedin.com/posts "send your CV" Johannesburg
```

```text
site:linkedin.com/posts "Financial Manager" hiring "Cape Town"
```

```text
site:linkedin.com/posts "Head of Finance" hiring
```

```text
site:linkedin.com/posts "Finance Director" "South Africa"
```

```text
site:linkedin.com/posts CFO hiring "South Africa"
```

```text
site:linkedin.com/posts "join our team" Stellenbosch
```

```text
site:linkedin.com/posts "our team is growing" Gauteng
```

```text
site:linkedin.com/posts "time for a new challenge" CFO "South Africa"
```

Also test:

```text
site:linkedin.com/feed/update/
```

---

# 17. Time Slicing

Do not assume the first page of results represents the whole market.

Break searches down by:

- last 24 hours;
- last 3 days;
- last 7 days;
- last 30 days;
- geography;
- title family;
- functional family;
- seniority;
- company;
- author;
- industry.

If a query is too broad, subdivide it.

Example:

```text
"we're hiring" South Africa
```

becomes:

```text
"we're hiring" Cape Town
"we're hiring" Johannesburg
"we're hiring" Durban
"we're hiring" Pretoria
```

Then:

```text
"we're hiring" finance Cape Town
"we're hiring" technology Cape Town
"we're hiring" procurement Cape Town
```

---

# 18. Image / PDF / Carousel Inspection

A text-only scanner is insufficient.

When a post contains:

- hiring language;
- insufficient job detail;
- an image;
- a PDF;
- a carousel;
- a graphic;
- a screenshot;

the engine should inspect the attached visual content.

Extract where possible:

```text
role title
employer
location
salary
requirements
closing date
contact person
email address
application URL
employment type
hybrid/remote/on-site status
```

---

# 19. Comments and Replies

Do not scrape all comments indiscriminately.

Inspect comments only where:

- the post is commercially valuable;
- the application link is missing;
- location is unclear;
- the author may have added more information;
- the hiring manager has replied;
- another employee confirms the role.

Prioritise comments by:

1. original author;
2. company employee;
3. HR / TA;
4. functional leader;
5. recruiter;
6. other commenters.

---

# 20. Repost / Social Trail Logic

Classify each social signal:

```text
ORIGINAL_POST
SHARED_JOB
REPOST
COMMENT
REACTION_SURFACE
```

When a repost is discovered:

1. trace to the original post;
2. identify original author;
3. identify amplifying employee;
4. store both;
5. assess whether either person is commercially useful.

The social trail should be stored because:

- original author may be the hiring manager;
- amplifier may provide internal access;
- repeated amplifiers can become future hiring sensors.

---

# 21. Raw Signal Record Schema

```yaml
signal_id:
source_platform: linkedin
source_type:
  - post
  - job_card
  - company_post
  - employee_post
  - executive_post
  - recruiter_post
  - repost
  - comment
  - xray_result

source_url:
discovered_at:
posted_at:
original_post_url:

author:
  name:
  title:
  company:
  linkedin_url:
  location:
  author_type:

post_text:
has_image:
has_pdf:
has_carousel:
has_job_card:

entities:
  companies:
  people:
  locations:
  emails:
  urls:
  phone_numbers:
  hashtags:

detected_signals:
  hiring_terms:
  role_terms:
  seniority_terms:
  geography_terms:
  expansion_terms:
  movement_terms:

classification:
confidence:
```

---

# 22. Vacancy Classification

Use:

```text
CONFIRMED_VACANCY
PROBABLE_VACANCY
MULTI_ROLE_HIRING
EARLY_HIRING_SIGNAL
EXECUTIVE_DEPARTURE
BUSINESS_EXPANSION
HIRING_AUTHOR
REPOST
AGENCY_ADVERT
IRRELEVANT
```

## Confirmed Vacancy

Evidence includes:

- explicit vacancy wording;
- title;
- application instruction;
- native job card;
- company career page;
- clear employer post.

## Probable Vacancy

Strong recruitment signal but incomplete confirmation.

## Early Hiring Signal

Examples:

- executive resignation;
- team expansion;
- new plant;
- new business unit;
- acquisition;
- funding;
- new office.

---

# 23. Vacancy Record Schema

```yaml
vacancy_id:

role:
  raw_title:
  normalized_title:
  function:
  seniority:
  level:
  priority_family:

employer:
  name:
  confirmed:
  confidence:
  direct_employer:
  industry:
  company_size:
  ownership:
  jse_listed:
  location:

location:
  raw:
  normalized:
  province:
  metro:
  node:
  remote_status:

compensation:
  salary_stated:
  salary_min:
  salary_max:
  estimated_salary_min:
  estimated_salary_max:
  estimated_above_420k:
  confidence:

employment:
  permanent:
  contract:
  contract_length:
  full_time:
  hybrid:
  remote:
  on_site:

application:
  method:
  url:
  email:
  contact_name:
  closing_date:

discovery:
  source:
  source_url:
  author:
  author_title:
  author_company:
  original_or_repost:
  discovered_at:
  posted_at:

verification:
  careers_page_found:
  linkedin_job_found:
  external_job_board_found:
  multiple_sources:
  last_verified_at:

commercial:
  target_family:
  excluded_family:
  salary_rule_pass:
  direct_employer_identified:
  existing_client:
  agreement_exists:
  hiring_manager_found:
  contact_data_found:
  priority:

status:
  - active
  - closed
  - unknown
  - filled
```

---

# 24. Employer Attribution Workflow

When employer is unclear:

```text
Post
 ↓
Author
 ↓
Author employer
 ↓
Mentioned companies
 ↓
Tagged company
 ↓
Hashtags
 ↓
Job description wording
 ↓
Location
 ↓
Industry clues
 ↓
Company careers sites
 ↓
Other adverts
 ↓
Employee movements
 ↓
Likely employer shortlist
```

For senior roles, effort must increase substantially.

---

# 25. Senior Role Escalation Rules

For:

```text
Chief
C-suite
Vice President
Director
Head
Executive
General Manager
Senior Lead
```

do not discard merely because the employer is unclear.

Escalate research.

Minimum additional checks:

- original post;
- author employer;
- current employer activity;
- tagged companies;
- comments;
- company careers pages;
- related LinkedIn jobs;
- similar wording elsewhere;
- location;
- role scope;
- company scale;
- recent executive departures;
- company acquisitions / expansion;
- likely reporting line.

---

# 26. Commercial Qualification

Process:

```text
Is salary stated?
        │
   ┌────┴────┐
   │         │
  YES        NO
   │         │
>R420k?   Estimate from:
           - title
           - industry
           - employer size
           - geography
           - seniority
           - market data
```

Then:

```text
Likely > R420k?
        ↓
Target job family?
        ↓
Direct employer identifiable?
        ↓
Commercially approachable?
        ↓
Existing agreement?
        ↓
Decision-maker identifiable?
```

Output:

```text
PRIORITY_1
PRIORITY_2
PRIORITY_3
REJECT
```

---

# 27. Suggested Priority Logic

## Priority 1

Any of:

- C-suite;
- director;
- VP;
- head-level;
- scarce skills;
- finance leadership;
- technology leadership;
- data / AI leadership;
- legal leadership;
- procurement / supply-chain leadership;
- employer already has agreement with Talent Tree;
- hiring manager directly visible;
- candidate market known to be scarce;
- job not yet widely advertised.

## Priority 2

- senior manager;
- specialist professional role;
- compensation probably above R420k;
- direct employer identifiable;
- strong commercial fit.

## Priority 3

- relevant but lower urgency;
- unclear salary;
- employer difficult to access;
- role widely advertised;
- low differentiation.

## Reject

- excluded family;
- likely under R420k;
- non-South-African role outside scope;
- duplicate;
- clearly filled / closed;
- spam;
- applicant post;
- irrelevant content.

---

# 28. Deduplication

A single vacancy may appear as:

- company post;
- hiring-manager post;
- employee repost;
- LinkedIn Job;
- company careers page;
- agency advert;
- job board;
- external search result.

Do not create separate vacancies.

Match using:

```text
normalized employer
normalized title
location
employment type
posting date proximity
job description similarity
application URL
application email
reference number
hiring manager
```

Create:

```yaml
canonical_vacancy_id:
source_count:
sources:
  - type:
    url:
    author:
    posted_at:
```

---

# 29. Self-Learning Signal Expansion

The hiring-signal dictionary must evolve.

When a newly discovered phrase repeatedly yields valid jobs:

Example:

```text
"strengthening our team"
```

Store:

```yaml
candidate_signal:
phrase: "strengthening our team"
times_seen:
valid_jobs_found:
false_positive_rate:
first_seen:
last_seen:
status:
  - candidate
  - approved
  - rejected
```

Promote to active search phrase when validated.

Repeat for:

- hashtags;
- role-title variants;
- location variants;
- employer phrases;
- application wording;
- seniority wording.

---

# 30. Query Generator

Conceptual logic:

```python
for signal in hiring_signals:
    for geography in priority_geographies:
        search(signal, geography)

for role_family in role_families:
    for signal in priority_signals:
        search(role_family, signal)

for seniority in seniority_terms:
    for geography in major_metros:
        search(seniority, geography, "hiring")

for company in watched_companies:
    for signal in company_signals:
        search(company, signal)

for author in watched_authors:
    inspect_recent_posts(author)

for movement_signal in executive_movement_signals:
    for senior_title in executive_titles:
        search(movement_signal, senior_title, "South Africa")
```

---

# 31. Query Object Schema

```yaml
query_id:
channel:
  - linkedin_posts
  - linkedin_job_posts
  - external_xray
  - company_watch
  - author_watch
  - executive_movement
  - expansion_signal

query_text:
signal_family:
role_family:
geography:
company:
author:
seniority:
recency:
priority:
last_run:
next_run:
results_found:
new_results:
valid_results:
false_positive_rate:
```

---

# 32. Search Cadence

| Frequency | Search Type |
|---|---|
| Daily | CFO / C-suite / Director / Head roles |
| Daily | Explicit hiring phrases |
| Daily | `send CV`, `looking for`, `join my team`, `we're hiring` |
| Daily | Tier A Hiring Signal Authors |
| Daily | Existing Talent Tree clients |
| 2–3x weekly | Manager-level functional searches |
| 2–3x weekly | Priority metro searches |
| Weekly | Broad South Africa location sweeps |
| Weekly | Executive movement |
| Weekly | Expansion / acquisition / new plant |
| Weekly | Company watch refresh |
| Monthly | Dictionary refresh |
| Monthly | Hiring-signal author scoring refresh |

---

# 33. Output Dashboard Fields

Each vacancy should display:

```text
Role
Employer
Location
Date discovered
Date posted
Source
Original author
Author title
Confirmed / probable / early signal
Seniority
Salary stated / estimated
R420k qualification
Direct employer confidence
Hiring manager
Contact status
Existing agreement
Commercial priority
Latest verification
Application deadline
Duplicate sources
```

---

# 34. Dashboard Filters

Required filters:

```text
Province
Metro
Commercial node
Role family
Seniority
Salary band
Priority
Confirmed / probable / signal
Direct employer confidence
Existing client
Hiring manager found
Contact found
Source type
Date discovered
Date posted
Remote / Hybrid / On-site
Permanent / Contract
```

---

# 35. Core KPI Metrics

Track:

```text
New signals found
Confirmed vacancies
Probable vacancies
Early signals
Vacancies before job-board publication
Direct-employer jobs
Agency jobs
Vacancies above R420k
Priority 1 roles
Hiring managers identified
Contact details identified
Existing-client vacancies
New employer opportunities
Duplicate-source count
Average time from social signal to formal advert
False-positive rate
Signal phrase yield
Query yield
```

---

# 36. Detection of Multi-Role Posts

Some posts advertise several roles in one message.

Example:

```text
We're hiring:
- Financial Manager
- Procurement Manager
- Data Engineer
```

Create:

```text
ONE SOURCE RECORD
     ↓
THREE VACANCY RECORDS
```

Each vacancy should retain:

```yaml
parent_signal_id:
```

---

# 37. Recruiter / Agency Logic

Do not automatically reject agency posts.

Instead classify:

```text
AGENCY_ADVERT
```

Then try to identify the direct employer.

Research effort should scale with role seniority.

### Lower-level / low-value role

If employer cannot be identified quickly:

```text
MOVE ON
```

### Director / Head / Executive role

Use deeper attribution:

```text
Agency wording
+ location
+ industry
+ salary
+ reporting line
+ company size
+ job description wording
+ other adverts
+ company movement
+ social posts
```

Output:

```text
Likely employer shortlist
Confidence per employer
Evidence
```

---

# 38. Existing Client Priority

Existing agreed clients should receive special monitoring.

If a watched client posts:

```text
hiring
vacancy
join our team
new position
growing
new office
new contract
```

the role should be surfaced at high priority even when Talent Tree has not yet received the assignment.

Suggested tag:

```text
EXISTING_CLIENT_PROACTIVE_OPPORTUNITY
```

---

# 39. Contact Intelligence Layer

For each Priority 1 or Priority 2 vacancy, identify:

```text
Hiring manager
Functional head
Department head
HR / Talent Acquisition
Executive sponsor
Direct reporting manager
Internal recruiter
```

Preferred order:

1. functional hiring manager;
2. relevant executive;
3. talent acquisition;
4. HR business partner;
5. generic recruitment contact.

Avoid defaulting to a generic careers mailbox if a decision-maker is visible.

---

# 40. Final Operating Workflow

```text
DISCOVER
    ↓
COLLECT
    ↓
NORMALISE
    ↓
CLASSIFY
    ↓
EXTRACT IMAGE / PDF CONTENT
    ↓
DEDUPLICATE
    ↓
IDENTIFY DIRECT EMPLOYER
    ↓
VERIFY
    ↓
ESTIMATE SALARY
    ↓
APPLY ROLE / SALARY FILTER
    ↓
PRIORITISE
    ↓
IDENTIFY HIRING MANAGER
    ↓
FIND CONTACT INTELLIGENCE
    ↓
PUSH TO DASHBOARD / CRM
    ↓
MONITOR FOR CHANGES
```

---

# 41. Initial Machine-Readable File Structure

Recommended project files:

```text
linkedin_signals.json
executive_movement_signals.json
business_expansion_signals.json
south_africa_locations.json
role_taxonomy.json
excluded_role_families.json
seniority_terms.json
query_templates.json
watched_companies.json
watched_authors.json
classification_rules.json
employer_attribution_rules.json
salary_rules.json
commercial_priority_rules.json
deduplication_rules.json
signal_learning_rules.json
```

---

# 42. Initial Search Volume

Recommended first deployment:

```text
~30 core hiring phrases
×
~30 priority location clusters
×
~20 role / functional families
```

Do not execute every theoretical combination.

Prune combinations based on usefulness.

Target:

```text
500–1,000 recurring high-value micro-searches
```

plus:

```text
company watches
author watches
executive movement searches
business expansion searches
external X-ray searches
```

---

# 43. Success Definition

The system is successful if it increasingly finds:

1. roles before they appear on major job boards;
2. roles distributed only through LinkedIn social activity;
3. hiring managers directly connected to vacancies;
4. executive movements that predict openings;
5. company growth events that predict recruitment demand;
6. direct-employer vacancies hidden behind recruiter adverts;
7. vacancies at existing clients before Talent Tree is formally briefed;
8. scarce-skill opportunities above R420k;
9. recurring people and companies that act as high-quality hiring sensors.

The long-term competitive advantage is not simply a bigger job database.

It is a **self-learning network of hiring signals, companies, hiring managers, role patterns and market movements across South Africa**.