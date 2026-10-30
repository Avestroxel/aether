import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, rm, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { init, update, uninstall, doctor, rollback, learn, selectSkills, listSkills } from '../dist/core/index.js';
import { discover } from '../dist/resources/discovery.js';

const source = resolve(fileURLToPath(new URL('..', import.meta.url)));
const temp = async (fn) => {
  const dir = await mkdtemp(join(tmpdir(), 'aether-test-'));
  try { await fn(dir); } finally { await rm(dir, { recursive: true, force: true }); }
};
const file = (root, name) => readFile(join(root, name), 'utf8');

 test('initial install creates valid skill references and preserves existing instructions', async () => temp(async (root) => {
  await writeFile(join(root, 'AGENTS.md'), '# User rules\n');
  await mkdir(join(root, '.cursor'));
  await mkdir(join(root, '.claude'));
  const written = await init(root, source);
  assert.ok(written.includes('.cursor/rules/aether-design-thinking.mdc'));
  assert.ok(written.includes('CLAUDE.md'));
  assert.equal(await file(root, 'AGENTS.md'), '# User rules\n');
  assert.match(await file(root, '.agents/skills/aether-motion-design/SKILL.md'), /^name: aether-motion-design$/m);
  assert.match(await file(root, '.agents/skills/aether-design-thinking/SKILL.md'), /\.\.\/\.\.\/\.\.\/aether\/knowledge\/strategy\.md/);
  assert.deepEqual(await doctor(root), []);
  assert.deepEqual(await init(root, source), []);
}));

test('update does not overwrite edits and rollback restores preceding version', async () => temp(async (root) => {
  await init(root, source, ['windsurf']);
  const rule = '.windsurf/rules/aether-design-thinking.md';
  await writeFile(join(root, rule), 'my custom rules');
  assert.match((await doctor(root)).join('\n'), /Modified: .windsurf/);
  const change = await update(root, source);
  assert.equal(change.includes(rule), false);
  assert.equal(await file(root, rule), 'my custom rules');
  const removed = await uninstall(root);
  assert.equal(removed.includes(rule), false);
  assert.equal(await file(root, rule), 'my custom rules');
  assert.match(await file(root, 'aether/manifest.json'), /windsurf/);
  await assert.rejects(() => rollback(root));
}));

test('update and rollback preserve managed versions and local contributions', async () => temp(async (root) => {
  await init(root, source, []);
  const installed = await file(root, 'aether/INDEX.md');
  const contribution = await learn(root, source, {module: 'typography', text: 'Test long headline line breaks on narrow screens.'});
  assert.match(await file(root, contribution), /long headline/);
  assert.deepEqual(await update(root, source), []);
  await assert.rejects(() => rollback(root), /No update/);
  const marker = 'aether/INDEX.md';
  const editedSource = await mkdtemp(join(tmpdir(), 'aether-source-'));
  try {
    await mkdir(join(editedSource, 'skills'));
    await mkdir(join(editedSource, 'knowledge'));
    const { cp } = await import('node:fs/promises');
    await cp(join(source, 'skills'), join(editedSource, 'skills'), { recursive: true, force: true });
    await cp(join(source, 'knowledge'), join(editedSource, 'knowledge'), { recursive: true, force: true });
    await writeFile(join(editedSource, 'knowledge', 'extra.md'), '# New knowledge\n');
    assert.ok((await update(root, editedSource)).includes(marker));
    assert.match(await file(root, 'aether/INDEX.md'), /extra.md/);
    await rollback(root);
    assert.equal(await file(root, 'aether/INDEX.md'), installed);
    await assert.rejects(() => access(join(root, 'aether/knowledge/extra.md')));
    assert.match(await file(root, contribution), /long headline/);
  } finally { await rm(editedSource, { recursive: true, force: true }); }
}));

test('all native adapters generate distinct files without replacing user rules', async () => temp(async (root) => {
  await mkdir(join(root, '.github'));
  await writeFile(join(root, '.github/copilot-instructions.md'), 'keep this');
  const written = await init(root, source, ['antigravity', 'cursor', 'copilot', 'claude', 'windsurf']);
  assert.equal(await file(root, '.github/copilot-instructions.md'), 'keep this');
  assert.equal(written.includes('.github/copilot-instructions.md'), false);
  assert.match(await file(root, '.agents/rules/aether-design-thinking.md'), /trigger: model_decision/);
  assert.match(await file(root, '.windsurf/rules/aether-design-thinking.md'), /trigger: model_decision/);
  assert.match(await file(root, '.cursor/rules/aether-design-thinking.mdc'), /alwaysApply: false/);
  assert.match(await file(root, 'CLAUDE.md'), /aether\/INDEX.md/);
}));

test('CLI installs, diagnoses and uninstalls in an external project', async () => temp(async (root) => {
  const cli = join(source, 'dist/cli.js');
  const run = (...args) => spawnSync(process.execPath, [cli, ...args, '--cwd', root], {encoding: 'utf8'});
  const start = run('init', '--ide', 'cursor');
  assert.equal(start.status, 0, start.stderr);
  assert.match(start.stdout, /IDE adapters: cursor/);
  assert.equal(run('doctor').status, 0);
  const end = run('uninstall');
  assert.equal(end.status, 0, end.stderr);
  assert.match(end.stdout, /uninstall: aether\/manifest.json/);
  assert.equal(run('doctor').status, 1);
}));

test('skill selection, input validation and protection against unowned conflicts', async () => temp(async (root) => {
  assert.ok((await listSkills(source)).length >= 10);
  assert.ok((await selectSkills(source, 'interactive 3d product experience')).includes('3d-design'));
  assert.ok((await selectSkills(source, 'architecture studio')).includes('typography'));
  assert.ok((await selectSkills(source, 'SaaS dashboard')).includes('component-design'));
  await writeFile(join(root, 'package.json'), JSON.stringify({dependencies: {react: '^19.0.0', three: '^0.180.0'}}));
  const candidates = await discover(root, '3d');
  assert.equal(candidates.candidates.find((item) => item.name === 'Three.js').installed, true);
  assert.equal(candidates.candidates.find((item) => item.name === 'Drei').compatible, true);
  await mkdir(join(root, 'aether'));
  await writeFile(join(root, 'aether/INDEX.md'), 'existing');
  await assert.rejects(() => init(root, source), /Unowned AETHER resource/);
  await rm(join(root, 'aether/INDEX.md'));
  await init(root, source);
  await assert.rejects(() => learn(root, source, { module: 'unknown', text: 'x' }), /Unknown/);
  await assert.rejects(() => learn(root, source, { module: 'typography', text: 'https://bad.example' }), /external URLs/);
}));
