import { randomUUID } from "node:crypto";

import { adapters } from "../adapters/index.js";
import { loadResources } from "../resources/index.js";
import { hash, relativePath, SafeTree } from "./files.js";
import { collect } from "./contributions.js";
export { contributions, reviewContribution, rollbackContribution } from "./contributions.js";

interface Owned { hash: string; version: string }
interface Manifest {
  schema: 1;
  files: Record<string, Owned>;
  adapters: string[];
  history: string[];
}
interface Revision {
  before: Manifest;
  after: Manifest;
  changed: string[];
}

const manifestPath = "aether/manifest.json";
const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const adapterPaths = new Set(adapters.flatMap((adapter) => adapter.files().map((file) => file.path)));
const allowed = (path: string): boolean => path === "AGENTS.md" || path === "aether/INDEX.md" ||
  /^aether\/knowledge\/(?:README|[a-z0-9]+(?:-[a-z0-9]+)*)\.md$/.test(path) ||
  /^\.agents\/skills\/aether-[a-z0-9]+(?:-[a-z0-9]+)*\/SKILL\.md$/.test(path) || adapterPaths.has(path);

function parseManifest(data: Buffer): Manifest {
  let parsed: unknown;
  try { parsed = JSON.parse(data.toString("utf8")); } catch { throw new Error("Invalid AETHER manifest JSON"); }
  const m = parsed as Manifest;
  if (!m || m.schema !== 1 || !m.files || typeof m.files !== "object" || Array.isArray(m.files) ||
    !Array.isArray(m.adapters) || !Array.isArray(m.history)) throw new Error("Invalid AETHER manifest");
  for (const [path, item] of Object.entries(m.files)) {
    relativePath(path);
    if (!allowed(path) || !item || !/^[a-f0-9]{64}$/.test(item.hash) || !/^[a-f0-9]{64}$/.test(item.version)) throw new Error(`Invalid manifest entry: ${path}`);
  }
  if (m.adapters.some((id) => typeof id !== "string" || !adapters.some((adapter) => adapter.id === id)) ||
    m.history.some((id) => typeof id !== "string" || !/^[a-f0-9-]{36}$/.test(id))) throw new Error("Invalid manifest metadata");
  return m;
}
function encode(m: Manifest): string { return JSON.stringify(m, null, 2) + "\n"; }
function clone(m: Manifest): Manifest { return JSON.parse(JSON.stringify(m)) as Manifest; }
async function readManifest(tree: SafeTree): Promise<{ manifest: Manifest | undefined; raw: Buffer | undefined }> {
  const raw = await tree.read(manifestPath);
  return { manifest: raw ? parseManifest(raw) : undefined, raw };
}
async function saveManifest(tree: SafeTree, manifest: Manifest, raw?: Buffer): Promise<void> {
  await tree.write(manifestPath, encode(manifest), raw ? hash(raw) : undefined);
}
function empty(): Manifest { return { schema: 1, files: {}, adapters: [], history: [] }; }
function knowledgePath(name: string): string { return `aether/knowledge/${name}`; }
function skillPath(name: string): string { return `.agents/skills/aether-${name}/SKILL.md`; }
function indexContent(names: string[], knowledge: string[]): string {
  return `# AETHER index

Start with [design thinking](../.agents/skills/aether-design-thinking/SKILL.md). Act as a Creative Director and Principal UI Engineer: compare at least two distinct structural and aesthetic directions, commit to a bold visual thesis, and build directly in production code unless asked for a written brief.

## Routing & Priority
1. **Concept & Anti-Generic Direction:** \`design-thinking\`, \`visual-design\`, \`anti-generic-design\` (\`knowledge/strategy.md\`, \`knowledge/category-directions.md\`, \`knowledge/visual-direction.md\`, \`knowledge/distinctiveness.md\`)
2. **Core Visual Craft (load for website/UI creation):** \`typography\`, \`color-intelligence\`, \`layout-intelligence\`, \`responsive-design\` (\`knowledge/color-typography.md\`, \`knowledge/layout-components-responsive.md\`)
3. **Interactive & Spatial Craft (load when relevant):** \`component-design\`, \`navigation-architecture\`, \`interaction-design\`, \`motion-design\`, \`scroll-engineering\`, \`3d-design\` (\`knowledge/interaction-motion-3d.md\`, \`knowledge/technology-choices.md\`)
4. **Engineering & Quality Gate:** \`accessibility\`, \`performance\`, \`ux-design\`, \`design-quality\`, \`self-improvement\` (\`knowledge/ux-accessibility.md\`, \`knowledge/performance.md\`, \`knowledge/resources-qa.md\`, \`knowledge/improvement-loop.md\`)

**Conflict resolution:** Distinctive art direction, expressive web typography, atmospheric color tokens, varied section rhythm, and domain-authentic copy lead the visual experience. Accessibility (WCAG 2.2 AA, keyboard/touch parity, \`prefers-reduced-motion\`), semantics, performance, and silent-by-default audio are engineering guardrails—never an excuse for generic system-font wireframes or repetitive 3-card templates.

## Skills
${names.map((name) => `- [${name}](../${skillPath(name)})`).join("\n")}

## Knowledge
${knowledge.map((name) => `- [${name}](knowledge/${name})`).join("\n")}
`;
}
const agentsContent = "# AETHER\n\nFor website design or UI work, start with `.agents/skills/aether-design-thinking/SKILL.md` and consult `aether/INDEX.md`. Pair distinctive art direction (`visual-design`, `typography`, `color-intelligence`, `layout-intelligence`) with accessible, responsive, silent-by-default engineering, and implement directly in production code.\n";

/** Install packaged resources and detected (or explicitly selected) native adapters. */
export async function init(root: string, source: string, ids?: string[]): Promise<string[]> {
  const tree = new SafeTree(root);
  await tree.checkRoot();
  const resources = await loadResources(source);
  if (ids && ids.some((id) => !adapters.some((adapter) => adapter.id === id))) throw new Error(`Unknown adapter: ${ids.find((id) => !adapters.some((adapter) => adapter.id === id))}`);
  const { manifest: old, raw } = await readManifest(tree);
  const selected = ids ? adapters.filter((adapter) => ids.includes(adapter.id)) : [];
  if (!ids) for (const adapter of adapters) if (await adapter.detect(root)) selected.push(adapter);
  const active = [...new Set([...(old?.adapters || []), ...selected.map((adapter) => adapter.id)])];
  // Skills link to these shared copies; refuse conflicting unowned resources instead
  // of installing broken references or silently claiming somebody else's files.
  for (const path of ["aether/INDEX.md", skillPath("design-thinking"), ...resources.knowledge.map((file) => knowledgePath(file.name))]) {
    if (!old?.files[path] && await tree.read(path)) throw new Error(`Unowned AETHER resource already exists: ${path}`);
  }
  const desired = new Map<string, string>();
  for (const file of resources.knowledge) desired.set(knowledgePath(file.name), file.content);
  for (const skill of resources.skills) desired.set(skillPath(skill.name), skill.content);
  for (const id of active) {
    const adapter = adapters.find((item) => item.id === id)!;
    for (const file of adapter.files()) {
      relativePath(file.path);
      if (!allowed(file.path)) throw new Error(`Unsafe adapter path: ${file.path}`);
      desired.set(file.path, file.content);
    }
  }
  if (!(await tree.read("AGENTS.md"))) desired.set("AGENTS.md", agentsContent);
  // Do not advertise an unowned, conflicting skill or knowledge file in the index.
  const visibleSkills: string[] = [];
  const visibleKnowledge: string[] = [];
  for (const skill of resources.skills) if (!(await tree.read(skillPath(skill.name))) || old?.files[skillPath(skill.name)]) visibleSkills.push(skill.name);
  for (const file of resources.knowledge) if (!(await tree.read(knowledgePath(file.name))) || old?.files[knowledgePath(file.name)]) visibleKnowledge.push(file.name);
  desired.set("aether/INDEX.md", indexContent(visibleSkills, visibleKnowledge));

  const next = clone(old || empty());
  next.adapters = active;
  const changes: Array<{ path: string; content: string; previous?: Buffer }> = [];
  for (const [path, content] of desired) {
    if (!allowed(path)) throw new Error(`Unsafe install path: ${path}`);
    const previous = await tree.read(path);
    const owned = old?.files[path];
    if (previous && (!owned || hash(previous) !== owned.hash)) continue;
    if (previous?.toString("utf8") === content) continue;
    changes.push({ path, content, previous });
    next.files[path] = { hash: hash(content), version: hash(content) };
  }
  next.adapters = active.filter((id) => adapters.find((adapter) => adapter.id === id)!.files().some((file) => !!next.files[file.path]));
  if (!changes.length && JSON.stringify(next) === JSON.stringify(old)) return [];
  const revision = old && changes.length ? randomUUID() : undefined;
  if (revision) next.history.push(revision);
  // Backups are written before replacing anything, including the manifest.
  if (revision) {
    for (const change of changes) if (change.previous) {
      await tree.write(`aether/history/${revision}/files/${change.path}`, change.previous);
    }
    const entry: Revision = { before: old!, after: next, changed: changes.map((change) => change.path) };
    await tree.write(`aether/history/${revision}/entry.json`, JSON.stringify(entry, null, 2) + "\n");
  }
  const applied: typeof changes = [];
  try {
    for (const change of changes) {
      await tree.write(change.path, change.content, change.previous ? hash(change.previous) : undefined);
      applied.push(change);
    }
    await saveManifest(tree, next, raw);
  } catch (error) {
    for (const change of applied.reverse()) {
      try {
        if (change.previous) await tree.write(change.path, change.previous, hash(change.content));
        else await tree.remove(change.path, hash(change.content));
      } catch { /* Preserve user changes that raced with the install. */ }
    }
    throw error;
  }
  return changes.map((change) => change.path);
}

/** Refresh packaged files without adding newly detected adapters. */
export async function update(root: string, source: string): Promise<string[]> {
  const tree = new SafeTree(root);
  if (!(await readManifest(tree)).manifest) throw new Error("AETHER is not installed");
  return init(root, source, []);
}

/** Remove only files still matching their installed hashes. */
export async function uninstall(root: string): Promise<string[]> {
  const tree = new SafeTree(root);
  const { manifest, raw } = await readManifest(tree);
  if (!manifest) return [];
  const next = clone(manifest);
  const removed: string[] = [];
  for (const [path, owned] of Object.entries(manifest.files)) {
    let current: Buffer | undefined;
    try { current = await tree.read(path); }
    catch { continue; } // A symlink or unsafe parent is never followed or removed.
    if (current && hash(current) !== owned.hash) continue;
    if (current) { await tree.remove(path, owned.hash); removed.push(path); }
    delete next.files[path];
  }
  if (Object.keys(next.files).length) {
    next.adapters = next.adapters.filter((id) => adapters.find((adapter) => adapter.id === id)!.files().some((file) => !!next.files[file.path]));
    await saveManifest(tree, next, raw);
  } else {
    await tree.remove(manifestPath, hash(raw!));
    removed.push(manifestPath);
  }
  return removed;
}

/** Report missing, modified and unsafe managed files without changing them. */
export async function doctor(root: string): Promise<string[]> {
  const tree = new SafeTree(root);
  const { manifest } = await readManifest(tree);
  if (!manifest) return ["AETHER is not installed (aether/manifest.json is missing)"];
  const issues: string[] = [];
  for (const [path, owned] of Object.entries(manifest.files)) {
    try {
      const content = await tree.read(path);
      if (!content) issues.push(`Missing: ${path}`);
      else if (hash(content) !== owned.hash) issues.push(`Modified: ${path}`);
    } catch (error) { issues.push(`Unsafe: ${path}: ${(error as Error).message}`); }
  }
  if (!manifest.files[skillPath("design-thinking")]) issues.push("Missing entry skill: design-thinking");
  return issues;
}

export async function listSkills(source: string): Promise<Array<{ name: string; description: string }>> {
  return (await loadResources(source)).skills.map(({ name, description }) => ({ name, description }));
}

/** Store a local lesson, without changing packaged knowledge or installed skill files. */
export async function learn(root: string, source: string, input: { module: string; text: string; source?: string; license?: string }): Promise<string> {
  const { knowledge, skills } = await loadResources(source);
  const module = input.module;
  if (!slug.test(module) || ![...knowledge.map((item) => item.name.replace(/\.md$/, "")), ...skills.map((item) => item.name)].includes(module)) throw new Error("Unknown learning module");
  const text = typeof input.text === "string" ? input.text.trim() : "";
  if (!text || text.length > 100_000 || /https?:\/\/|www\.|<\s*\/?\s*[a-z][^>]*>|javascript:/i.test(text)) throw new Error("Learning text is empty or contains external URLs or HTML");
  if (input.source !== undefined && (typeof input.source !== "string" || !input.source.trim() || /[<>\r\n]/.test(input.source))) throw new Error("Invalid learning source");
  if (input.license !== undefined && (typeof input.license !== "string" || !input.license.trim() || /[<>\r\n]/.test(input.license))) throw new Error("Invalid learning license");
  if (input.source && !input.license) throw new Error("External references require a license");
  if (input.license && !input.source) throw new Error("A license requires a source");
  const tree = new SafeTree(root);
  if (!(await readManifest(tree)).manifest) throw new Error("AETHER is not installed");
  return collect(root, { ...input, text });
}

/** Pick the entry skill and the most relevant installed-package skills for a brief and optional project root. */
export async function selectSkills(source: string, brief: string, root?: string): Promise<string[]> {
  const skills = (await loadResources(source)).skills;
  const available = new Set(skills.map((skill) => skill.name));
  const terms = (brief.toLowerCase().match(/[a-z0-9]+/g) || []).filter((word) => word.length > 2);
  const words = new Set(terms);
  const signals: Record<string, RegExp> = {
    "3d-design": /\b(3d|webgl|webgpu|three|spatial|immersive|gltf|glb|shader|spline|canvas|model)\b/i,
    "motion-design": /\b(motion|animated?|animation|scroll|interactive|transition|cinematic|reveal|parallax|choreograph|microinteraction)\b/i,
    "scroll-engineering": /\b(scroll|parallax|pinned|pinning|reveal|scrolltrigger|intersectionobserver|storytelling|scrub)\b/i,
    "interaction-design": /\b(button|hover|form|tabs|accordion|modal|drawer|carousel|interaction|interactive|state|control|filter|toggle)\b/i,
    "navigation-architecture": /\b(navigation|navbar|menu|header|mega.menu|sticky|route|routing|anchor|sidebar|topbar|footer)\b/i,
    "design-quality": /\b(qa|quality|audit|test|review|critique|production|launch|evaluate|polish)\b/i,
    "component-design": /\b(dashboard|admin|form|pricing|checkout|commerce|ecommerce|store|storefront|saas|component|table|card|workbench|app)\b/i,
    "layout-intelligence": /\b(editorial|magazine|portfolio|architecture|architectural|agency|studio|layout|grid|hero|section|landing|website|site|page|homepage|flagship|composition|asymmetric)\b/i,
    "typography": /\b(editorial|magazine|luxury|fashion|typography|type|font|serif|architecture|architectural|agency|studio|brand|portfolio|publication|story|hero|landing|website|site)\b/i,
    "ux-design": /\b(dashboard|admin|onboarding|checkout|workflow|education|booking|conversion|journey|usability|saas|form|search)\b/i,
    "color-intelligence": /\b(brand|palette|color|colour|identity|theme|dark|light|atmosphere|luxury|fashion|studio|editorial|storefront|commerce|landing|website|site)\b/i,
    "responsive-design": /\b(mobile|responsive|tablet|breakpoint|touch|device|adaptive|viewport|zoom|reflow|screen)\b/i,
    "performance": /\b(performance|loading|speed|bundle|webgl|vitals|lcp|cls|inp|fast|optimize)\b/i,
    "accessibility": /\b(accessible|accessibility|a11y|keyboard|screen.reader|wcag|contrast|focus|inclusive)\b/i,
    "self-improvement": /\b(improve|iteration|retrospective|lesson|experiment|hypothesis|feedback)\b/i,
  };
  const categoryBoosts: Array<{ pattern: RegExp; boosts: Record<string, number> }> = [
    {
      pattern: /\b(architecture|architectural|interior|luxury|fashion|editorial|magazine|publication|portfolio|agency|studio|gallery|cultural|hotel|restaurant|roaster|artisan|brand)\b/i,
      boosts: { "typography": 7, "layout-intelligence": 7, "color-intelligence": 6, "responsive-design": 4, "motion-design": 3 },
    },
    {
      pattern: /\b(saas|dashboard|admin|workbench|analytics|platform|b2b|enterprise|tool|app|application|software)\b/i,
      boosts: { "component-design": 7, "ux-design": 6, "layout-intelligence": 5, "typography": 4, "color-intelligence": 4, "interaction-design": 4 },
    },
    {
      pattern: /\b(ecommerce|commerce|store|storefront|shop|product|checkout|catalog|retail|flagship)\b/i,
      boosts: { "component-design": 6, "ux-design": 6, "layout-intelligence": 5, "color-intelligence": 5, "typography": 4, "responsive-design": 5, "navigation-architecture": 4 },
    },
    {
      pattern: /\b(landing|website|site|homepage|web\s+page|redesign|launch)\b/i,
      boosts: { "layout-intelligence": 6, "typography": 6, "color-intelligence": 5, "responsive-design": 4, "component-design": 3 },
    },
  ];
  const stackBoosts: Record<string, number> = {};
  if (root) {
    try {
      const tree = new SafeTree(root);
      const pkgRaw = await tree.read("package.json");
      if (pkgRaw) {
        const pkg = JSON.parse(pkgRaw.toString("utf8")) as { dependencies?: Record<string, string>; devDependencies?: Record<string, string> };
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };
        if ("three" in deps || "@react-three/fiber" in deps || "@splinetool/react-spline" in deps) {
          stackBoosts["3d-design"] = (stackBoosts["3d-design"] || 0) + 4;
          stackBoosts["performance"] = (stackBoosts["performance"] || 0) + 3;
        }
        if ("gsap" in deps || "motion" in deps || "framer-motion" in deps || "lenis" in deps) {
          stackBoosts["motion-design"] = (stackBoosts["motion-design"] || 0) + 3;
          stackBoosts["scroll-engineering"] = (stackBoosts["scroll-engineering"] || 0) + 2;
        }
      }
    } catch { /* Ignore unreadable or absent project metadata during selection. */ }
  }
  const scores = skills.filter((skill) => !["design-thinking", "visual-design", "anti-generic-design"].includes(skill.name)).map((skill) => {
    const title = skill.name.replace(/-/g, " ");
    const tokens = new Set((`${title} ${skill.description}`.toLowerCase().match(/[a-z0-9]+/g) || []).filter((word) => word.length > 2));
    let score = (signals[skill.name]?.test(brief) ? 9 : 0) + (stackBoosts[skill.name] || 0);
    for (const group of categoryBoosts) {
      if (group.pattern.test(brief) && group.boosts[skill.name]) score += group.boosts[skill.name];
    }
    score += [...words].reduce((sum, word) => sum + (tokens.has(word) ? (title.includes(word) ? 3 : 1) : 0), 0);
    return { name: skill.name, score };
  }).filter((item) => item.score > 0).sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

  const chosen = scores.slice(0, 5).map((item) => item.name);
  const ensure = (name: string, replaceIndex = chosen.length - 1) => {
    if (!available.has(name) || chosen.includes(name)) return;
    if (chosen.length < 5) chosen.push(name);
    else if (replaceIndex >= 0 && replaceIndex < chosen.length) chosen.splice(replaceIndex, 1, name);
  };
  // Enforce skill dependencies so coupled capabilities are never loaded in isolation.
  if (signals["scroll-engineering"].test(brief)) {
    ensure("scroll-engineering", 4);
    ensure("motion-design", 3);
  }
  if (chosen.includes("3d-design")) ensure("performance", 4);
  if (chosen.includes("navigation-architecture") && signals["responsive-design"].test(brief)) ensure("responsive-design", 4);
  // If a brief is very short or generic with no matches, provide the visual craft foundation.
  if (chosen.length === 0) {
    for (const fallback of ["typography", "layout-intelligence", "color-intelligence", "responsive-design"]) ensure(fallback);
  }
  return ["design-thinking", "visual-design", "anti-generic-design", ...new Set(chosen)];
}

/** Restore the last update if every touched file still matches that update. */
export async function rollback(root: string): Promise<string[]> {
  const tree = new SafeTree(root);
  const { manifest, raw } = await readManifest(tree);
  const id = manifest?.history[manifest.history.length - 1];
  if (!id || !manifest || !raw) throw new Error("No update to roll back");
  const data = await tree.read(`aether/history/${id}/entry.json`);
  if (!data) throw new Error("Missing update history");
  const entry = JSON.parse(data.toString("utf8")) as Revision;
  parseManifest(Buffer.from(encode(entry.before)));
  parseManifest(Buffer.from(encode(entry.after)));
  if (encode(entry.after) !== encode(manifest) || !Array.isArray(entry.changed) || !entry.changed.every((path) => allowed(path) && relativePath(path))) throw new Error("Update history does not match the installed manifest");
  const backups = new Map<string, Buffer | undefined>();
  for (const path of entry.changed) {
    const current = await tree.read(path);
    if (!current || hash(current) !== entry.after.files[path]?.hash) throw new Error(`Modified since update: ${path}`);
    const previous = entry.before.files[path];
    const backup = previous ? await tree.read(`aether/history/${id}/files/${path}`) : undefined;
    if (previous && (!backup || hash(backup) !== previous.hash)) throw new Error(`Missing or invalid backup: ${path}`);
    backups.set(path, backup);
  }
  const restored: string[] = [];
  for (const path of entry.changed.slice().reverse()) {
    const backup = backups.get(path);
    if (backup) await tree.write(path, backup, entry.after.files[path].hash);
    else await tree.remove(path, entry.after.files[path].hash);
    restored.push(path);
  }
  await saveManifest(tree, entry.before, raw);
  return restored;
}
