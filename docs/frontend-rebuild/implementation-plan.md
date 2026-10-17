# REC frontend rebuild implementation plan

Goal: replace REC presentation with the supplied Pro visual language while preserving canonical research and validated operations. The supplied master execution brief is the controlling specification. Its explicit autonomy and parallel workstream instructions govern execution; routine design choices proceed without additional approval gates.

## Architecture and boundaries

Next.js server pages continue to call getWorkspaceSnapshot. Client views receive only the authorised snapshot. No reference API, database, seeding, mock login, fabricated metrics or AI behavior enters REC. Shared primitives own buttons, status badges, dialogs, focus, empty states and metric cards; AppHeader owns the responsive forest sidebar, utility bar and scoped global search. Feature directories own read models and screen components. Existing auth, ingestion and operational endpoints remain authoritative.

## Dependency order and ownership

- [x] Audit actual main and PR26 merge base, inspect every supplied frontend component, create preservation/data/screen matrices and safe reference screenshots.
- [x] Agree shared component props and exclusive file ownership before concurrent implementation.
- [ ] Replace tokens/global styles/shell and login presentation; add route loading/error/not-found boundaries. Verify navigation, global search, dialog focus/Escape and synthetic/live labels.
- [ ] Intelligence and organisations: derive honest scoped KPIs, lifecycle counts and attention queues; searchable organisation grouping with record-linked details. Test unknown employer isolation, overlapping identities and uncertainty.
- [ ] Vacancies: rebuild queue/detail/candidate composition and extract read-only panels, preserving controller mutations/rollback. Verify close/exclusion reason, saved views, candidate focus, deep links, density and mobile pane state. Extend saved facets compatibly when adding filters.
- [ ] Candidate markets: identity cards with assignment-specific evidence/fit/actions; maintain research bucket independently. Verify filtering, exact action payloads, rejection/error recovery and contextual return links.
- [ ] Stakeholders, Evidence & QA, Runs: preserve vacancy association, observed/inferred email distinction, independent QA and claims, recorded metrics and honest completion caveats. Test absent history and exact entity links.
- [ ] Integrate: run npm run verify; independently challenge preservation matrix, API boundaries and absence of reference data. Capture all major routes at 375/430/768/1024/1280/1440/1920, inspect desktop/mobile gallery and accessible reflow. Exercise search, filters, drawers, Escape, operations and deep links in Chromium.
- [ ] Commit only reviewed files; update PR26 through its existing branch when Git access permits. Deploy an isolated existing-project Vercel preview only with authorised credentials, inspect safe authorised records and report actual evidence. Never merge or promote production.

## Review focus

1. Generic unresolved employer names must not merge distinct unknown employers.
2. Repeated candidate IDs and stakeholder keys must retain vacancy-specific assignments and confidence.
3. Failed live writes must not display success or alter independent research buckets.
4. Old saved views must restore deterministic defaults and new facets must round-trip.
5. Long evidence, constrained widths, modal nesting and keyboard use must preserve reading/focus without document overflow.

## External limits

Git HTTPS reads work; GitHub REST/GraphQL API currently responds Forbidden, so remote check rollup cannot yet be established. Vercel and live Supabase access are being checked independently. No deployment/readiness claim may be inferred from the local demo.
