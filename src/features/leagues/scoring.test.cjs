const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

require.extensions['.ts'] = function (module, filename) {
  const code = fs.readFileSync(filename, 'utf8');
  const compiled = ts.transpileModule(code, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  });
  module._compile(compiled.outputText, filename);
};

const {
  calculateJourneyCalories,
  calculateTotalCalories,
  calculateBurnSummary,
  getEnrichedSampleLeague,
  calculateUserEntry,
  rankByMetric,
  calculateRivalMatchup,
  calculateLevelProgress,
} = require(path.join(__dirname, 'scoring.ts'));

test('calculateJourneyCalories computes active commute walking and station movement', () => {
  // 0 km returns 0
  assert.equal(calculateJourneyCalories({ kilometers: 0, from: 'pcmc', to: 'pcmc' }), 0);

  // Standard direct ride: PCMC -> Civil Court (13.4 km, no interchange transfer walk)
  // 45 baseline + 13.4 * 12 = 45 + 160.8 = ~206 kcal
  const direct = calculateJourneyCalories({
    kilometers: 13.4,
    from: 'pcmc',
    to: 'civil-court',
    stationIds: ['pcmc', 'sant-tukaram-nagar', 'bhosari', 'kasarwadi', 'phugewadi', 'dapodi', 'bopodi', 'khadki', 'range-hill', 'shivajinagar', 'civil-court'],
  });
  assert.equal(direct, 206);

  // Cross-line transfer ride: Vanaz -> PCMC (via Civil Court interchange)
  // adds 25 kcal transfer walk: 45 + 25 + 15 * 12 = 250 kcal
  const transfer = calculateJourneyCalories({
    kilometers: 15.0,
    from: 'vanaz',
    to: 'pcmc',
    stationIds: ['vanaz', 'ideal-colony', 'nal-stop', 'garware-college', 'deccan-gymkhana', 'chhatrapati-sambhaji-udyan', 'pmc', 'civil-court', 'shivajinagar', 'pcmc'],
  });
  assert.equal(transfer, 250);
});

test('calculateBurnSummary accurately handles real journeys and honest zero state', () => {
  // Zero state
  const empty = calculateBurnSummary([]);
  assert.equal(empty.calories, 0);
  assert.equal(empty.walkingKmEquivalent, 0);
  assert.equal(empty.flightOfStairsEquivalent, 0);
  assert.equal(empty.co2SavedKg, 0);
  assert.equal(empty.petrolSavedLiters, 0);

  // Active commute: 2 rides
  const mockJourneys = [
    {
      id: '1',
      from: 'pcmc',
      to: 'civil-court',
      kilometers: 10,
      co2Kg: 0.8,
      points: 50,
      stationIds: ['pcmc', 'civil-court'],
    },
    {
      id: '2',
      from: 'civil-court',
      to: 'vanaz',
      kilometers: 8,
      co2Kg: 0.64,
      points: 30,
      stationIds: ['civil-court', 'vanaz'],
    },
  ];

  const summary = calculateBurnSummary(mockJourneys);
  assert.ok(summary.calories > 0);
  assert.equal(summary.co2SavedKg, 1.44);
  assert.ok(summary.walkingKmEquivalent > 0);
  assert.ok(summary.flightOfStairsEquivalent > 0);
  assert.ok(summary.petrolSavedLiters > 0);
});

test('getEnrichedSampleLeague provides complete demo entries with burn metrics', () => {
  const sampleBoard = getEnrichedSampleLeague();
  assert.equal(sampleBoard.length, 6);
  for (const entry of sampleBoard) {
    assert.equal(entry.sample, true);
    assert.ok(entry.points > 0);
    assert.ok(entry.caloriesBurned > 0);
    assert.ok(entry.co2SavedKg > 0);
    assert.ok(entry.ridesCount >= 1);
  }

  // Aarav should lead sample board by points and calories
  const aarav = sampleBoard.find(e => e.id === 'sample-aarav');
  assert.ok(aarav);
  assert.equal(aarav.points, 240);
  assert.equal(aarav.caloriesBurned, 580);
});

test('calculateUserEntry derives honest user profile and handles blank name', () => {
  const mockJourneys = [
    {
      id: '1',
      from: 'pcmc',
      to: 'civil-court',
      kilometers: 10,
      co2Kg: 0.8,
      points: 50,
      stationIds: ['pcmc', 'civil-court'],
    },
  ];

  const withName = calculateUserEntry('  Priya  ', 50, mockJourneys, 'purple');
  assert.equal(withName.id, 'you');
  assert.equal(withName.name, 'Priya');
  assert.equal(withName.sample, false);
  assert.equal(withName.points, 50);
  assert.equal(withName.ridesCount, 1);
  assert.equal(withName.co2SavedKg, 0.8);

  const fallback = calculateUserEntry('   ', 0, [], 'aqua');
  assert.equal(fallback.name, 'You');
  assert.equal(fallback.points, 0);
  assert.equal(fallback.caloriesBurned, 0);
});

test('rankByMetric sorts deterministically across xp, calories, and eco with stable ties', () => {
  const entries = [
    { id: '1', name: 'Zoe', points: 100, caloriesBurned: 300, co2SavedKg: 2.0, sample: true, line: 'purple', ridesCount: 3 },
    { id: '2', name: 'Alice', points: 100, caloriesBurned: 300, co2SavedKg: 2.0, sample: true, line: 'aqua', ridesCount: 3 },
    { id: '3', name: 'Bob', points: 150, caloriesBurned: 250, co2SavedKg: 1.5, sample: true, line: 'purple', ridesCount: 2 },
    { id: '4', name: 'Charlie', points: 80, caloriesBurned: 400, co2SavedKg: 3.5, sample: true, line: 'aqua', ridesCount: 4 },
  ];

  // Rank by XP: Bob (150) -> Alice (100) -> Zoe (100) -> Charlie (80)
  const byXp = rankByMetric(entries, 'xp');
  assert.equal(byXp[0].id, '3'); // Bob
  assert.equal(byXp[1].name, 'Alice'); // tie break Alice vs Zoe
  assert.equal(byXp[2].name, 'Zoe');
  assert.equal(byXp[3].id, '4'); // Charlie

  // Rank by Calories: Charlie (400) -> Alice (300) -> Zoe (300) -> Bob (250)
  const byCalories = rankByMetric(entries, 'calories');
  assert.equal(byCalories[0].id, '4'); // Charlie
  assert.equal(byCalories[1].name, 'Alice');
  assert.equal(byCalories[2].name, 'Zoe');
  assert.equal(byCalories[3].id, '3'); // Bob

  // Rank by Eco: Charlie (3.5) -> Alice (2.0) -> Zoe (2.0) -> Bob (1.5)
  const byEco = rankByMetric(entries, 'eco');
  assert.equal(byEco[0].id, '4');
  assert.equal(byEco[1].name, 'Alice');
  assert.equal(byEco[2].name, 'Zoe');
  assert.equal(byEco[3].id, '3');
});

test('calculateRivalMatchup generates actionable head-to-head competition insight', () => {
  const board = [
    { id: '1', name: 'Aarav', points: 240, caloriesBurned: 580, co2SavedKg: 4.2, sample: true, line: 'purple', ridesCount: 6 },
    { id: 'you', name: 'You', points: 180, caloriesBurned: 430, co2SavedKg: 3.1, sample: false, line: 'purple', ridesCount: 4 },
    { id: '2', name: 'Neha', points: 90, caloriesBurned: 210, co2SavedKg: 1.6, sample: true, line: 'purple', ridesCount: 2 },
  ];

  // Behind Aarav in XP
  const xpMatch = calculateRivalMatchup(board[1], board, 'xp');
  assert.equal(xpMatch.isTopRank, false);
  assert.equal(xpMatch.rivalName, 'Aarav');
  assert.equal(xpMatch.rivalRank, 1);
  assert.equal(xpMatch.scoreDeficit, 60);
  assert.equal(xpMatch.targetUnit, 'XP');
  assert.match(xpMatch.recommendation, /Earn 60 more XP/);

  // Behind Aarav in Calories
  const calMatch = calculateRivalMatchup(board[1], board, 'calories');
  assert.equal(calMatch.scoreDeficit, 150);
  assert.equal(calMatch.targetUnit, 'kcal');
  assert.match(calMatch.recommendation, /Burn 150 more kcal/);

  // User is #1
  const leaderBoard = [board[1], board[0], board[2]];
  const leaderMatch = calculateRivalMatchup(leaderBoard[0], leaderBoard, 'calories');
  assert.equal(leaderMatch.isTopRank, true);
  assert.equal(leaderMatch.userRank, 1);
  assert.match(leaderMatch.recommendation, /leading this league/);
});

test('calculateLevelProgress calculates levels, bounds and perks accurately', () => {
  const zero = calculateLevelProgress(0);
  assert.equal(zero.level, 1);
  assert.equal(zero.progressInLevel, 0);
  assert.equal(zero.percent, 0);
  assert.equal(zero.xpToNextLevel, 100);
  assert.equal(zero.nextLevel, 2);
  assert.equal(zero.title, 'Explorer Rookie');

  const fifty = calculateLevelProgress(50);
  assert.equal(fifty.level, 1);
  assert.equal(fifty.progressInLevel, 50);
  assert.equal(fifty.percent, 50);
  assert.equal(fifty.xpToNextLevel, 50);

  const ninetyNine = calculateLevelProgress(99);
  assert.equal(ninetyNine.level, 1);
  assert.equal(ninetyNine.progressInLevel, 99);
  assert.equal(ninetyNine.percent, 99);
  assert.equal(ninetyNine.xpToNextLevel, 1);

  const hundred = calculateLevelProgress(100);
  assert.equal(hundred.level, 2);
  assert.equal(hundred.progressInLevel, 0);
  assert.equal(hundred.percent, 0);
  assert.equal(hundred.title, 'Corridor Commuter');

  const master = calculateLevelProgress(450);
  assert.equal(master.level, 5);
  assert.equal(master.title, 'Master Transit Legend');
});
