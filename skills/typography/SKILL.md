---
name: typography
description: Choose and implement a readable type system for websites, including hierarchy, font loading, language support, responsive sizing and real-content testing.
---

# Typography

Use when selecting fonts, fixing hierarchy or defining text styles. Read [color and typography](../../knowledge/color-typography.md) and [performance](../../knowledge/performance.md).

1. Inventory content types: hero, headings, prose, labels, navigation, data and error messages. Choose a compact set of roles rather than a size for every page.
2. Select fonts for actual language, numerals, characters and weight range. Check license and permitted hosting using [resource QA](../../knowledge/resources-qa.md); use system fonts when custom fonts add little value.
3. Define bounded responsive sizes, line heights and measure; start body near 16–18 CSS px with 1.4–1.6 line-height. Check 200% zoom and long translated strings.
4. Load only used weights/subsets, provide fallbacks and measure font-related layout shift. Test contrast on actual backgrounds.

Example: A pricing table needs distinct numerals and legible footnotes; a display serif can headline the page while body and data remain in a clear sans. Deliver role tokens, font/fallback stack, loading plan and samples using longest real labels. Avoid tiny uppercase captions that fail to communicate critical information.
