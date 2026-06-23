---
target: all pages
total_score: 26
p0_count: 0
p1_count: 4
timestamp: 2026-06-23T11-21-18Z
slug: src-features-credit-payment-term-pages
correction: "Original P0 ('sale-type radio is cosmetic, gate the second quotation block') was retracted by the user on 2026-06-23: every request always has both Hardware and Software & Installation; saleType only controls whether they share one quotation number or get separate -1/-2 numbers. Both blocks rendering unconditionally is correct, not a bug. See memory project_saletype_semantics."
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Spinners on async buttons, but no toast/confirmation after approve/reject succeeds — only a silent badge change. |
| 2 | Match Between System and Real World | 3 | Thai-first copy with correct domain terms throughout. |
| 3 | User Control and Freedom | 2 | Cancel is a native window.confirm(), the cheapest dialog in the app, for the only undo-less action. |
| 4 | Consistency and Standards | 2 | Two confirmation idioms for destructive actions in the same file; every page skips h1 straight to h3 (Card hardcodes h3, no h2 exists anywhere) — confirmed live in the DOM. |
| 5 | Error Prevention | 3 | Live installment-percent validation is good; cost > selling price is accepted silently with no margin warning. |
| 6 | Recognition Rather Than Recall | 3 | Status badges + mono currency reduce recall; rejection reason is hidden from the role re-deciding the case. |
| 7 | Flexibility and Efficiency of Use | 2 | Zero inline list-level actions for approvers — every decision costs row to detail to modal to back. |
| 8 | Aesthetic and Minimalist Design | 3 | Clean, restrained visual language; both quotation blocks always rendering is correct (every request has both categories), not clutter. |
| 9 | Error Recovery | 2 | Field errors are fine; the top-of-form failure message names nothing, on a ~900-line form. |
| 10 | Help and Documentation | 1 | No tooltips or contextual help anywhere; policy rules live only in human rejection comments after the fact. |
| Total | | 26/40 | Acceptable — solid bones, specific fixable gaps, not a redesign |

## Anti-Patterns Verdict

Does this look AI-generated? No. Coherent navy/teal identity, consistent 4px radius, JetBrains Mono used correctly everywhere money appears, Thai-first copy with real domain terms. The failure mode is the product-register one: components that promise more rigor than the logic delivers.

Deterministic scan (detect.mjs against all page/component dirs): 1 finding — layout-transition warning on RequestFormStepper.tsx:613 (transition: width on the installment progress-bar fill). Detector sanity-checked against a synthetic violation first and fired correctly.

Browser-injected overlay (live page, all 4 routes, fresh tab each):
- low-contrast 2.5-2.7:1 for #929EB4 on #FFFFFF/#F2F6F8, repeated 6-10x per page, every page. Need is 4.5:1. Default treatment for every timestamp/hint/placeholder.
- layout-transition fired 2-3x on Create/Edit (once per quotation block) vs effectively never elsewhere — confirms both quotation blocks render together, which is correct (every request has both Hardware and Software & Installation; the original P0 raised about this was retracted, see frontmatter).
- skipped-heading: h1 to h3 with no h2, confirmed live on Create/Edit/Detail. Verified in source: Card.tsx:43 hardcodes h3 for every card title; no page ever uses h2.
- clipped-overflow-container on Create/Edit. Verified in source: Card.tsx:18 sets overflow:hidden on every card, and the existing-customer/reseller search dropdown in RequestFormStepper.tsx renders as a position:absolute child inside that card. Real bug, not a false positive.
- ai-color-palette "Cyan gradient background" flagged on every page — false positive, this is the documented EXZY CI --gradient-primary token, not generic AI styling.
- cramped-padding: 0px vertical padding on 13.5px text, Edit page only — minor.
- Mobile (390px) overflow measured per page: List 24px (4-column stat-card grid never collapses, confirmed visually — topbar title wraps 3 lines, role-switcher buttons clipped, 2 of 4 stat cards cut off), Detail 8px, Create/Edit 0px.

## Overall Impression

The interface is honest and disciplined where it's been deliberately designed (installment math, currency formatting, approval-modal friction) and quietly inconsistent where something got built once and never revisited (Cancel's confirm dialog, a dead branch in ApproveModal). The single biggest opportunity is the contrast fix — it's the one issue touching every screen.

## What's Working

1. The installment-percent progress bar (RequestFormStepper.tsx:547-615) computes and surfaces a suggested next-row percent and turns red when the total doesn't reach 100%. The most domain-aware UX in the codebase.
2. JetBrains Mono on every currency figure, zero exceptions, across list/detail/summaries/form previews.
3. Role-aware list-page alerts (RequestListPage.tsx:140-153): approvers get a one-click filter to their pending queue, sales reps get a rejected-count nudge.

## Priority Issues

> Note: an earlier draft of this report flagged a "[P0] sale-type selection is cosmetic" finding, proposing to gate the Software & Installation block behind `saleType`. Retracted per user correction on 2026-06-23 — every request always has both Hardware and Software & Installation; `saleType` only controls the `-1`/`-2` quotation-number suffix. Both blocks rendering unconditionally is correct behavior. See memory `project_saletype_semantics`.

[P1] #929EB4 muted text fails contrast everywhere — measured, not assumed. 2.5-2.7:1 against white/surface-2, repeated 6-10x per page across all 4 pages. WCAG AA needs 4.5:1. Default secondary-text color for the entire app, not an edge case. Fix: darken --color-muted for body-weight uses, reserve current value for decorative/disabled only.

[P1] Cancel uses a native window.confirm() — the only irreversible action without ceremony. RequestDetailPage.tsx:165. Approve/Reject require a typed reason plus checkbox in a styled Modal; Cancel gets a one-line OS dialog with no audit trail. Fix: build a CancelModal matching the existing pattern, require a reason.

[P1] Rejection context is hidden from the role that needs it most. RequestDetailPage.tsx:227 gates the "previously rejected" Alert to sales role only. An approver re-deciding a resubmitted request gets no surfaced reason. Fix: show the banner to approver/accounting roles too.

[P1] Generic top-of-form error names nothing, on a ~900-line form. RequestFormStepper.tsx:261 fires the same string for ~15 possible validation keys. Fix: scroll-to-first-error or name the failed fields.

## Persona Red Flags

Riley (time-pressured approver): no inline approve/reject from the list, every decision costs row to detail to modal to back; rejection-history banner suppressed for their role on req002.

Jordan (first-time sales rep): existing-customer dropdown can be visually clipped by the card's overflow:hidden if results are long, with no scroll cue.

Sam (screen-reader/low-vision user): credit-term dropdown and percent-preset toggles are plain buttons with no role/aria-expanded/aria-selected; every page skips h1 to h3; the measured 2.5-2.7:1 contrast is exactly their failure mode.

## Minor Observations

- Dead/duplicated error branch in ApproveModal.tsx:79-82 — unreachable logic next to the line that already renders the error.
- Mobile (390px): List page concretely breaks (24px overflow). Create/Edit/Detail don't technically overflow but are unoptimized. Low priority given desktop-office context.
- "ai-color-palette: Cyan gradient" flags on every page — false positive (documented brand token).
- Two entry points to the same "custom percent" state in installment rows — mildly redundant.
- Empty-state copy "ไม่พบคำขอ" does double duty for "no results" and "not found by ID".
- RoleSwitcher correctly labeled "DEV — Role" and no-print — confirm it's excluded from production build, not just hidden in print.

## Questions to Consider

1. Was hiding rejection history from approvers deliberate, or did it inherit a nearby sales-only gate?
2. Cancel and Reject both end a request with no further action possible — what made one worth a full modal and the other a one-liner?
