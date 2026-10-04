# Claude Agent — REC Quick Reference

Obey `AGENTS.md` first. Key invariants for this session:

- Source-of-truth: `manifest.yaml` + `ARCHITECTURE_GUARD.md` + `interface/README.md`.
- Four sourcing channels only: AGREED_CLIENTS, AGENCY_SITES, LINKEDIN, JOB_BOARDS.
- Research Top 10 (`marketBucket`) and Recruiter Top 10 (`operationalStatus`) are separate; never let a recruiter click overwrite evidence.
- Candidate exclusion requires a reason; close vacancy requires a reason.
- Failed mutations must roll back; never leave optimistic state after server error.
- Database = work product; publish via `npm run rec:publish -- <payload>`; check persistence.
- Archival surface exists (`archiveFilter`); closed vacancies must remain retrievable.
- Evidence (CONFIRMED/PROBABLE/HYPOTHESIS/UNKNOWN) is separate from QA and from operational workflow.
- Hiring-team intelligence preserves observed vs probable email with evidence provenance.
- Health/verify: `npm run verify` (typecheck + contracts + regression + build).
- No candidate/stakeholder PII should enter source control.

Continue through candidate mapping, QA Gate D, client-submittable Top 10 and verified REC persistence.
