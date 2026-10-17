# Visual and interaction QA

Local review completed 17 October 2026 against a production Next.js build in synthetic demo mode. See screenshot-gallery.md for all major desktop/mobile screens, three before/after comparisons, reference captures and record-detail views.

## Evidence

The committed screenshots/browser-report.json records **56 successful route/viewport combinations**: all eight operational/login screens at 375, 430, 768, 1024, 1280, 1440 and 1920px. There is no document overflow at any tested width. All pages return HTTP 200. **13 axe-core scans** found zero violations after corrections; these cover the eight main screens plus organisation/candidate/run details, mobile navigation and closure confirmation. Seven browser interaction groups passed. No JavaScript page errors or backend demo writes occurred.

The runner is tests/frontend-browser-smoke.mjs (`npm run test:browser`). Readiness waits include real rendered content and hydration; finite entrance transitions settle before screenshots/contrast analysis. A zero-test run, open port or loading skeleton is not accepted as screen evidence.

## Comparison to the supplied reference

| Area              | Inspected outcome                                                                                                                                                                                                                                                                  |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Application shell | Permanent forest sidebar, white active navigation, lime icon emphasis, warm canvas and separate utility bar. All seven destinations exist. SVG icons replace reference Unicode. Mobile retains branding, search, mode and accessible navigation.                                   |
| Intelligence      | Dark rounded hero encloses real KPI cards; operational lifecycle stages replace the fictional sales funnel. White action rows sit inside the reference-inspired lime research-priority panel. No fees, conversion percentages or AI-completed claims were copied.                  |
| Organisations     | Directory supports cards/table, search, relationship/location/evidence filters, sort and pagination. Seven-tab profiles use vacancy-derived associations and visibly retain unknown employer identity. Missing industry/commercial records are unavailable.                        |
| Vacancies         | New heading/KPI/filter composition, compact queue, dominant intelligence panel and contextual candidate market. Wide screens show three panes; narrower desktops/tablets use context switching. Phones use deliberate list/intelligence/candidate navigation with preserved state. |
| Candidate markets | Reference-derived cards, compact table and a second-level drawer. Identity and assignment-specific fit/evidence/actions are separate. Claims retain confidence labels and research/recruiter statuses do not collapse.                                                             |
| Stakeholders      | Premium directory/detail styling and filters; current demo legitimately has no stakeholder mappings. The empty state is reviewed; isolated tests exercise email-confidence details without inventing app records.                                                                  |
| Evidence and runs | Independent research QA, challenged claims/gaps and source confidence replace the reference’s placement claims. Run metrics and completion status are recorded facts, with publication receipt limitations explicit. Mobile run/QA records stack for accessible actions.           |

## Issues found and corrected

- Absolute screen-reader table labels escaped narrow table wrappers and widened the document. Positioned wrappers now contain overflow; all seven required widths pass.
- Candidate metadata and an organisation count denominator lacked contrast. Shared-muted text now meets the measured contrast requirements; evidence states retain distinct semantics.
- Mobile research tables hid useful status/actions; record-card treatment now exposes them. A narrow run-note layout was changed to a stacked link and readable paragraph.
- Mobile navigation lacked visible brand context; the utility bar now includes the Talent Tree lockup.
- The first drawer focus behavior jumped to a footer select. Generic dialogs now focus their explicit autofocus target or first control, with Escape and focus restoration.
- Closing a role could retarget the pending confirmation after optimistic filtering. The confirmed target is now pinned, cancellation is blocked while pending, and empty-control focus remains inside the drawer.
- Concurrent workbench candidate writes could race rollback. Pending actions now serialize with a synchronous guard, preserving the exact candidate assignment.
- Same-route search links did not reapply initial props. Route parameter keys now refresh the intended vacancy, run and stakeholder context. Actual vacancy/run navigation is browser-tested.
- A workflow strip inferred completed history from the current enum. It now shows only the recorded current stage and explicitly identifies missing history.

## Scope and limits

These findings establish the observed local frontend behavior, not a WCAG certification or live backend release approval. Axe checks cover WCAG 2 A/AA, WCAG 2.1 AA and best-practice rules; keyboard/focus/reflow checks supplement them. Real OTP delivery, role/RLS cases, production writes and missing backend histories require authorised follow-up. External preview evidence is recorded separately in delivery.md.
