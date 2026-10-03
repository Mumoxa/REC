# LinkedIn Discovery Strategy

## Architecture

Canonical channel facade:

`channels/linkedin.md`

This is **Channel 3 / Stage 3** and begins only after Channels 1 and 2 complete.

## Authority

The authoritative LinkedIn discovery specification is:

`South_Africa_LinkedIn_Hidden_Hiring_Signal_Engine_MASTER.md`

That master must be honoured in full for LinkedIn discovery work.

This file is intentionally only a routing note. It must not become a shorter substitute for the master.

## Non-negotiable separation

The LinkedIn engine is a **role-agnostic discovery layer**.

Its job is to:

- search LinkedIn activity and social distribution paths;
- surface South African hiring opportunities;
- follow authors, companies, reposts, comments, reactions, amplifiers and ATS links;
- inspect visual vacancy content;
- preserve the social evidence trail;
- deduplicate social manifestations into one opportunity;
- send all valid South African opportunities downstream.

It must **not** decide during discovery:

- which professions matter commercially;
- salary thresholds;
- client priority;
- commercial priority;
- employer exclusions;
- outreach priority.

Those belong to the downstream enrichment/qualification worker.

## Conflict rule

If any older LinkedIn strategy, historical source document, worker text or generic recruitment instruction conflicts with the current master, the current master governs LinkedIn discovery.
