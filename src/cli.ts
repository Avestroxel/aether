#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { adapters } from "./adapters/index.js";
import { contributions, doctor, init, learn, listSkills, reviewContribution, rollback, rollbackContribution, selectSkills, uninstall, update } from "./core/index.js";
import { discover } from "./resources/discovery.js";

const source = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const commands = new Set(["init", "update", "doctor", "skills", "learn", "lessons", "review", "undo-review", "uninstall", "rollback", "resources"]);

function options(args: string[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    if (!args[i].startsWith("--")) throw new Error(`Unexpected argument: ${args[i]}`);
    const key = args[i].slice(2);
    if (!["cwd", "ide", "brief", "module", "text", "file", "source", "license", "capability", "id", "status", "evidence"].includes(key) || !args[i + 1] || args[i + 1].startsWith("--") || key in result) throw new Error(`Invalid option: ${args[i]}`);
    result[key] = args[++i];
  }
  return result;
}

async function run(): Promise<void> {
  const [command = "help", ...args] = process.argv.slice(2);
  if (command === "help" || command === "--help" || command === "-h") {
    console.log("AETHER — Think Beyond Templates\n\nUsage: aether-design <init|update|doctor|skills|resources|learn|lessons|review|undo-review|rollback|uninstall> [--cwd PATH]\n  init [--ide antigravity,cursor,copilot,claude,windsurf]  Detect IDEs, install guidance\n  update                                              Update unchanged managed files\n  doctor                                              Check installed files\n  skills [--brief DESCRIPTION]                       List or select contextual skills\n  resources --capability motion|3d|components|inspiration  Evaluate candidates\n  learn --module NAME (--text TEXT | --file PATH)    Collect an unverified lesson\n  review --module NAME --id UUID --status approved|rejected [--evidence TEXT]  Review a lesson\n  undo-review --module NAME --id UUID               Restore prior lesson state\n  lessons --brief TEXT                               List approved contextual lessons\n  rollback                                            Restore previous update\n  uninstall                                           Remove unchanged managed files");
    return;
  }
  if (!commands.has(command)) throw new Error(`Unknown command: ${command}`);
  const flags = options(args);
  const root = resolve(flags.cwd || process.cwd());
  let paths: string[] = [];
  switch (command) {
    case "init": {
      const ids = flags.ide ? flags.ide.split(",").map((id) => id.trim()) : undefined;
      paths = await init(root, source, ids);
      const selected = ids || (await Promise.all(adapters.map(async (adapter) => await adapter.detect(root) ? adapter.id : null))).filter((id): id is string => id !== null);
      console.log(`IDE adapters: ${selected.length ? selected.join(", ") : "none detected (AGENTS.md fallback)"}`);
      console.log("Start: ask your coding agent to design a website; see aether/INDEX.md for contextual skills.");
      break;
    }
    case "update": paths = await update(root, source); break;
    case "uninstall": paths = await uninstall(root); break;
    case "rollback": paths = await rollback(root); break;
    case "doctor": {
      const issues = await doctor(root);
      if (issues.length) { for (const issue of issues) console.log(issue); process.exitCode = 1; }
      else console.log("AETHER managed files are intact.");
      return;
    }
    case "skills": {
      if (flags.brief) {
        for (const name of await selectSkills(source, flags.brief)) console.log(`${name}: .agents/skills/aether-${name}/SKILL.md`);
      } else for (const skill of await listSkills(source)) console.log(`${skill.name}: ${skill.description}`);
      return;
    }
    case "resources": {
      const found = await discover(root, flags.capability || "components");
      console.log(`Detected package manager: ${found.manager}. Candidate leads only; check license, maintenance, security, cost and compatibility before installing.`);
      for (const item of found.candidates) console.log(`${item.name} [${item.installed ? "declared" : item.compatible ? "candidate" : "requires React"}] ${item.url}\n  ${item.note}`);
      return;
    }
    case "learn": {
      if (!flags.module || Boolean(flags.text) === Boolean(flags.file)) throw new Error("Use --module NAME and exactly one of --text or --file");
      const text = flags.file ? await readFile(resolve(root, flags.file), "utf8") : flags.text;
      console.log(`Saved pending local contribution: ${await learn(root, source, { module: flags.module, text, source: flags.source, license: flags.license })}`);
      return;
    }
    case "review": {
      if (!flags.module || !flags.id || !flags.status || !["approved", "rejected"].includes(flags.status)) throw new Error("Use --module NAME --id UUID --status approved|rejected");
      const record = await reviewContribution(root, flags.module, flags.id, flags.status as "approved" | "rejected", flags.evidence ? [flags.evidence] : []);
      console.log(`${record.status}: ${record.module}/${record.id} v${record.version}`);
      return;
    }
    case "undo-review": {
      if (!flags.module || !flags.id) throw new Error("Use --module NAME --id UUID");
      const record = await rollbackContribution(root, flags.module, flags.id);
      console.log(`Restored: ${record.module}/${record.id} v${record.version} (${record.status})`);
      return;
    }
    case "lessons": {
      if (!flags.brief) throw new Error("Use --brief DESCRIPTION");
      const selected = await selectSkills(source, flags.brief);
      for (const item of await contributions(root, selected)) console.log(`${item.module}/${item.id} v${item.version} [${item.scope}] source: ${item.provenance.source || item.provenance.project}\n  ${item.text}`);
      return;
    }
  }
  console.log(paths.length ? paths.map((path) => `${command}: ${path}`).join("\n") : `No files changed by ${command}. Existing or modified files were preserved.`);
}

run().catch((error: unknown) => { console.error(`AETHER: ${error instanceof Error ? error.message : String(error)}`); process.exitCode = 1; });
