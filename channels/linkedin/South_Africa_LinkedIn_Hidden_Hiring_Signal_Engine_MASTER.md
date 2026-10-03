# South Africa LinkedIn Hidden Hiring-Signal Discovery Engine
## Master Search & Surfacing Instruction

**Primary objective:**  
Use LinkedIn as a live hiring-intelligence network, not merely as a job board.

The purpose of this instruction is to surface **South African job opportunities being distributed socially on LinkedIn**, including opportunities that are:

- posted directly by companies;
- posted directly by hiring managers;
- posted by executives or department heads;
- posted by internal recruiters or HR teams;
- shared by employees;
- reposted by users without additional text;
- reposted with personal commentary;
- surfaced because a user liked or commented on the original post;
- promoted through employee referrals;
- placed inside images, posters, PDFs, documents or carousels;
- mentioned in comments rather than the main post;
- linked through an ATS or company careers page from an ordinary LinkedIn post;
- described only as an “opportunity”, “opening”, “join my team”, “we are growing”, or similar wording;
- announced through a team-growth, business-expansion or leadership-change post;
- discoverable through the activity of people who repeatedly amplify vacancies;
- indexed externally even when they are difficult to find through ordinary LinkedIn job search.

This engine is intentionally **role-agnostic**. It does not decide which professions, salary bands, functions or levels should ultimately enter a recruitment pipeline. Its job is to **surface the opportunity and preserve the evidence trail**. Any downstream commercial, role, salary or client rules should be applied after this discovery layer.

---

# 1. Geographic Focus

Search **South Africa only**.

Apply geographic effort in this order:

1. **Western Cape**
2. **Gauteng**
3. **KwaZulu-Natal**
4. **South Africa / national catch-all and the remaining provinces**

The search engine must not treat the words “South Africa” as sufficient geographic coverage. Many users post only the city, suburb, business district, industrial area or province.

For that reason, the discovery engine must run both:

- broad country-level searches; and
- granular place-name searches.

---

# 2. Core Search Philosophy

The central principle is:

> **Search activity, not only adverts.**

A LinkedIn vacancy can travel through the platform in many forms.

The original source may be a company page, but the opportunity may reach the market through:

- an employee repost;
- a colleague’s comment;
- a hiring manager saying “come join my team”;
- a recruiter sharing a job card;
- a CFO or CIO sharing an opportunity from their department;
- a connection liking a vacancy and causing it to appear in the feed;
- an employee tagging another person;
- a user saying “please share with your network”;
- a post containing only a graphic;
- a repost of a repost;
- a comment added to an old post;
- a company mention inside an employee post;
- an ATS link shared as a normal post;
- a public LinkedIn post indexed by a search engine.

The engine must therefore scan the **social distribution graph around vacancies**, not just the vacancy itself.

---

# 3. Discovery Surfaces

Every scan should cover the following LinkedIn surfaces.

## 3.1 LinkedIn Posts Search

Use the main LinkedIn search bar and switch to **Posts**.

Run keyword searches across:

- all posts;
- recent posts;
- job-related posts;
- member posts;
- company posts;
- reposts surfaced in results;
- posts mentioning companies;
- posts mentioning people.

Where available, use LinkedIn post-search filters such as:

- Sort by;
- Date posted;
- Content type;
- From member;
- From company;
- Posted by;
- Mentioning member;
- Mentioning company;
- Author industry;
- Author company.

Use these filters to create multiple views of the same search rather than relying on one result set.

---

## 3.2 LinkedIn Job-Post Content Type

Run a dedicated search lane using LinkedIn’s **Job posts** content type.

This is a discovery lane, not the full system.

The same keyword should also be run in **All Posts**, because socially distributed vacancies can exist outside the Job posts classification.

Example search pair:

```text
"we're hiring" + Western Cape + Job posts
```

and:

```text
"we're hiring" + Western Cape + All Posts
```

---

## 3.3 Member Activity

For high-value people, open their profile and inspect **Activity**.

Review:

- posts;
- comments;
- articles where relevant;
- visible repost activity;
- recent interactions connected to hiring.

This is one of the strongest methods for surfacing vacancies that do not rank highly in normal search.

Typical people to inspect include:

- internal recruiters;
- talent acquisition professionals;
- HR leaders;
- business leaders;
- department heads;
- executives;
- employees who repeatedly repost jobs;
- well-connected industry professionals who regularly amplify vacancies.

The objective is not simply to inspect what they authored.

The objective is to identify **what hiring content they are touching**.

---

## 3.4 Company Page Posts

For South African employers discovered during scanning, inspect the company’s LinkedIn page and recent posts.

Search for:

- hiring posts;
- job cards;
- team announcements;
- employee referral campaigns;
- graduate/professional hiring campaigns;
- “join us” posts;
- new department announcements;
- expansion posts;
- new office/site openings;
- links to career opportunities;
- hiring graphics;
- posts that tag employees who are leading the hiring.

A company may not advertise the vacancy through LinkedIn Jobs but may still publish it socially.

---

## 3.5 Employee Posts About Their Employer

Use:

- company-name keyword searches;
- Mentioning company;
- Author company;
- From member;
- employee activity inspection.

Search for ordinary employees posting:

```text
we are hiring
we're hiring
my team is hiring
our team is hiring
come join us
join my team
join our team
we have an opening
we have a vacancy
opportunity in my team
role in my team
role on my team
```

This is a major hidden-job lane.

---

## 3.6 Repost Chains

Treat reposts as first-class discovery objects.

For any promising vacancy post:

1. open the post;
2. inspect the visible repost count;
3. review people who reposted it;
4. identify reposts with added commentary;
5. identify direct reposts with no commentary;
6. capture each useful amplifier;
7. inspect the amplifier’s Activity;
8. identify whether the amplifier repeatedly shares vacancies;
9. add high-yield amplifiers to the watch list;
10. follow connected reposts back to the original source;
11. preserve the full chain.

Represent the chain as:

```text
ORIGINAL COMPANY / HIRING POST
        ↓
REPOST WITH THOUGHTS
        ↓
DIRECT REPOST
        ↓
COMMENT / LIKE / NETWORK SURFACE
        ↓
DISCOVERY
```

A reposted vacancy is not noise. It is both:

- a vacancy signal; and
- a clue to another person who may repeatedly surface future vacancies.

---

# 4. Silent-Repost Discovery

A silent repost is a vacancy shared without meaningful new text.

Keyword search alone may not expose the reposter because the useful words belong to the original post.

Therefore run a separate **amplifier-discovery workflow**.

## 4.1 Seed From Known Vacancy Posts

For every confirmed hiring post found:

- inspect who reposted it;
- record reposters;
- inspect each reposter’s recent activity;
- look for additional job cards and hiring posts;
- identify recurring companies;
- identify recurring hiring themes;
- identify other users whose posts they repost.

## 4.2 Build an Amplifier Graph

Store:

```yaml
person:
current_company:
current_title:
linkedin_profile:
first_seen:
last_seen:
vacancy_posts_amplified:
companies_amplified:
original_posts_found:
reposts_found:
comments_on_hiring_posts:
signal_strength:
```

Use simple tiers:

```text
TIER A = repeatedly surfaces genuine hiring opportunities
TIER B = occasionally surfaces genuine hiring opportunities
TIER C = incidental engagement
```

## 4.3 Expand From Tier A Amplifiers

For each Tier A person:

- inspect recent Activity;
- search their name + hiring phrases;
- use From member filters;
- review posts they commented on;
- review posts they reposted;
- note employers they repeatedly amplify;
- note other high-signal people appearing in the same repost network.

Continue until the scan stops yielding new high-signal people or employers.

This creates a **self-expanding South African hiring-signal network**.

---

# 5. Feed-Based Discovery

The LinkedIn home feed itself is a discovery source.

Pay close attention to feed headers such as:

```text
[Name] reposted this
[Name] commented
[Name] likes this
[Name] and [Name] like this
[Name] shared this
```

When the underlying post contains a vacancy or hiring signal:

1. capture the underlying vacancy;
2. capture the original author;
3. capture the person whose activity caused the post to surface;
4. capture the company;
5. classify the relationship:
   - original author;
   - reposter;
   - commenter;
   - liker/reactor;
   - employee amplifier;
   - recruiter amplifier.

The feed is valuable because it exposes **second-order and third-order vacancy distribution**.

A job does not have to be authored by someone in the network to become visible through network activity.

---

# 6. Comment-Led Discovery

Comments can expose jobs that are not obvious in the main post.

Inspect comments where:

- the post looks like a hiring announcement;
- the main post says “link in comments”;
- the application email is missing;
- the author promises more detail below;
- a recruiter comments on another person’s post;
- an employee adds a job link;
- the hiring manager answers questions;
- someone tags a colleague into a vacancy;
- a user says “we are hiring too”;
- a recruiter responds with a live opportunity.

High-priority comment authors:

1. original post author;
2. hiring manager;
3. employee of the hiring company;
4. HR / talent acquisition;
5. recruiter;
6. executive;
7. department head.

For known high-signal people, inspect their Activity for **Comments** as a separate discovery route.

---

# 7. Direct Employer Advertising Patterns

Do not assume direct employer advertising looks like a formal job advert.

Search for posts such as:

```text
We're hiring
We are hiring
Now hiring
Hiring now
We're recruiting
We are recruiting
We're looking for
We are looking for
Looking for someone to join us
Come join us
Join our team
Join the team
Join my team
Come work with us
Opportunity to join
Exciting opportunity
Career opportunity
We have an opening
We have a vacancy
Open position
Open role
Applications are open
Applications close
Please apply
Apply here
Apply below
Send your CV
Send CVs
Email your CV
Submit your CV
```

Also search shorter text combinations because many direct posts contain very little prose.

---

# 8. Employee Referral / Personal-Network Language

These phrases are especially important because they often appear in posts that are not formal adverts.

Search:

```text
my team is hiring
our team is hiring
hiring in my team
hiring into my team
join my team
join our team
come join my team
come join us
role in my team
role on my team
opening in my team
vacancy in my team
opportunity in my team
we need someone
I am hiring
I'm hiring
I’m hiring
we're looking for someone
looking for someone
know someone who
if you know someone
please share
please share with your network
share with your network
repost appreciated
please repost
referrals welcome
referrals are welcome
refer someone
tag someone
spread the word
help me find
help us find
looking for recommendations
```

This family should receive heavy attention.

---

# 9. Repost / Amplification Language

Search directly for wording that suggests someone is amplifying another person’s vacancy.

```text
reposting
repost
sharing this opportunity
sharing an opportunity
sharing with my network
sharing for visibility
sharing on behalf of
posting on behalf of
for anyone looking
for anyone in my network
someone in my network
opportunity for my network
great opportunity at
great opportunity with
interesting opportunity
worth sharing
signal boost
boosting this
please share
please repost
help spread the word
pass this on
tag someone
know someone suitable
```

Combine with South African geography.

Examples:

```text
"sharing this opportunity" "Cape Town"
"reposting" vacancy Johannesburg
"for anyone in my network" hiring Gauteng
"please share" vacancy Durban
"posting on behalf of" "Western Cape"
```

---

# 10. Application-Instruction Language

Application language often identifies a real live vacancy even when “hiring” is absent.

Search:

```text
send your CV
send CV
send your resume
CV to
CVs to
email your CV
email CV
email your resume
submit your CV
submit CV
submit your application
apply now
apply here
apply below
apply via
apply through
applications open
applications are open
applications close
closing date
deadline to apply
link below
link in comments
application link
careers page
career page
```

Also search common mailbox patterns:

```text
careers@
career@
jobs@
recruitment@
recruit@
talent@
hr@
people@
```

Combine mailboxes with:

```text
CV
apply
vacancy
hiring
opportunity
```

and South African geography.

---

# 11. Growth / Team-Building Language

Some vacancy posts do not say “job” at all.

Search:

```text
our team is growing
we're growing
we are growing
growing our team
expanding our team
expanding the team
building our team
building the team
scaling our team
scaling the team
strengthening our team
growing the department
expanding the department
building out the team
building out our team
new team
new function
new department
building a new team
```

Then inspect the post, comments, tagged employees and linked content for actual opportunities.

---

# 12. Opportunity Language

Search generic opportunity wording because many professional users avoid recruitment terminology.

```text
exciting opportunity
great opportunity
new opportunity
career opportunity
opportunity available
opportunity to join
opportunity within
opportunity in our team
opportunity on our team
role available
position available
opening available
```

Run these separately by geography.

---

# 13. Hashtag Discovery

Run standalone and combined hashtag searches.

Core:

```text
#hiring
#wearehiring
#hiringnow
#recruiting
#recruitment
#vacancy
#vacancies
#job
#jobs
#jobalert
#jobopportunity
#career
#careers
#careeropportunity
#joinourteam
#opportunity
```

South Africa:

```text
#SouthAfrica
#SouthAfricaJobs
#JobsInSouthAfrica
#SAJobs
#CapeTown
#CapeTownJobs
#WesternCape
#WesternCapeJobs
#Johannesburg
#JohannesburgJobs
#Gauteng
#GautengJobs
#Durban
#DurbanJobs
#KZN
#KZNJobs
```

Run both:

```text
#hiring #CapeTown
```

and:

```text
#CapeTownJobs
```

Do not require hashtags in all searches. They are one discovery lane.

---

# 14. Visual Vacancy Posts

Many LinkedIn vacancies place the useful information inside:

- a graphic;
- image;
- poster;
- PDF;
- document;
- carousel;
- screenshot;
- presentation;
- flyer.

Whenever the post text contains a weak or generic hiring signal but includes media:

1. open the media;
2. inspect every page or panel;
3. extract:
   - company;
   - job title;
   - city / province;
   - application email;
   - application link;
   - closing date;
   - contact person;
   - reference number;
   - any other useful application information;
4. create separate vacancy records for each role shown.

A post saying only:

```text
We're hiring. See below.
```

can contain multiple opportunities in the visual.

---

# 15. Multi-Vacancy Posts

When a single post contains multiple jobs:

```text
ONE LINKEDIN SOURCE
      ↓
MULTIPLE OPPORTUNITY RECORDS
```

Each record must keep a shared:

```yaml
parent_signal_id:
source_url:
original_author:
```

Do not store a multi-role post as one vague “hiring” record.

---

# 16. ATS-Link Discovery

Ordinary LinkedIn posts often contain links directly to an applicant tracking system.

Search for hiring language together with visible ATS / careers-link patterns.

Examples of link concepts to recognise:

```text
careers
jobs
apply
myworkdayjobs
workdayjobs
greenhouse
lever
smartrecruiters
bamboohr
simplify
successfactors
oraclecloud
workable
ashby
```

The domain dictionary should be self-expanding.

Whenever a new domain repeatedly resolves to genuine employer vacancies:

1. store the domain;
2. classify it as an ATS/careers signal;
3. add it to future LinkedIn post searches;
4. search LinkedIn posts containing that domain plus South African locations.

Example:

```text
"myworkdayjobs" "Cape Town"
"greenhouse" Johannesburg
"simplify" "Western Cape"
```

---

# 17. Search by Company Mention

A vacancy may be posted by an employee rather than the company page.

For each company encountered:

run searches using:

```text
"[company name]" hiring
"[company name]" vacancy
"[company name]" "join our team"
"[company name]" opportunity
"[company name]" "looking for"
"[company name]" "send your CV"
"[company name]" careers
```

Also use LinkedIn filters for:

```text
Mentioning company
Author company
From company
```

This creates three distinct views:

```text
COMPANY POSTED IT
EMPLOYEE OF COMPANY POSTED IT
SOMEONE ELSE MENTIONED COMPANY
```

All three can surface different jobs.

---

# 18. Search by Person

When a person becomes a strong hiring signal:

Run:

```text
"[person name]" hiring
"[person name]" vacancy
"[person name]" opportunity
"[person name]" recruiting
```

and inspect their Activity.

Use:

```text
From member
```

where available.

The important point is to move from:

> search phrase → vacancy

to:

> search phrase → useful person → all activity from useful person → more vacancies.

---

# 19. Search by Author Company

Use **Author company** filters when a company has many employees who may post openings independently.

This is particularly useful for companies where:

- staff frequently repost vacancies;
- internal recruiters post from personal accounts;
- managers advertise directly;
- employees run referral drives.

For a target company:

```text
Search: hiring
Filter: Author company = [company]
```

Repeat with:

```text
vacancy
opportunity
join our team
join my team
looking for
apply
CV
```

---

# 20. Search by “Mentioning Company”

Use the **Mentioning company** filter to capture:

- employee posts tagging the employer;
- recruiters tagging the employer;
- referral posts;
- event posts announcing hiring;
- external users sharing an employer’s vacancy.

Repeat core keywords with the company mention filter.

---

# 21. Search by “From Company”

Use **From company** to isolate posts published directly by employer pages.

Repeat:

```text
hiring
vacancy
opportunity
join
career
apply
CV
opening
looking for
```

This is especially important when the company uses social posts instead of a formal LinkedIn Job listing.

---

# 22. Search by Date

Every meaningful query should be run in time slices.

Priority:

```text
Last 24 hours
Recent / current week
Recent / current month
```

For regular scanning, newest activity should be processed first.

A weekly broad sweep should also capture posts missed by the daily pass.

Store:

```yaml
posted_at:
first_discovered_at:
last_seen_at:
```

---

# 23. Search by Sort Order

Repeat key searches using both:

```text
Most recent
Most relevant
```

The two views can expose different content.

Use **Most recent** for live vacancy detection.

Use **Most relevant** to discover:

- high-engagement posts;
- recurring recruiters;
- influential vacancy amplifiers;
- company hiring campaigns;
- posts still circulating through the network.

---

# 24. Geography Dictionary — Priority 1: Western Cape

Run province, metro, town, suburb and industrial-node variations.

## Province / Region

```text
Western Cape
Cape Town
Cape Town Metro
Cape Metropole
Cape Peninsula
Cape Winelands
Winelands
West Coast
Garden Route
Overberg
```

## Cape Town / Northern Suburbs / Business Nodes

```text
Cape Town
CPT
CBD
Foreshore
V&A Waterfront
Waterfront
Woodstock
Salt River
Maitland
Ndabeni
Paarden Eiland
Century City
Montague Gardens
Milnerton
Table View
Bellville
Bellville South
Tyger Valley
Tygervalley
Durbanville
Brackenfell
Brackenfell Industrial
Kraaifontein
Parow
Goodwood
Epping
Epping Industria
Airport Industria
Blackheath
Saxenburg Park
Stikland
Atlantis
Northern Suburbs
Southern Suburbs
Claremont
Newlands
Rondebosch
Pinelands
Tokai
Westlake
Steenberg
Diep River
Retreat
Ottery
```

## Winelands / Helderberg

```text
Stellenbosch
Paarl
Somerset West
Strand
Wellington
Franschhoek
Klapmuts
Cape Winelands
```

## Wider Western Cape

```text
George
Mossel Bay
Worcester
Malmesbury
Saldanha
Saldanha Bay
Vredenburg
Hermanus
Grabouw
Robertson
Caledon
Oudtshoorn
```

Every core hiring phrase should be rotated across these geographic terms.

---

# 25. Geography Dictionary — Priority 2: Gauteng

## Province / Metro

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

## Johannesburg / Business Nodes

```text
Sandton
Rosebank
Bryanston
Fourways
Randburg
Woodmead
Rivonia
Illovo
Melrose Arch
Parktown
Midrand
Waterfall
Linbro Park
Longmeadow
Roodepoort
Bedfordview
Edenvale
Germiston
Boksburg
Kempton Park
Isando
Jet Park
Alberton
Wadeville
Spartan
```

## Pretoria / Centurion

```text
Pretoria
Tshwane
Centurion
Midstream
Menlyn
Hatfield
Brooklyn
Silver Lakes
Rosslyn
Samrand
Olifantsfontein
```

Rotate all major signal families across these terms.

---

# 26. Geography Dictionary — Priority 3: KwaZulu-Natal

```text
KwaZulu-Natal
KZN
Durban
eThekwini
Umhlanga
La Lucia
Mount Edgecombe
Riverhorse Valley
Pinetown
Westville
New Germany
Prospecton
Amanzimtoti
Ballito
Richards Bay
Pietermaritzburg
PMB
Tongaat
Dube TradePort
```

Run all major signal families across these locations.

---

# 27. Geography Dictionary — Priority 4: South Africa / National Catch-All

After the three priority regions, run national searches:

```text
South Africa
South African
SA
ZA
Remote South Africa
South Africa Remote
Nationwide
National
```

Then run remaining provincial / city coverage:

```text
Eastern Cape
Gqeberha
Port Elizabeth
East London
Coega
Kariega

Free State
Bloemfontein
Sasolburg
Welkom

Mpumalanga
Mbombela
Nelspruit
eMalahleni
Witbank
Secunda
Middelburg

Limpopo
Polokwane
Lephalale
Mokopane
Tzaneen

North West
Rustenburg
Brits
Potchefstroom
Klerksdorp

Northern Cape
Kimberley
Upington
Kathu
Postmasburg
```

---

# 28. Geographic Query Construction

For each geographic cluster, run several phrase families separately.

Example Western Cape pass:

```text
"we're hiring" "Western Cape"
"we are hiring" "Cape Town"
"my team is hiring" "Cape Town"
"join my team" "Cape Town"
"send your CV" "Cape Town"
"CVs to" "Western Cape"
"sharing this opportunity" "Cape Town"
"please share" vacancy "Cape Town"
"our team is growing" "Cape Town"
"opportunity to join" "Stellenbosch"
"applications close" "Cape Town"
"link in comments" hiring "Cape Town"
```

Example Gauteng pass:

```text
"we're hiring" Gauteng
"my team is hiring" Johannesburg
"join our team" Sandton
"send your CV" Johannesburg
"sharing this opportunity" Gauteng
"posting on behalf of" vacancy Johannesburg
"our team is growing" Midrand
"opportunity to join" Pretoria
```

Example KZN pass:

```text
"we're hiring" Durban
"my team is hiring" KZN
"join our team" Umhlanga
"send your CV" Durban
"sharing this opportunity" Durban
"our team is growing" KZN
```

---

# 29. Phrase Family Rotation

Do not combine the entire dictionary into one Boolean string.

Run small, overlapping queries.

Suggested families:

```text
FAMILY A — explicit hiring
FAMILY B — vacancy/opening
FAMILY C — join-the-team
FAMILY D — employee/referral
FAMILY E — application CTA
FAMILY F — opportunity
FAMILY G — team growth
FAMILY H — repost/amplification
FAMILY I — closing/application timing
FAMILY J — hashtags
FAMILY K — ATS/link patterns
FAMILY L — email/mailbox patterns
```

For each geography:

```text
geography × FAMILY A
geography × FAMILY B
geography × FAMILY C
...
```

This produces broader coverage than one giant query.

---

# 30. Boolean Search Templates

Use compact queries.

## Explicit Hiring

```text
("we're hiring" OR "we are hiring") AND "Cape Town"
```

## Personal-Team Hiring

```text
("my team is hiring" OR "join my team") AND Johannesburg
```

## Application CTA

```text
("send your CV" OR "CVs to") AND "Western Cape"
```

## Referral / Amplification

```text
("please share" OR "repost appreciated") AND vacancy AND Gauteng
```

## Opportunity

```text
("exciting opportunity" OR "opportunity to join") AND Durban
```

## Growth

```text
("our team is growing" OR "expanding our team") AND "South Africa"
```

Use quoted phrases where phrase order matters.

---

# 31. Natural-Language Search Variations

Do not use Boolean only.

Also run plain-language searches such as:

```text
companies hiring in Cape Town
people hiring in Cape Town
new job opportunities Western Cape
join my team Cape Town
hiring managers posting jobs Johannesburg
new vacancies shared by employees Gauteng
companies growing teams Durban
South African companies hiring
```

LinkedIn search should be treated as both:

- keyword search; and
- natural-language discovery.

---

# 32. External LinkedIn X-Ray Search

Run external web search as a parallel LinkedIn index.

Core templates:

```text
site:linkedin.com/posts "we're hiring" "Cape Town"
site:linkedin.com/posts "we are hiring" "Western Cape"
site:linkedin.com/posts "my team is hiring" "Cape Town"
site:linkedin.com/posts "join my team" Johannesburg
site:linkedin.com/posts "send your CV" Gauteng
site:linkedin.com/posts "sharing this opportunity" "South Africa"
site:linkedin.com/posts "please share" vacancy Durban
site:linkedin.com/posts "our team is growing" "Cape Town"
site:linkedin.com/posts "applications close" "South Africa"
site:linkedin.com/posts "link in comments" hiring South Africa
```

Also test:

```text
site:linkedin.com/feed/update/ hiring "Cape Town"
site:linkedin.com/feed/update/ vacancy Johannesburg
site:linkedin.com/feed/update/ opportunity "South Africa"
```

Run the same phrase families across:

1. Western Cape;
2. Gauteng;
3. KZN;
4. South Africa.

---

# 33. External Search for Employee-Led Posts

Use phrases that reveal personal sharing:

```text
site:linkedin.com/posts "my team is hiring" "South Africa"
site:linkedin.com/posts "join my team" "South Africa"
site:linkedin.com/posts "come work with us" "Cape Town"
site:linkedin.com/posts "sharing with my network" vacancy South Africa
site:linkedin.com/posts "posting on behalf of" hiring South Africa
site:linkedin.com/posts "repost appreciated" hiring South Africa
site:linkedin.com/posts "if you know someone" vacancy South Africa
```

This lane specifically targets opportunities that behave like ordinary social posts rather than formal adverts.

---

# 34. External Search for Application Details

Search:

```text
site:linkedin.com/posts "careers@" "Cape Town"
site:linkedin.com/posts "recruitment@" "South Africa"
site:linkedin.com/posts "send your CV" "co.za"
site:linkedin.com/posts "CVs to" "co.za"
site:linkedin.com/posts "apply here" "Cape Town"
```

Email-domain and `.co.za` combinations can surface direct employer posts.

---

# 35. Search-Result Expansion Workflow

Every useful result should generate additional searches.

Example:

```text
FOUND:
Employee at Company X shares vacancy.
```

Immediately run:

```text
Company X hiring
Company X vacancy
Company X careers
Company X join our team
Company X opportunity
```

Then:

```text
Author Name hiring
Author Name vacancy
Author Name opportunity
```

Then inspect:

```text
Company X page posts
Author activity
Other employees amplifying same vacancy
Repost list
Comments
```

One vacancy should therefore create **multiple new discovery paths**.

---

# 36. Company-Signal Expansion

Whenever a company produces one genuine hiring signal:

Add the company to a temporary high-intensity watch.

For the next scan cycles, search:

```text
company + hiring
company + vacancy
company + opportunity
company + join
company + careers
company + apply
company + CV
```

Inspect:

- company page;
- employees;
- internal recruiters;
- department leaders;
- people reposting its vacancies.

If additional vacancies are found, promote the company to a persistent watch list.

---

# 37. Person-Signal Expansion

Whenever a person surfaces two or more genuine opportunities:

Promote them to a hiring-signal author.

For that person:

```text
inspect Activity
search name + hiring
search name + vacancy
search name + opportunity
search From member
review comments
review reposts
record employers and companies amplified
```

This turns the search engine from a phrase scanner into a **people-powered intelligence network**.

---

# 38. Recruitment-Professional Discovery

Search for South African people likely to generate repeated vacancy signals.

Use People search for combinations such as:

```text
Talent Acquisition
Talent Partner
Talent Specialist
Recruiter
Recruitment Specialist
Internal Recruiter
HR Business Partner
People Partner
People & Culture
HR Manager
Talent Manager
Talent Lead
Head of Talent
```

Prioritise the geographic order:

```text
Western Cape
Gauteng
KwaZulu-Natal
South Africa
```

Once discovered, inspect Activity rather than merely recording the person.

The output from this lane is a list of **human vacancy sensors**.

---

# 39. Hiring-Manager Discovery

The system should also identify people whose titles indicate they are likely to hire into their own teams.

The role taxonomy is not defined here; instead use general leadership markers:

```text
Chief
Director
Head
Manager
Lead
Principal
Executive
General Manager
Vice President
VP
```

When such a person posts:

```text
join my team
my team is hiring
come work with us
we're growing
looking for someone
```

treat the post as a high-confidence direct hiring signal.

---

# 40. Company-Employee Cross Search

For any active employer, combine:

```text
Author company = [Company]
```

with:

```text
hiring
vacancy
opportunity
join
apply
CV
looking for
```

This uncovers employee posts that may not mention the employer name in the text.

That is a particularly important discovery method.

---

# 41. Mention Cross Search

For any active employer, combine:

```text
Mentioning company = [Company]
```

with:

```text
hiring
vacancy
opportunity
career
join
apply
```

This can reveal:

- external recruiters;
- employees;
- industry peers;
- referral posts;
- event speakers;
- users amplifying a company vacancy.

---

# 42. Engagement Graph

For every useful post, capture relevant engagement metadata:

```yaml
original_author:
original_company:
reposters:
reposters_with_commentary:
commenters:
employee_amplifiers:
external_recruiter_amplifiers:
network_member_that_surfaced_post:
```

The aim is to identify patterns such as:

```text
Person A repeatedly reposts Company X vacancies.
Person B comments on technology vacancies across several companies.
Person C is an internal recruiter who posts roles only from a personal account.
```

These patterns should create new watch targets.

---

# 43. Repost-of-Repost Traversal

When a repost contains an earlier repost:

Follow the chain.

Example:

```text
Person C reposted
    ↓
Person B reposted with thoughts
    ↓
Company A original vacancy
```

Store all nodes.

The original post establishes the vacancy.

The intermediate reposters establish additional discovery channels.

---

# 44. Activity Cluster Detection

Look for short bursts of activity around one employer.

Example:

```text
Monday: company posts “we are growing”
Tuesday: employee reposts a vacancy
Wednesday: manager posts “join my team”
Thursday: recruiter posts another role
```

Treat this as a **company hiring cluster**.

When a cluster is detected:

- intensify searches around the company;
- inspect employee activity;
- search the company name with all major signal families;
- inspect visual posts;
- review recent reposts and comments.

---

# 45. Location Inference From Context

A post may omit the location but expose it indirectly through:

- author location;
- company office;
- tagged office/site;
- visual job card;
- application page;
- comments;
- company careers page;
- hashtag;
- city in the job-card preview.

Extract all available location evidence.

Normalise to:

```yaml
country: South Africa
province:
city:
suburb_or_node:
location_confidence:
```

The discovery engine should retain the raw wording as well.

---

# 46. South Africa Confirmation Signals

Useful South African indicators include:

```text
South Africa
South African
Western Cape
Gauteng
KwaZulu-Natal
KZN
Cape Town
Johannesburg
Pretoria
Durban
co.za
ZAR
R per month
R per annum
+27
```

These can help confirm local relevance when the post is otherwise ambiguous.

---

# 47. Search Logging

Every search must be logged.

```yaml
query_id:
run_date:
platform:
surface:
query_text:
filters:
geography:
sort_order:
date_range:
results_reviewed:
new_signals_found:
duplicates_found:
new_companies_found:
new_authors_found:
new_amplifiers_found:
```

This allows the system to learn which queries actually produce jobs.

---

# 48. Query Yield Scoring

Measure query productivity.

```yaml
query:
runs:
results_reviewed:
genuine_hiring_signals:
new_vacancies:
duplicate_vacancies:
new_hiring_authors:
new_company_watches:
yield_rate:
```

High-yield queries run more often.

Low-yield queries remain in rotation at a lower frequency instead of being allowed to dominate daily effort.

---

# 49. Phrase Learning

The phrase dictionary must grow automatically.

Whenever a genuine hiring post contains useful wording not already in the dictionary:

1. extract the phrase;
2. store it as a candidate signal;
3. search the phrase independently;
4. measure whether it finds more vacancies;
5. promote productive wording into the recurring search set.

Store:

```yaml
phrase:
first_seen:
last_seen:
source_post:
times_seen:
valid_hiring_signals:
query_yield:
status:
  - candidate
  - active
  - low_frequency
```

Examples of phrases that might emerge:

```text
strengthening our team
come build with us
we've got a seat for you
we're adding to the team
open seat
new opening in our team
we need another pair of hands
```

The search language should evolve with how South African LinkedIn users actually talk.

---

# 50. Hashtag Learning

Whenever a genuine South African hiring post uses a recurring hashtag:

- extract it;
- store it;
- test it;
- combine it with the priority regions;
- promote it if productive.

Do not rely only on predefined recruitment hashtags.

---

# 51. Employer-Language Learning

Some companies use recurring phrases.

Example:

```text
Build your future with us
Join the journey
We're growing places
Be part of the team
```

If the phrase repeatedly maps to genuine hiring:

- store the phrase with the company;
- use it in future company-specific searches.

---

# 52. Image-Language Learning

Visual adverts may repeatedly contain wording such as:

```text
VACANCY
WE'RE HIRING
JOIN OUR TEAM
CAREER OPPORTUNITY
NOW RECRUITING
APPLICATIONS OPEN
```

Treat these as visual trigger phrases.

When a screenshot, PDF or carousel contains one, inspect the entire asset.

---

# 53. New-Post Follow-Up

When a newly discovered post is incomplete:

Revisit it later to inspect:

- new comments;
- added application links;
- clarified location;
- added closing dates;
- replies from the author;
- additional roles added in comments.

Store:

```yaml
follow_up_required:
follow_up_reason:
last_checked:
```

---

# 54. Old-Post Reactivation

An older vacancy can become active again if:

- someone reposts it;
- the company reposts it;
- a manager comments that applications remain open;
- the role is re-advertised;
- a new closing date is added.

If an old post receives new hiring activity, create a new activity event against the existing opportunity rather than ignoring it.

---

# 55. Deduplication Across Social Sources

The same job may appear through:

```text
company post
employee post
hiring manager post
recruiter post
silent repost
repost with thoughts
comment
LinkedIn job card
company careers link
external X-ray result
```

Create one canonical opportunity and attach every social source.

Match using:

```text
company
title
location
application link
email
reference number
posting date
job-card URL
description similarity
```

Store:

```yaml
canonical_opportunity_id:
social_sources:
amplification_count:
original_source:
latest_source:
```

---

# 56. Preserve the Social Trail

Do not flatten a vacancy into only:

```text
Company
Title
Location
```

Preserve:

```yaml
discovered_via:
network_trigger:
original_author:
original_author_title:
original_author_company:
reposted_by:
commented_by:
liked_or_reacted_by:
company_page:
source_url:
original_url:
repost_url:
application_url:
date_first_seen:
date_last_seen:
```

This information identifies who actually carries hiring information through the market.

---

# 57. Source-Type Classification

Classify every signal by discovery mechanism:

```text
LINKEDIN_JOB_POST
DIRECT_COMPANY_POST
DIRECT_HIRING_MANAGER_POST
INTERNAL_RECRUITER_POST
EMPLOYEE_REFERRAL_POST
EMPLOYEE_REPOST
SILENT_REPOST
REPOST_WITH_COMMENTARY
COMMENT_DISCOVERY
REACTION_FEED_DISCOVERY
COMPANY_MENTION_DISCOVERY
AUTHOR_COMPANY_DISCOVERY
ATS_LINK_POST
IMAGE_ONLY_HIRING_POST
PDF_OR_DOCUMENT_HIRING_POST
MULTI_ROLE_POST
EXTERNAL_XRAY_DISCOVERY
TEAM_GROWTH_SIGNAL
COMPANY_HIRING_CLUSTER
```

This makes it possible to measure which routes surface the most otherwise-hidden vacancies.

---

# 58. Core Signal Record

```yaml
signal_id:
linkedin_url:
original_linkedin_url:
source_type:
posted_at:
discovered_at:
last_checked_at:

author:
  name:
  title:
  company:
  profile_url:

network_surface:
  surfaced_via_person:
  action:
    - repost
    - comment
    - reaction
    - direct_post
    - company_post

geography:
  raw:
  province:
  city:
  node:
  country: South Africa

post:
  text:
  hashtags:
  mentions:
  links:
  emails:
  has_image:
  has_document:
  has_carousel:
  has_job_card:

social_graph:
  original_author:
  reposters:
  commenters:
  amplifiers:

opportunities_found:
```

---

# 59. Daily Scan Order

## Pass 1 — Western Cape

Run:

- explicit hiring phrases;
- personal-team phrases;
- application CTA phrases;
- repost/amplification phrases;
- opportunity phrases;
- growth phrases;
- company watches;
- author watches;
- feed-based signals;
- external X-ray searches.

## Pass 2 — Gauteng

Repeat the same stack.

## Pass 3 — KwaZulu-Natal

Repeat the same stack.

## Pass 4 — South Africa / National

Run national phrases and remaining provinces.

---

# 60. High-Frequency Search Stack

Run frequently:

```text
"we're hiring"
"we are hiring"
"my team is hiring"
"our team is hiring"
"I'm hiring"
"I am hiring"
"join my team"
"join our team"
"come join us"
"we're looking for"
"we are looking for"
"send your CV"
"CVs to"
"apply here"
"applications open"
"vacancy"
"open role"
"open position"
"exciting opportunity"
"opportunity to join"
"please share"
"repost appreciated"
"sharing this opportunity"
"our team is growing"
"expanding our team"
```

Rotate across the four geographic priorities.

---

# 61. Medium-Frequency Search Stack

Run on a broader cadence:

```text
"posting on behalf of"
"sharing with my network"
"for anyone in my network"
"if you know someone"
"referrals welcome"
"tag someone"
"spread the word"
"help us find"
"looking for recommendations"
"link in comments"
"career opportunity"
"position available"
"role available"
"deadline to apply"
"closing date"
"building our team"
"scaling our team"
"strengthening our team"
```

---

# 62. Network Watch Stack

Continuously maintain:

```text
high-signal internal recruiters
high-signal HR people
high-signal executives
high-signal department heads
frequent employee vacancy reposters
frequent recruitment amplifiers
companies producing repeated hiring clusters
```

For each, inspect recent activity and search their name/company against the signal dictionary.

---

# 63. Discovery Loop

The engine should operate as a loop:

```text
SEARCH PHRASE
      ↓
FIND POST
      ↓
FIND COMPANY
      ↓
FIND AUTHOR
      ↓
FIND REPOSTERS / COMMENTERS
      ↓
FIND MORE POSTS
      ↓
FIND MORE COMPANIES
      ↓
FIND MORE HIGH-SIGNAL PEOPLE
      ↓
EXPAND WATCH LISTS
      ↓
RUN AGAIN
```

This is the core innovation.

The search engine should become progressively better because every genuine vacancy teaches it:

- another person to watch;
- another company to watch;
- another phrase to search;
- another hashtag;
- another ATS domain;
- another geographic wording;
- another repost chain.

---

# 64. Search Expansion From Reactions

When a vacancy appears because a connection liked or reacted to it:

Capture both:

```text
underlying vacancy
person whose reaction surfaced it
```

If the same person repeatedly causes hiring posts to appear:

promote that person to an amplifier watch list.

This makes passive feed activity useful as structured vacancy intelligence.

---

# 65. Search Expansion From Comments

When a vacancy appears because a connection commented:

1. capture the underlying vacancy;
2. inspect the commenter’s role/company;
3. inspect the commenter’s Activity;
4. determine whether they frequently engage with vacancy posts;
5. add them to the amplifier graph if productive.

---

# 66. Search Expansion From Reposts

When a user reposts a vacancy:

1. inspect the original;
2. inspect the reposter;
3. inspect other people who reposted the same item;
4. inspect other vacancy posts by those reposters;
5. inspect other company posts they amplify.

A single vacancy can therefore seed an entire local hiring network.

---

# 67. Geographic Prioritisation Logic

When time or compute must be allocated, use:

```text
1. Western Cape
2. Gauteng
3. KwaZulu-Natal
4. South Africa national / remaining provinces
```

Within each geography:

```text
1. newest direct posts
2. silent reposts / network amplification
3. employee and hiring-manager posts
4. company page posts
5. comments
6. external X-ray
7. broader historical sweep
```

---

# 68. What Counts as a Successful Discovery

A discovery is successful when the engine can establish that a South African hiring opportunity exists and preserve enough evidence to hand it to the next workflow.

At minimum capture where available:

```text
job / opportunity title
company
location
post date
source URL
original author
discovery method
application route
social amplification trail
```

Do not apply role-family or commercial exclusions inside this engine.

---

# 69. Separate Discovery From Qualification

This document governs:

```text
WHERE TO SEARCH
HOW TO SEARCH
WHAT HIRING LANGUAGE TO SEARCH
HOW TO FOLLOW REPOSTS
HOW TO FOLLOW PEOPLE
HOW TO FOLLOW COMPANY ACTIVITY
HOW TO SEARCH SOUTH AFRICA
HOW TO EXPAND FROM ONE SIGNAL TO ANOTHER
```

A separate downstream instruction should decide:

```text
which job families matter
salary threshold
client rules
commercial priority
employer exclusions
outreach priority
```

Keeping the two systems separate protects discovery coverage.

---

# 70. Master Operating Sequence

```text
1. RUN WESTERN CAPE LINKEDIN POST SEARCHES
2. RUN WESTERN CAPE REPOST / AMPLIFIER SEARCHES
3. RUN WESTERN CAPE AUTHOR / COMPANY WATCHES
4. RUN WESTERN CAPE EXTERNAL X-RAY

5. RUN GAUTENG LINKEDIN POST SEARCHES
6. RUN GAUTENG REPOST / AMPLIFIER SEARCHES
7. RUN GAUTENG AUTHOR / COMPANY WATCHES
8. RUN GAUTENG EXTERNAL X-RAY

9. RUN KZN LINKEDIN POST SEARCHES
10. RUN KZN REPOST / AMPLIFIER SEARCHES
11. RUN KZN AUTHOR / COMPANY WATCHES
12. RUN KZN EXTERNAL X-RAY

13. RUN SOUTH AFRICA NATIONAL SEARCHES
14. RUN REMAINING PROVINCE SEARCHES
15. RUN NATIONAL AUTHOR / COMPANY WATCHES
16. RUN NATIONAL EXTERNAL X-RAY

17. EXPAND EVERY VALID RESULT
18. TRACE REPOST CHAINS
19. INSPECT COMMENTS
20. INSPECT MEDIA
21. ADD NEW AUTHORS
22. ADD NEW AMPLIFIERS
23. ADD NEW COMPANIES
24. ADD NEW PHRASES
25. ADD NEW ATS DOMAINS
26. DEDUPLICATE
27. PRESERVE THE SOCIAL TRAIL
28. SEND ALL VALID SOUTH AFRICAN OPPORTUNITIES DOWNSTREAM
```

---

# 71. Final Search Doctrine

The engine should behave as if every real LinkedIn vacancy can be discovered through one or more of these paths:

```text
THE COMPANY POSTED IT
THE HIRING MANAGER POSTED IT
AN INTERNAL RECRUITER POSTED IT
AN EMPLOYEE POSTED IT
AN EMPLOYEE REPOSTED IT
A USER REPOSTED IT SILENTLY
A USER REPOSTED IT WITH COMMENTARY
A USER COMMENTED ON IT
A USER LIKED IT AND CAUSED IT TO SURFACE
THE COMPANY WAS MENTIONED
THE AUTHOR'S COMPANY IDENTIFIES THE EMPLOYER
THE ROLE IS INSIDE AN IMAGE
THE ROLE IS INSIDE A PDF OR CAROUSEL
THE POST LINKS TO AN ATS
THE APPLICATION DETAILS ARE IN COMMENTS
THE POST USES REFERRAL LANGUAGE
THE POST USES TEAM-GROWTH LANGUAGE
THE POST USES OPPORTUNITY LANGUAGE
THE POST IS INDEXED EXTERNALLY
ANOTHER VACANCY LED TO THE AUTHOR
ANOTHER AUTHOR LED TO THE COMPANY
ANOTHER REPOSTER LED TO THE VACANCY
```

The central goal is to turn LinkedIn from a list of advertised jobs into a **South African social hiring radar**.

The system should continuously learn from the way real users distribute vacancies and use each newly discovered post, person, company, phrase, hashtag, link domain and repost chain as the seed for further discovery.