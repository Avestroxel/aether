import { stat } from "node:fs/promises";
import { join } from "node:path";

export interface Adapter {
  id: string;
  detect(root: string): Promise<boolean>;
  files(): Array<{ path: string; content: string }>;
}

// These are project-root-relative paths. The installer owns all filesystem writes.
const skillPath = ".agents/skills/aether-design-thinking/SKILL.md";
const indexPath = "aether/INDEX.md";

const entryWorkflow = `# AETHER design entry workflow

For website, UI/UX, frontend, layout, styling, or visual implementation tasks:
1. Read \`${skillPath}\` first. Act as a Creative Director and Principal UI Engineer: silently compare at least two distinct structural and aesthetic concepts tailored to the domain, choose a bold visual thesis, and implement directly in production-quality code (do not output a prose brief unless asked for strategy/critique only).
2. Read \`${indexPath}\` to load only the skills relevant to the task: pair concept direction with the Core Visual Craft skills (\`visual-design\`, \`typography\`, \`color-intelligence\`, \`layout-intelligence\`) plus any needed specialist skills (\`component-design\`, \`navigation-architecture\`, \`interaction-design\`, \`motion-design\`, \`scroll-engineering\`, \`responsive-design\`, \`3d-design\`, \`accessibility\`, \`performance\`, \`design-quality\`).
3. Creative priority and conflict resolution: distinctive art direction, expressive web typography, atmospheric color tokens, varied section rhythm, and domain-authentic content drive the design. Accessibility (WCAG 2.2 AA, keyboard/touch parity, \`prefers-reduced-motion\`), semantics, performance, and silent-by-default audio are mandatory engineering guardrails that shape how the interface is built—never an excuse for generic system-font wireframes, repetitive 3-card templates, or visual emptiness.
`;

async function hasMarker(root: string, marker: string): Promise<boolean> {
  try {
    await stat(join(root, marker));
    return true;
  } catch (error) {
    if ((error as { code?: string }).code === "ENOENT") return false;
    throw error;
  }
}

async function hasAnyMarker(root: string, markers: string[]): Promise<boolean> {
  for (const marker of markers) {
    if (await hasMarker(root, marker)) return true;
  }
  return false;
}

export const adapters: Adapter[] = [
  {
    id: "antigravity",
    detect: (root) => hasAnyMarker(root, [".agents/rules", ".agent/rules", "GEMINI.md"]),
    files: () => [{
      path: ".agents/rules/aether-design-thinking.md",
      content: `---\ntrigger: model_decision\ndescription: "Use AETHER for design, UI/UX, frontend, layout, styling, and visual implementation tasks."\n---\n\n${entryWorkflow}`,
    }],
  },
  {
    id: "cursor",
    detect: (root) => hasAnyMarker(root, [".cursor", ".cursorrules"]),
    files: () => [{
      path: ".cursor/rules/aether-design-thinking.mdc",
      content: `---\ndescription: "Use AETHER for design, UI/UX, frontend, layout, styling, and visual implementation tasks."\nalwaysApply: false\n---\n\n${entryWorkflow}`,
    }],
  },
  {
    id: "copilot",
    detect: (root) => hasAnyMarker(root, [".vscode", ".github/copilot-instructions.md", ".github/instructions"]),
    files: () => [{
      path: ".github/copilot-instructions.md",
      content: entryWorkflow,
    }],
  },
  {
    id: "claude",
    detect: (root) => hasAnyMarker(root, [".claude", "CLAUDE.md"]),
    files: () => [{
      path: "CLAUDE.md",
      content: entryWorkflow,
    }],
  },
  {
    id: "windsurf",
    detect: (root) => hasAnyMarker(root, [".windsurf", ".windsurfrules"]),
    files: () => [{
      path: ".windsurf/rules/aether-design-thinking.md",
      content: `---\ntrigger: model_decision\ndescription: "Use AETHER for design, UI/UX, frontend, layout, styling, and visual implementation tasks."\n---\n\n${entryWorkflow}`,
    }],
  },
];
