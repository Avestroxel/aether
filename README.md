# AETHER

**Think Beyond Templates. Design Beyond Expectations.**

AETHER is an open-source, agent-native design intelligence toolkit by **Anas Hashim**. It installs contextual design skills, actionable knowledge and native IDE rules into an existing project. It is **not** a website generator or a guarantee of visual quality: your coding agent still implements the website, guided by a brief → alternatives → art direction → system → implementation → QA workflow.

## Quick start — Node-free Windows launcher

On Windows 10/11 with **Windows PowerShell 5.1**, from the repository directory run the one-time setup (the checkout must include `portable/`):

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\install-aether.ps1
```

Open a **new terminal** to pick up the user PATH change. Then, from **any project directory**:

```powershell
aether init
aether doctor
```

The launcher points back to this checkout and installs project-local skills, knowledge, an index and an Antigravity entry rule; it does not copy the repository or install Node.js. Consumers of this Windows workflow need **no Node.js, npm, network access or npm package publication**. `AGENTS.md` is added only if absent; existing user instructions are not overwritten. If your agent does not discover the installed entry rule, add a pointer to `.agents/skills/aether-design-thinking/SKILL.md` and `aether/INDEX.md` to your existing instructions yourself.

Ask your coding agent: “Create a premium site for a modern architecture studio. Minimal, sophisticated, immersive visuals and smooth interactions.” The agent should open `.agents/skills/aether-design-thinking/SKILL.md`, inspect `aether/INDEX.md`, and select layout, typography and motion guidance as needed. AETHER installs guidance; it does not automatically generate code, execute a model or guarantee visual quality.

## Windows launcher commands

| Command | Behavior |
| --- | --- |
| `aether init [--cwd DIR]` | Install portable resources in the current project (or `DIR`); preserve existing user files |
| `aether doctor [--cwd DIR]` | Report missing, modified or unsafe managed files; exit nonzero on issues |
| `aether update [--cwd DIR]` | Refresh a previously installed project from the current portable package; preserve modified files and back up replaced files |
| `aether rollback [--cwd DIR]` | Restore the most recent update if its files have not changed since; preserve history |
| `aether uninstall [--cwd DIR]` | Remove unchanged project-owned files; leave modified files, contributions and history |
| `aether package [--cwd DIR]` | Rebuild the portable package from the registered source checkout; `--cwd` must name an existing directory but does not change the package destination |
| `aether skills [--brief TEXT] [--cwd DIR]` | List available design skills or select an intelligent context-appropriate shortlist matching a brief |
| `aether --help` / `aether help` / `aether -h` | Show Windows launcher usage |
| `aether --version` | Print the portable Windows launcher version |

`--cwd DIR` selects an existing project directory for project commands; the default is the current working directory. After editing `skills/` or `knowledge/` in the source checkout, run `aether package` **before** `aether update` in each installed project. Setup verifies the bundled package against its sources and refuses a stale or modified package; `aether package` rebuilds it. If you move the checkout, rerun setup from the new repository directory with `powershell -NoProfile -ExecutionPolicy Bypass -File .\install-aether.ps1`; the script detects its own new source path. `-Source 'C:\path\to\moved\AETHER'` is available when running setup from elsewhere (use your actual absolute path). Keep the checkout in place otherwise: the launcher refers to it rather than bundling it.

To remove the global launcher and user PATH entry, run `powershell -NoProfile -ExecutionPolicy Bypass -File .\uninstall-aether.ps1` from the repository; by default it preserves the registration config, and `-RemoveConfig` also deletes that config. Use `aether uninstall` in **each project** separately before removing the launcher if you want project files removed. The global setup does not uninstall project resources.

### Windows troubleshooting and limits

- `aether` not found: open a new terminal after setup; check that `%LOCALAPPDATA%\AETHER\bin` is on your user PATH (unless setup used `-NoPath`). If another `aether` command wins, use `where.exe aether` to identify the conflict; setup refuses to overwrite a launcher it does not own.
- Source missing after a move: rerun `install-aether.ps1` from the new checkout (or pass `-Source` with an absolute path). The launcher uses an ASCII-only batch file and a UTF-8 registration config, so repository paths with spaces and Unicode work.
- Stale package after source edits: run `aether package`, then `aether update` in each project. Setup's `-RebuildPackage` can rebuild before registration. Resolve unexpected files in `portable/` rather than deleting user data blindly.
- Modified or colliding project files: `aether doctor` reports integrity problems. `update` and `uninstall` preserve edited files; `init` refuses unowned index, entry skill or knowledge collisions. Keep your own backup and resolve conflicts manually; neither command promises to restore overwritten user files.

This launcher requires Windows PowerShell 5.1 and Windows `powershell.exe`/`.cmd`; it is **not** a cross-platform launcher or a PowerShell 7-only workflow. Default registration lives under `%LOCALAPPDATA%\AETHER`, and setup changes user PATH unless `-NoPath` is supplied. PATH registration in a fresh user session and live IDE discovery should be checked on your machine; they are not asserted here as tested.

## Legacy Node CLI (separate workflow)

The existing `aether-design` CLI requires Node.js 20+. For a local checkout, run `npm install && npm run build`, then from a target project run `node C:\path\to\AETHER\dist\cli.js init` (or `node dist/cli.js init --cwd C:\path\to\project` from the checkout). The npm registry returned 404 for `aether-design` on 2026-10-30, but namespace availability and publication are **not confirmed**; local installation does not require publishing. `npx aether-design ...` depends on a published package and is not the Windows quickstart.

Both the portable Windows launcher and the **Node CLI** provide identical intelligent skill-selection and category-boosted shortlists via `aether skills --brief TEXT` without requiring any external APIs or Node runtime for the Windows launcher. The Node CLI additionally supports `--ide` (for example, `cursor,claude`) to configure alternative IDE adapters and experimental local learning commands. For example: `node dist/cli.js init --cwd C:\path\to\project --ide cursor,claude`.

### Legacy Node CLI commands (`aether-design` / `node dist/cli.js`)

These are **not** portable `aether` subcommands. Both CLIs share the version-1 ownership manifest and update-history format; Windows tests cover doctor/update/rollback in both directions. The Node CLI can install other IDE adapter rules, while portable `aether` installs Antigravity only. Verify any mixed workflow against your project's modified files before switching tools.

| Command | Behavior |
| --- | --- |
| `init [--ide cursor,claude,...] [--cwd DIR]` | Install resources; auto-detect native IDE markers or explicitly select adapters |
| `update [--cwd DIR]` | Replace only unchanged, manifest-owned resources; back up replaced files |
| `doctor [--cwd DIR]` | Check hashes for missing/modified/unsafe managed files; exit nonzero on issues |
| `skills [--brief TEXT]` | List skills or select a small context-appropriate shortlist |
| `resources --capability motion\|3d\|components\|inspiration` | List offline curated leads, detect package manager and declared dependencies; never installs |
| `learn --module NAME --text TEXT` | Collect an unverified, project-local contribution under `aether/contributions/` |
| `learn --module NAME --file PATH [--source NAME --license SPDX]` | Import text; require source and license together for external references |
| `review --module NAME --id UUID --status approved\|rejected [--evidence TEXT]` | Explicitly review a lesson; approval requires recorded evidence |
| `undo-review --module NAME --id UUID` | Append a revision restoring the preceding review state |
| `lessons --brief TEXT` | Retrieve approved, evidenced lessons for the brief's selected skills only |
| `rollback [--cwd DIR]` | Restore the most recent update if touched files remain unchanged |
| `uninstall [--cwd DIR]` | Remove only unchanged AETHER-owned files; preserve edits and local contributions |

For the Node CLI, use `--cwd` to target a different project. `learn` records suggestions as pending JSON revisions, **not automatically trusted or activated rules**. Review and integrate lessons intentionally; approval records reviewer-supplied evidence but cannot prove the evidence is accurate. `lessons` retrieves only approved records, never injects them into IDE instructions or modifies core knowledge. The legacy `.md` contributions remain untouched and untrusted. Update, installer rollback and uninstall leave all contributions alone. See [learning and review](docs/experience.md). URL/HTML content is rejected for local lessons; for third-party work verify license and provenance independently. No remote search, automatic dependency installation, feedback-based model training or autonomous code mutation is claimed. `resources` provides a curated offline evaluation starting point and cannot attest to current maintenance or licensing.

## IDE support

The following detection and native adapters describe the **legacy Node CLI**. The portable Windows launcher installs the Antigravity `.agents/rules/aether-design-thinking.md` entry plus shared skills and knowledge; it does not auto-detect or install Cursor, Copilot, Claude Code or Windsurf native rules.

| Environment | Native entry | Detection marker |
| --- | --- | --- |
| Google Antigravity | `.agents/rules/aether-design-thinking.md` | `.agents/rules/`, legacy `.agent/rules/`, `GEMINI.md` |
| Cursor | `.cursor/rules/aether-design-thinking.mdc` | `.cursor/`, `.cursorrules` |
| VS Code Copilot | `.github/copilot-instructions.md` | `.vscode/`, existing Copilot instruction locations |
| Claude Code | `CLAUDE.md` | `.claude/`, `CLAUDE.md` |
| Windsurf | `.windsurf/rules/aether-design-thinking.md` | `.windsurf/`, `.windsurfrules` |

Every adapter points to the shared project-local Agent Skills under `.agents/skills/aether-*/SKILL.md`. Adapters are declarative; the installer refuses to overwrite existing non-owned rule files. If an existing `AGENTS.md`, `CLAUDE.md` or Copilot instructions block AETHER's entry rule, add a reference to the installed skill manually. An IDE may require manual skill discovery configuration. For VS Code, the native file targets Copilot chat/agent instructions, **not** arbitrary VS Code extensions. Native formats and precedence may change; see [integration notes](docs/integrations.md).

## Intelligence architecture

`skills/` holds 18 source skills with Agent Skills metadata; `knowledge/` contains task-specific reference modules. `build-portable.ps1` packages these sources under `portable/`; the Windows launcher verifies that package before installing project-local resources. The separate Node installer copies sources into a project and supports native IDE adapters. Both create an index and use `AGENTS.md` only when available. In the Node implementation, `src/core/` owns manifest, safety, update/rollback, contextual selection and local feedback; `src/adapters/` owns native instruction formats; `src/resources/` handles validated packaged resources and offline resource discovery; `src/cli.ts` exposes Node commands.

Selection uses deterministic brief keyword and description matching, not an LLM or arbitrary randomness. The design-thinking and anti-generic skills require comparing purposeful alternatives; visual direction, accessible components, motion and 3D depend on the brief and implementation context. Dedicated signals route scroll-engineering, interaction-design, navigation-architecture and design-quality for matching briefs; the shortlist is a heuristic, not semantic analysis. Existing project design systems and libraries take precedence over default heuristics. No screenshots or image inspection are required for the core workflow; use code, DOM, functional, accessibility and performance checks when available.

## Safety and customization

`aether/manifest.json` tracks SHA-256 hashes for AETHER-owned files. Existing rules are not claimed or overwritten. In both workflows, `update` skips modified files and stores revisions in `aether/history/`; `rollback` refuses to overwrite later edits; `uninstall` retains modified files, local lessons and history. Review leftover files after uninstall. Missing/corrupt manifests cannot safely reconstruct ownership; recover from your own project backups. Symlinks in managed paths and unsafe manifest paths are rejected. Do not run simultaneous installers in the same project; filesystem safety checks are not a transaction or security sandbox.

Edit your project-specific design instructions directly (they become user-owned modifications) or submit a change to `skills/` or `knowledge/` in the source project, then test it before releasing. To use an external library, inspect the project's dependencies and compare maintenance, compatibility, licensing, security, privacy and bundle impact before installation; `resources` provides leads, not license clearance.

## Development (Node CLI)

```bash
npm install
npm test
npm pack --dry-run
```

Run `node dist/cli.js init --cwd ./my-site --ide cursor` to test the Node CLI locally. Node tests exercise install, detection, contextual routing, contribution review and rollback, input validation and preservation using temporary projects. A separate Windows PowerShell 5.1 integration suite lives in `tests/portable-windows.test.ps1`; its Node wrapper skips it on non-Windows hosts. Running tests does not establish user PATH propagation in a new terminal or live IDE discovery. Do not infer cross-platform support for the Windows launcher from the Node tests. [Contributing](CONTRIBUTING.md) · [Changelog](CHANGELOG.md) · [Roadmap](docs/roadmap.md) · [MIT license](LICENSE).
