# Gemini Agent — REC Quick Reference

Obey `AGENTS.md`. Key invariants for this session (same as CLAUDE.md):

- Authoritative sources: `manifest.yaml`, `ARCHITECTURE_GUARD.md`, `interface/README.md`.
- Four sourcing channels only.
- Research `marketBucket` and Recruiter `operationalStatus` are separate concepts.
- Evidence states (CONFIRMED/PROBABLE/HYPOTHESIS/UNKNOWN) never collapse into workflow.
- Candidate exclusion and vacancy close require reasons; roll back on server failure.
- Database persistence verified via ingestion endpoint; local JSON is not publication.
- Archive/closed retrieval supported (`archiveFilter` in workspace).
- Hiring-team intelligence distinguishes observed from probable email with evidence labels.
- Verify repository: `npm run verify`.
- Never commit personal data.
