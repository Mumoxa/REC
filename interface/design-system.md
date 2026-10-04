# Workspace design system — Horizon / evidence-first operations

## Design read

Reading this as: a high-volume, evidence-first recruitment-intelligence ATS workspace for specialist recruiters, with a trust-forward operations-console language, leaning toward a bespoke enterprise system rather than a marketing site or generic AI dashboard.

The product idea remains unchanged: four independent sourcing channels feed one canonical vacancy, independent QA, evidence-backed candidate mapping and a recruiter workflow. This visual system does not add a channel, research capability, ranking model or second source of truth.

## Applying Taste Skill to this product

The design pass used the audit-first and brief-inference approach from [Taste Skill's `design-taste-frontend`](https://github.com/Leonxlnx/taste-skill/tree/main/skills/taste-skill) and the targeted-upgrade guidance in [`redesign-existing-projects`](https://github.com/Leonxlnx/taste-skill/tree/main/skills/redesign-skill), checked on 2026-10-03.

Taste Skill explicitly scopes its default frontend rules to landing pages, portfolios and redesigns, and says not to apply them mechanically to dashboards or data tables. The ATS is a dense operational tool, so the build deliberately adapts its anti-default discipline instead of importing cinematic hero layouts, GSAP scroll effects, giant bento cards or spacious marketing-page density. The companion redesign audit was applied selectively: distinctive typography, a disciplined palette, interaction feedback, responsive layout, explicit empty states, accessible focus and semantic markup.

There is no existing frontend framework or design-system dependency in this repository. The prototype therefore uses native HTML, CSS and JavaScript rather than introducing a framework migration. It is a bespoke system informed by enterprise operations patterns; it is not represented as an official Carbon, Fluent or other vendor implementation.

### Design dials

| Dial | Setting | Product reason |
|---|---:|---|
| Design variance | 5 / 10 | Distinctive hierarchy and layered context without destabilising a work queue. |
| Motion intensity | 3 / 10 | Fast, quiet transitions; research and evidence are more important than spectacle. |
| Visual density | 7 / 10 | Recruiters need vacancy, evidence and candidate context visible at once. |

## What “2050” means here

The future-facing concept is operational, not decorative. A 2050-grade recruiting workspace should reduce context switching and make uncertain knowledge legible:

- **Persistent context:** three panes keep the vacancy, its evidence and its candidate market in one spatial working set.
- **Progressive compression:** expanded, compact and minimal queue density, plus Candidate Focus, adapt the same canonical records to triage or deep market work.
- **Evidence as an interface primitive:** source lineage, confidence, QA gates and unknowns are presented beside the relevant claim rather than buried in prose.
- **Explicit action boundaries:** stored-intelligence search is immediate; new web/AI research is an explicit, separately logged operation.
- **Temporal awareness:** first seen, last seen, last verified and lifecycle state remain visible so a recruiter can judge recency rather than trust a static “match” score.
- **Adaptive work surfaces:** at narrow widths the recruiter switches among queue, vacancy and candidate panes without losing the selected role or saved view.

No holographic chrome, sci-fi gradients, fabricated certainty or unexplained AI score is used as a substitute for product capability.

## Visual tokens

The live token values are defined in `interface/prototype/styles.css` under `:root`.

| Token | Value | Use |
|---|---|---|
| Deep ink | `#111a17` | Global application chrome and navigation. |
| Primary text | `#17231e` | High-contrast labels and record content. |
| Page canvas | `#edf2ed` | Surrounding workspace canvas. |
| Primary surface | `#fbfcfa` / `#ffffff` | Queue, evidence and candidate work surfaces. |
| Structural line | `#dce5dd` | Panel and table separation, not decoration. |
| Signal mint | `#b7ef88` | Brand accent and active navigation cue; used sparingly. |
| Evidence green | `#24745c` family | Confirmed evidence and positive QA states. |
| Review amber | `#8b641e` family | Probable evidence, open questions and review states. |
| Conflict red | `#a5453d` family | Research failure, exclusion and destructive actions. |
| Display type | Aptos Display / Segoe UI Variable Display, with system fallback | Role titles and high-salience headings. |
| Interface type | Inter / Segoe UI Variable, with system fallback | Dense but readable workflow and evidence text. |
| Data type | SFMono-Regular / Consolas / Liberation Mono | IDs, timestamps, status keys and aligned counts. |

The prototype requests no remote font or asset provider; the system-first stack is private-by-default and remains usable offline.

Use tabular figures for numerical counts. Keep status labels in text in addition to colour. Borders are quiet and shadows are reserved for workspace elevation and transient surfaces. Small status labels may be compact; primary buttons, important actions and record text must remain legible at normal zoom.

## Layout and density

### Desktop

- Keep the canonical vacancy queue, selected vacancy intelligence and vacancy-scoped candidate market visible together.
- Give the selected record and evidence the strongest type hierarchy; do not style every pane as an equal card.
- Keep high-value scan fields in the queue: role, employer confidence, location, client relationship, source count, QA/research state, candidate-market progress and recency.
- Place filters and saved-view controls above the workbench. Use removable filter chips and show the applied scope.
- Retain pane-local scrolling; never make the entire page jump when a queue item changes.

### Tablet and phone

- At intermediate widths, preserve the queue and selected detail, then open candidate market as an accessible drawer.
- On narrow screens, present explicit Vacancies / Intelligence / Candidates pane switching. Preserve the selected vacancy and compatible filters.
- Do not squeeze the three desktop columns into unreadable miniatures or silently discard candidate context.
- Keep action targets comfortable, prevent horizontal page overflow and respect reduced-motion preferences.

## Evidence, recommendation and workflow semantics

Three statuses are never conflated:

1. **Evidence status** — `CONFIRMED`, `PROBABLE`, `HYPOTHESIS` or `UNKNOWN`, attached to an individual claim and its provenance.
2. **QA status** — the conclusion of independent review, with challenged claims, contradictions and remaining unknowns.
3. **Recruiter workflow** — Earmarked, Recruiter Top 10, Approach, Engaged, Submitted or Excluded for a specific vacancy-candidate assignment.

The evidence-backed `candidate-market-map.top_10` is labelled **Research Top 10**. A recruiter action that sets operational status `TOP_10` is labelled **Recruiter Top 10**. Updating one must not silently rewrite the other.

The 50-person candidate research-depth target is shown with explicit “not a quota” language. Do not turn it into a score, percentage completion or candidate-quality target that rewards list padding.

## Motion and interaction

- Use short opacity/transform transitions for pane, tab, menu and button feedback; no scroll-triggered spectacle in the ATS work surface.
- Provide visible `:focus-visible` rings and retain a clear selected state independent of hover.
- Support Escape to dismiss dialogs/drawers, arrow-key queue movement, Enter to select and a keyboard-accessible global search.
- Use confirmation and a required reason when closing a vacancy. Offer an undo path in the prototype; preserve sources, map, Top 10, search log and QA.
- Require a reason for excluding a candidate. The action is vacancy-specific and must not alter the person's evidence.
- Show distinct loading, empty, filtered-empty, error and access-limited states in production. Empty records are not the same as failed data loading.
- Honour `prefers-reduced-motion` and do not make information available only on hover.

## Accessibility, privacy and trust

- Target WCAG 2.2 AA for contrast, keyboard access, focus order, labels, dialog behaviour, reflow and status announcement.
- Use semantic landmarks, headings, tables with header cells, labelled fields, accessible dialog names and polite live regions for action feedback.
- Use colour plus text/icon/shape for evidence and QA semantics. Do not depend on colour alone.
- Do not store candidate/person data, stakeholder contact details or live evidence in browser `localStorage` in production. The prototype uses only synthetic records and its banner says so.
- Production authentication, role-based access, audit, lawful-basis/retention rules and South African POPIA controls must be implemented in the private data layer; a UI label or JSON Schema is not a security boundary.

## Implementation boundary

The prototype is a focused, buildless visual and interaction reference for **VACANCIES → Inbox**, not a deployed ATS. It uses fictional sample records, browser-local view/operational state and no research provider. Its queue is not canonical evidence, its actions are not sent to a backend, and its static sample chronology does not replace the production event history.
