# Color and typography

## Color as a functional system

Choose semantic roles before hex values: canvas, surface, text, muted text, border, accent, focus, success, warning and danger. Define states for each interactive role (rest, hover, pressed, disabled, focus) and light/dark surfaces if both are required. Use a small palette with intentional emphasis; don't apply the accent indiscriminately. Test actual foreground/background combinations, including text over images, translucent layers, gradients and status badges.

For WCAG 2.2 AA, normal text requires at least **4.5:1** contrast, large text **3:1**, and essential non-text UI and focus indicators **3:1** against adjacent colors. Large text means at least 24 CSS px regular or ~18.66 CSS px bold. These are minimums, not a substitute for testing thin fonts or glare. Do not convey state solely with color; pair with labels, shapes or icons. Derive contrast from rendered colors, not an unblended token.

## Typography as information architecture

Assign roles: display, heading, body, label, caption and code/data if needed. Start with a readable body at roughly 16–18 CSS px, line-height around 1.4–1.6, and comfortable measure around 45–75 characters for long-form content. Use fluid sizing where appropriate, bounded with `clamp()`, and test 200% zoom and narrow widths. Favor weight, size and spacing before adding more families; avoid loading unused weights. Use `font-display: swap` or equivalent and reliable fallbacks; account for layout shifts from font substitution.

Choose type for the content and language: check numerals for pricing, punctuation and diacritics for locales, distinction between `I/l/1`, and variable font support. Test long headings, form labels, mixed-case navigation and user-generated text. A decorative face may serve large headings but not dense interface copy. Document role tokens rather than sprinkling arbitrary one-off sizes.
