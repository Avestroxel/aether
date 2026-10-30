---
name: performance
description: Make web design decisions against measured loading, responsiveness and layout stability budgets, especially for images, fonts, motion and third-party code.
---

# Performance

Use when adding assets/libraries/effects or investigating slow pages. Read [performance](../../knowledge/performance.md) and [resource QA](../../knowledge/resources-qa.md).

1. Record representative page, device, network and baseline metrics before changing anything. Separate lab measurements from field data.
2. Identify the actual LCP element, main-thread bottleneck and layout-shift sources. Prioritize the cause with largest user impact rather than optimizing small files by instinct.
3. Size and compress imagery, prioritize the above-fold image, lazy-load below-fold assets, subset fonts, reserve dimensions and defer nonessential JS/3D. Prefer simpler native/CSS solutions when adequate; count scroll listeners, timeline work, GPU rendering and shipped library code against the budget. Pause offscreen work and remove observers on teardown.
4. Re-measure on the same setup; check the primary task and accessibility for regressions. For field Core Web Vitals, compare 75th-percentile LCP ≤ 2.5 s, INP ≤ 200 ms and CLS ≤ 0.1.

Example: If a hero video delays LCP, use a well-sized poster and user-initiated playback; do not remove meaningful content merely to improve a synthetic score. Deliver before/after numbers, measurement context, changed asset budgets and any unresolved tradeoffs.
