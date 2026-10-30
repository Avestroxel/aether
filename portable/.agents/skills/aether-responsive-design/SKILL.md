---
name: aether-responsive-design
description: Adapt content, navigation, typography, imagery and interaction across viewport sizes, zoom and input modes rather than merely scaling a desktop layout.
---

# Responsive design

Use for mobile layouts, breakpoint planning or reflow bugs. Read [layout, components and responsive](../../../aether/knowledge/layout-components-responsive.md) and [UX and accessibility](../../../aether/knowledge/ux-accessibility.md).

1. Start with the smallest width at which the task must work. Keep the same essential content and actions available; prioritize rather than hide them.
2. Add breakpoints where content actually breaks, not at a favorite device size. Specify what changes in columns, spacing, crop, navigation and data presentation; switch hover-dependent actions to visible/tappable controls and simplify pinned scroll or 3D compositions where space or input changes.
3. Keep DOM reading order sensible even when visual columns change; ensure touch targets and keyboard access. Use fluid type/width within bounds and responsive imagery with intentional focal points.
4. Probe 320, 375, 768, 1024 CSS px plus intermediate and wide sizes; test 200% zoom, landscape, long labels, open menus and both scroll directions if motion is used. Document any intentional horizontal scrolling for data.

Example: A wide feature table may become grouped per-feature rows on mobile with plan names repeated, rather than shrinking all columns until text is unreadable. Deliver a breakpoint rationale, behavior per region and observed failures/fixes. Avoid device-specific CSS that breaks between named presets.
