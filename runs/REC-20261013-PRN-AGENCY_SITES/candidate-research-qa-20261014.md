# PRN candidate research and independent QA — 14 October 2026

## Canonical records / authority
- **Run:** `REC-20261013-PRN-AGENCY_SITES`
- **Channel:** `AGENCY_SITES` (Channel 2)
- **Live datastore:** REC Supabase, existing `public.candidates`, `public.candidate_assignments`, `public.candidate_claims`, `public.candidate_operations`, `public.research_queries`, `public.qa_reviews`, `public.vacancies`, `public.runs`
- **Persisted run status: `PARTIAL`**. This file is a research/audit snapshot, not a second candidate database.
- The underlying candidate names/profile links remain in access-controlled REC tables rather than being copied to this repository.

## Research results
| PRN reference | Opportunity | Research-stage mapped candidate assignments | QA PASS_WITH_UNKNOWNS | QA research required |
|---|---|---:|---:|---:|
| KK711 | Absolute Pets — Senior Financial Accountant | 59 | 2 | 57 |
| KK701 | Takealot — Finance Lead Inventory | 57 | 2 | 55 |
| KK691 | Probable FPG Foods — Senior Accountant | 28 | 3 | 25 |
| KK704 | Watchmaker Genomics — Senior Cost Accountant | 18 | 0 | 18 |
| KK682 | Allan Gray — Group Legal Advisor | 14 | 2 | 12 |
| KK698 | Oceana Group — Risk & Compliance Specialist | 11 | 0 | 11 |
| KK707 | Probable RCS Group — Treasury Manager ALM | 5 | 0 | 5 |
| **Total** | | **192** | **9** | **183** |

- **151 new distinct public professional profiles** across these pools, deduplicated by profile URL and candidate identity. Multiple vacancy assignments legitimately reuse candidates.
- **192 preliminary candidate Gate D QA reviews** and candidate operational records persisted.
- **5 STRONG_MARKET** preliminary research candidates, **0 TOP_10**. STRONG_MARKET must not imply client-ready.
- **15 executed research-query records** plus earlier agency attribution queries recorded in REC. Clay public people searches span restaurant franchising finance, investment law, inventory/stock accounting, broad retail finance, FMCG/manufacturing costing, treasury and risk/compliance. Research pagination was logged separately where executed.
- Salary, willingness to move, compensation, notice, relocation and role-specific systems remain `UNKNOWN` unless personally evidenced.
- The longlist is **public-index leads**, not 151 fully qualified or contactable people. Some have only a name, title, employer and professional profile URL.

## Critical independent QA findings
1. **Adél Grimbeek:** initial third-party index listed Hungry Lion as current employer; primary profile indicates **Origin Wine**. REC candidate record corrected and contradictory historical/current employer notes retained. Her accounting experience at Hungry Lion is historical and does not independently prove required PRN systems.
2. **Caitlyn Robson:** Hungry Lion financial accountant confirmed by individual profile plus an organisation directory. A post *shared* by the candidate about finishing CA(SA) articles belongs to another author and **MUST NOT** be attributed to Caitlyn. Completed articles and five years post-articles not verified.
3. **Sbongakonke Khumalo:** Ninety One's official biography https://ninetyone.com/en/people/sbongakonke-khumalo supports identity, Legal Counsel, LLB, intellectual-property and investment-platform legal exposure. https://za.linkedin.com/in/sbongakonke-khumalo-9238a3a7 supports admitted attorney. Specific PRN agreements, detailed regulation and PQE fit not presumed.
4. **Janine Langenhoven:** Ninety One official biography https://ninetyone.com/en/luxembourg/people/janine-langenhoven supports Senior Legal Counsel, LLB, LLM and extensive pension-law experience; around 18 years industry experience may be much more senior than PRN's 3–5 years PQE target. The apparent overqualification must be checked, not ignored.
5. **Retail inventory specialization:** source-driven Clay custom work-history research found more specific stock reconciliation and stock loss reporting for one Cape Town PEP inventory professional. These `PROBABLE` individual claims are stored with direct profile citation; **IAS 2, ERP–WMS and commercial terms remain UNKNOWN** unless independently evidenced.
6. **Agreed client relationship risk:** PEP is associated with agreed-client Pepkor. Treat all mapped PEP employees as subject to client/no-poach and conflict-of-interest clearance **before** any outreach. The map is an internal intelligence artifact, not authorization to approach.
7. People employed by the **proposed hiring employer** (e.g. Takealot, FPG Foods and Allan Gray) were not automatically promoted as external candidates for that same vacancy.
8. A company's technological stack, store-count or revenue is never assigned to an individual candidate as their personal experience.

## Activation and honest REC completion status
- **31 current-index specific vacancies, six historical-index vacancies, one generic CA(SA) candidate register** were investigated in upstream PRN sourcing; general candidate registration does not create a vacancy.
- Of 37 actual vacancies, the seven above received provisional candidate searches. The other 30 are **not yet candidate-mapped** because role freshness, client attribution and/or salary/qualification gates require further verification. Do not label those as scarcity or failed candidate searches.
- Only KK701 (Takealot Greenhouse) and KK711 (Absolute Pets BreezyHR) had employer-direct hiring pages reconfirmed at the initial research snapshot; PRN/client contract association is still unconfirmed.
- 50+ index-surfaced candidate-assignment target was achieved for KK701 and KK711 **without** validating 50+ fully credible people. There is no evidence-backed market-exhaustion claim for the other five mapped roles.
- **No client-submittable Top 10 has been completed.** The aggregate run remains `PARTIAL` and its completion contract is `false`. Do not relabel to `COMPLETE`, `READY` or `MARKET_READY` until missing evidence and the prescribed per-vacancy QA are satisfied.

## Next required research work (not falsely represented as completed)
1. Qualification Gate A: reconfirm every relevant vacancy is open, client identity, remuneration band, and whether Talent Tree may approach (including agreed-client and existing agency restrictions).
2. Gate B: obtain exact compulsory article/PQE, qualification, systems, specific inventory or compliance obligations. Differentiate employer-specific vs person-specific claims.
3. Gate C: expand evidence-backed comparable-company maps, with tier/industry/value-chain precision.
4. Candidate verification: check current LinkedIn profile or credible independent bios for each market lead; qualifications via first-party person claims or professional-body corroboration; actual ERP, IAS 2, franchise POS, IFRS, manufacturing costing and company-specific duties.
5. Direct candidate contact/engagement: verify current employment, salary, notice, relocation, motivation and interest as contact-stage data; no inferred emails or numbers.
6. Adversarial Gate D: independently challenge each candidate's source, duplicates, chronology, credentials, possible protected-client status, fit and alternative closer profiles. Only after that build a strong 20–25 and honest Top 10, or documented smaller market where justified.
7. Persist candidate QA and Top 10 in REC and verify completion contract before changing run status.

## Evidence surfaces
- Original PRN archive: [PRN source register](./source-register.csv)
- PRN main page: https://prnstaffing.co.za/career-opportunities/
- Takealot employer recruiting: https://job-boards.greenhouse.io/takealotgroup/jobs/8125529
- Absolute Pets employer recruiting: https://absolute-pets.breezy.hr/p/583dbb827c9401-senior-financial-accountant-retail
- Ninety One public employee biographies: https://ninetyone.com/en/people/sbongakonke-khumalo ; https://ninetyone.com/en/luxembourg/people/janine-langenhoven
- All individual candidate/source URLs and exact QA decisions are stored against REC candidate and assignment IDs; refer to authoritative database rows, not this aggregate README.

## Independent QA doctrine
A `FAIL_RESEARCH_REQUIRED` candidate QA result is a useful documented lead, **not a suitable candidate**. A `PASS_WITH_UNKNOWNS` preliminary result means only specifically corroborated role facts passed; it does not magically confirm key requirements or consent to recruitment. Differentiate these rigorously.
