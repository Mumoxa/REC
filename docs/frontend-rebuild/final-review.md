# Independent frontend integrity review

Reviewed 17 October 2026 against the supplied master execution brief and [feature preservation matrix](feature-preservation-matrix.md). Target: the integrated, uncommitted frontend rebuild on `design/pro-rebuild-20261016`, following the PR #26 baseline. This was an independent source and focused executable review; it did not deploy or write live REC records.

## Verdict

No unresolved material defect was identified in the inspected areas after the fixes below. Focused frontend checks pass. Overall delivery remains **partial** until the separately required preview and authorised live validation are completed. Visual fidelity, full verification and browser results belong to the integrator's [visual QA record](visual-qa.md); this review does not substitute for them.

## Findings resolved during review

| Severity | Finding and observed failure                                                                                                                                                                                                                                       | Final correction and evidence                                                                                                                                                                                                                                                                  |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1       | Closing vacancy A optimistically removed it from the active queue, retargeting the still-open confirmation to B and re-enabling its Confirm button. A rejected request also left the confirmation on B; closing the final active vacancy removed pending feedback. | The confirmation pins its vacancy snapshot, uses independent pending state and a duplicate-request guard, retains feedback when the queue empties, and restores the failed target selection. The three deferred-fetch closure regressions failed before this correction and now pass.          |
| P2       | Same-route links from global search changed URL parameters without reinitialising the vacancy workspace, stakeholder detail or run search. Those components read URL intent only into initial state.                                                               | The three server pages now key their client surfaces by relevant route parameters. Source inspection confirms each parameter reaches the keyed surface. Browser confirmation is tracked separately by the integrator.                                                                          |
| P2       | Candidate detail displayed every earlier workflow stage as completed, although the supported operation allows skipping stages and the read model has no workflow history.                                                                                          | Detail now displays the actual current stage and states that earlier history is unavailable. Source re-review confirms the inferred completed-stage list and checkmarks were removed.                                                                                                          |
| P2       | Disabling all closure controls while pending left the legacy focus trap with no focusable items. Tab escaped to the background skip link.                                                                                                                          | Pending focus moves to the focusable drawer; the trap prevents Tab and Shift+Tab from escaping when no enabled control remains. The new regression reproduced the escape before correction and now passes, including blocked Escape/backdrop dismissal.                                        |
| P2       | Workbench candidate operations shared one pending string while allowing simultaneous writes. Completion of A could re-enable still-pending B, allowing later edits to race B's rollback.                                                                           | Workbench candidate mutations are serialised with a synchronous guard and disabled mutation controls. Vacancy closure also waits for the candidate request. A deferred 403 regression failed before correction and now verifies rollback, re-enabled controls and unchanged research evidence. |

Production fixes were made by the integrator. This reviewer added only the authorised [close transaction regressions](../../src/components/workspace/workspace-close-race.test.tsx), [candidate transaction regression](../../src/components/workspace/workspace-candidate-race.test.tsx), and this report.

## Requirement traceability

| Requirement or risk                                                      | Evidence reviewed                                                                                                                           | Result within this review                                                            |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Candidate identity remains separate from vacancy assignment              | Directory deduplication by candidate ID; assignment selector; exact vacancy/candidate request IDs; two-assignment interaction tests         | Pass                                                                                 |
| Research bucket, claims and QA remain separate from recruiter operations | Mutation payloads and local patches; candidate rejection and cross-assignment tests; no changes to protected repository/operations adapters | Pass                                                                                 |
| Failed mutations restore local state and remain actionable               | Deferred closure and candidate rejections, pinned confirmation, serialised writes                                                           | Pass with simulated endpoint responses                                               |
| Deep links and filter restoration retain their intended context          | Keyed route surfaces; vacancy/candidate deep-link test; saved-view sanitiser and restoration of relationship, research stage and ordering   | Pass in inspected source/component scope; browser URL transitions tracked separately |
| Employer uncertainty and stakeholder email distinctions remain visible   | Organisation label grouping, mixed evidence, separate observed/inferred email fields and original confidence statuses                       | Pass in inspected source/model scope                                                 |
| Research QA and publication status are not invented from workflow        | Evidence record links and status mapping; run completion wording; explicit missing receipt/history messages                                 | Pass in inspected source/model scope                                                 |
| Authentication, data reads and publication boundaries survive            | Diff inspection of repository adapter, types, operations validation, Supabase clients, proxy, auth callback and API routes                  | No changes in these protected boundaries; live behaviour unverified                  |

## Fresh focused execution

Executed from `/workspace/REC` after the production fixes:

```bash
npx vitest run \
  src/components/workspace/workspace-candidate-race.test.tsx \
  src/components/workspace/workspace-close-race.test.tsx \
  src/components/workspace/workspace-rebuild.test.tsx \
  src/components/candidates/candidate-markets.test.tsx \
  src/components/research/research-model.test.ts \
  src/components/organisations/read-model.test.ts \
  tests/unit/frontend-shell.test.tsx
```

Exit status **0**: **7 files, 48 tests passed**. These checks cover transaction races and rollback, pending focus, candidate assignment isolation, filters and pagination, claim confidence groups, safe public links, organisation grouping, authorised-record search, navigation and shared modal interactions.

The changed source-text smoke checks retain their prior assertions and read both the workspace controller and its extracted rendered panels. They are contract guards, not substitutes for rendered behaviour or live persistence.

## Coverage limits

- All endpoint responses in this review's component tests are simulated. No authenticated Supabase reads, live RLS/role cases, OTP delivery, production operations, publication receipts or live persistence were validated here.
- Route keys were independently checked in source. This reviewer did not execute a Next.js browser transition; the integrator owns that browser evidence.
- Detailed claim citations, timestamped QA review history, workflow history, master organisation identity and run publication receipts remain unavailable in the existing read model. The new screens disclose these limits.
- Full-suite results, seven-width responsive inspection, reference comparison and preview deployment must be assessed using their own evidence. Passing the focused tests alone does not establish the complete definition of done.
