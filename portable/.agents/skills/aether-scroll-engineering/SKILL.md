---
name: aether-scroll-engineering
description: Design and audit scroll-linked storytelling, section entry and exit, reverse travel, anchors and native scrolling with accessible fallbacks.
---

# Scroll engineering

Use when a brief calls for scroll reveals, pinning, parallax or a long-form sequence. Read [interaction, motion and 3D](../../../aether/knowledge/interaction-motion-3d.md), [technology choices](../../../aether/knowledge/technology-choices.md) and [performance](../../../aether/knowledge/performance.md).

1. Sketch section states for **before → entering → active → leaving → revisiting upward**. Name the element, viewport threshold, direction, progress source, final state and whether it may replay. A one-time reveal must remain visible on reverse travel; a scrubbed effect must correctly reverse, not jump or re-run a separate entrance.
2. Keep content readable in document order without JS, animation or scroll completion. Avoid hiding text behind an observer that might never fire. Use native scroll/anchors first; use IntersectionObserver for discrete entry, CSS scroll-driven animations where supported with fallback, and a timeline library only when sequencing/pinning warrants it. Choose one scroll authority.
3. For pinning, budget the scroll distance and space for following content. Recalculate on resize, font load and content changes; avoid trapping wheel/touch or fighting focus, deep links, sticky headers and browser history restoration. Specify what happens if the user scrolls quickly past multiple sections.
4. Honor reduced motion with immediate visible states, no parallax/pinning-dependent access; verify both scroll directions, refreshed mid-page, anchor links, keyboard scrolling, touch, zoom and short/tall viewports. Profile long tasks and frame pacing on representative hardware; clean up observers/timelines on navigation.

Deliver a state/threshold map, library rationale, fallback and checks actually performed. Never require scrolling to finish an animation before the next action works.
