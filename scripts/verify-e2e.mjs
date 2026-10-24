import assert from 'node:assert/strict';
import { spawn, execFileSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { createServer } from 'node:net';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export function validateSmokeResult(result) {
  assert.ok(result && typeof result === 'object' && !Array.isArray(result), 'Browser smoke must return a result object.');
  for (const [field, expected] of Object.entries({ journeys: 1, collected: 2, xp: 50, postPersisted: true, reactionPersisted: true, membershipPersisted: true, profilePersisted: true, mobileTabs: 5 })) {
    assert.equal(result[field], expected, `Browser smoke failed or omitted ${field}.`);
  }
  assert.ok(Number.isFinite(result.journeyMilliseconds) && result.journeyMilliseconds > 0 && result.journeyMilliseconds < 10_000, 'Quick journey logging must take less than ten seconds.');
  assert.ok(Array.isArray(result.browserErrors) && result.browserErrors.length === 0, 'Browser smoke reported errors or omitted browserErrors.');
  return result;
}

async function freePort() {
  const probe = createServer();
  return new Promise((resolvePort, reject) => {
    probe.once('error', reject);
    probe.listen(0, '127.0.0.1', () => {
      const port = probe.address().port;
      probe.close(error => error ? reject(error) : resolvePort(port));
    });
  });
}

function runNpm(args, capture = false) {
  return new Promise((resolveOutput, reject) => {
    const child = spawn(process.execPath, [process.env.npm_execpath, ...args], { cwd: root, env: { ...process.env, CI: '1' }, stdio: ['ignore', 'pipe', 'pipe'] });
    let output = '';
    const timer = setTimeout(() => { child.kill(); reject(new Error(`Timed out: npm ${args.join(' ')}`)); }, 180_000);
    child.stdout.on('data', data => { output += data; if (!capture) process.stdout.write(data); });
    child.stderr.on('data', data => process.stderr.write(data));
    child.once('error', error => { clearTimeout(timer); reject(error); });
    child.once('close', code => {
      clearTimeout(timer);
      if (code === 0) resolveOutput(output.trim());
      else reject(new Error(`npm ${args.join(' ')} exited with ${code}.`));
    });
  });
}

async function waitForServer(server, url, serverFailure) {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (serverFailure() || server.exitCode !== null || server.signalCode !== null) throw serverFailure() ?? new Error('Expo static server exited before becoming ready.');
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(Math.max(1, Math.min(1500, deadline - Date.now()))) });
      await response.body?.cancel();
      if (response.ok) return;
    } catch { /* The server may still be binding its port. */ }
    await new Promise(resolveWait => setTimeout(resolveWait, Math.max(0, Math.min(250, deadline - Date.now()))));
  }
  throw new Error('Expo static server did not become ready within thirty seconds.');
}

async function verify() {
  const session = `metroquest-e2e-${process.pid}-${Date.now()}`;
  const playwright = ['exec', '--yes', '--package', '@playwright/cli', '--', 'playwright-cli', `-s=${session}`];
  let server;
  let browserStarted = false;
  let result = { passed: false, gitHead: null, startedAt: new Date().toISOString() };
  let failure;
  try {
    await mkdir(resolve(root, 'output'), { recursive: true });
    await writeFile(resolve(root, 'output/e2e-result.json'), `${JSON.stringify(result, null, 2)}\n`);
    assert.ok(process.env.npm_execpath, 'Run this verifier through npm run verify:e2e.');
    result.gitHead = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
    for (const script of ['typecheck', 'test', 'export:web']) await runNpm(['run', script]);
    const port = await freePort();
    const url = `http://127.0.0.1:${port}`;
    let serverError;
    server = spawn(process.execPath, [resolve(root, 'node_modules/expo/bin/cli'), 'serve', '--port', String(port)], { cwd: root, env: { ...process.env, CI: '1' }, stdio: ['ignore', 'pipe', 'pipe'] });
    server.stdout.on('data', data => process.stdout.write(data));
    server.stderr.on('data', data => process.stderr.write(data));
    server.once('error', error => { serverError = error; });
    await waitForServer(server, url, () => serverError);
    browserStarted = true;
    await runNpm([...playwright, 'open', url], true);
    const browserResult = JSON.parse(await runNpm([...playwright, 'run-code', '--filename=scripts/browser-smoke.js', '--raw'], true));
    result = { ...result, ...validateSmokeResult(browserResult), passed: true };
  } catch (error) { failure = error; }
  finally {
    if (browserStarted) {
      try { await runNpm([...playwright, 'close'], true); }
      catch (error) { failure ??= error; }
    }
    if (server && server.exitCode === null && server.signalCode === null) server.kill();
    if (failure) result = { ...result, passed: false, error: failure instanceof Error ? failure.message : String(failure) };
    result.finishedAt = new Date().toISOString();
    await mkdir(resolve(root, 'output'), { recursive: true });
    await writeFile(resolve(root, 'output/e2e-result.json'), `${JSON.stringify(result, null, 2)}\n`);
  }
  if (failure) throw failure;
  console.log(`E2E passed for ${result.gitHead}. Evidence: output/e2e-result.json`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  verify().catch(error => { console.error(error); process.exitCode = 1; });
}
