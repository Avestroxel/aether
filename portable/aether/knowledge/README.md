# Design knowledge map

Use these references selectively; do not apply every aesthetic or technique to every site. Start with the user's actual audience, content, constraints, and existing code. Treat numbers as starting heuristics unless a cited standard is specified. Never describe an untested design as validated.

| Question | Reference |
| --- | --- |
| What should the experience accomplish? | [Strategy and design thinking](strategy.md) |
| Which category-specific needs change the composition? | [Category directions](category-directions.md) |
| What visual language and assets fit? | [Visual direction](visual-direction.md) |
| How should colors and type work together? | [Color and typography](color-typography.md) |
| How should space, components and breakpoints behave? | [Layout, components and responsive](layout-components-responsive.md) |
| When should interaction, motion, scroll or 3D be used? | [Interaction, motion and 3D](interaction-motion-3d.md) and [technology choices](technology-choices.md) |
| Can people understand and operate it? | [UX and accessibility](ux-accessibility.md) |
| What should be measured and optimized? | [Performance](performance.md) |
| How do we avoid template-looking output? | [Distinctiveness](distinctiveness.md) |
| Which references/assets are safe and useful? | [Resources and QA](resources-qa.md) |
| What do we learn from the result? | [Improvement loop](improvement-loop.md) |

Routing: For a new concept, read strategy + visual direction before choosing tokens. For UI implementation, read layout + UX and accessibility; use navigation-architecture or interaction-design for those focused tasks. For scroll effects, consult scroll-engineering + interaction/motion; for assets or libraries, read resources and QA + performance. For critiques, use design-quality, compare the result against strategy and distinctiveness, then use the improvement loop. These are reading suggestions, not guarantees about automatic skill selection. If a project supplies a design system, follow it over these default heuristics unless the user asks to change it.
