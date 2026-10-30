import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const script = join(root, 'tests', 'portable-windows.test.ps1');

test('Windows PowerShell 5.1 portable integration', { skip: process.platform !== 'win32' }, () => {
  const powershell = join(process.env.SystemRoot ?? process.env.windir ?? 'C:\\Windows',
    'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe');
  const result = spawnSync(powershell, ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', script], {
    cwd: root,
    encoding: 'utf8',
    timeout: 240_000,
    maxBuffer: 4 * 1024 * 1024,
    windowsHide: true,
  });
  assert.ifError(result.error);
  assert.equal(result.status, 0, `Portable Windows suite failed:\n${result.stdout}\n${result.stderr}`);
});
