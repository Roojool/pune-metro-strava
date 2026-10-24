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

const { calculateRivalDuelDetail } = require(path.join(__dirname, 'rivalDuel.ts'));

test('calculateRivalDuelDetail returns null for single-entry boards or missing user', () => {
  const single = [
    { id: 'you', name: 'You', points: 100, sample: false, line: 'purple', caloriesBurned: 200, co2SavedKg: 1.0, ridesCount: 2 },
  ];
  assert.equal(calculateRivalDuelDetail(single[0], single, 'xp'), null);

  const missingUser = [
    { id: 'r1', name: 'Aarav', points: 100, sample: true, line: 'purple', caloriesBurned: 200, co2SavedKg: 1.0, ridesCount: 2 },
    { id: 'r2', name: 'Sana', points: 80, sample: true, line: 'purple', caloriesBurned: 150, co2SavedKg: 0.8, ridesCount: 2 },
  ];
  const user = { id: 'you', name: 'You', points: 50, sample: false, line: 'purple', caloriesBurned: 100, co2SavedKg: 0.5, ridesCount: 1 };
  assert.equal(calculateRivalDuelDetail(user, missingUser, 'xp'), null);
});

test('calculateRivalDuelDetail identifies chaser when user is #1', () => {
  const board = [
    { id: 'you', name: 'You', points: 500, sample: false, line: 'purple', caloriesBurned: 900, co2SavedKg: 5.0, ridesCount: 8 },
    { id: 'r1', name: 'Aarav', points: 400, sample: true, line: 'purple', caloriesBurned: 700, co2SavedKg: 4.0, ridesCount: 6 },
    { id: 'r2', name: 'Sana', points: 300, sample: true, line: 'purple', caloriesBurned: 500, co2SavedKg: 3.0, ridesCount: 4 },
  ];

  const duel = calculateRivalDuelDetail(board[0], board, 'xp');
  assert.ok(duel);
  assert.equal(duel.userRank, 1);
  assert.equal(duel.rivalRank, 2);
  assert.equal(duel.rivalName, 'Aarav');
  assert.equal(duel.scoreDelta, 100);
  assert.equal(duel.caloriesDelta, 200);
  assert.equal(duel.momentumAdvantage, 'user');
  assert.match(duel.headline, /Defending #1 · 100 XP Lead over Aarav/);
  assert.match(duel.accessibilityAnnouncement, /Leaderboard leader/);
});

test('calculateRivalDuelDetail computes deficit and catchup rides when chasing rival ahead', () => {
  const board = [
    { id: 'r1', name: 'Aarav', points: 500, sample: true, line: 'purple', caloriesBurned: 900, co2SavedKg: 5.0, ridesCount: 8 },
    { id: 'you', name: 'You', points: 410, sample: false, line: 'purple', caloriesBurned: 720, co2SavedKg: 4.1, ridesCount: 6 },
    { id: 'r2', name: 'Sana', points: 300, sample: true, line: 'purple', caloriesBurned: 500, co2SavedKg: 3.0, ridesCount: 4 },
  ];

  const duel = calculateRivalDuelDetail(board[1], board, 'xp');
  assert.ok(duel);
  assert.equal(duel.userRank, 2);
  assert.equal(duel.rivalRank, 1);
  assert.equal(duel.rivalName, 'Aarav');
  assert.equal(duel.scoreDelta, -90);
  assert.equal(duel.xpDelta, -90);
  assert.equal(duel.caloriesDelta, -180);
  assert.match(duel.headline, /Chasing Rank #1 \(Aarav\) · 90 XP Deficit/);

  // Suggested catchup rides verification:
  // PCMC ↔ Civil Court awards 50 XP -> 90 / 50 = ceil(1.8) = 2 rides needed
  const pcmcCatchup = duel.suggestedCatchups.find(c => c.routeLabel.includes('PCMC ↔ Civil Court'));
  assert.ok(pcmcCatchup);
  assert.equal(pcmcCatchup.ridesNeededToOvertake, 2);

  // Deccan Gymkhana ↔ PMC awards 25 XP -> 90 / 25 = ceil(3.6) = 4 rides needed
  const deccanCatchup = duel.suggestedCatchups.find(c => c.routeLabel.includes('Deccan Gymkhana'));
  assert.ok(deccanCatchup);
  assert.equal(deccanCatchup.ridesNeededToOvertake, 4);

  assert.match(duel.accessibilityAnnouncement, /Rival duel against Aarav at rank 1/);
});

test('calculateRivalDuelDetail assesses momentum advantage across rides count', () => {
  const board = [
    { id: 'r1', name: 'Aarav', points: 250, sample: true, line: 'purple', caloriesBurned: 400, co2SavedKg: 2.0, ridesCount: 3 },
    { id: 'you', name: 'You', points: 240, sample: false, line: 'purple', caloriesBurned: 420, co2SavedKg: 2.1, ridesCount: 4 },
  ];

  // User has 4 rides vs 3 rides -> momentum is 'user'
  const duel = calculateRivalDuelDetail(board[1], board, 'xp');
  assert.ok(duel);
  assert.equal(duel.momentumAdvantage, 'user');
});
