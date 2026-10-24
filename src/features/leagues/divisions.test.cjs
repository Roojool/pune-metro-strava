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
  getUserDivisionTier,
  calculateDivisionStanding,
  DIVISION_TIERS,
} = require(path.join(__dirname, 'divisions.ts'));

test('getUserDivisionTier maps cumulative points to appropriate division tiers', () => {
  assert.equal(getUserDivisionTier(0).tier, 'bronze');
  assert.equal(getUserDivisionTier(140).tier, 'bronze');
  assert.equal(getUserDivisionTier(150).tier, 'silver');
  assert.equal(getUserDivisionTier(340).tier, 'silver');
  assert.equal(getUserDivisionTier(350).tier, 'gold');
  assert.equal(getUserDivisionTier(590).tier, 'gold');
  assert.equal(getUserDivisionTier(600).tier, 'diamond');
  assert.equal(getUserDivisionTier(1500).tier, 'diamond');
});

test('calculateDivisionStanding identifies promotion zone with buffer when user is in top 2', () => {
  const board = [
    { id: 'you', name: 'You', points: 300, sample: false, line: 'purple', caloriesBurned: 500, co2SavedKg: 3.5, ridesCount: 5 },
    { id: 'r2', name: 'Sana', points: 250, sample: true, line: 'purple', caloriesBurned: 400, co2SavedKg: 2.8, ridesCount: 4 },
    { id: 'r3', name: 'Neha', points: 200, sample: true, line: 'purple', caloriesBurned: 350, co2SavedKg: 2.0, ridesCount: 3 },
    { id: 'r4', name: 'Kabir', points: 150, sample: true, line: 'purple', caloriesBurned: 250, co2SavedKg: 1.5, ridesCount: 2 },
    { id: 'r5', name: 'Ishaan', points: 100, sample: true, line: 'purple', caloriesBurned: 150, co2SavedKg: 1.0, ridesCount: 1 },
    { id: 'r6', name: 'Meera', points: 80, sample: true, line: 'purple', caloriesBurned: 100, co2SavedKg: 0.8, ridesCount: 1 },
  ];

  const standing = calculateDivisionStanding(1, 6, board, 'xp', 300);
  assert.equal(standing.zone, 'promotion');
  assert.equal(standing.userRank, 1);
  assert.equal(standing.pointsToPromote, 0);
  assert.equal(standing.pointsToSafety, 0);
  assert.ok(standing.bufferOverCutoff >= 50);
  assert.match(standing.headline, /Promotion Zone/);
  assert.match(standing.a11yZoneDescription, /In promotion zone/);
});

test('calculateDivisionStanding identifies safe zone with distance to promotion', () => {
  const board = [
    { id: 'r1', name: 'Aarav', points: 400, sample: true, line: 'purple', caloriesBurned: 600, co2SavedKg: 4.0, ridesCount: 6 },
    { id: 'r2', name: 'Sana', points: 350, sample: true, line: 'purple', caloriesBurned: 500, co2SavedKg: 3.2, ridesCount: 5 },
    { id: 'r3', name: 'Neha', points: 280, sample: true, line: 'purple', caloriesBurned: 400, co2SavedKg: 2.5, ridesCount: 4 },
    { id: 'you', name: 'You', points: 250, sample: false, line: 'purple', caloriesBurned: 380, co2SavedKg: 2.2, ridesCount: 3 },
    { id: 'r5', name: 'Kabir', points: 150, sample: true, line: 'purple', caloriesBurned: 200, co2SavedKg: 1.2, ridesCount: 2 },
    { id: 'r6', name: 'Ishaan', points: 100, sample: true, line: 'purple', caloriesBurned: 150, co2SavedKg: 1.0, ridesCount: 1 },
  ];

  const standing = calculateDivisionStanding(4, 6, board, 'xp', 250);
  assert.equal(standing.zone, 'safe');
  assert.equal(standing.userRank, 4);
  assert.equal(standing.pointsToSafety, 0);
  assert.ok(standing.pointsToPromote > 0);
  assert.match(standing.headline, /Safe Zone/);
  assert.match(standing.a11yZoneDescription, /In safe zone/);
});

test('calculateDivisionStanding flags relegation danger in Silver tier for bottom ranks', () => {
  const board = [
    { id: 'r1', name: 'Aarav', points: 400, sample: true, line: 'purple', caloriesBurned: 600, co2SavedKg: 4.0, ridesCount: 6 },
    { id: 'r2', name: 'Sana', points: 350, sample: true, line: 'purple', caloriesBurned: 500, co2SavedKg: 3.2, ridesCount: 5 },
    { id: 'r3', name: 'Neha', points: 280, sample: true, line: 'purple', caloriesBurned: 400, co2SavedKg: 2.5, ridesCount: 4 },
    { id: 'r4', name: 'Kabir', points: 220, sample: true, line: 'purple', caloriesBurned: 300, co2SavedKg: 1.8, ridesCount: 3 },
    { id: 'r5', name: 'Ishaan', points: 180, sample: true, line: 'purple', caloriesBurned: 220, co2SavedKg: 1.4, ridesCount: 2 },
    { id: 'you', name: 'You', points: 160, sample: false, line: 'purple', caloriesBurned: 190, co2SavedKg: 1.1, ridesCount: 2 },
  ];

  // 160 points is Silver tier (min 150), 6th of 6 participants -> in bottom 2 -> relegation danger
  const standing = calculateDivisionStanding(6, 6, board, 'xp', 160);
  assert.equal(standing.zone, 'relegation');
  assert.equal(standing.userRank, 6);
  assert.ok(standing.pointsToSafety > 0);
  assert.match(standing.headline, /Relegation Alert/);
  assert.match(standing.a11yZoneDescription, /Warning: In relegation zone/);
});

test('calculateDivisionStanding never relegates in Bronze tier', () => {
  const board = [
    { id: 'r1', name: 'Aarav', points: 100, sample: true, line: 'purple', caloriesBurned: 200, co2SavedKg: 1.0, ridesCount: 2 },
    { id: 'r2', name: 'Sana', points: 80, sample: true, line: 'purple', caloriesBurned: 150, co2SavedKg: 0.8, ridesCount: 2 },
    { id: 'r3', name: 'Neha', points: 60, sample: true, line: 'purple', caloriesBurned: 120, co2SavedKg: 0.6, ridesCount: 1 },
    { id: 'you', name: 'You', points: 30, sample: false, line: 'purple', caloriesBurned: 50, co2SavedKg: 0.3, ridesCount: 1 },
  ];

  // 30 points = Bronze tier. Rank 4 of 4 cannot be relegated.
  const standing = calculateDivisionStanding(4, 4, board, 'xp', 30);
  assert.notEqual(standing.zone, 'relegation');
  assert.equal(standing.zone, 'safe');
  assert.equal(standing.relegationRanksCount, 0);
});

test('calculateDivisionStanding handles honest zero state with 0 points', () => {
  const board = [
    { id: 'r1', name: 'Aarav', points: 100, sample: true, line: 'purple', caloriesBurned: 200, co2SavedKg: 1.0, ridesCount: 2 },
    { id: 'r2', name: 'Sana', points: 80, sample: true, line: 'purple', caloriesBurned: 150, co2SavedKg: 0.8, ridesCount: 2 },
    { id: 'you', name: 'You', points: 0, sample: false, line: 'purple', caloriesBurned: 0, co2SavedKg: 0, ridesCount: 0 },
  ];

  const standing = calculateDivisionStanding(3, 3, board, 'xp', 0);
  assert.equal(standing.tierInfo.tier, 'bronze');
  assert.equal(standing.userScore, 0);
  assert.ok(standing.pointsToPromote > 0);
  assert.equal(standing.pointsToSafety, 0);
});

test('calculateDivisionStanding works correctly across calories metric', () => {
  const board = [
    { id: 'you', name: 'You', points: 200, sample: false, line: 'purple', caloriesBurned: 700, co2SavedKg: 3.5, ridesCount: 5 },
    { id: 'r1', name: 'Aarav', points: 300, sample: true, line: 'purple', caloriesBurned: 500, co2SavedKg: 3.0, ridesCount: 4 },
    { id: 'r2', name: 'Sana', points: 250, sample: true, line: 'purple', caloriesBurned: 400, co2SavedKg: 2.5, ridesCount: 4 },
  ];

  const standing = calculateDivisionStanding(1, 3, board, 'calories', 200);
  assert.equal(standing.targetUnit, 'kcal');
  assert.equal(standing.userScore, 700);
  assert.equal(standing.zone, 'promotion');
});
