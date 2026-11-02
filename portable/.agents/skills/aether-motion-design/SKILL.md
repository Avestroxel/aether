---
name: aether-motion-design
description: Add or review purposeful interface motion with state feedback, continuity, reduced-motion alternatives and performance-aware implementation.
---

# Motion design

Compare candidate libraries with [technology choices](../../../aether/knowledge/technology-choices.md) before adding dependencies.

Use for choreographed transitions, reveal rhythm, or animated state feedback. Read [interaction, motion and 3D](../../../aether/knowledge/interaction-motion-3d.md) and [performance](../../../aether/knowledge/performance.md).

1. **Give every animation a clear editorial or functional job:** Use motion to establish spatial hierarchy, tactile button/card feedback, or smooth state continuity. Use refined easing (such as `cubic-bezier(0.22, 1, 0.36, 1)` for entrances and `150–250ms` for microfeedback); if an animation communicates nothing, remove it.
2. **Account for interruption and reverse travel:** Specify trigger, entering/settled/exiting states, duration, easing, and clean behavior on rapid reversal or repeated activation. For scroll-linked states also handle reverse travel, re-entry, and mid-page load; consult the scroll-engineering skill for scroll work.
3. **Start silent and composite cleanly:** Enforce no autoplay audio, endless ambient loops, or hijacked scroll physics. Animate `opacity` and `transform` rather than layout-shifting properties; ensure exiting elements stop intercepting input immediately and pause offscreen work.
4. **Enforce `prefers-reduced-motion` parity:** Always implement `@media (prefers-reduced-motion: reduce)` so all content and status changes remain immediately visible and operable without movement. Test keyboard, touch, interrupted transitions, and reverse scrolling.
