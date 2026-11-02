# Color and typography

## Atmospheric color architecture

Great web interfaces feel tactile and art-directed because they treat color as **spatial atmosphere and material elevation**, not flat paint on raw `#ffffff` or `#000000`.

### 1. Tinted architectural neutrals & multi-tiered elevation
Instead of harsh pure white or pure black, anchor surfaces in subtle warm or cool undertones and step through clear elevation tiers:

| Semantic Token | Warm Architectural / Editorial (Light) | Obsidian Technical / Cinema (Dark) | High-Craft Studio (Warm Dark) |
| --- | --- | --- | --- |
| `--bg-canvas` | `#F6F3EC` (Alabaster / Linen) | `#090A0F` (Deep Carbon) | `#11100E` (Warm Obsidian) |
| `--bg-surface-1` | `#EFEAE0` (Travertine / Stone) | `#11131C` (Elevated Slate) | `#191714` (Smoked Bronze) |
| `--bg-surface-2` | `#E6DFD1` (Warm Sand Card) | `#181B28` (Interactive Card) | `#221F1B` (Tactile Panel) |
| `--bg-glass` | `rgba(246, 243, 236, 0.82)` | `rgba(17, 19, 28, 0.78)` | `rgba(25, 23, 20, 0.82)` |
| `--text-primary` | `#161513` (Deep Ink) | `#F3F5F8` (Crisp Alabaster) | `#F4F0EA` (Warm Chalk) |
| `--text-secondary` | `#4A4640` (Graphite Prose) | `#A0AAB8` (Muted Steel) | `#B5ADA2` (Stone Gray) |
| `--text-muted` | `#6E685F` (Index / Captions) | `#7E899B` (Technical Meta) | `#8C8479` (Specimen Meta) |
| `--border-subtle` | `rgba(22, 21, 19, 0.11)` | `rgba(243, 245, 248, 0.09)` | `rgba(244, 240, 234, 0.10)` |
| `--border-strong` | `rgba(22, 21, 19, 0.28)` | `rgba(243, 245, 248, 0.24)` | `rgba(244, 240, 234, 0.26)` |

### 2. Disciplined accent & state choreography
- **60–30–10 proportion (or Editorial Monochrome + 1 Accent):** Keep 90% of the viewport in harmonious canvas, elevated surfaces, and crisp hairlines so the 10% accent (`--accent-primary`: e.g., `#B85032` terracotta, `#8C6D3F` aged brass, `#2563EB` international cobalt, or `#10B981` signal emerald) commands immediate attention on primary CTAs, active markers, and focal data points.
- **Hairline craftsmanship:** Use `1px solid var(--border-subtle)` to create architectural structure, exposed grid dividers, and card boundaries instead of heavy, muddy drop shadows.
- **WCAG 2.2 AA compliance:** Every rendered text pairing must meet **4.5:1** for normal text (including `--text-muted` captions!), **3:1** for large text (`≥24px` regular or `≥18.66px` bold), and **3:1** for essential UI borders and `:focus-visible` indicators. Never convey validation, status, or trends through color alone—always include a label, symbol (`+14.2%`), or icon.

---

## Expressive, high-craft typography

Typography is the single strongest signal of design quality on the web. Defaulting a brand, architecture, editorial, or product site to `system-ui` immediately makes it look like an unfinished template.

### 1. Curated web font pairings by domain
Always load purposeful web fonts (`<link rel="preconnect">` + Google Fonts or local `@font-face` with `font-display: swap`), selecting 2–3 complementary roles (`--font-display`, `--font-sans`, `--font-mono`):

| Archetype | Display / Headline (`--font-display`) | UI & Prose (`--font-sans`) | Technical / Index (`--font-mono`) |
| --- | --- | --- | --- |
| **Luxury Architecture & Interior** | `Cormorant Garamond`, `Instrument Serif`, or `Newsreader` (light/regular + italic tension) | `Plus Jakarta Sans` or `DM Sans` | `IBM Plex Mono` or `JetBrains Mono` |
| **Editorial, Cultural & Magazine** | `Playfair Display`, `Newsreader`, or `Fraunces` | `Inter` or `Source Sans 3` | `JetBrains Mono` |
| **Modern SaaS & AI Launch** | `Space Grotesk`, `Plus Jakarta Sans`, or `Outfit` | `Inter` or `Plus Jakarta Sans` | `JetBrains Mono` |
| **Avant-Garde Agency & Portfolio** | `Syne`, `Space Grotesk`, or `Instrument Serif` | `Plus Jakarta Sans` or `Inter` | `IBM Plex Mono` |
| **Native-OS Admin / Dense Utility** | `Inter` or platform `system-ui` stack | `Inter` or `system-ui` | `JetBrains Mono` or `ui-monospace` |

### 2. Fluid typographic scale & micro-craft
Use bounded `clamp()` rules and deliberate contrast in weight, tracking, and case:
- **Hero Display:** `font-size: clamp(2.75rem, 5.5vw + 1rem, 5.5rem)`, `line-height: 0.98` to `1.06`, `letter-spacing: -0.025em` to `-0.04em`, `text-wrap: balance`. Mix roman and italic words in serif headlines for editorial sophistication.
- **Section Heading (H2):** `font-size: clamp(1.85rem, 3.2vw + 0.5rem, 3.25rem)`, `line-height: 1.08` to `1.15`, `letter-spacing: -0.02em`, `text-wrap: balance`.
- **Subheading / Lead (H3 / Lede):** `font-size: clamp(1.2rem, 1.5vw + 0.5rem, 1.5rem)`, `line-height: 1.4`, max measure `55ch`.
- **Body Prose:** `font-size: clamp(1rem, 0.25vw + 0.95rem, 1.125rem)`, `line-height: 1.6` to `1.7`, measure strictly constrained to `55–70ch` (`text-wrap: pretty`). Never allow body paragraphs to stretch across a `1200px` container.
- **Eyebrow / Kicker / Rubric:** `font-size: 0.75rem` (`12px`), `text-transform: uppercase`, `letter-spacing: 0.1em` to `0.15em`, `font-weight: 600`, paired with a monospace index (`01`) or subtle hairline rule.
- **Numeric Discipline:** Apply `font-variant-numeric: tabular-nums` on all metrics, pricing, architectural dimensions (`420 m²`), coordinates, dates, and table cells so numbers align vertically and never jitter.
