# UX and accessibility

## Task-centered UX

A page should answer: Where am I? What can I do? What happens next? Put critical information before decorative claims, make labels specific, and preserve state when an error occurs. For forms: use persistent visible labels, mark required fields, validate near the field, show useful error text, and keep entered values. For complex choices, expose meaningful comparisons and costs instead of dark patterns, surprise defaults or hidden terms. Use usability tasks with representative content and observe completion, hesitation and error recovery.

## Inclusive implementation baseline

Use semantic headings in logical order, landmarks, actual links/buttons and properly associated form labels. Ensure all functionality works without a mouse; show a visible focus indicator, allow Escape to dismiss transient overlays, and return focus appropriately. For dialogs, trap focus only while open and label the dialog. Provide text alternatives for meaningful images and captions/transcripts for media where needed. Avoid instructions based only on position, shape or color. Support zoom and reflow without loss of information. In navigation, use destination links and disclosure buttons with correct expanded state; opening, closing and route transitions need predictable focus, Escape and no invisible focusable elements. Anchor destinations should remain visible under sticky headers and reachable on direct load/back navigation.

Target WCAG 2.2 AA where appropriate: text contrast 4.5:1 (large text 3:1), non-text contrast 3:1, pointer targets at least 24×24 CSS px or satisfying the spacing exception, and no keyboard trap. A 44×44 px touch target is a useful comfort goal, not the WCAG 2.2 AA minimum. Automated tools can catch some issues, not focus logic, meaning, reading order or task usability. Verify with keyboard, screen reader and zoom on actual flows; record failures with reproduction steps and priority. For motion/scroll/3D also verify reduced motion, reverse travel and a non-canvas route to critical content; a preference alone does not prove an accessible fallback.
