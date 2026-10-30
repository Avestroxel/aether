---
name: accessibility
description: Audit and implement accessible web UI with semantic structure, keyboard and screen-reader flows, contrast, reflow and WCAG 2.2 AA checks.
---

# Accessibility

Use for a UI audit, new interactive component or reported access barrier. Read [UX and accessibility](../../knowledge/ux-accessibility.md), [color and typography](../../knowledge/color-typography.md), and [resource QA](../../knowledge/resources-qa.md).

1. Identify critical tasks and inspect semantic headings, landmarks, links, buttons, labels, error associations and image alternatives. Prefer native controls to custom ARIA.
2. Complete the main task with keyboard alone; check visible focus, logical order, dialogs, Escape and focus return. Include menu opening/closing, route changes, sticky-header anchors and exit transitions: hidden or departing content must not retain focus or intercept input. Test with a screen reader on at least one representative flow.
3. Measure rendered text/non-text contrast, inspect zoom/reflow at 200%, verify target sizes and non-color cues. Check reduced motion, reverse-scroll access to content and meaningful media/3D alternatives; status must not rely on motion or sound.
4. Run automated checks for coverage, then manually verify meaning and behavior. Record each finding with reproduction, impacted task, severity, fix and retest status.

Example: A clickable card made of a `<div>` needs a real link for navigation and a clear focus state; `role="button"` alone does not provide native keyboard behavior. Do not claim WCAG conformance without testing the scope in question.
