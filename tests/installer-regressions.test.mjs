import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { init, rollback, update } from '../dist/core/index.js';

const source = resolve(fileURLToPath(new URL('..', import.meta.url)));
const temp = async (fn) => {
  const root = await mkdtemp(join(tmpdir(), 'aether-installer-'));
  try { await fn(root); } finally { await rm(root, { recursive: true, force: true }); }
};
const read = (root, path) => readFile(join(root, path), 'utf8');

test('update records versions and rollback refuses a modified file before restoring it', async () => temp(async (root) => {
  const alternate = await mkdtemp(join(tmpdir(), 'aether-package-'));
  try {
    await cp(join(source, 'skills'), join(alternate, 'skills'), { recursive: true });
    await cp(join(source, 'knowledge'), join(alternate, 'knowledge'), { recursive: true });
    const path = 'aether/knowledge/strategy.md';
    await init(root, source, []);
    const before = await read(root, path);
    const originalManifest = JSON.parse(await read(root, 'aether/manifest.json'));
    await writeFile(join(alternate, 'knowledge/strategy.md'), `${before}\n## Revised guidance\n\nValidate the brief with stakeholders.\n`);
    const changed = await update(root, alternate);
    assert.ok(changed.includes(path));
    assert.ok(!changed.includes('AGENTS.md'));
    const updated = await read(root, path);
    const updatedManifest = JSON.parse(await read(root, 'aether/manifest.json'));
    assert.notEqual(updatedManifest.files[path].version, originalManifest.files[path].version);
    assert.equal(updatedManifest.history.length, originalManifest.history.length + 1);
    assert.deepEqual(JSON.parse(await read(root, `aether/history/${updatedManifest.history.at(-1)}/entry.json`)).changed.sort(), changed.slice().sort());
    assert.equal(await read(root, `aether/history/${updatedManifest.history.at(-1)}/files/${path}`), before);
    await writeFile(join(root, path), 'User changes after update\n');
    await assert.rejects(() => rollback(root), /Modified since update/);
    assert.equal(await read(root, path), 'User changes after update\n');
    assert.deepEqual(JSON.parse(await read(root, 'aether/manifest.json')), updatedManifest);
    await writeFile(join(root, path), updated);
    const restored = await rollback(root);
    assert.ok(restored.includes(path));
    assert.equal(await read(root, path), before);
    assert.deepEqual(JSON.parse(await read(root, 'aether/manifest.json')), originalManifest);
    await assert.rejects(() => rollback(root), /No update/);
  } finally { await rm(alternate, { recursive: true, force: true }); }
}));

test('Antigravity detection installs a native rule without replacing existing instructions', async () => temp(async (root) => {
  await writeFile(join(root, 'GEMINI.md'), '# Existing Antigravity instructions\n');
  await writeFile(join(root, 'AGENTS.md'), '# Existing project instructions\n');
  const installed = await init(root, source);
  const rulePath = '.agents/rules/aether-design-thinking.md';
  assert.ok(installed.includes(rulePath));
  const rule = await read(root, rulePath);
  assert.match(rule, /^trigger: model_decision$/m);
  assert.match(rule, /\.agents\/skills\/aether-design-thinking\/SKILL\.md/);
  assert.match(rule, /aether\/INDEX\.md/);
  assert.equal(await read(root, 'GEMINI.md'), '# Existing Antigravity instructions\n');
  assert.equal(await read(root, 'AGENTS.md'), '# Existing project instructions\n');
  assert.deepEqual(JSON.parse(await read(root, 'aether/manifest.json')).adapters, ['antigravity']);
  assert.deepEqual(await update(root, source), []);
  assert.equal(await read(root, rulePath), rule);
}));

test('update does not auto-install a newly detectable Antigravity adapter', async () => temp(async (root) => {
  await init(root, source, []);
  await mkdir(join(root, '.agent/rules'), { recursive: true });
  assert.deepEqual(await update(root, source), []);
  assert.deepEqual(JSON.parse(await read(root, 'aether/manifest.json')).adapters, []);
}));
