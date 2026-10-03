# Talent Tree Recruitment Intelligence

Version-controlled operating system for Talent Tree's South African recruitment-intelligence engine.

## Purpose

This repository is the canonical source of truth for the rules, source registries, channel strategies, runtime worker instructions, schemas and regression tests used to discover and qualify commercially valuable hiring opportunities.

The runtime is deliberately modular:

1. **LinkedIn discovery worker** — hiring signals, company/employee/executive posts, X-ray search, hiring-author watches and early signals.
2. **Agency discovery worker** — priority recruitment agencies and anonymous-employer vacancy discovery.
3. **Job board / ATS discovery worker** — direct careers pages, ATS platforms, major job boards and the broader source universe.
4. **Enrichment worker** — normalisation, deduplication, salary/functional qualification, employer attribution, commercial eligibility, stakeholder mapping and contact intelligence.

## Design principles

- GitHub defines **how the system should work**.
- Runtime workers load only the modules they need.
- Shared commercial rules live once and are not copied into channel-specific instructions.
- Every material conclusion must be evidence-backed.
- Confirmed, probable, hypothesis and unknown must remain distinct.
- Existing agreed clients receive first commercial priority.
- The system is a hiring-signal intelligence engine, not merely a job scraper.
- Original source specifications are preserved under `archive/originals/`.

## Repository map

- `core/` — shared commercial and evidence rules.
- `sources/` — agreed clients and source governance.
- `channels/` — discovery strategy unique to each channel.
- `runtime/` — thin worker instructions for scheduled execution.
- `schemas/` — standard machine-readable output contracts.
- `tests/` — regression / golden cases.
- `archive/originals/` — source documents used to compile this build.
- `manifest.yaml` — declares exactly which files each worker should load.
- `MASTER_INDEX.md` — maps original source topics into the modular architecture.

## Status

Infrastructure V1 — initial decomposition in progress.
