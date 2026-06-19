---
target: src/features/credit-payment-term/components/RequestFormStepper.tsx
total_score: 26
p0_count: 1
p1_count: 3
p2_count: 2
p3_count: 1
timestamp: 2026-06-19T03-07-27Z
slug: dit-payment-term-components-requestformstepper-tsx
---
# UX Critique — RequestFormStepper.tsx

## Design Health Score (Nielsen's 10 heuristics, 0-4 each) — Total 26/40
1. Visibility of System Status: 3/4
2. Match Between System & Real World: 4/4
3. User Control & Freedom: 3/4
4. Consistency & Standards: 1/4
5. Error Prevention: 3/4
6. Recognition Rather Than Recall: 4/4
7. Flexibility & Efficiency: 3/4
8. Aesthetic & Minimalist Design: 2/4
9. Help Recognize/Diagnose/Recover from Errors: 2/4
10. Help & Documentation: 1/4

## Anti-Patterns Verdict
- Side-stripe borders: Pass
- Gradient text: Pass
- Glassmorphism: Pass
- Identical card grids: Pass
- Numbered section markers: Earned (real sequence)
- Uppercase tracked eyebrow labels: Borderline (4x repeated formula)
- Text overflow: Not assessed (no browser)
- Gradient Restraint Rule (project DESIGN.md): FAIL — ~9 gradient fills vs spec of 1 (primary CTA only)
- Flat-By-Default Rule (project DESIGN.md): FAIL — 2 resting shadows without border (quotation card wrapper, footer block)
- Pill-button mandate (project DESIGN.md): Partial — Button.tsx stays pill; new segmented/installment buttons are deliberate rounded-rect exception

## Overall Impression
Functionally solid, domain-correct internal form. Friction is concentrated in this session's
visual pass: gradient/squared-button direction was explicit user intent but measured against
this project's own DESIGN.md it overshoots the Gradient Restraint Rule and the Flat-By-Default
Rule. Separately, FormField.tsx (shared, app-wide) never used the brand teal focus ring or the
project's error red to begin with — a pre-existing bug, not something introduced this session.

## What's Working
- Domain-fluent Thai copy and field grouping (heuristic #2: 4/4)
- Presets (credit-term, installment %, customer default-credit-term autofill) cut recall burden
- Live %-complete progress bar gives ongoing reconciliation feedback before submit

## Priority Issues

P0 — FormField.tsx off-brand interactive states (app-wide)
- What: Input/Textarea focus hardcodes #2563EB blue + rgba(37,99,235,0.12) ring; error state
  hardcodes #FCA5A5/#FFF5F5/#DC2626 — none are EXZY tokens.
- Why: DESIGN.md states "Focus ring uses teal" — false on every input app-wide. Error red also
  conflicts with #F3554F used inline elsewhere on the same screen.
- Fix: swap focus -> #66C5C5 + teal ring; swap error -> #F3554F-based tokens, in FormField.tsx.
- Command: /impeccable polish src/components/ui/FormField.tsx

P1 — Gradient spread vs. Gradient Restraint Rule
- What: ~9 gradient fills added this session (segmented buttons, installment-count buttons,
  installment cards, 3 subtotal/summary rows, quotation card body, 2 quotation headers) on top
  of Button.tsx's own sanctioned primary-CTA gradient.
- Why: rule reserves gradient for exactly one element so it stays a signal; spread this wide it
  becomes ambient texture, working against the "lighter, airier" goal it was added to chase.
- Fix: gradient on primary submit button only; flat single-tone elsewhere.
- Command: /impeccable quieter (scoped) or /impeccable polish

P1 — Resting shadows on cards vs. Flat-By-Default Rule
- What: quotation-card wrapper (line 554) and footer block (line 776) carry permanent boxShadow,
  no border, at rest — Card.tsx itself does this correctly (border, shadow only on hover).
- Fix: drop resting boxShadow, add 1px solid #D0D6DF to match Card.tsx.
- Command: /impeccable polish

P1 — Three divergent ink/border color systems in one file
- What: file's own tokens (#586782/#001122/#D0D6DF) vs. credit-term dropdown's hardcoded colors
  (#4A5568/#1A202C/#E2E8F0, lines 404-421) vs. FormField.tsx's own third system.
- Fix: replace dropdown's hardcoded colors with file's existing tokens.
- Command: /impeccable extract or fold into polish pass above

P2 — Submit-time-only validation, no error summary
- What: errors only appear after failed submit, scattered across a long single-page form.
- Fix: validate on blur and/or add top-of-form error summary with anchors.
- Command: /impeccable harden

P2 — Repeated identical eyebrow-label formula
- What: 4 section labels use the identical uppercase/tracked/11px formula.
- Command: /impeccable typeset

P3 — Detector finding: layout-property animation
- What: line 543 animates `width` on installment progress-bar fill (detect.mjs: layout-transition,
  severity warning). Low impact (single 6px bar) but transform:scaleX() is a free fix.
- Command: /impeccable optimize (low priority)

## Minor Observations
- Component named RequestFormStepper has no step/wizard navigation — single scrolling form with
  numbered Cards, not next()/back() logic. Naming may mislead future maintainers.
- Credit-term control reinvents a custom dropdown instead of reusing <Select> — two different
  "pick from a list" affordances coexist in one form (product.md ban: reinventing affordances).
- No browser tool available this run; contrast/hover/real-layout claims are code-level reasoning,
  not pixel-verified.

## Method note
Assessment A (design review) grounded in full reads of RequestFormStepper.tsx, Card.tsx,
Button.tsx, FormField.tsx, DESIGN.md, PRODUCT.md. Assessment B used detect.mjs (one finding).
No sub-agent isolation; ran sequentially in one thread. Browser visualization unavailable in
this environment — explicitly skipped per critique.md's stated fallback.
