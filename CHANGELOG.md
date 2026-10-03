# Changelog

## 0.2.0 — Authoritative Hidden Hiring LinkedIn Engine

- Adopted `South_Africa_LinkedIn_Hidden_Hiring_Signal_Engine_MASTER.md` as the controlling LinkedIn discovery specification.
- Changed LinkedIn discovery to a strict role-agnostic discovery layer.
- Removed salary, role-family, client-priority and commercial filtering from the LinkedIn worker bootstrap.
- Added a dedicated LinkedIn social-signal schema.
- Added explicit conflict precedence: the current LinkedIn master governs over historical LinkedIn instructions.
- Preserved downstream qualification/enrichment as a separate worker.

## 0.1.0 — Infrastructure V1

- Initialized canonical recruitment-intelligence repository.
- Added worker manifest and source-coverage index.
- Added shared qualification, evidence, deduplication and employer-attribution modules.
- Added agreed-client registry and source-governance rules.
- Added LinkedIn, agency and job-board channel strategies.
- Added four thin runtime worker instructions.
- Added discovery and final-opportunity JSON schemas.
- Added initial regression / golden cases.
- Preserved original source specifications under `archive/originals/`.
