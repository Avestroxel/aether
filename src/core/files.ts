import { createHash, randomUUID } from "node:crypto";
import { lstat, mkdir, open, readFile, rename, link, unlink, readdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

export function hash(content: string | Buffer): string {
  return createHash("sha256").update(content).digest("hex");
}

export function relativePath(path: string): string {
  if (!path || path.startsWith("/") || path.includes("\\") || path.split("/").some((part) => !part || part === "." || part === ".." || part.includes(":"))) {
    throw new Error(`Unsafe relative path: ${path}`);
  }
  return path;
}

export class SafeTree {
  readonly root: string;
  constructor(root: string) { this.root = resolve(root); }

  async checkRoot(): Promise<void> {
    const info = await lstat(this.root);
    if (!info.isDirectory()) throw new Error(`Not a real directory: ${this.root}`);
  }

  private async location(path: string, create: boolean): Promise<string> {
    relativePath(path);
    await this.checkRoot();
    const parts = path.split("/");
    let current = this.root;
    for (const part of parts.slice(0, -1)) {
      current = join(current, part);
      try {
        const info = await lstat(current);
        if (!info.isDirectory()) throw new Error(`Not a real directory: ${current}`);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT" || !create) throw error;
        try { await mkdir(current); } catch (race) {
          if ((race as NodeJS.ErrnoException).code !== "EEXIST") throw race;
        }
        if (!(await lstat(current)).isDirectory()) throw new Error(`Not a real directory: ${current}`);
      }
    }
    return join(current, parts[parts.length - 1]);
  }

  async list(path: string): Promise<string[]> {
    try {
      const location = await this.location(`${path}/.aether-list`, false);
      if (!(await lstat(dirname(location))).isDirectory()) throw new Error(`Not a real directory: ${path}`);
      return await readdir(dirname(location));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
      throw error;
    }
  }

  async read(path: string): Promise<Buffer | undefined> {
    let location: string;
    try { location = await this.location(path, false); }
    catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined; throw error; }
    try {
      const info = await lstat(location);
      if (!info.isFile()) throw new Error(`Not a regular file: ${path}`);
      return await readFile(location);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
      throw error;
    }
  }

  async write(path: string, content: string | Buffer, expected?: string): Promise<void> {
    const location = await this.location(path, true);
    const before = await this.read(path);
    if (expected === undefined ? before !== undefined : before === undefined || hash(before) !== expected) {
      throw new Error(`File changed or already exists: ${path}`);
    }
    const temp = join(dirname(location), `.aether-${randomUUID()}.tmp`);
    const handle = await open(temp, "wx", 0o600);
    try {
      await handle.writeFile(content);
    } finally { await handle.close(); }
    try {
      if (expected === undefined) {
        // Hard-link creation is atomic and fails if a new file appeared meanwhile.
        await link(temp, location);
      } else {
        const latest = await this.read(path);
        if (!latest || hash(latest) !== expected) throw new Error(`File changed: ${path}`);
        await rename(temp, location);
      }
    } finally {
      try { await unlink(temp); } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      }
    }
  }

  async remove(path: string, expected: string): Promise<void> {
    const location = await this.location(path, false);
    const before = await this.read(path);
    if (!before || hash(before) !== expected) throw new Error(`File changed: ${path}`);
    await unlink(location);
  }
}
