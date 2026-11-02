---
name: component-design
description: Design or implement reusable UI components with clear semantics, variant boundaries, accessible states and practical component contracts.
---

# Component design

Use when designing or building UI components, interactive widgets, cards, forms, and bespoke domain artifacts. Read [layout, components and responsive](../../knowledge/layout-components-responsive.md), [color and typography](../../knowledge/color-typography.md), and [UX and accessibility](../../knowledge/ux-accessibility.md).

1. **Craft bespoke, category-authentic components (not generic bootstrap boxes):** Inspect the repository's existing primitives first. Design components whose geometry, borders, and typography express the visual thesis—such as editorial monograph cards with index numbers and `4:5` image frames, interactive specification ledgers with `1px` hairline dividers, tactile pill/architectural buttons with crisp `:focus-visible` rings, or live filterable showcases.
2. **Enforce semantic HTML contracts:** Use `<a>` for navigation to a URL/anchor and `<button type="button">` (or `submit`) for actions, toggles, filters, and drawers. Keep domain data decoupled from presentation props so components remain composable without dozens of conflicting boolean flags.
3. **Design the complete interactive state matrix:** Specify visual and accessible behavior across **default, hover, focus-visible, active/pressed, disabled, loading, empty, and error** states. Use subtle surface elevation shifts (`--bg-surface-1` → `--bg-surface-2`), border brightening (`--border-subtle` → `--border-strong`), and micro-transform feedback rather than heavy drop shadows.
4. **Build real interactive utility:** Where a page calls for tabs, project category filters, unit toggles (`m² / ft²`), interactive configurators, or inquiry forms, wire them up with clean, working state and keyboard accessibility (`aria-selected`, `aria-expanded`, `aria-live` feedback) rather than shipping dead decorative mockups.
