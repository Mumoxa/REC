# PRN — Channel 2 source-intelligence run (13 October 2026)

**Canonical run ID:** `REC-20261013-PRN-AGENCY_SITES`  
**Agency:** Professional Recruitment Network (PRN)  
**Geography:** Western Cape, South Africa  
**Run status:** **PARTIAL** (research persisted, candidate-mapping completion gates outstanding)  
**Source:** https://prnstaffing.co.za/career-opportunities/

## Recorded discovery

- 38 research-register rows: **31 current-index specific vacancies**, **6 historical-index specific vacancies**, **1 general CA(SA) registration listing**.
- **37 actual vacancies** inserted/upserted into the REC operational database (`public.vacancies`).
- **11 proposed employer organisations** mapped in `public.companies`.
- The agency advert, external-source and direct-employer links are separate `public.vacancy_sources` records.
- Per-vacancy Gate A discovery QA, research plan, operational lifecycle and role fingerprints persisted.
- Names of proposed clients are never promoted to contractually **CONFIRMED** merely because similar direct-company advert text exists.
- R420k/annum salary screening remains unknown unless a reliable salary is independently documented. No salary has been invented.
- PRN KK671 (external sales) excluded from the commercial vacancy queue; retained as closed intelligence, not deleted.
- The generic CA(SA) registration listing does not create a vacancy.

## Key employer clusters

- **FPG Foods (PROBABLE):** KK691, KK694, KK690, KK687, KK686, KK695, plus older KK693 and KK692. Distinctive Plattekloof, QSR/KFC and UK operations, but PRN has not publicly named its client. Employer context https://fpgfoods.co.za/contact-us/
- **Allan Gray (employer-named matching advert; PRN relationship unconfirmed):** KK682, KK702, KK712, KK627.
- **RCS Group (PROBABLE):** KK707 and older KK685. European Central Bank reporting and card/loan treasury fingerprints.
- **vida e caffè (one direct employer-name match; another cross-role hypothesis):** KK669, KK703.
- Other proposed named employers: **Absolute Pets** KK711; **Equites Property Fund** KK706; **Watchmaker Genomics** KK704; **Sea Harvest** KK678; **takealot.com** KK701; **Oceana Group** KK698; **Babylonstoren** KK680.
- **Unresolved cases** remain unnamed, including KK709, KK699, KK696, KK710 and KK700. The latter's Takealot link is a *hypothesis*, not an assigned employer.

## Additional direct-employer checks

- KK711 senior financial accountant is currently listed on Absolute Pets' own ATS:
  https://absolute-pets.breezy.hr/p/583dbb827c9401-senior-financial-accountant-retail
- KK701 finance lead inventory is listed at Takealot's Greenhouse ATS:
  https://job-boards.greenhouse.io/takealotgroup/jobs/8125529
  The posting identifies the functional hiring role as `Head of Finance: General`.
- The observed published vida application contact is Nuraan Snyman — `NuraanS@Caffe.co.za` at https://www.saipa.co.za/vacancies/; no current job title or universal company email naming pattern is inferred.

## Publication / research gates

- This GitHub directory is the **research source archive**. The **live REC Supabase tables** are the operational records.
- Stage completed: PRN index enumeration, employer hypothesis clustering, evidence-source registration, explicit unknowns, Gate A checks and research queries.
- Stage **NOT COMPLETE**: current-employer confirmation for many vacancies, all compensation screening, 2–10 current hiring contacts for each qualifying role, evidence-backed 50+ candidate-market mapping, QA-cleared Top 10 and client-submit-ready output.
- The authoritative `README.md` states a run must remain `PARTIAL` or `RUNNING` until the candidate and completion contract is satisfied. **Do not change this run to COMPLETE without that evidence and persisted QA.**

## Import / idempotency

Each vacancy key is `prn-kkNNN`, source key `prn-advert-kkNNN` plus separately numbered crosschecks and employer source. Research run ID is unique per workspace. Unresolved clients use a clearly artificial display value `Undisclosed employer (PRN KKNNN)` with `employer_status=UNKNOWN` and **no company link**. This is a database display convention, not a claimed employer.

See [source-register.csv](./source-register.csv) for all per-reference breadcrumbs, status, original PRN URL, outside evidence URL and next action.
