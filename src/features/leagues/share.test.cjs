const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const ts = require('typescript');

require.extensions['.ts'] = function (module, filename) {
  const code = fs.readFileSync(filename, 'utf8');
  const compiled = ts.transpileModule(code, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  });
  module._compile(compiled.outputText, filename);
};

const {
  generateLeagueShareSummary,
  handleLeagueShareResult,
} = require(path.join(__dirname, 'share.ts'));

test('generateLeagueShareSummary builds aggregate privacy-preserving commuter summary', () => {
  const summary = generateLeagueShareSummary({
    rank: 2,
    totalParticipants: 7,
    leagueTitle: 'Pune explorers',
    points: 180,
    caloriesBurned: 430,
    level: 2,
    milestoneName: 'Spicy Katakirr Misal Pav',
  });

  assert.match(summary, /Rank #2 of 7 · Pune explorers/);
  assert.match(summary, /180 XP · Level 2 Explorer/);
  assert.match(summary, /430 active commute kcal burned \(Spicy Katakirr Misal Pav\)/);
  assert.match(summary, /local self-reported demo, not verified travel/);

  // Strict Privacy Checks:
  // Must NOT leak specific travel dates, times, home/work commute locations, or specific timestamps
  assert.doesNotMatch(summary, /2026-|UTC|AM|PM|home|work|schedule/i);
});

test('generateLeagueShareSummary handles honest zero state with clear encouragement', () => {
  const zero = generateLeagueShareSummary({
    rank: 7,
    totalParticipants: 7,
    leagueTitle: 'Pune explorers',
    points: 0,
    caloriesBurned: 0,
    level: 1,
    isZeroState: true,
  });

  assert.match(zero, /Starting my everyday Pune Metro transit habit/);
  assert.match(zero, /0 XP · 0 kcal burned/);
  assert.match(zero, /Self-reported local exploration demo/);
});

test('handleLeagueShareResult normalizes native and web responses', () => {
  assert.equal(handleLeagueShareResult(undefined).ok, true);
  assert.equal(handleLeagueShareResult({ action: 'sharedAction' }).ok, true);
  assert.equal(handleLeagueShareResult({ action: 'dismissedAction' }).ok, false);
  assert.equal(handleLeagueShareResult(null).ok, false);
});
