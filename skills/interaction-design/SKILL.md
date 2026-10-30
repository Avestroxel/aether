---
name: interaction-design
description: Specify premium but quiet interface interactions, feedback, hover focus touch parity, interruptible state transitions and recovery paths.
---

# Interaction design

Use for menus, cards, controls and microinteractions, not as a request for animation everywhere. Read [interaction, motion and 3D](../../knowledge/interaction-motion-3d.md), [UX and accessibility](../../knowledge/ux-accessibility.md) and [technology choices](../../knowledge/technology-choices.md).

1. Start silent by default: no autoplay sound, constant drift, forced smooth scrolling or ambient effects. Add feedback only where it explains action, state or orientation. Specify trigger, state, confirmation and recovery for pointer, touch and keyboard; never make hover reveal the only way to reach an action.
2. Model default → hover/focus → pressed → busy → success/error → reset or exit. For a panel/modal, include opening, closing, rapid reversal, outside click if appropriate, Escape and focus return. Distinguish links from actions and preserve native affordances.
3. Specify enter and exit separately: where departing content goes, when it stops intercepting input, and whether replacement content remains legible. Interruption must settle in the latest requested state without duplicate timers, stale `aria-expanded`, or invisible focusable controls. Prefer CSS/native primitives for simple transitions; justify heavier orchestration.
4. Check reduced motion, coarse pointer, disabled JS where relevant, long labels and touch/keyboard parity. Verify focus visibility and state announcements rather than relying on easing to convey success.

Deliver a state table, interaction spec, motion-off behavior and observed test results. A refined experience may have no animation at all.
