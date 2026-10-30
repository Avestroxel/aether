# Contributing

AETHER is maintained as open-source design intelligence, not a collection of copied site implementations. Contributions from designers and engineers are welcome; original author: **Anas Hashim**.

1. Explain the audience, constraint, design tradeoff and applicable project categories behind any new instruction. Include an actionable example and an anti-pattern. Avoid aesthetic absolutes.
2. Add or refine a scoped `skills/<slug>/SKILL.md` and reference `knowledge/*.md` when needed. Agent Skills metadata (`name`, `description`) must match the source folder, with a precise activation description. The installer prefixes installed skill names with `aether-`.
3. For resource suggestions include primary source, author, license, allowed use and verification date. Do not include proprietary implementations, unlicensed assets or live secrets.
4. Run `npm test` and `npm pack --dry-run`. Exercise install/update/uninstall on a disposable project if changing adapters or filesystem logic. Document platform-specific tests actually run.
5. Keep core code changes reviewable; user-contributed lessons are inert until reviewed and merged. Core engine changes require a code review and tests. Do not represent the offline resource catalog as an automatically audited security database.

For a new IDE, add a declarative adapter in `src/adapters/index.ts`, detect a reliable local marker, use native documented format, then add tests and update `docs/integrations.md`. If existing project configuration collides, preserve it and explain a manual merge.
