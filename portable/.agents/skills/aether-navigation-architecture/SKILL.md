---
name: aether-navigation-architecture
description: Plan usable website navigation, menus, anchors and route changes across mobile desktop keyboard touch and assistive technology.
---

# Navigation architecture

Use for architectural headers, site maps, section indexes, mega menus, sticky navigation, and mobile drawers. Read [strategy](../../../aether/knowledge/strategy.md), [layout, components and responsive](../../../aether/knowledge/layout-components-responsive.md), and [UX and accessibility](../../../aether/knowledge/ux-accessibility.md).

1. **Design clear, category-authentic wayfinding:** Organize navigation around 3–5 specific visitor destinations (e.g., `Selected Works`, `Practice`, `Material Library`, `Monograph`, `Inquire`) plus a distinct primary action. Keep headers refined—such as a low-profile translucent bar with a `1px` structural bottom hairline—and ensure key actions are discoverable without hover.
2. **Use semantic links for navigation and buttons for opening menus:** Implement `<a href="...">` links for navigation and buttons for opening menus or mobile drawers (`aria-expanded`, `aria-controls`). Manage desktop, narrow mobile, and zoomed layouts cleanly, including open/close state, return focus, Escape, outside dismissal, and current-section indication.
3. **Coordinate sticky headers and in-page anchors:** For sticky headers, apply `scroll-margin-top` on target sections so headings are never obscured, and preserve focus, anchor URLs, back/forward restoration, and mid-page load position. Ensure closed mobile drawers do not retain keyboard focus or intercept clicks.
4. **Verify across devices and assistive tech:** Test navigation flows with keyboard tabbing, touch, and screen reader across mobile (`320px–375px`), desktop, `200%` zoom, and reduced motion.
