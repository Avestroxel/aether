---
name: aether-design-quality
description: Review a design against its specific audience task and constraints using evidence-led visual interaction responsive accessibility and performance QA.
---

# Design quality

Use as a self-check before finishing any UI build or when conducting a design and engineering critique. Read [resource QA](../../../aether/knowledge/resources-qa.md), [distinctiveness](../../../aether/knowledge/distinctiveness.md), [strategy](../../../aether/knowledge/strategy.md), and [improvement loop](../../../aether/knowledge/improvement-loop.md).

1. **Separate the three pillars of quality (never conflate them):**
   - **Functional & Technical Correctness:** Valid semantic HTML/JSX, zero broken states or console errors, working interactive controls, clean CSS layout without overflow bugs.
   - **Visual & Creative Quality:** Unmistakable category art direction, expressive web typography, atmospheric color tokens, sculptural hierarchy, and varied section composition.
   - **UX Quality:** Immediate clarity of purpose, domain-authentic copy, effortless keyboard/touch/screen-reader flows, and low cognitive friction.
2. **Audit against the 13-Dimension Design Quality Gate using code & DOM inspection:**
   Verify all 13 dimensions before shipping: **(1) Originality**, **(2) Art Direction**, **(3) Visual Hierarchy**, **(4) Typography**, **(5) Color Harmony**, **(6) Layout Composition**, **(7) Section Differentiation**, **(8) Component Quality**, **(9) Consistency**, **(10) Responsive Design**, **(11) Accessibility**, **(12) Performance**, and **(13) Overall Professional Appearance**.
3. **Fix root-cause visual or structural weaknesses immediately:** When building UI, if any dimension fails (e.g., fallback `system-ui` on a brand site, raw `#ffffff` canvas with 3 identical icon cards, missing interactive states, or placeholder copy), upgrade the code before completing your turn.
4. **Report critiques with reproducible evidence:** When asked for a design review, log findings as **dimension → location/reproduction → observed code/DOM evidence → user/brand impact → concrete fix → verification status**. Never claim screen-reader or field Web Vitals validation unless actually executed.
