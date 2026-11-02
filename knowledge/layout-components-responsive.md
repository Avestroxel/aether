# Layout, components and responsive behavior

## Section differentiation and spatial rhythm

The hallmark of a generic AI website is **structural monotony**: every section is a centered heading above a 3-column grid of rounded cards. High-craft web design choreographs **spatial rhythm** by alternating layout geometry, density, and visual weight from one section to the next.

### Recommended 5-part spatial progression (adapt to category)
1. **The Architectural / Theater Hero:**
   - *Editorial / Studio / Flagship:* Asymmetric `7:5` or `8:4` grid, or monumental display headline spanning the top with a split metadata column (`01 / Location / Year / Typology`) beside a commanding `16:10` or `4:5` visual frame.
   - *Technical SaaS / Product:* Split theater (`6:6` or `5:7`) pairing a sharp value thesis and primary CTA with an interactive, inspectable product artifact (live workflow switcher, schematic diagram, or telemetry console).
2. **The Editorial Split or Narrative Thesis:**
   - A `4:8` or `5:7` asymmetric layout where a sticky section header/kicker anchors the left column while the right column unfolds a sequence of numbered principles, case-study chapters, or architectural specifications separated by `1px` horizontal hairlines.
3. **The Interactive Showcase or Specification Ledger:**
   - Instead of generic icon cards, use an **indexical ledger table** (project name, typology, material palette, dimensions, year, hover preview) or an **interactive tabbed/filterable stage** where visitors can inspect real domain details (`All / Residential / Cultural / Adaptive Reuse` or `Schema / Query / Telemetry`).
4. **The Visual Statement or Asymmetric Bento/Gallery:**
   - A curated gallery or asymmetric feature composition (`2fr 1fr`, staggered portrait + landscape aspect ratios, or full-bleed architectural diagram) with detailed captions and technical callouts.
5. **The High-Confidence Conversion / Inquiry Studio & Structured Footer:**
   - A concrete action section (project inquiry form with scope/timeline selectors, interactive plan calculator, or direct consultation booking) followed by a structured multi-column footer with colophon, coordinates, and semantic links.

### Spacing and grid mechanics
- **Fluid section rhythm:** Use `padding-block: clamp(4rem, 8vw, 8rem)` for primary sections and `clamp(1.5rem, 3vw, 3rem)` for internal grid gaps.
- **Container discipline:** Center a max-width container (`1280px`–`1440px`) with `padding-inline: clamp(1.25rem, 4vw, 3.5rem)`, allowing selected full-bleed dividers or visual stages to span edge-to-edge cleanly without triggering `100vw` horizontal scrollbar bugs.
- **Measure control:** Always cap body paragraphs at `55–70ch` even inside wide grid tracks.

---

## Bespoke component craft

Components must act as **tactile architectural elements** AND **accessible semantic contracts**:

1. **Buttons & Primary Controls:**
   - Match geometry to brand voice: sharp `0px–2px` corners or chamfered edges for architecture/brutalist/editorial sites; crisp `6px–8px` radius for technical SaaS; pill radius (`9999px`) only when deliberate.
   - Give primary buttons unmistakable contrast, subtle border definition, and immediate `:hover`, `:active`, and `:focus-visible` (`2px solid var(--focus-ring)` with `2px` offset) states.
2. **Cards, Ledgers & Spec Rows:**
   - Avoid floating cards with muddy `0 10px 30px rgba(0,0,0,0.15)` shadows on every section. Prefer **hairline-framed cells** (`1px solid var(--border-subtle)`), exposed grid borders (`gap: 1px; background: var(--border-subtle)`), or clean editorial figure plates where image crop, monospace index, title, and metadata align on a razor-sharp baseline.
3. **Architectural Headers & Navigation Bars:**
   - Keep headers low-profile (`56px–72px`), using translucent surface blur (`backdrop-filter: blur(12px)`) over a `1px` bottom hairline. Pair the brand wordmark/monogram with 3–5 clear destination links and one primary action button.
4. **Interactive Artifacts & Forms:**
   - Wire up interactive controls (category filters, dimension unit switches, expandable specification drawers, and validated forms) with semantic HTML (`<button>`, `aria-expanded`, `aria-pressed`, `<label for>`) so the page feels alive and functional immediately.

---

## Responsive adaptation without losing soul

Responsive design is **re-composing the art direction for narrow and zoomed viewports**, never dumping everything into a plain single-column wireframe:

- **Breakpoints where content actually breaks:** Start from a rock-solid `320px–375px` mobile composition and expand at content-driven thresholds (`~640px`, `~768px`, `~1024px`, `~1280px`).
- **Preserve editorial tension on mobile:** Keep eyebrow kickers, monospace index numbers, `1px` hairline dividers, and intentional image aspect ratios intact on mobile. Use 2-column micro-grids for compact metadata pairs (e.g., `Location` | `Area m²`) so mobile screens retain architectural structure rather than becoming an endless vertical list of single words.
- **Navigation & touch parity:** Ensure every interactive control has at least `24×24 CSS px` (`44×44 CSS px` recommended for primary touch targets) and works without hover. Mobile menu drawers must support button toggle (`aria-expanded`), `Escape`, outside dismissal, and focus return.
- **DOM reading order & `200%` zoom:** Keep DOM reading order logical across all breakpoints. Verify that `200%` browser zoom and long words (`overflow-wrap: break-word`) never clip text or force horizontal page scrolling.
