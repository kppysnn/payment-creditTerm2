# Product

## Register

product

## Users

**Sales Representatives** — primary creators. They open requests during or after customer negotiations, need to move fast, and check status throughout the approval cycle. Moderate tech comfort; they're mobile-adjacent but primarily desktop at the office.

**L1 Approvers (Sales Managers)** — review queue clears daily. They need to see the full picture quickly: customer context, what's being asked for, why, and whether it's within policy. Decisions are time-sensitive; slow interfaces cost money.

**L2 Approvers (Directors / Senior Management)** — review only high-value or high-risk escalations. Low volume, high consequence. They expect the interface to make the significance of each case clear immediately.

**Finance / Accounting** — process approved requests, issue terms, mark completion. They treat this as a task queue and need clean, reliable status signals. Accuracy over speed.

**IT Admin** — manage users, customers, policy rules, and the approval matrix. Low-frequency but configuration-critical; any misconfiguration silently breaks the workflow.

## Product Purpose

PCT (Payment & Credit Term) is an internal approval workflow system for EXZY Co., Ltd., a B2B hardware/software/services company. Before PCT, sales negotiated payment and credit terms informally via LINE and email — no audit trail, no policy enforcement, no visibility for management.

PCT replaces that with a structured multi-step approval flow: Sales creates a request, it routes through L1 and optionally L2 based on deal value, risk, and credit increase, then Accounting closes it. Every action is logged.

Success looks like: zero approvals via LINE, full audit history visible to management, approval cycle time cut to under 48 hours, and sales reps who trust the system enough to use it on every deal.

## Brand Personality

Modern, friendly, professional, clear, reliable, smart but approachable. Technology-oriented without feeling cold or bureaucratic.

Three words: **Controlled. Clear. Credible.**

Emotional goal: users should feel that the system is on their side — organized and trustworthy, not another enterprise obstruction. A sales rep should feel efficient; an approver should feel informed and in control; a director should feel confident the right things are getting escalated.

## Anti-references

No restrictions stated. Design freely within the brand.

Implicit anti-references inferred from the product context:
- **Not legacy enterprise** — no SAP/Oracle density, gray tables that look like Windows XP.
- **Not consumer-startup SaaS** — avoid the Notion/Linear cream-white template with large empty spaces that waste screen real estate for a data-dense tool.
- **Not aggressive dark-gamer** — neon on black with heavy glow is the wrong register for a finance-adjacent approval tool.

## Design Principles

1. **Density earns trust.** This is a data tool used under time pressure. Whitespace is earned, not given. Tables should be readable, not spacious. Every screen should answer the user's next question before they have to ask it.

2. **Status is never ambiguous.** Approval state, risk level, request type — each must be immediately and consistently legible across every page. Color, shape, and label all carry the same signal.

3. **Role shapes the view.** A sales rep and an approver opening the same request should see different primary actions and different context hierarchies. The system knows who you are; the interface should prove it.

4. **Audit visibility is a feature.** The activity timeline isn't a log page hidden in settings — it's a first-class component on every detail view. Accountability is part of the value proposition.

5. **Confidence over comfort.** Actions with consequences (reject, cancel, escalate) are clearly labeled, require confirmation, and are never hidden. The system should feel impossible to accidentally misuse.

## Accessibility & Inclusion

- WCAG AA minimum (4.5:1 contrast for body text, 3:1 for large text and UI elements).
- Thai language is primary; the font stack must support Thai script cleanly at all weights.
- Keyboard navigation for all primary actions (approve, reject, create request).
- No accessibility-specific requirements stated beyond standard WCAG AA compliance.
