const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const api = import('../scripts/team-loop.mjs');
test('stages distinguish work, waiting, review failure, merge and closed PRs', async () => {
  const { stageFor } = await api;
  assert.equal(stageFor(null), 'fix');
  assert.equal(stageFor({ state: 'OPEN', statusCheckRollup: [{ conclusion: 'FAILURE' }] }), 'fix');
  assert.equal(stageFor({ state: 'OPEN', reviewDecision: 'CHANGES_REQUESTED' }), 'fix');
  assert.equal(stageFor({ state: 'OPEN', statusCheckRollup: [{ state: 'PENDING' }] }), 'waiting');
  assert.equal(stageFor({ state: 'OPEN', statusCheckRollup: [{ conclusion: 'SUCCESS' }] }), 'waiting');
  assert.equal(stageFor({ state: 'MERGED' }), 'merged');
  assert.equal(stageFor({ state: 'CLOSED' }), 'blocked');
});
test('arguments and ownership refuse wrong branches and shared files', async () => {
  const { parseArgs, assertBranch, assertOwned } = await api;
  assert.deepEqual(parseArgs(['passport', '--minutes', '5', '--dry-run']), { role: 'passport', minutes: 5, dryRun: true });
  assert.throws(() => parseArgs(['lead']));
  assert.throws(() => parseArgs(['journey', '--minutes', '31']));
  assert.throws(() => parseArgs(['journey', '--minutes']));
  assert.throws(() => parseArgs(['journey', '--unknown']));
  assert.throws(() => assertBranch('passport', 'main'));
  assert.throws(() => assertBranch('passport', 'feature/journey-tracking'));
  assert.doesNotThrow(() => assertBranch('passport', 'feature/passport-stats'));
  assert.doesNotThrow(() => assertOwned('passport', ['src/features/passport/PassportScreen.tsx']));
  assert.throws(() => assertOwned('passport', ['src/state/AppState.tsx']));
});
test('exclusive checkout lock refuses a second runner and can be released', async () => {
  const { acquireLock } = await api;
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'metroquest-lock-'));
  const filename = path.join(directory, 'runner.lock');
  try {
    const release = acquireLock(filename);
    assert.throws(() => acquireLock(filename), { code: 'EEXIST' });
    release(); release();
    const second = acquireLock(filename); second();
    assert.equal(fs.existsSync(filename), false);
  } finally { fs.rmdirSync(directory); }
});
test('controller syncs shared updates before taking the ownership-check snapshot', async () => {
  const { syncBeforeSnapshot } = await api;
  const calls = [];
  const before = syncBeforeSnapshot((...args) => { calls.push(args); return args[0] === 'rev-parse' ? 'after-main-sync' : ''; });
  assert.deepEqual(calls, [['fetch', 'origin', 'main'], ['merge', '--no-edit', 'origin/main'], ['rev-parse', 'HEAD']]);
  assert.equal(before, 'after-main-sync');
  assert.throws(() => syncBeforeSnapshot((...args) => { if (args[0] === 'merge') throw new Error('conflict'); }), /conflict/);
});
