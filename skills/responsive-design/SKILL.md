---
name: responsive-design
description: Adapt content, navigation, typography, imagery and interaction across viewport sizes, zoom and input modes rather than merely scaling a desktop layout.
---

# Responsive design

Use for multi-viewport adaptation, mobile composition, breakpoint engineering, and reflow verification. Read [layout, components and responsive](../../knowledge/layout-components-responsive.md) and [UX and accessibility](../../knowledge/ux-accessibility.md).

1. **Preserve art direction on mobile (adapt, do not flatten):** Mobile users deserve the same editorial authority and atmospheric craft as desktop users. Retain typographic hierarchy, tinted surfaces, `1px` architectural hairlines, index numbers, and intentional image crops (`aspect-ratio: 4 / 5` or `16 / 10`) on narrow viewports rather than collapsing everything into a monotonous centered stack.
2. **Add breakpoints where content actually breaks:** Design fluidly with `clamp()`, CSS Grid (`minmax()`), and container-aware sizing, adding breakpoints where content actually breaks rather than only targeting fixed device presets. Reflow multi-column editorial splits, specification matrices, and navigation cleanly; convert hover-only disclosures into explicit, tappable controls (`≥44×44px` comfort target, `≥24×24px` WCAG minimum) and simplify pinned or 3D stages when viewport height or coarse pointer input demands it.
3. **Maintain sensible DOM reading order and overflow discipline:** Keep DOM reading order logical even when desktop grids position elements asymmetrically, so keyboard and screen-reader users experience a coherent flow. Prevent accidental horizontal page overflow (`overflow-x`) from wide headlines, bleed elements, or fixed-width tables; convert wide data comparisons into stacked specification groups or labeled scrollable containers on mobile.
4. **Verify across viewport probes and 200% zoom:** Test at `320px`, `375px`, `768px`, `1024px`, and `1440px+` widths, as well as `200% zoom`, landscape orientation, long localized strings, open mobile navigation drawers, and both scroll directions.
