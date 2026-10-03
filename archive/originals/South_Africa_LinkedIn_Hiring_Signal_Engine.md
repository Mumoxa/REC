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