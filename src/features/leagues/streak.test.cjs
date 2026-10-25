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
  calculateActiveBurnStreak,
  calculateRivalDuel,
  calculateUserEntry,
} = require(path.join(__dirname, 'scoring.ts'));

test('calculateActiveBurnStreak generates accurate 14-day matrix and streak stats', () => {
  const now = new Date('2026-10-24T12:00:00Z'); // 17:30 IST on Oct 24

  // Empty journeys
  const emptySummary = calculateActiveBurnStreak([], now);
  assert.equal(emptySummary.currentStreak, 0);
  assert.equal(emptySummary.longestStreak, 0);
  assert.equal(emptySummary.activeStreakDays, 0);
  assert.equal(emptySummary.shieldActive, false);
  assert.equal(emptySummary.twoWeekMatrix.length, 14);
  assert.equal(emptySummary.twoWeekMatrix[13].isToday, true);
  assert.equal(emptySummary.twoWeekMatrix[13].isActive, false);

  // Journeys: today (Oct 24) and yesterday (Oct 23)
  const activeJourneys = [
    {
      id: 'j-today',
      from: 'pcmc',
      to: 'civil-court',
      kilometers: 13.4,
      at: '2026-10-24T06:00:00Z', // 11:30 IST today
    },
    {
      id: 'j-yesterday',
      from: 'vanaz',
      to: 'civil-court',
      kilometers: 8.5,
      at: '2026-10-23T08:00:00Z', // 13:30 IST yesterday
    },
    {
      id: 'j-2daysago',
      from: 'nal-stop',
      to: 'civil-court',
      kilometers: 5.5,
      at: '2026-10-22T08:00:00Z', // 13:30 IST 2 days ago
    },
  ];

  const streakSummary = calculateActiveBurnStreak(activeJourneys, now);
  assert.equal(streakSummary.currentStreak, 3);
  assert.equal(streakSummary.longestStreak, 3);
  assert.equal(streakSummary.activeStreakDays, 3);
  assert.equal(streakSummary.shieldActive, false); // Today is already active!
  assert.match(streakSummary.streakStatusText, /Streak locked in for today!/);

  // Today dot in matrix is active
  const todayEntry = streakSummary.twoWeekMatrix[13];
  assert.equal(todayEntry.isToday, true);
  assert.equal(todayEntry.isActive, true);
  assert.ok(todayEntry.calories > 100);

  // Shield Case: active yesterday, but no ride yet today
  const pendingTodayJourneys = [
    {
      id: 'j-yesterday',
      from: 'vanaz',
      to: 'civil-court',
      kilometers: 8.5,
      at: '2026-10-23T08:00:00Z', // yesterday
    },
  ];

  const pendingSummary = calculateActiveBurnStreak(pendingTodayJourneys, now);
  assert.equal(pendingSummary.currentStreak, 1);
  assert.equal(pendingSummary.shieldActive, true);
  assert.match(pendingSummary.streakStatusText, /Ride today before midnight IST to protect your 1-day/);
});

test('calculateRivalDuel computes head-to-head calorie gap, flights of stairs, and duel insights', () => {
  const user = calculateUserEntry('You', 100, [], 'purple');
  user.caloriesBurned = 350;

  // Case 1: Rival leads (Aarav with 580 kcal)
  const rivalAarav = {
    id: 'sample-aarav',
    name: 'Aarav Sharma',
    points: 260,
    sample: true,
    line: 'purple',
    caloriesBurned: 580,
    co2SavedKg: 4.2,
    ridesCount: 6,
  };

  const duelBehind = calculateRivalDuel(user, rivalAarav);
  assert.equal(duelBehind.userLeads, false);
  assert.equal(duelBehind.calorieGap, 230); // 580 - 350
  assert.equal(duelBehind.stairFlightsToBridge, Math.round(230 / 3.5)); // ~66 flights
  assert.equal(duelBehind.kmToBridge, Math.round((230 / 65) * 10) / 10); // ~3.5 km
  assert.match(duelBehind.duelInsight, /Burn 230 more kcal.*to overtake Aarav Sharma/);

  // Case 2: User leads (Kabir with 110 kcal)
  const rivalKabir = {
    id: 'sample-kabir',
    name: 'Kabir Patel',
    points: 80,
    sample: true,
    line: 'purple',
    caloriesBurned: 110,
    co2SavedKg: 0.8,
    ridesCount: 1,
  };

  const duelAhead = calculateRivalDuel(user, rivalKabir);
  assert.equal(duelAhead.userLeads, true);
  assert.equal(duelAhead.calorieGap, -240);
  assert.match(duelAhead.duelInsight, /Leading Kabir Patel by \+240 kcal/);

  // Case 3: Dead heat / tie
  const rivalTied = {
    ...rivalKabir,
    caloriesBurned: 350,
  };
  const duelTied = calculateRivalDuel(user, rivalTied);
  assert.equal(duelTied.userLeads, true);
  assert.equal(duelTied.calorieGap, 0);
  assert.match(duelTied.duelInsight, /Dead heat!/);
});
