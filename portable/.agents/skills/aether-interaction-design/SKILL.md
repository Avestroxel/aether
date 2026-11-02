---
name: aether-interaction-design
description: Specify premium but quiet interface interactions, feedback, hover focus touch parity, interruptible state transitions and recovery paths.
---

# Interaction design

Use for tactile controls, menus, cards, filters, drawers, and microinteractions. Read [interaction, motion and 3D](../../../aether/knowledge/interaction-motion-3d.md), [UX and accessibility](../../../aether/knowledge/ux-accessibility.md), and [technology choices](../../../aether/knowledge/technology-choices.md).

1. **Start silent by default with tactile precision:** Use no autoplay sound, constant drift, forced smooth scrolling, or distracting ambient loops. Craft crisp, immediate feedback where it clarifies action, elevation, or state. Guarantee parity across pointer, touch and keyboard; never make hover reveal the only way to reach essential information or actions.
2. **Model complete, interruptible state lifecycles:** Implement **default → hover/focus-visible → active/pressed → busy → success/error → reset** states using subtle surface shifts, border brightening, and transform microfeedback. For drawers, modals, and disclosures, handle opening, closing, rapid reversal, outside click, `Escape`, and focus return cleanly. Use semantic `<a>` links for navigation and `<button>` elements for actions.
3. **Coordinate enter/exit and clean state updates:** Ensure departing layers stop intercepting pointer or keyboard input immediately and never leave stale `aria-expanded` attributes or invisible focusable elements. Prefer CSS transitions and native platform primitives for microinteractions.
4. **Verify accessibility and implement directly:** Check `prefers-reduced-motion`, coarse pointers, long labels, and touch and keyboard parity. Express interactive states directly in production CSS/JS unless the user specifically asks for a written interaction specification.
