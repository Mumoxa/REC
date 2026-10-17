# REC application design system

The supplied Pro project governs the rebuilt application composition. The user’s 17 October correction restores the official Talent Tree palette and artwork while preserving the rebuilt layouts, typography, spacing and controls. The canonical research, evidence, operational and authentication contracts remain REC’s own. The historical buildless interface/prototype is isolated from the production routes; it is not the new frontend foundation.

## Tokens and composition

Source: src/app/tokens.css, globals.css and shell.css. Talent Tree ink #0E2A3A and deep navy #071F2D frame warm paper #F4F1EA with white operational surfaces, brand azure #006DA3, bright azure #5AB9E8 and quiet blue #D9EAF3. The palette follows the official values documented in interface/design-system.md. Shared navigation and login use the existing, unmodified public/talent-tree-logo-2026.png artwork rather than a generic leaf. The sidebar is 272px at desktop widths from 1100px; narrower screens use an accessible drawer. The utility bar keeps global search, branding and explicit demo/live status available. The dashboard uses the reference’s dark hero enclosing four real KPI cards, a multi-column operational body and bright azure priority panel with white action rows.

The sans-serif stack uses system Inter when available and native platform fallbacks; no external font request is required. Headings are 28–36px, section headings about 21px and operational body 13–14px. Rounded surfaces use 10/14/20px tokens and pill controls. Counts use tabular numerals. Lucide SVG icons replace decorative Unicode production icons.

Evidence is labelled independently of QA: confirmed green, probable blue, hypothesis amber, unknown neutral. Blocking QA is red; pass with unknowns is amber; pass is green. Text always carries the status. Research Top 10 and Recruiter Top 10 are separate labels, values and operations.

## Shared primitives

src/components/ui/primitives.tsx supplies PageHeader, StatCard, Badge, EmptyState and Dialog. Common buttons, fields, tables, skeletons, pagination and semantic surfaces share global classes. Dialog supplies labelled modal semantics, Escape/backdrop cancellation, focus trap/restoration, nested-dialog handling and body scroll locking.

The workbench retains domain-specific confirmation drawers: closure must pin the original vacancy while optimistic filtering changes the visible selection, keep the transaction visible for the last active record, prevent dismissal or duplicate submission while pending, and restore the exact record on failure. This transactional lifecycle is deliberately separate from generic read-only record dialogs. Both use the same design tokens and visible confirmation language. Candidate exclusions require a reason and preserve the research bucket.

## Responsive behavior and motion

The workbench uses a compact queue, dominant intelligence panel and candidate context on wide screens. At constrained widths it uses deliberate pane navigation without losing selection or filters. Mobile filters collapse so the workspace stays reachable. Research tables become mobile record cards where status/actions would otherwise be hidden. Other tables contain horizontal scrolling inside positioned wrappers, preserving document reflow and readable typography.

Hover changes last about 150ms; dialogs enter over about 180ms. There are no artificial AI/loading delays. prefers-reduced-motion reduces animation and transitions. The skip link targets a focusable main landmark; visible focus outlines, labelled controls and keyboard tabs support non-pointer use.

## Data and capability boundaries

All views consume getWorkspaceSnapshot through existing server pages. New read models derive employers, people, evidence queues and activity from authorised records, preserving uncertainty and vacancy assignments. No reference API, schema, seed, account or business metric is imported. Unsupported execution, outreach, placement and revenue capabilities are absent or explicitly unavailable. Missing full QA history, claim source URLs and target-company data are identified in context rather than fabricated.

## Loading behavior

Protected workspace links disable speculative route prefetch, preventing background requests for other authenticated pages. Candidate and organisation intelligence are split into lazy modules with labelled loading feedback; direct links still render the selected record. Candidate and organisation filtering uses deferred, memoized results so text entry can update before larger result calculations. Global search builds its record index once when opened. The vacancy stylesheet loads from the vacancy route instead of the root layout. No shared cache of private workspace records is introduced.
