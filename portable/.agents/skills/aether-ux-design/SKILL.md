---
name: aether-ux-design
description: Improve website task flows, information scent, forms, navigation and error recovery using evidence and realistic user scenarios.
---

# UX design

Use when structuring user journeys, interactive flows, forms, filters, or conversion paths. Read [strategy](../../../aether/knowledge/strategy.md) and [UX and accessibility](../../../aether/knowledge/ux-accessibility.md).

1. **Anchor flows in domain-authentic user intent:** Define the visitor's immediate question, decision criteria, and desired action. Ensure every viewport answers *Where am I? What makes this credible? What can I inspect or do next?* without forcing users through generic marketing fluff.
2. **Design high-scent labels and frictionless decisions:** Use specific, domain-literate labels on navigation links, filter pills, specification tables, and CTAs (e.g., `"Explore Selected Works (06)"` or `"Request Monograph & Site Brief"` instead of `"Learn More"` or `"Submit"`). Surface critical decision data—dimensions, pricing parameters, availability, or technical specs—before asking for commitment.
3. **Implement complete interactive and form states:** Build working interactive controls (category filters, tabbed views, inquiry forms, calculators) with persistent `<label>` elements, inline validation, clear empty/loading/success feedback, and preserved user input on error.
4. **Execute in code or audit with evidence:** When building or redesigning a UI, implement the streamlined flow and interactive states directly in production code. Output a standalone written journey map only when asked for a UX critique or planning document.
