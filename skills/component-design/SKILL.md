---
name: component-design
description: Design or implement reusable UI components with clear semantics, variant boundaries, accessible states and practical component contracts.
---

# Component design

Use when a repeated interface pattern needs a component or an existing component needs cleanup. Read [layout and components](../../knowledge/layout-components-responsive.md) and [UX and accessibility](../../knowledge/ux-accessibility.md).

1. Inspect the repository's primitives, tokens and framework before introducing another abstraction. Separate domain data from presentation.
2. Define the contract: purpose, inputs, slots, outputs/events, semantic element, keyboard behavior and responsive behavior. Use `<a>` for navigation and `<button>` for an action.
3. Enumerate only relevant states: default, hover, focus-visible, pressed, disabled, loading, success, error, empty. Specify visible feedback, accessible names and what happens on failure.
4. Implement one real use case and one edge case; test keyboard navigation, long text, loading and narrow screens. Add variants only for distinct needs.

Example: A `PlanCard` can accept plan name, price, limits and a link destination; it should not decide which plan is best from hidden global state. Deliver component API, state matrix and an example with long/localized content. Do not create a universal component that requires dozens of booleans to represent unrelated patterns.
