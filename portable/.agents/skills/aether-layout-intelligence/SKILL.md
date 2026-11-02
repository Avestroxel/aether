---
name: aether-layout-intelligence
description: Structure website content with deliberate hierarchy, spacing, grids and reading order that survive real copy and multiple viewport widths.
---

# Layout intelligence

Use for page architecture, spatial composition, section pacing, and grid systems. Read [layout, components and responsive](../../../aether/knowledge/layout-components-responsive.md), [category directions](../../../aether/knowledge/category-directions.md), and [strategy](../../../aether/knowledge/strategy.md).

1. **Choreograph section differentiation and spatial rhythm:** Never stack consecutive 3-column card grids down a page. Alternate structural compositions across viewports to create narrative momentum—for example:
   - *Viewport 1:* Asymmetric architectural hero (e.g., `7:5` or `8:4` split, or monumental typography over an art-directed focal frame with an index strip).
   - *Viewport 2:* Editorial split narrative (`4:8` sticky thesis column beside scrolling project monographs or technical proofs).
   - *Viewport 3:* Structured specification ledger, interactive comparison matrix, or bespoke diagram showcase with exposed `1px` grid hairlines.
   - *Viewport 4:* Full-bleed atmospheric statement or curated gallery with varied aspect ratios (`4:5`, `16:10`, `1:1`).
   - *Viewport 5:* High-clarity action/inquiry studio and structured architectural footer.
2. **Use purposeful asymmetric grids and exposed structure:** Prefer 12-column CSS Grid or explicit fractional tracks (`grid-template-columns: 1.35fr 1fr`) over uniform auto-fit boxes when building brand, editorial, or portfolio pages. Use subtle `1px solid var(--border-subtle)` structural rules to create crisp architectural compartments and align baselines across columns.
3. **Control density and negative space:** Contrast information-dense regions (spec tables, index rows, telemetry) with generous, intentional negative space (`clamp(4rem, 9vw, 8.5rem)` vertical section padding). Constrain long-form prose to `55–70ch` while allowing visual stages and data tables to span wider grid tracks.
4. **Preserve logical DOM order and structural resilience:** Keep semantic landmarks (`<header>`, `<main>`, `<section>`, `<footer>`) and heading hierarchy in logical reading order regardless of visual grid placement. Test layout stability with long labels, variable content lengths, keyboard tabbing, and narrow-to-ultrawide viewports.
