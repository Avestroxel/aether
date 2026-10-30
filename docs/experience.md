# Design experience and verification

Created by Anas Hashim.

AETHER installs guidance for an agent; it does not generate a website, inspect a browser automatically, or guarantee a design outcome. For each website: inspect the target repository, audience and tasks; compare at least two appropriate directions; choose a visual hierarchy and motion language; implement; run available checks; report what was actually tested. Use `aether/INDEX.md` to open only the skills relevant to the brief; the separate Node CLI's `aether-design skills --brief "..."` offers a deterministic shortlist (the Windows `aether` launcher has no `skills` command). If the brief is ambiguous, explicitly choose specialist guidance rather than loading everything.

## Motion and interaction

For each section, decide whether motion improves comprehension, then define an entry, resting, exit and upward-scroll state. A one-shot reveal remains readable after it finishes; a scroll-scrubbed transformation reverses smoothly. Default to semantic, visible content and CSS/IntersectionObserver; only consider GSAP/ScrollTrigger, Motion, React Spring, AutoAnimate, Lenis or View Transitions when their capabilities justify compatibility, licensing, maintenance, bundle and accessibility costs. Use transform/opacity for simple effects; avoid excessive listeners, forced layout, scroll traps and identical effects on every section. Give navigation, buttons, cards, forms, dialogs and menus clear hover/touch/keyboard/focus/disabled/error states. **Never add audio unless explicitly requested**; if requested, require accessible opt-in controls and respect autoplay restrictions.

## Responsive and 3D

Adapt navigation, type, layout, density and controls to content and input capability, not just fixed device widths. Test narrow mobile, mobile, tablet, laptop, desktop and wide layouts; check overflow, collisions, tap targets, image sizing, forms, focus order and zoom. Reduce parallax and stagger on low-power/touch devices; with `prefers-reduced-motion`, keep essential content immediately visible. Use 3D only for a clear task (such as product understanding), with asset/texture budgets, lazy loading, fallback content, low-power and reduced-motion handling. Use native scrolling and fallbacks rather than making information depend on rendering or a completed animation.

## Quality gate

Run the project's existing build/tests first. Where available, use DOM/browser and accessibility checks for keyboard/touch, headings/labels, focus, links, assets, forms, responsive reflow, reverse scroll and reduced-motion behavior. Use performance profiling for continuous effects and 3D. Review visual hierarchy, coherence and originality with human judgment; automated checks do not prove visual quality. Record which viewport sizes, browsers and assistive technologies were *actually* tested; do not claim screenshot, browser or device validation without performing it.

## Local learning lifecycle (legacy Node CLI only)

The following `aether-design learn`, `review`, `lessons` and `undo-review` commands require the Node.js 20+ CLI. They are not supported by the Node-free Windows `aether` launcher.

1. Collect a useful, privacy-safe observation: `aether-design learn --module motion-design --text "Keep a revealed section visible when scrolling upward" --cwd PROJECT`. The command returns a path like `aether/contributions/motion-design/UUID/v1.json`. Save the UUID; a pending lesson is not authoritative.
2. Check technical, accessibility, responsive and performance evidence independently. Confirm the lesson is reusable, non-duplicative, correctly scoped to this project, and does not conflict with existing guidance. External source and license must be supplied together. Remove secrets or personal data before collection; the CLI is not a privacy scanner.
3. `aether-design review --module motion-design --id UUID --status approved --evidence "Tested reverse scroll at 360px and 1280px with reduced motion" --cwd PROJECT`. Approval requires nonempty reviewer-supplied evidence. The CLI checks that evidence exists, **not** whether the test really happened. To decline, use `--status rejected`.
4. `aether-design lessons --brief "scroll motion for portfolio" --cwd PROJECT` returns only approved lessons for selected modules. Compare against current context before using them. Lessons are never inserted into managed skills or IDE rules and never leave the local project automatically. General-scope lessons are not promoted to universal knowledge by the CLI.
5. `aether-design undo-review --module motion-design --id UUID --cwd PROJECT` appends a revision restoring the preceding state without deleting history. This is distinct from `rollback`, which reverts the most recent *installer* update. `update`, installer `rollback` and `uninstall` never take ownership of contributions. Older `.md` lessons remain unchanged and excluded from retrieval; migrate them manually after review if useful.

Records include module, source/project provenance, scope, evidence, status, timestamp, version and previous revision hash. Local files can still be edited by their owner; this is an auditable workflow, **not** cryptographic proof of reviewer identity or an automatic learning model. Avoid simultaneous reviews of the same lesson. Successful project code is an observation, not automatically a universal design rule.
