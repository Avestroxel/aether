import { lstat, readdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";

export interface SkillResource {
  name: string;
  description: string;
  content: string;
}

export interface PackageResources {
  skills: SkillResource[];
  knowledge: Array<{ name: string; content: string }>;
}

const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

async function safeRead(base: string, ...parts: string[]): Promise<string> {
  let path = resolve(base);
  if (!(await lstat(path)).isDirectory()) throw new Error(`Not a directory: ${path}`);
  for (const part of parts) {
    if (part === "." || part === ".." || part.includes("/") || part.includes("\\")) throw new Error("Invalid resource path");
    path = join(path, part);
    const info = await lstat(path);
    if (info.isSymbolicLink()) throw new Error(`Symlink in package: ${path}`);
  }
  if (!(await lstat(path)).isFile()) throw new Error(`Not a file: ${path}`);
  return readFile(path, "utf8");
}

export async function loadResources(source: string): Promise<PackageResources> {
  const base = resolve(source);
  const skillsDir = join(base, "skills");
  const knowledgeDir = join(base, "knowledge");
  for (const path of [base, skillsDir, knowledgeDir]) {
    const info = await lstat(path);
    if (!info.isDirectory()) throw new Error(`Invalid package directory: ${path}`);
  }
  const knowledge: PackageResources["knowledge"] = [];
  for (const name of (await readdir(knowledgeDir)).sort()) {
    if (!/^(?:README|[a-z0-9]+(?:-[a-z0-9]+)*)\.md$/.test(name)) throw new Error(`Invalid knowledge entry: ${name}`);
    knowledge.push({ name, content: await safeRead(base, "knowledge", name) });
  }
  const names = new Set(knowledge.map((item) => item.name));
  const skills: SkillResource[] = [];
  for (const name of (await readdir(skillsDir)).sort()) {
    if (!slug.test(name)) throw new Error(`Invalid skill name: ${name}`);
    const dir = join(skillsDir, name);
    if (!(await lstat(dir)).isDirectory()) throw new Error(`Invalid skill directory: ${dir}`);
    const content = await safeRead(base, "skills", name, "SKILL.md");
    const header = /^---\r?\nname: ([^\r\n]+)\r?\ndescription: ([^\r\n]+)\r?\n---(?:\r?\n|$)/.exec(content);
    if (!header || header[1] !== name) throw new Error(`Invalid skill metadata: ${name}`);
    const rewritten = content.replace(/^name: [^\r\n]+/m, `name: aether-${name}`).replace(/\]\(\.\.\/\.\.\/knowledge\/([^\s)#?]+\.md)\)/g, (_match, file: string) => {
      if (!names.has(file)) throw new Error(`Missing knowledge reference: ${file}`);
      return `](../../../aether/knowledge/${file})`;
    });
    skills.push({ name, description: header[2].trim(), content: rewritten });
  }
  if (!skills.some((skill) => skill.name === "design-thinking")) throw new Error("Missing design-thinking entry skill");
  return { skills, knowledge };
}
