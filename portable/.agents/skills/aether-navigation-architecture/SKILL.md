---
name: aether-navigation-architecture
description: Plan usable website navigation, menus, anchors and route changes across mobile desktop keyboard touch and assistive technology.
---

# Navigation architecture

Use for site maps, headers, mega menus, sticky navigation or mobile nav. Read [strategy](../../../aether/knowledge/strategy.md), [layout, components and responsive](../../../aether/knowledge/layout-components-responsive.md) and [UX and accessibility](../../../aether/knowledge/ux-accessibility.md).

1. List top tasks and destinations. Group by user language, not internal org chart; choose labels that predict destination and identify the current location. Keep search and essential actions findable without hover or animation.
2. Select direct links for navigation and buttons for opening menus. Specify desktop, narrow width and zoomed layouts, overflow, open/close/return focus, Escape, outside dismissal and active state. A disclosure menu is not automatically an ARIA application menu; use native semantics unless its keyboard model is fully implemented.
3. For sticky headers and in-page links, account for focus, heading offset, anchor URLs, back/forward restoration and content revealed on load. Route transitions must not delay focus or leave the old page interactive behind the new one.
4. Walk representative routes with keyboard, touch and screen reader at small and large widths, 200% zoom and reduced motion. Test deep links, missing destinations, long translated labels and JS failure where progressive enhancement is expected.

Deliver a destination map, navigation state table, responsive behavior and verification notes. Do not trade findability for a clever menu animation.
