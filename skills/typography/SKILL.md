---
name: typography
description: Choose and implement a readable type system for websites, including hierarchy, font loading, language support, responsive sizing and real-content testing.
---

# Typography

Use when selecting fonts, establishing typographic hierarchy, or styling text across a website or UI. Read [color and typography](../../knowledge/color-typography.md), [category directions](../../knowledge/category-directions.md), and [performance](../../knowledge/performance.md).

1. **Select and load distinctive, category-authentic web fonts:** Never default brand, marketing, editorial, architecture, luxury, or portfolio websites to plain `system-ui` or `Arial`. Load a purposeful font pairing via Google Fonts or project assets (verify licensing with [resource QA](../../knowledge/resources-qa.md)):
   - *Editorial / Luxury / Architecture:* High-contrast serif display (`Cormorant Garamond`, `Instrument Serif`, `Playfair Display`, `Newsreader`) + refined sans body (`Plus Jakarta Sans`, `Inter`, `DM Sans`) + technical mono metadata (`JetBrains Mono`, `IBM Plex Mono`).
   - *Technical SaaS / AI / Agency:* Expressive grotesk display (`Space Grotesk`, `Syne`, `Plus Jakarta Sans`, `Outfit`) + legible UI sans + tabular mono for code/metrics.
   - Reserve `system-ui` stacks strictly for native-OS utility admin panels or offline-constrained environments.
2. **Architect dramatic scale and editorial contrast:** Define clear role tokens (`--font-display`, `--font-sans`, `--font-mono`). Use fluid `clamp()` sizing with genuine tension between monumental display headlines (`clamp(2.5rem, 5.5vw, 5.25rem)`, line-height `0.98–1.08`, tight tracking `-0.02em` to `-0.04em`), structured section headings, and comfortable body copy (`1rem–1.125rem`, line-height `1.55–1.7`, measure `55–70ch`).
3. **Apply micro-typographic craft:** Pair headlines with tracked uppercase eyebrows/kickers (`0.75rem`, `letter-spacing: 0.08em–0.14em`, `font-weight: 600`) or monospace index numbers (`01 / 05`). Enforce `font-variant-numeric: tabular-nums` on all prices, dimensions, dates, tables, and counters. Use `text-wrap: balance` on headings and `text-wrap: pretty` on body paragraphs.
4. **Load efficiently and verify resilience:** Request only required weights (`400;500;600;700`), include `display=swap`, provide metric-compatible fallbacks, and test at `200%` zoom, narrow mobile widths, and against actual surface backgrounds for WCAG 2.2 AA contrast.
