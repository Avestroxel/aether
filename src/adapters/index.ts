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

For design, UI/UX, frontend, layout, styling, or visual implementation tasks:
1. From the project root, read \`${skillPath}\` first and follow its design-thinking workflow.
2. Read \`${indexPath}\` to find the relevant AETHER guidance and assets.
3. Use that guidance while planning and implementing the task; do not skip the entry workflow.
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
