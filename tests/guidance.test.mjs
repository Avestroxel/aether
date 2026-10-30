import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { init, selectSkills } from '../dist/core/index.js';

const source = resolve(fileURLToPath(new URL('..', import.meta.url)));
const temp = async (fn) => {
  const root = await mkdtemp(join(tmpdir(), 'aether-guidance-'));
  try { await fn(root); } finally { await rm(root, { recursive: true, force: true }); }
};
const skill = (root, name) => readFile(join(root, `.agents/skills/aether-${name}/SKILL.md`), 'utf8');

test('brief selection includes relevant motion, scroll, navigation, responsive and accessibility skills', async () => {
  for (const [brief, expected] of [
    ['animated interface motion transitions', 'motion-design'],
    ['scroll-linked storytelling anchors reverse travel', 'scroll-engineering'],
    ['navigation menus anchors route changes', 'navigation-architecture'],
    ['responsive mobile breakpoint reflow', 'responsive-design'],
    ['accessible keyboard screen reader audit', 'accessibility'],
  ]) {
    const chosen = await selectSkills(source, brief);
    assert.equal(chosen[0], 'design-thinking', brief);
    assert.ok(chosen.includes(expected), `${brief}: expected ${expected}, got ${chosen.join(', ')}`);
    assert.equal(new Set(chosen).size, chosen.length);
  }
});

test('installed guidance covers reverse scroll, menu focus, responsive reflow, reduced motion and silent feedback', async () => temp(async (root) => {
  await init(root, source, []);
  const index = await readFile(join(root, 'aether/INDEX.md'), 'utf8');
  for (const name of ['motion-design', 'scroll-engineering', 'navigation-architecture', 'responsive-design', 'accessibility']) {
    assert.ok(index.includes(`aether-${name}/SKILL.md`), `${name} should be discoverable`);
    assert.match(await skill(root, name), new RegExp(`^name: aether-${name}$`, 'm'));
  }
  const motion = await skill(root, 'motion-design');
  assert.match(motion, /rapid reversal|reverse travel/i);
  assert.match(motion, /prefers-reduced-motion/);
  assert.match(motion, /no autoplay audio/i);
  const scroll = await skill(root, 'scroll-engineering');
  assert.match(scroll, /revisiting upward/);
  assert.match(scroll, /without JS/);
  assert.match(scroll, /anchor links.*keyboard scrolling.*touch/i);
  const nav = await skill(root, 'navigation-architecture');
  assert.match(nav, /links for navigation and buttons for opening menus/i);
  assert.match(nav, /return focus, Escape, outside dismissal/i);
  assert.match(nav, /sticky headers.*anchor URLs.*back\/forward restoration/i);
  const responsive = await skill(root, 'responsive-design');
  assert.match(responsive, /breakpoints where content actually breaks/i);
  assert.match(responsive, /DOM reading order/i);
  assert.match(responsive, /200% zoom/i);
  const accessibility = await skill(root, 'accessibility');
  assert.match(accessibility, /keyboard alone.*visible focus/i);
  assert.match(accessibility, /screen reader/i);
  assert.match(accessibility, /status must not rely on motion or sound/i);
  const interaction = await skill(root, 'interaction-design');
  assert.match(interaction, /no autoplay sound/i);
  assert.match(interaction, /touch and keyboard/i);
}));
