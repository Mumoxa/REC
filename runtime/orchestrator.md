# Runtime — Four-Channel Dispatcher

## Authority

Load:

- `manifest.yaml`
- `ARCHITECTURE_GUARD.md`
- `core/search-structure.md`
- `sources/search-priority.yaml`

## Purpose

Dispatch one or more of the four sourcing channels.

The four channels are independently runnable.

## Run modes

### Single-channel run

If one channel is requested, run it directly.

No prior channel completion is required.

Examples:

- `AGREED_CLIENTS` only
- `AGENCY_SITES` only
- `LINKEDIN` only
- `JOB_BOARDS` only

### Selected multi-channel run

If a subset is requested, run only those channels.

Unless an explicit order is supplied, use their relative default priority:

`AGREED_CLIENTS → AGENCY_SITES → LINKEDIN → JOB_BOARDS`

### Full run

If all four channels are requested, default to:

1. AGREED_CLIENTS
2. AGENCY_SITES
3. LINKEDIN
4. JOB_BOARDS

This is a default priority order, not a prerequisite chain.

## Shared intelligence stack

Before running any sourcing channel, load the `shared_channel_stack` from `manifest.yaml`.

Every channel uses the same:

- search structure;
- query templates;
- role taxonomy;
- role boundary rules;
- seniority ontology;
- geography ontology;
- qualification rules;
- disqualifiers;
- scoring rubric;
- evidence standard;
- deduplication;
- employer attribution;
- client-status vocabulary;
- output structure.

Channel-specific instructions may change source tactics only.

## Channel dispatch map

- `AGREED_CLIENTS` → `runtime/agreed-client-worker.md`
- `AGENCY_SITES` → `runtime/agency-worker.md`
- `LINKEDIN` → `runtime/linkedin-worker.md`
- `JOB_BOARDS` → `runtime/jobboard-worker.md`

## Cross-channel behaviour

- Preserve original source/channel provenance.
- If any channel discovers an agreed-client vacancy, give it immediate agreed-client commercial priority.
- Do not require the agreed-client channel to have run first for another channel to recognise an agreed client.
- Deduplicate across channel outputs when they are consolidated.
- Do not let one channel create different role/seniority/geography definitions.

## Enrichment

`runtime/enrichment-worker.md` may process output from any single channel or any combination of channels.

Enrichment is not a fifth sourcing channel.
