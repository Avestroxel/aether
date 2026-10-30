# IDE integration and troubleshooting

Created by Anas Hashim.

AETHER ships a minimal entry rule plus on-demand Agent Skills. Native agent formats are not interchangeable. The **Node CLI** (`aether-design` / `node dist/cli.js`) detects markers on `init`; use `--ide antigravity,cursor,copilot,claude,windsurf` to select explicitly. The **Windows PowerShell 5.1 launcher** (`aether`) installs the Antigravity `.agents/rules/aether-design-thinking.md` entry and shared skills/index, without IDE detection or `--ide`. It does not install the other native adapters listed below. Existing non-owned files always win.

- **Antigravity**: `.agents/rules/aether-design-thinking.md` uses `trigger: model_decision` and `description`. Agent Skills are installed under `.agents/skills/`. `.agent/rules` is detected as a legacy marker but not written.
- **Cursor**: `.cursor/rules/aether-design-thinking.mdc` uses `description` and `alwaysApply: false`. `AGENTS.md` is also supported by Cursor when not already present. Cursor Tab is not affected by agent rules.
- **VS Code Copilot**: `.github/copilot-instructions.md` holds repository-wide guidance; other extensions may require different formats. Copilot instructions do not control inline completion.
- **Claude Code**: `CLAUDE.md` is the native project entry. If it already exists, AETHER leaves it alone: add a manual pointer to `.agents/skills/aether-design-thinking/SKILL.md` and `aether/INDEX.md` in your existing file. Check current project instruction precedence when mixing `AGENTS.md` and `CLAUDE.md`.
- **Windsurf**: `.windsurf/rules/aether-design-thinking.md` uses `trigger: model_decision`. Keep project rules below Windsurf's character limits.

In either workflow, if `doctor` reports `Modified`, that file is protected from update and uninstall. `Missing` means a managed file was removed manually: `update` can regenerate a missing managed path if no unrelated file occupies it. If `init` reports an unowned `aether/INDEX.md`, entry skill or managed knowledge file, resolve the collision manually; the Windows installer refuses to claim it. Existing `AGENTS.md` is preserved, so add the entry pointer yourself when your agent does not discover native rules. Before publishing, verify current official IDE format documentation; product conventions evolve. The portable Windows suite does not establish live IDE discovery or user PATH propagation in a new terminal; verify both locally.
