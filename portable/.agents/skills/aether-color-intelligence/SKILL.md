---
name: aether-color-intelligence
description: Build and audit semantic color tokens, interaction states and contrast for a website or UI, including accessible light and dark surfaces.
---

# Color intelligence

Use for palette creation, atmospheric surface architecture, theming, and contrast verification. Read [color and typography](../../../aether/knowledge/color-typography.md), [category directions](../../../aether/knowledge/category-directions.md), and [UX and accessibility](../../../aether/knowledge/ux-accessibility.md).

1. **Design an atmospheric color architecture (avoid raw `#fff` / `#000`):** Unless a existing repository token system dictates otherwise, build palettes around **tinted architectural neutrals** that match the category mood:
   - *Warm daylight / editorial / architecture:* Alabaster, travertine, warm stone, parchment (`#F7F4EE`, `#EFECE6`, `#E5DFD5`) paired with deep espresso or charcoal ink (`#161513`, `#57534E`).
   - *Obsidian dark / technical / cinema:* Deep carbon, midnight slate, or warm obsidian (`#090A0F`, `#11131A`, `#181B24`) paired with crisp off-white (`#F3F4F6`) and muted silver-slate (`#94A3B8`).
2. **Establish multi-tiered surface elevation and hairline borders:** Define semantic CSS custom properties for layered depth (`--bg-canvas`, `--bg-surface-1`, `--bg-surface-2`, `--bg-glass`), typography (`--text-primary`, `--text-secondary`, `--text-muted`), and subtle `1px` structural hairlines (`--border-subtle` using `rgba(...)` or `color-mix(...)`, plus `--border-strong` for active/hover framing).
3. **Exercise accent discipline (60-30-10 or monochrome + focal accent):** Use 60% primary canvas, 30% secondary tonal surface/structure, and 10% purposeful accent (e.g., terracotta, oxidized brass, cobalt, vermilion, or electric emerald) reserved for primary actions, active indicators, and key focal highlights. Define explicit interactive states (`hover`, `focus-visible`, `active`, `disabled`) and semantic status tokens (`success`, `warning`, `danger`).
4. **Enforce WCAG 2.2 AA contrast and non-color redundancy:** Verify every rendered foreground/background pair—including text over imagery, translucent glass headers, and muted captions—meets WCAG 2.2 AA (**4.5:1** normal text, **3:1** large text and essential UI/focus rings). Never rely on color alone to communicate status or errors; always pair hue with text labels or icons.
