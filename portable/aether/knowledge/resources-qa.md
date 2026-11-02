# Resource evaluation and the 13-Dimension Design Quality Gate

## Evaluate external assets & libraries before adopting

For any font, photograph, icon set, illustration, UI package, animation library, or 3D model, verify:
- **Provenance & license:** Confirm commercial permission, modification/redistribution rights, and required attribution. Never hotlink unlicensed previews.
- **Technical & privacy cost:** Check bundle weight, maintenance status, framework compatibility, accessibility support, and third-party network/cookie behavior. Prefer native platform features, inline precision SVGs, and CSS custom properties whenever they achieve the design goal cleanly.

---

## The Three Quality Pillars

A site that compiles without errors can still look like a sterile wireframe. Always evaluate and pass all three independent pillars:

1. **Functional & Technical Correctness:** Clean DOM structure, working state transitions (filters, tabs, mobile drawers, forms), zero horizontal overflow (`overflow-x`), resilient asset loading, and valid markup.
2. **Visual & Creative Quality:** Category-authentic art direction, loaded web fonts with dramatic scale contrast, atmospheric multi-tiered surfaces, `1px` architectural hairlines, and bespoke visual artifacts.
3. **UX Quality:** Domain-authentic copy (zero placeholders or generic slogans), clear primary actions, predictable navigation, WCAG 2.2 AA contrast, keyboard/focus parity, and `prefers-reduced-motion` support.

---

## The 13-Dimension Design Quality Gate (Code & DOM Inspectable)

Run this 13-dimension gate on every website or interface before completion:

| # | Dimension | Code & DOM Pass Criteria | Instant Fail Signal |
| --- | --- | --- | --- |
| **1** | **Originality** | Domain-specific copy, real/realistic metrics & names, signature structural motif (ledger, split monograph, interactive stage). | Generic AI Template (`"Transform your workflow"`, 3 icon cards, `Lorem ipsum`, or placeholder disclaimers). |
| **2** | **Art Direction** | Cohesive 3-attribute visual thesis matched to the category (e.g., warm travertine + serif monograph for architecture; obsidian + mono telemetry for dev tools). | Category mismatch (e.g., SaaS pricing cards on a luxury studio or cultural site). |
| **3** | **Visual Hierarchy** | Unmistakable primary focal point per viewport; `clamp()` display scale (`≥2.75rem`), eyebrow kickers, and clear CTA prominence. | Flat hierarchy where headings, body text, and buttons compete at similar sizes/weights. |
| **4** | **Typography** | Purposeful web fonts loaded (`--font-display`, `--font-sans`, `--font-mono`); tight display tracking (`-0.02em` to `-0.04em`); prose measure `55–70ch`; `tabular-nums` on numbers. | Unstyled `system-ui`/`Arial` on a brand/editorial site, or 120ch edge-to-edge paragraphs. |
| **5** | **Color Harmony** | Tinted architectural neutrals (`--bg-canvas`, `--bg-surface-1`, `--bg-surface-2`), subtle `1px` hairline borders (`rgba`/`color-mix`), disciplined 60-30-10 accent usage. | Raw `#ffffff`/`#000000` with random saturated rainbow badges or muddy drop shadows. |
| **6** | **Layout Composition** | Intentional asymmetric grids (`7:5`, `4:8`, 12-col), aligned baselines, generous vertical rhythm (`clamp(4rem, 8vw, 8rem)`), active negative space. | Everything centered in a narrow column or cramped with inconsistent padding. |
| **7** | **Section Differentiation** | Consecutive sections alternate layout geometry and pacing (hero → split narrative → interactive ledger/matrix → visual showcase → inquiry studio). | Repeating the same 3-column card grid in two or more sections. |
| **8** | **Component Quality** | Tactile buttons, hairline-framed cards/ledgers, bespoke SVG diagrams or art-directed media containers, complete `:hover` / `:focus-visible` / `:active` states. | Default unstyled inputs, dead non-interactive mock buttons, or generic Bootstrap-style boxes. |
| **9** | **Consistency** | Unified CSS custom properties for spacing, radius, border alpha, typography roles, and transition timing across the entire document. | Arbitrary one-off hex codes, mixed border radii, or inconsistent button styles. |
| **10** | **Responsive Design** | Content-driven breakpoints (`320px`, `375px`, `768px`, `1024px+`), `200%` zoom reflow without clipping or horizontal scroll, preserved mobile art direction. | Fixed pixel widths causing horizontal overflow, or mobile views stripped of all design character. |
| **11** | **Accessibility** | Semantic landmarks (`<header>`, `<main>`, `<nav>`, `<footer>`), logical H1–H3 order, WCAG 2.2 AA contrast (`4.5:1` / `3:1`), keyboard operability, focus return, `prefers-reduced-motion`. | `<div>` buttons, missing form `<label>`s, low-contrast muted text, or motion-only status cues. |
| **12** | **Performance** | Above-fold LCP image prioritized (never lazy-loaded), explicit `width`/`height` or `aspect-ratio` on media, minimal font weights with `display=swap`, composited `transform`/`opacity` animations. | Layout shift from unsized media, unthrottled scroll handlers, or unnecessary heavy libraries. |
| **13** | **Overall Professional Appearance** | Reads immediately as a shipped flagship experience crafted by a senior design studio and staff front-end engineer. | Looks like an AI wireframe, a homework skeleton, or a generic boilerplate template. |

## Verification protocol

When auditing or testing:
- Exercise the primary user flow, interactive filters/drawers/forms, keyboard tabbing, `200%` zoom, mobile widths (`320px`/`375px`), and `prefers-reduced-motion`.
- Record issues as **context → dimension → reproduction → impact → fix → retest status**. Separate verified checks from unrun environment tests.
