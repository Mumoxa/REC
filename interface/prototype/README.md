# Vacancy inbox prototype

A buildless, single-screen interaction reference for **VACANCIES → Inbox**. It uses plain HTML, CSS and JavaScript; no framework, package manager, API, research provider or credentials are required. It demonstrates the core operating model, not the entire capability surface; the complete feature and data contracts remain in the interface specifications.

## Run locally

From the repository root:

```bash
python3 -m http.server 4173 --bind 0.0.0.0 --directory interface/prototype
```

Then open `http://localhost:4173`. In Arena preview, the same directory can be served on the provided public preview host.

Run the static prototype and schema/contract smoke checks from the repository root with `node tests/workspace-prototype-smoke.mjs`; validate JavaScript syntax with `node --check interface/prototype/app.js`.

## What is interactive

- Change queue view, search the current queue, filter and sort vacancies.
- Set Expanded / Compact / Minimal queue density.
- Change vacancy intelligence tabs without leaving the selected record.
- Search across sample vacancies and mapped candidates with the global search shortcut (`Ctrl/⌘ K`). This searches local sample records only.
- Search mapped candidate records and filter for an individually confirmed claim.
- Switch candidate groupings; use Earmark, Recruiter Top 10, Approach and Exclude workflow actions.
- Open claim-level candidate evidence without replacing the vacancy selection.
- Use Candidate Focus and narrow-screen pane switching.
- Save and reload a personal view in this browser.
- Close/reopen a vacancy with a required close reason. The preview includes an undo action.
- Start a clearly labelled demo research action. It is written as `NOT_EXECUTED`; no external research runs.

## Synthetic-data and privacy boundary

Every vacancy, employer, person, source, claim, count and timeline item in this prototype is fictional illustrative data. It is not a real vacancy, candidate, employer record, QA review or research result. Some mapped-profile totals intentionally exceed the sample cards rendered; the candidate pane calls out the preview subset. The persistent top ribbon keeps this boundary visible.

The prototype stores only its demo view state, demo workflow actions, saved views and explicitly unexecuted demo-action log in browser `localStorage`. It has no route to load live records. **Do not adapt browser-local storage for live candidate, stakeholder or contact data.** Production data needs a private, access-controlled backend, audit and privacy controls.

Use `interface/design-system.md` for the visual/interaction authority and `interface/review-and-gaps.md` for the code/product review and production release gates.
