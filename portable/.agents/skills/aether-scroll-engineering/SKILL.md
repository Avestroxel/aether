---
name: aether-scroll-engineering
description: Design and audit scroll-linked storytelling, section entry and exit, reverse travel, anchors and native scrolling with accessible fallbacks.
---

# Scroll engineering

Use when a brief calls for scroll reveals, sticky split narratives, pinning, parallax, or long-form chapter progression. Read [interaction, motion and 3D](../../../aether/knowledge/interaction-motion-3d.md), [technology choices](../../../aether/knowledge/technology-choices.md), and [performance](../../../aether/knowledge/performance.md).

1. **Map section states across both directions:** Define behavior for **before → entering → active → leaving → revisiting upward**. One-time reveals must remain visible when revisiting upward; scrubbed or sticky progressions must unwind smoothly in reverse without jumping or trapping the viewport.
2. **Keep all content readable without JS:** Never leave essential text or imagery stuck at `opacity: 0` if JS fails, an observer has not fired yet, or the page loads mid-scroll. Progressive-enhance from a readable CSS baseline using native sticky positioning, `IntersectionObserver`, or CSS scroll-driven animations; choose at most one scroll authority.
3. **Budget pinning and preserve native navigation:** When using sticky chapters or pinned stages, budget scroll distance and recalculate on resize or font load. Never hijack wheel/touch momentum or break focus order, deep links, sticky headers, or browser history restoration.
4. **Honor reduced motion and all input modes:** Provide immediate visible states under `prefers-reduced-motion: reduce`, and verify both scroll directions, mid-page refresh, anchor links, keyboard scrolling, touch, and `200%` zoom.
