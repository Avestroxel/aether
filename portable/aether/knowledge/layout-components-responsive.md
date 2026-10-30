# Layout, components and responsive behavior

## Layout rules

Use content and reading order before a grid. Identify page regions (navigation, primary message, evidence, action, footer); order them by user priority. Use a small spacing scale (e.g. 4/8/12/16/24/32/48/64 CSS px) as a starting point, then tune optical alignment. Set readable max widths for prose and allow tables or charts more width. Prefer CSS Grid for two-dimensional composition and Flexbox for one-dimensional alignment; avoid absolute positioning for essential content. Test with real copy, long words, localization and empty states.

## Components as contracts

For each reusable component specify purpose, content API, behavior and state: default, hover, focus-visible, pressed, disabled, loading, success and error as applicable. Define keyboard behavior, screen reader label, responsive behavior and token usage. Keep primitives composable: a `Button` handles action semantics and states, not pricing-page business logic. Use a link for navigation and a button for an action; disabled visuals must not hide the reason an action is unavailable. Document variants only when they solve real use cases. Define entry/exit, interruption, focus and reduced-motion behavior for animated states so a closing panel cannot remain operable while invisible.

## Responsive is adaptation, not shrinking

Start at the smallest useful width; add breakpoints when content fails rather than targeting named devices. Adapt column count, spacing, crop, navigation and interaction affordances independently. Preserve a sensible DOM reading order even if desktop visuals reorder content. Test at 320/375/768/1024 CSS px and a wide viewport as probes, plus widths between them; test 200% zoom, landscape and large text. Avoid horizontal scrolling except intentional data views with an accessible alternative. Ensure controls remain operable with touch and keyboard; keep important content and actions available on every size. Specify how navigation changes when labels wrap or zoom reduces space; do not replace a visible desktop menu with a gesture-only mobile menu. Simplify pinning, hover effects or camera travel when viewport height, input type or performance budget changes; verify reverse scrolling after each layout change.
