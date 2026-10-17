# Supplied frontend reference audit

Source: extracted `ai-recruitment-management-platform.zip` at `/workspace/reference-project`.
Inspected all eight frontend components, `src/app/page.tsx`, `layout.tsx`, `globals.css`, package configuration, and the AI route to distinguish implemented interactions from visual placeholders. No reference data, API implementation, database schema, seeding, authentication bypass, or mock AI behavior should enter REC. Source findings were followed by isolated local Chromium renders using synthetic request fixtures; details and screenshot locations follow.

## Reference inventory and composition

| File                                   | Purpose                                         | Main visual structure                                                                                                                     |
| -------------------------------------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/page.tsx`                     | Whole application frame and local tab switching | Forest desktop sidebar + independent light sticky top bar + bounded warm canvas; mobile bottom bar                                        |
| `src/components/Sidebar.tsx`           | Desktop navigation                              | 280 px forest rail with brand, six rich navigation rows, two funnel meters, bottom account card                                           |
| `src/components/MobileNav.tsx`         | Small-screen navigation                         | Fixed forest bottom strip, five icon/label buttons, selected white tile                                                                   |
| `src/components/DashboardView.tsx`     | Intelligence dashboard                          | Dark hero with embedded KPI cards; 8/4 column section with funnel and vacancy table left, lime actions and candidate/activity cards right |
| `src/components/OrganizationsView.tsx` | Organisation directory                          | Heading/action, white filter capsule, 3-column company card grid, edit/create modal                                                       |
| `src/components/VacanciesView.tsx`     | Vacancy directory                               | Heading/grid-list switch/action, filter capsule, 2-column cards or full-width table, stage controls, edit/create modal                    |
| `src/components/CandidatesView.tsx`    | Candidate directory                             | Heading/action, search/filter/scoring strip, 3-column candidate cards with inset intelligence, edit and AI modals                         |
| `src/components/StakeholdersView.tsx`  | Stakeholder directory                           | Heading/action, search/influence filters, 3-column portrait cards with inset notes, edit and AI modals                                    |
| `src/components/EvidenceView.tsx`      | Evidence dashboard                              | Three KPI cards, full-width activity log, forest CTA band                                                                                 |

This is a full composition reference, not a request to recolor REC's existing dense operating panels. The navigation, page widths, whitespace, card hierarchy, action shapes, and per-page information grouping work together.

## Shared visual system

| Token           | Reference value or usage                                                     | Rebuild interpretation                                                 |
| --------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Main canvas     | `#F8F7F2`                                                                    | Warm neutral foundation across routes                                  |
| Forest          | `#0F1E16`                                                                    | Sidebar, hero, primary buttons, strong badges, modal headers           |
| Lime            | `#C6F042`                                                                    | High-priority CTA, hero second line, selected accents, AI action panel |
| Secondary green | `#1A6B4A`                                                                    | Funnel series; semantic positive text also uses emerald utilities      |
| White           | `#FFFFFF`                                                                    | Cards, selected nav row, inputs, selected contrast action              |
| Secondary text  | Mostly slate-500/600; root `--muted: #6B7280`                                | Quiet readable descriptions and metadata                               |
| Lines           | Slate-200; white at 10% on forest                                            | Thin outlines; card boundaries primarily surface + border              |
| Font            | System sans; 400 body, 500/600 labels and headings, 700 metrics              | No serif display headings in reference                                 |
| Page title      | 24 px / semibold                                                             | Ordinary directory heading                                             |
| Hero title      | 28 px small / 36 px from 768 px, weight 600, tight tracking, line-height 1   | Two-line dominant headline                                             |
| Body            | 14 px; descriptions mostly 12/14 px                                          | More open than REC's existing dense 11–13 px workspace                 |
| Microlabels     | 10–11 px, uppercase, wide tracking                                           | KPI/table headers, status/influence labels                             |
| Major radius    | 24 px hero and dialogs, 20 px dashboard panels                               | Clear soft geometric hierarchy                                         |
| Standard radius | 16 px ordinary cards/filter panel, 12 px inset content, 999 px buttons/chips | Avoid rectangular primary controls                                     |
| Gaps            | 24 px between major sections; 16 px directory cards; 12 px compact groups    | Shared measured rhythm                                                 |
| Padding         | 20 px directory cards, 24 px dashboard panels, 24/32 px hero                 | Air around content and distinct sections                               |
| Borders/shadows | Thin light borders; only subtle hover elevation                              | Forest/lime surfaces carry emphasis rather than heavy drop shadows     |
| Scrollbars      | 6 px, light gray thumb, transparent track                                    | Quiet overflow treatment                                               |

The reference loads no custom font, image library, icon package, or chart library. Symbols are Unicode glyphs (`◈`, `⬢`, `◎`, arrows), avatars use external `i.pravatar.cc` URLs, and company marks are text. Rebuild icons can be consistent inline SVGs; use REC identity and privacy-appropriate avatar fallbacks rather than importing synthetic people or depending on a remote avatar service.

## Shell and navigation

At `lg` (1024 px), a 280 px `sticky top-0 h-screen` sidebar becomes visible. It participates in a horizontal flex frame and does not require a left-margin hack. The rail scrolls independently when needed. Main content uses `flex-1 min-w-0` to contain overflow.

The brand block has 24 px horizontal padding, a 36 px lime rounded square symbol, 18 px white wordmark, 11 px tracked uppercase descriptor, and a two-line muted tagline below. A light separator ends the brand region.

Navigation uses 12 px outer gutters and vertically stacked rounded 12 px rows with 12 px internal padding. Each row contains a 32 px icon tile, a two-line label/description, and an optional count pill. Inactive rows are white at 70% opacity with a translucent icon tile. The selected row is white with forest text; its icon tile is forest with a lime glyph. Counts invert to dark pills. This is a stronger selected state than a colored text link.

Six reference destinations are Intelligence, Organisations, Vacancies, Candidate markets, Hiring stakeholders, and Verified evidence. REC also needs real Runs and QA destinations and a way to retain all existing working routes. Navigation in REC should use real route links with `aria-current`, browser history, and direct URLs; the reference uses local `active` state and therefore cannot be copied as routing architecture.

Below navigation, a thin separator introduces an uppercase Sales Funnel label and two compact progress meters. A bottom account module has a 36 px avatar, name/email, small circular action, and private-workspace footnote. All numbers and account data in this reference section are synthetic; use real derived REC context or clear unavailable states.

The separate top bar is sticky at top, z-index 20, warm canvas at 80% opacity, backdrop blur, and a slate divider. It has 16 px horizontal padding, rising to 32 px at 1024 px; 12 px vertical padding. A white pill search field with subtle border is visible from 768 px, capped as part of a 576 px group. A dark AI assist pill appears only at desktop. Right-hand controls include a reseed button (reference only), circular notification control, and 32 px avatar. Small screens show a compact forest logo/wordmark instead of desktop search. REC must retain honest environment/status information and useful global search rather than the reference reseed action or fictional identity.

Main area: `max-width: 1400px`, centered, 16 px horizontal gutters below 1024 px and 32 px above; 24 px top padding, 96 px bottom space on mobile and 32 px desktop. Most pages use 24 px section gaps.

## Intelligence dashboard

`DashboardView.tsx` lines 31–62 define a 24 px rounded forest hero. It has lime blurred circles/radial glow only as low-opacity background decoration. Content is above them using relative positioning.

The top hero group stacks below 1024 px and becomes a horizontal text/actions arrangement above it. A small translucent capsule presents a pulse indicator and signal summary. The large headline is two lines, with lime on the second; a muted 14 px paragraph below is limited to roughly 576 px. Adjacent actions are lime and white pills with 20 px horizontal / 12 px vertical padding.

Four white KPI tiles live _inside_ the forest hero, separated from the headline by 32 px. They form two columns below 1024 px and four above, with 12 px gaps. Each tile has 16 px padding and radius, a 32 px forest icon circle, 11 px uppercase label, 24 px bold figure, and small green status caption. This enclosure is a major reference characteristic.

Below the hero, the dashboard uses a 12-column desktop grid with a left 8-column region and right 4-column region separated by 24 px; it becomes a single stack below 1024 px.

The left region contains:

1. A 20 px rounded white funnel panel, 24 px padding. Heading and compact quarter pills sit above a six-column fixed-height bar chart. Bars are rounded at the top, have numeric values near their bases, and use gray, green, forest, lime, and amber. Labels sit below bars. Three warm inset summary tiles follow a top separator. In REC, labels/counts must reflect supported recruitment and pipeline stages; fake commercial conversion or placement statistics must not be introduced.
2. A white vacancy table panel with generous heading row and View all action. The table uses warm uppercase header, thin row dividers, two-line role cells, priority pills, dark stage pills, and right-aligned financial values. A horizontal overflow wrapper is present. REC vacancy links and fees must follow real data semantics, with unavailable financial metrics handled honestly.

The right region contains:

1. A lime rounded action panel: dark icon circle + uppercase eyebrow, small action-count pill, 18 px title, supporting copy, then four white rounded action rows. Each row has a dark arrow circle, title/metadata, and a dark hover inversion. REC should derive actions from existing vacancies, candidate states, evidence gaps, and research runs.
2. A white candidate spotlight panel with evidence/status badge, warm horizontal candidate rows, 40 px avatar, name and score badge, title/location, up to three skill chips, View action, and full-width dark Explore button.
3. A white activity panel with a thin vertical timeline, 16 px completed/pending circular markers, title, description, timestamp/type, and semantic priority pill.

The reference dashboard opens a centered 672 px maximum-width AI dialog with 24 px corners, black 40% blurred backdrop, forest heading, lime icon, a scrollable result body, evidence/source chips, and warm action footer. Height is capped at 80 vh. The source's result is plain preformatted text, not rendered Markdown. In REC, any intelligence preview must identify actual evidence and expose safe meaningful actions; do not reproduce fabricated grounded status or simulated sending.

## Organisations

The page begins with a 24 px semibold title, one muted description line, and a dark pill New organisation action. From 768 px the heading/action share a row; below that they stack.

A separate white rounded 16 px filter panel uses 16 px padding and 12 px gaps. The search fills remaining width and has a warm background and leading search symbol. Adjacent warm pill selects filter status and industry. Controls stack below 768 px.

The card grid has one column small, two from 768 px, three from 1024 px, with 16 px gaps. White 16 px rounded cards have 20 px padding, subtle border, and hover elevation. The top pairs a 48 px forest rounded company mark and small semantic account-status pill. Name and compact industry/location/size metadata follow; a two-line description sits below. Employee and verified chips precede a divider. Footer pairs revenue potential with two circular edit/delete actions. REC company detail should use existing relationships and available records; do not import arbitrary account revenue, employee counts, or verification badges.

Loading uses six 192 px shimmer cards; no results is a white dashed panel with central icon, title, and explanatory text. Create/edit is a 672 px dialog with heading/close, two-column fields from 768 px, full-width name/description, and pill Save/Cancel footer. Source fields include industry, size, location, status, website, revenue, employees, description. These fields describe the reference, not permission to alter REC's data model.

## Vacancies

Heading/action composition matches Organisations, adding a white pill segmented Grid/List toggle with dark selected segment and lime New vacancy action. The filter panel includes search, stage, priority. A two-column card grid starts at 768 px.

Vacancy cards use white, 16 px corners, 20 px padding, top-left bold uppercase priority pill, and small edit/delete circles top-right. Role title and location/work/employment metadata precede a two-line description. A chip line presents stage, salary range, and green fee value. The divided footer contains applicant/deadline metadata and four compact stage pills, with current stage lime. Stage changes are optimistic server PATCHes in the reference. REC must retain its actual vacancy, gate, run, and candidate workflow semantics rather than replacing them with this simplified stage model.

List mode is a full-width white rounded table with warm header, role/applicant two-line cells, location, stage pill, right-aligned fee, and Edit/Delete actions. The reference list table lacks a protective overflow wrapper; the rebuild should provide one or a responsive alternate presentation. Long chips and footer controls in source cards can overrun narrow cards and should wrap appropriately.

The create/edit dialog matches shared 672 px, 24 px corners, 90 vh maximum, scrollable body. It includes title, organisation, location, work/employment type, salary min/max, fee percent/value, description. It uses the reference's backend and should not be copied into REC.

## Candidate markets

Heading uses a dark Add candidate action. Search/filter strip adds a soft green AI-scoring indicator at the right. Card grid is one/two/three columns at base/768/1024 px.

Each 20 px padded white card starts with a 48 px portrait, truncated name/title, muted location/experience, and a match badge. Match score at least 90 is lime, at least 80 amber, otherwise gray. Skills wrap into warm bordered chips. An inset warm 12 px rounded box presents a small dark intelligence icon, AI groundwork label, and three-line summary. A metadata row aligns availability status and salary/notice. Bottom actions are a full-width dark AI summary pill, warm Edit, circular destructive control, and optional small verified-evidence caption.

REC's candidate-market contract is broader credible market → strongest market → Top 10 → client-submittable, with evidence and vacancy relationships. The reference directory layout is useful, but its standalone availability score and generic reference claims do not express those stages. Preserve the contract and make market selection, evidence, shortlist, submit readiness, and exports understandable within this visual hierarchy.

Candidate edit dialog uses a two-column form (name, email, phone, title, location, salary, notice, status, skills, experience, avatar, summary), 672 px maximum width, scrollable 90 vh body. AI summary dialog is narrower (576 px maximum), forest header, white text result, warm footer with lime Draft outreach and white Close. Only open/close and result fetch are implemented; Draft outreach is a placeholder.

## Hiring stakeholders

The same heading/filter/card rhythm continues. Search covers name/role/email; a warm influence select sits alongside. Grid is one/two/three columns at base/768/1024 px, though loading skeletons incorrectly use only two columns.

Card top has 48 px portrait, name, role + organisation, email, and uppercase influence chip. Decision maker is forest, champion green, blocker red, other gray. An inset warm notes box has a two-line clamp. Last contact and phone occupy a small metadata line. The action row has lime AI briefing, warm Edit, and circular Delete.

The edit dialog has name, role, organisation, influence, email, phone, LinkedIn and notes. The AI dialog follows candidate intelligence styling but uses a dark Use in outreach action. REC hiring-team intelligence must retain verified/probable/distinct evidence levels and source links; an influence chip cannot imply verified hiring authority without evidence.

## Verified evidence

Three white cards become a three-column grid only at 1024 px. Each uses 20 px padding, 40 px dark icon circle, 30 px bold metric, 14 px label, and 12 px caption. All reference figures are hardcoded, including placements, satisfaction, and placement time.

The evidence log is a full-width white rounded panel with heading, positive status chip, and divided rows. Each row has a 40 px type icon, activity title/description/time/type/priority, and a right-hand status column. Type colors distinguish placement green, offer blue, submission amber, and other gray. The reference marks every record Verified regardless evidence. REC must replace this with true sourced evidence records and supported QA states.

A full-width forest rounded CTA band ends the page, with white heading/muted text and lime Generate packet pill. It stacks below 768 px. The source button is inert; REC should expose a real evidence review/export action supported by existing behavior, or explain its unavailable state.

## Responsive and interaction requirements

| Width             | Reference changes                                                                                                                           | Rebuild considerations                                                                                                                              |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Below 768 px      | All directory controls/headings stack; search top bar hidden; one-column cards; mobile bottom nav; hero 28 px; content gutters 16 px        | Keep navigation and selected vacancy/candidate context available, provide all destinations, prevent chip/action overflow, keep touch targets useful |
| 768–1023 px       | Two-column entity/vacancy cards; filters and headings become rows; top search appears; hero 36 px; dashboard still stacked; no desktop rail | Verify narrow two-column cards with real long content; dialogs use two-column forms                                                                 |
| 1024 px and above | 280 px desktop sidebar, no mobile bar; 32 px gutters; 3-column entity grids; 2-column vacancy grid; dashboard 8/4 split; 4 hero KPI columns | Match reference visual hierarchy while retaining meaningful content widths and existing workflow                                                    |
| Wide desktop      | Content capped at 1400 px within flexible main region                                                                                       | Do not stretch cards indefinitely or impose a 3-panel operating console on every view                                                               |

Reference hover changes are simple color/background/elevation transitions. Skeletons use a horizontal shimmer at 1.4 s; live indicators pulse. It has no reduced-motion override. REC should retain reduced-motion support and visible keyboard focus.

The source dialogs lack accessible dialog roles, focus trapping/restoration, Escape handling, and proper visible labels for many form controls; icon-only controls also lack names. Preserve the visual composition while supplying these interactions. Backdrop closes the AI dialogs, while edit dialogs generally require close/cancel. Scrolling and sticky layers need explicit testing: mobile bar is z-index 50, same as reference dialogs, and can overlap them depending DOM order.

## Reference behavior that must not be transplanted

- `page.tsx` silently POSTs `/api/seed` on first mount when dashboard data is absent/empty. The account action also reseeds. No unchanged reference app should run against any REC backend, and no seeding should be triggered during previews.
- The reference uses a Drizzle/PostgreSQL backend and unauthenticated demo identity. REC's Supabase model, API contracts, authentication, ingestion, persistence, and real data must remain authoritative.
- AI responses are deterministic templates containing invented reference checks, scores, placement success, live-market claims, and grounded/source markers. These are not evidence.
- Global search has no handler. AI assist, notifications, quarter switches, Generate packet, Copy & Send, Edit inside dashboard AI, Draft outreach, and Use in outreach are decorative/inert controls.
- Sidebar counts, funnel conversion, hero signal count, revenue/placement/relationship claims, and evidence KPIs contain hardcoded mock values. Use actual data, explicitly unavailable states, or honest local-demo labeling.
- Reference create/edit functions generally ignore HTTP failure status and only roll back network exceptions; deletes do not restore failures. Organisation creation incorrectly tests truthy `editing` and can PATCH an undefined ID. These implementation bugs are not requirements.
- Search fires a fetch on every keystroke without cancellation/debouncing. Error/retry handling is absent; a failed dashboard shape can crash rendering. REC needs existing safe loading/error behavior.
- Reference mobile nav omits Evidence and has no More menu. All real REC destinations, including Runs and QA, must remain reachable at every viewport.
- Timestamps use browser locale without a fixed zone. REC's explicit South Africa time labeling should be retained.
- Reference fake avatars/identities and external image URLs should not replace actual REC records or create privacy assumptions.

## PR #26 audit against the supplied reference

Read-only evidence: `git show FETCH_HEAD` identifies commit `c1d642612ea9c46d0eda7b9bd61b0d7164328872`, title `style(ui): establish persistent Pro-inspired desktop sidebar across REC routes`. The diff changes only `src/app/pro-pages.css`, adding 29 lines.

What it gets toward the reference: a persistent forest desktop rail, vertically stacked links, a bottom context area, and corresponding content offset. It does not create a reference-equivalent shell or rebuild the page compositions.

Material differences:

1. Rail appears only from 1280 px and measures 244 px, or 220 px through 1450 px. Reference uses 280 px beginning at 1024 px. Large-tablet and smaller desktop layouts therefore never gain the intended rail.
2. Existing horizontal header markup is repositioned with fixed positioning and margin offsets. Reference has a genuine sidebar + flexible main frame and an independent light sticky top bar. PR moves search into the rail instead of the top bar.
3. Existing text-only links become a column; rich icon tile, secondary description, actual badge, selected white row hierarchy, brand/tagline region, and bottom contextual card are absent.
4. Existing app/workspace three-column constraints are retained and tweaked. Reference directory pages and dashboard use their own full-width compositions. At 1280 px, enforced panel minimums can exceed usable width.
5. No hero with enclosed KPI tiles, six-stage bar funnel, lime action stack, candidate spotlight, entity cards, vacancy Grid/List view, filter capsules, evidence log, or reference modal system is implemented by this diff.
6. Existing `.rec-pro-content` caps at 1550 px with variable 18–42 px padding; reference caps at 1400 px and uses 16/32 px horizontal, 24 px vertical rhythm. Existing actions use 12 px radius rather than pills and KPI styles are standalone outside a hero.
7. PR does not introduce the reference mobile bottom navigation or repair route access on small screens.

PR #26 can be understood as a preliminary sidebar treatment. It is not a complete implementation of the supplied frontend brief. The rebuild should replace composition-level structures with shared reusable shell/card/filter/dialog patterns while preserving REC's working data and workflows.

## Acceptance evidence to collect

Capture reference and rebuilt desktop views at matching viewport widths, plus tablet and mobile captures for the rebuilt app. Compare shell proportion and active navigation, hero/KPI enclosure, dashboard left/right hierarchy, directory filter/card spacing, detailed vacancy/candidate workflows, long-content wrapping, empty/error/loading states, and dialog accessibility. Interaction verification should cover real navigation/search/filtering, candidate-market tiers, evidence links, shortlist/submit-ready actions, export, role access, and persistence boundaries. No fake-data visual match is sufficient evidence of correct REC behavior.

## Isolated reference rendering evidence

The extracted reference was installed only inside `/workspace/reference-project`, using an npm cache under `/tmp`; no REC package or lockfile changed. Its automatic seed effect and reseed action were disabled in that isolated copy. The reference dev server runs at `http://localhost:3001`. Browser context interception fulfills every `/api/**` request using synthetic in-memory fixtures, so reference database routes are never invoked. Synthetic avatar SVGs are supplied locally. The browser capture observed no page errors and no seed requests; all observed application API requests were GETs intercepted before reaching the server. The Next.js developer indicator is hidden for clean comparison captures.

Twenty screenshots are under `docs/frontend-rebuild/screenshots/`:

- `reference-{intelligence,organisations,vacancies,candidates,stakeholders,evidence}-desktop.png`: 1440 × 1000 viewport, full page.
- `reference-{intelligence,organisations,vacancies,candidates,stakeholders,evidence}-tablet.png`: 768 × 1024 viewport, full page.
- `reference-{intelligence,organisations,vacancies,candidates,stakeholders,evidence}-mobile.png`: 375 × 812 viewport, full page.
- `reference-vacancies-list-desktop.png` and `reference-vacancy-dialog-desktop.png`: alternate table and dialog compositions.

Rendered desktop intelligence confirms the visual priorities: uninterrupted forest rail, light independent search bar, dark hero with four enclosed white KPIs, bar-funnel/table left, and lime action stack/candidate/activity right. The mobile vacancy capture confirms the intended warm card rhythm and bottom strip, as well as the source limitation that the fixed bar overlays content at viewport-bottom position in a full-page image. These captures illustrate the supplied design with fictional fixtures, not real REC results or verified evidence.

Full-page capture dimensions expose two reference mobile overflow defects at a requested 375 px viewport: intelligence renders 574 px wide and stakeholders 389 px wide. The other four mobile views stay at 375 px. Do not reproduce these defects: use `min-width: 0` on grid children, contained table overflow, and wrapping badge/action groups. Desktop and tablet captures remain at their requested widths.
