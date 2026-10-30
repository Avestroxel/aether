---
name: color-intelligence
description: Build and audit semantic color tokens, interaction states and contrast for a website or UI, including accessible light and dark surfaces.
---

# Color intelligence

Use for palette creation, theming or contrast review. Read [color and typography](../../knowledge/color-typography.md) and [UX and accessibility](../../knowledge/ux-accessibility.md).

1. Inventory current brand colors, backgrounds, text, status meanings and actual rendered surfaces. Do not replace existing tokens without checking uses.
2. Define semantic roles (`canvas`, `surface`, `text`, `muted`, `border`, `accent`, `focus`, `success`, `warning`, `danger`) and assign state colors only where needed. Prefer CSS custom properties or the repository's token system.
3. Calculate/check contrast for each real pairing, including hover, focus, disabled, overlays and image text. WCAG 2.2 AA baseline: normal text 4.5:1, large text 3:1, essential non-text UI 3:1. Disabled controls have different conformance rules but still need understandable affordances.
4. Test grayscale, dark mode if present, and non-color cues for status and errors.

Example: A red validation border must be accompanied by field-level error text and an icon/label, not just a hue change. Deliver a role/state table, specific foreground/background pairs, any failures and proposed replacements; do not claim compliance from a palette swatch alone.
