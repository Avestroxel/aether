import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { init } from '../dist/core/index.js';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { collect, contributions, reviewContribution, rollbackContribution } from '../dist/core/contributions.js';

const temp = async (fn) => {
  const root = await mkdtemp(join(tmpdir(), 'aether-contributions-'));
  try { await fn(root); } finally { await rm(root, { recursive: true, force: true }); }
};
const read = (root, path) => readFile(join(root, path), 'utf8');
const digest = (text) => createHash('sha256').update(text).digest('hex');

 test('collection records provenance and keeps unreviewed lessons out of default results', async () => temp(async (root) => {
  const path = await collect(root, {
    module: 'motion-design', text: '  Verify the transition on a keyboard.  ',
    source: 'Internal usability session', license: 'Used with permission',
    evidence: ['Session notes'], scope: 'general',
  });
  const record = JSON.parse(await read(root, path));
  assert.equal(path, `aether/contributions/motion-design/${record.id}/v1.json`);
  assert.equal(record.text, 'Verify the transition on a keyboard.');
  assert.deepEqual(record.provenance, { project: resolve(root), source: 'Internal usability session', license: 'Used with permission' });
  assert.deepEqual(record.evidence, ['Session notes']);
  assert.equal(record.scope, 'general');
  assert.equal(record.status, 'pending');
  assert.equal(record.version, 1);
  assert.equal(record.previous, null);
  assert.ok(!Number.isNaN(Date.parse(record.createdAt)));
  assert.deepEqual(JSON.parse(await read(root, `aether/contributions/motion-design/${record.id}/current.json`)), { version: 1 });
  assert.deepEqual(await contributions(root, ['motion-design']), []);
  assert.deepEqual(await contributions(root, ['motion-design', 'motion-design'], true), [record]);
  await assert.rejects(() => rollbackContribution(root, 'motion-design', record.id), /No contribution review/);
}));

test('approval requires evidence and appends an auditable revision without altering v1', async () => temp(async (root) => {
  const path = await collect(root, { module: 'accessibility', text: 'Check focus return.' });
  const original = await read(root, path);
  const id = JSON.parse(original).id;
  await assert.rejects(() => reviewContribution(root, 'accessibility', id, 'approved'), /Invalid contribution record/);
  assert.deepEqual(JSON.parse(await read(root, `aether/contributions/accessibility/${id}/current.json`)), { version: 1 });
  const approved = await reviewContribution(root, 'accessibility', id, 'approved', ['Keyboard flow verified', 'Keyboard flow verified']);
  assert.equal(approved.status, 'approved');
  assert.equal(approved.version, 2);
  assert.deepEqual(approved.evidence, ['Keyboard flow verified']);
  assert.equal(approved.previous, digest(original));
  assert.ok(!Number.isNaN(Date.parse(approved.reviewedAt)));
  assert.equal(await read(root, path), original);
  assert.deepEqual(JSON.parse(await read(root, `aether/contributions/accessibility/${id}/v2.json`)), approved);
  assert.deepEqual(await contributions(root, ['accessibility', 'accessibility']), [approved]);
  assert.deepEqual(await contributions(root, []), []);
}));

test('rejection is excluded; rollback restores the prior state as a new revision', async () => temp(async (root) => {
  const path = await collect(root, { module: 'responsive-design', text: 'Check 200% zoom.', evidence: ['Viewport audit'] });
  const v1 = JSON.parse(await read(root, path));
  const rejected = await reviewContribution(root, v1.module, v1.id, 'rejected', ['Zoom audit failed']);
  assert.equal(rejected.version, 2);
  assert.deepEqual(rejected.evidence, ['Viewport audit', 'Zoom audit failed']);
  assert.deepEqual(await contributions(root, [v1.module]), []);
  assert.deepEqual(await contributions(root, [v1.module], true), [rejected]);
  const restored = await rollbackContribution(root, v1.module, v1.id);
  assert.equal(restored.status, 'pending');
  assert.equal(restored.version, 3);
  assert.equal(restored.previous, digest(await read(root, `aether/contributions/${v1.module}/${v1.id}/v2.json`)));
  assert.deepEqual(restored.evidence, v1.evidence);
  assert.deepEqual(restored.provenance, v1.provenance);
  assert.equal(restored.createdAt, v1.createdAt);
  assert.deepEqual(JSON.parse(await read(root, `aether/contributions/${v1.module}/${v1.id}/current.json`)), { version: 3 });
  assert.deepEqual(JSON.parse(await read(root, `aether/contributions/${v1.module}/${v1.id}/v2.json`)), rejected);
  assert.deepEqual(await contributions(root, [v1.module]), []);
  const approved = await reviewContribution(root, v1.module, v1.id, 'approved');
  assert.equal(approved.version, 4);
  assert.deepEqual(approved.evidence, v1.evidence);
  assert.deepEqual(await contributions(root, [v1.module]), [approved]);
}));

test('invalid modules, text, and review evidence cannot become trusted contributions', async () => temp(async (root) => {
  await assert.rejects(() => collect(root, { module: '../escape', text: 'Safe text' }), /Invalid contribution record/);
  await assert.rejects(() => collect(root, { module: 'typography', text: 'See https://example.test' }), /Invalid contribution record/);
  await assert.rejects(() => contributions(root, ['../escape']), /Invalid contribution module/);
  const path = await collect(root, { module: 'typography', text: 'Use readable line lengths.' });
  const id = JSON.parse(await read(root, path)).id;
  await assert.rejects(() => reviewContribution(root, 'typography', id, 'approved', ['  ']), /Invalid contribution record/);
  await assert.rejects(() => reviewContribution(root, 'typography', id, 'pending', ['Checked']), /Invalid review status/);
  assert.deepEqual(await contributions(root, ['typography']), []);
}));

test('duplicate lessons and tampered revisions cannot be used as reviewed knowledge', async () => temp(async (root) => {
  const path = await collect(root, { module: 'motion-design', text: 'Keep content visible.' });
  await assert.rejects(() => collect(root, { module: 'motion-design', text: ' keep content visible. ' }), /Duplicate contribution/);
  const id = JSON.parse(await read(root, path)).id;
  await reviewContribution(root, 'motion-design', id, 'approved', ['Reviewed reduced-motion state']);
  const { writeFile } = await import('node:fs/promises');
  await writeFile(join(root, path), 'tampered');
  await assert.rejects(() => contributions(root, ['motion-design']), /revision chain is broken/);
}));

test('CLI learn, review, contextual retrieval and undo-review work end to end', async () => temp(async (root) => {
  const source = resolve(fileURLToPath(new URL('..', import.meta.url)));
  await init(root, source, ['antigravity']);
  const cli = join(source, 'dist/cli.js');
  const run = (...args) => spawnSync(process.execPath, [cli, ...args, '--cwd', root], { encoding: 'utf8' });
  const saved = run('learn', '--module', 'scroll-engineering', '--text', 'Keep reverse scroll readable.');
  assert.equal(saved.status, 0, saved.stderr);
  const id = saved.stdout.match(/scroll-engineering\/([a-f0-9-]{36})\/v1\.json/)?.[1];
  assert.ok(id, saved.stdout);
  assert.equal(run('lessons', '--brief', 'scroll reveals').stdout.trim(), '');
  const failed = run('review', '--module', 'scroll-engineering', '--id', id, '--status', 'approved');
  assert.equal(failed.status, 1);
  const reviewed = run('review', '--module', 'scroll-engineering', '--id', id, '--status', 'approved', '--evidence', 'Checked reduced motion and reverse scroll');
  assert.equal(reviewed.status, 0, reviewed.stderr);
  assert.match(run('lessons', '--brief', 'scroll reveals').stdout, /Keep reverse scroll readable/);
  const restored = run('undo-review', '--module', 'scroll-engineering', '--id', id);
  assert.equal(restored.status, 0, restored.stderr);
  assert.equal(run('lessons', '--brief', 'scroll reveals').stdout.trim(), '');
}));
