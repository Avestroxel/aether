import { randomUUID } from "node:crypto";
import { SafeTree, hash } from "./files.js";

export type ContributionStatus = "pending" | "approved" | "rejected";
export interface Contribution {
  schema: 1;
  id: string;
  module: string;
  text: string;
  provenance: { project: string; source?: string; license?: string };
  evidence: string[];
  scope: "project" | "general";
  status: ContributionStatus;
  version: number;
  previous: string | null;
  createdAt: string;
  reviewedAt?: string;
}
const uuid = /^[a-f0-9-]{36}$/i;
const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const folder = (module: string, id: string) => `aether/contributions/${module}/${id}`;
const revision = (module: string, id: string, version: number) => `${folder(module, id)}/v${version}.json`;

function check(input: Contribution): void {
  if (input.schema !== 1 || !uuid.test(input.id) || !slug.test(input.module) ||
    !Number.isSafeInteger(input.version) || input.version < 1 ||
    !["pending", "approved", "rejected"].includes(input.status) ||
    !["project", "general"].includes(input.scope) ||
    typeof input.text !== "string" || !input.text.trim() || input.text.length > 100_000 ||
    /https?:\/\/|www\.|<\s*\/?\s*[a-z][^>]*>|javascript:/i.test(input.text) ||
    !input.provenance || typeof input.provenance.project !== "string" || !input.provenance.project ||
    (input.provenance.source !== undefined && (typeof input.provenance.source !== "string" || !input.provenance.source.trim() || /[<>\r\n]/.test(input.provenance.source))) ||
    (input.provenance.license !== undefined && (typeof input.provenance.license !== "string" || !input.provenance.license.trim() || /[<>\r\n]/.test(input.provenance.license))) ||
    Boolean(input.provenance.source) !== Boolean(input.provenance.license) ||
    !Array.isArray(input.evidence) || input.evidence.length > 20 || input.evidence.some((e) => typeof e !== "string" || !e.trim() || e.length > 2000 || /[<>\r\n]/.test(e)) ||
    typeof input.createdAt !== "string" ||
    (input.status === "approved" && !input.evidence.length)) throw new Error("Invalid contribution record");
}

async function readRevision(tree: SafeTree, module: string, id: string, version: number): Promise<Contribution> {
  const data = await tree.read(revision(module, id, version));
  if (!data) throw new Error("Missing contribution revision");
  let record: Contribution;
  try { record = JSON.parse(data.toString("utf8")) as Contribution; }
  catch { throw new Error("Invalid contribution JSON"); }
  check(record);
  if (record.module !== module || record.id !== id || record.version !== version) throw new Error("Contribution identity mismatch");
  if (version > 1) {
    const previous = await tree.read(revision(module, id, version - 1));
    if (!previous || record.previous !== hash(previous)) throw new Error("Contribution revision chain is broken");
  } else if (record.previous !== null) throw new Error("Invalid initial contribution revision");
  return record;
}

async function current(tree: SafeTree, module: string, id: string): Promise<{ record: Contribution; pointer: Buffer }> {
  if (!slug.test(module) || !uuid.test(id)) throw new Error("Invalid contribution identity");
  const pointer = await tree.read(`${folder(module, id)}/current.json`);
  if (!pointer) throw new Error("Unknown contribution");
  let version: number;
  try { version = (JSON.parse(pointer.toString("utf8")) as { version: number }).version; }
  catch { throw new Error("Invalid contribution pointer"); }
  if (!Number.isSafeInteger(version) || version < 1) throw new Error("Invalid contribution pointer");
  return { record: await readRevision(tree, module, id, version), pointer };
}

export async function collect(root: string, input: { module: string; text: string; source?: string; license?: string; evidence?: string[]; scope?: "project" | "general" }): Promise<string> {
  const tree = new SafeTree(root);
  const id = randomUUID();
  const record: Contribution = {
    schema: 1, id, module: input.module, text: input.text.trim(),
    provenance: { project: tree.root, ...(input.source ? { source: input.source, license: input.license } : {}) },
    evidence: input.evidence || [], scope: input.scope || "project", status: "pending",
    version: 1, previous: null, createdAt: new Date().toISOString(),
  };
  check(record);
  const existing = await contributions(root, [record.module], true);
  if (existing.some((item) => item.text.trim().toLowerCase() === record.text.toLowerCase())) throw new Error("Duplicate contribution in module");
  const path = revision(record.module, id, 1);
  await tree.write(path, JSON.stringify(record, null, 2) + "\n");
  await tree.write(`${folder(record.module, id)}/current.json`, JSON.stringify({ version: 1 }) + "\n");
  return path;
}

/** Review is explicit; evidence describes checks actually performed, not inferred success. */
export async function reviewContribution(root: string, module: string, id: string, status: "approved" | "rejected", evidence: string[] = []): Promise<Contribution> {
  const tree = new SafeTree(root);
  const { record, pointer } = await current(tree, module, id);
  if (status !== "approved" && status !== "rejected") throw new Error("Invalid review status");
  const next: Contribution = { ...record, evidence: [...new Set([...record.evidence, ...evidence])], status, version: record.version + 1,
    previous: hash(JSON.stringify(record, null, 2) + "\n"), reviewedAt: new Date().toISOString() };
  check(next);
  await tree.write(revision(module, id, next.version), JSON.stringify(next, null, 2) + "\n");
  await tree.write(`${folder(module, id)}/current.json`, JSON.stringify({ version: next.version }) + "\n", hash(pointer));
  return next;
}

/** Restore a prior version by appending a new revision; never delete audit history. */
export async function rollbackContribution(root: string, module: string, id: string): Promise<Contribution> {
  const tree = new SafeTree(root);
  const { record, pointer } = await current(tree, module, id);
  if (record.version < 2) throw new Error("No contribution review to roll back");
  const before = await readRevision(tree, module, id, record.version - 1);
  const next: Contribution = { ...before, version: record.version + 1, previous: hash(JSON.stringify(record, null, 2) + "\n"), reviewedAt: new Date().toISOString() };
  check(next);
  await tree.write(revision(module, id, next.version), JSON.stringify(next, null, 2) + "\n");
  await tree.write(`${folder(module, id)}/current.json`, JSON.stringify({ version: next.version }) + "\n", hash(pointer));
  return next;
}

/** Only explicitly approved, evidenced lessons for the requested modules are returned. */
export async function contributions(root: string, modules: string[], includePending = false): Promise<Contribution[]> {
  const tree = new SafeTree(root);
  const results: Contribution[] = [];
  for (const module of new Set(modules)) {
    if (!slug.test(module)) throw new Error("Invalid contribution module");
    for (const id of await tree.list(`aether/contributions/${module}`)) {
      if (!uuid.test(id)) continue; // Legacy .md suggestions stay untouched and untrusted.
      const { record } = await current(tree, module, id);
      if (includePending || record.status === "approved") results.push(record);
    }
  }
  return results.sort((a, b) => a.module.localeCompare(b.module) || a.id.localeCompare(b.id));
}
