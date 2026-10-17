# Rebuild validation

Local validation uses the repository’s synthetic demo, never the reference project’s seed/database. The source and API boundary review is recorded in final-review.md. Screenshots contain only existing synthetic REC demo records and clearly identified reference fixtures.

## Commands

```bash
NEXT_PUBLIC_DEMO_MODE=true NEXT_TELEMETRY_DISABLED=1 npm run verify
node tests/full-candidate-market-smoke.mjs
```

Fresh result: typecheck and lint pass; three contract smoke checks pass; eight product regression checks pass; **106 tests across 17 files pass**; production Next.js build passes. The additional full-market smoke passes. Race tests were observed failing before the fixes and passing after them. Existing source-text assertions were preserved across the panel extraction.

For repeatable browser checks, start the built synthetic demo in a separate terminal:

```bash
NEXT_PUBLIC_DEMO_MODE=true NEXT_TELEMETRY_DISABLED=1 npm run start
BROWSER_EXECUTABLE_PATH=/usr/bin/chromium npm run test:browser
```

The runner uses Playwright and axe-core, requires an explicit Demo data indicator, blocks backend operation requests, tests seven viewport widths, and writes screenshots/report to /tmp/rec-browser-qa by default. Set REC_SCREENSHOT_DIR to choose an artifact directory. On a machine without system Chromium, install the Playwright Chromium browser and omit BROWSER_EXECUTABLE_PATH. REC_TEST_BASE_URL selects a different local test origin. `--details-only` narrows diagnosis to interactions/dialogs and does not replace the full default run.

The browser checks cover same-route search navigation, saved filter round trips, organisation tabs, candidate research/workflow separation, run search/details, mobile drawer focus/Escape and pane context, plus close-reason confirmation/cancel. Motion is allowed to settle before contrast analysis to avoid measuring transient entrance frames. There are no disabled accessibility assertions.

## What this does not prove

Component network responses are mocked; browser operations are temporary demo changes. These checks do not prove authenticated Supabase access, real permission/RLS enforcement, OTP delivery, production mutation persistence, research publication, high-volume performance or an external preview deployment. Those require separate authorised evidence. A passing build is not a production-readiness recommendation.
