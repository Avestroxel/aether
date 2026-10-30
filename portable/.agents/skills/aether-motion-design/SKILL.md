---
name: aether-motion-design
description: Add or review purposeful interface motion with state feedback, continuity, reduced-motion alternatives and performance-aware implementation.
---

# Motion design

Compare candidate libraries with [technology choices](../../../aether/knowledge/technology-choices.md) before adding dependencies.

Use for transitions, scroll effects or animated feedback. Read [interaction, motion and 3D](../../../aether/knowledge/interaction-motion-3d.md) and [performance](../../../aether/knowledge/performance.md).

1. State what each animation communicates: feedback, orientation, continuity or story. If it communicates nothing, remove it.
2. Specify trigger, entering/settled/exiting states, duration, easing, and what happens on rapid reversal or repeated activation. For scroll-linked states also specify reverse travel, re-entry and mid-page load; consult the scroll-engineering skill for scroll work. Begin microfeedback around 100–250 ms, then tune in context.
3. Start silent by default: no autoplay audio, endless ambient loops or forced smooth scroll. Prefer opacity/transform for large composited movement; avoid animation that shifts surrounding content or blocks input. Keep exiting elements from intercepting input and pause offscreen/hidden work.
4. Implement `prefers-reduced-motion` handling and test keyboard, touch, slow hardware, interrupted transitions, reverse scrolling and loading. Keep critical status understandable without movement; document what was tested versus only proposed.

Example: Expanding a details panel may animate its visual reveal but must expose `aria-expanded` and remain usable instantly when reduced motion is requested. Deliver a motion spec and test notes, not a blanket library recommendation. Never use parallax or autoplay as the sole route to essential content.
