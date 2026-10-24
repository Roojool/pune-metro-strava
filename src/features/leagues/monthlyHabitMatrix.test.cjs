const test = require('node:test');
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
  getIstDateKey,
  calculateMonthlyHabitMatrix,
} = require(path.join(__dirname, 'monthlyHabitMatrix.ts'));

test('getIstDateKey converts timestamps to IST calendar dates', () => {
  // 2026-10-24 20:00 UTC is 2026-10-25 01:30 IST
  assert.equal(getIstDateKey('2026-10-24T20:00:00Z'), '2026-10-25');

  // 2026-10-24 10:00 UTC is 2026-10-24 15:30 IST
  assert.equal(getIstDateKey('2026-10-24T10:00:00Z'), '2026-10-24');

  // Invalid date
  assert.equal(getIstDateKey('invalid'), '');
});

test('calculateMonthlyHabitMatrix handles honest zero state', () => {
  const fixedNow = new Date('2026-10-24T12:00:00Z');
  const summary = calculateMonthlyHabitMatrix([], fixedNow);

  assert.equal(summary.monthName, 'October');
  assert.equal(summary.year, 2026);
  assert.equal(summary.totalMonthRides, 0);
  assert.equal(summary.totalMonthCalories, 0);
  assert.equal(summary.activeDaysCount, 0);
  assert.equal(summary.consistencyPercentage, 0);
  assert.equal(summary.currentStreakDays, 0);
  assert.equal(summary.longestStreakDays, 0);
  assert.equal(summary.daysInMonth, 31);
  assert.equal(summary.days.length, 31);
  assert.equal(summary.habitStatusTitle, 'Station Newcomer');
  assert.match(summary.accessibilityDescription, /0 active days/);
});

test('calculateMonthlyHabitMatrix aggregates daily activity and streak records', () => {
  // Test reference date: 2026-10-24 12:00 UTC (Day 24 in IST)
  const fixedNow = new Date('2026-10-24T12:00:00Z');

  const journeys = [
    // Oct 21: 1 ride
    { id: '1', date: '2026-10-21T05:00:00Z', from: 'pcmc', to: 'civil-court', kilometers: 14 },
    // Oct 22: 2 rides
    { id: '2', date: '2026-10-22T04:00:00Z', from: 'pcmc', to: 'civil-court', kilometers: 14 },
    { id: '3', date: '2026-10-22T13:00:00Z', from: 'civil-court', to: 'pcmc', kilometers: 14 },
    // Oct 23: 1 ride
    { id: '4', date: '2026-10-23T06:00:00Z', from: 'vanaz', to: 'ramwadi', kilometers: 15 },
    // Oct 24 (today): 1 ride
    { id: '5', date: '2026-10-24T03:00:00Z', from: 'vanaz', to: 'civil-court', kilometers: 8 },
  ];

  const summary = calculateMonthlyHabitMatrix(journeys, fixedNow);

  assert.equal(summary.totalMonthRides, 5);
  assert.equal(summary.activeDaysCount, 4);
  assert.ok(summary.totalMonthCalories > 0);

  // Oct 21, 22, 23, 24 = 4 consecutive active days ending today
  assert.equal(summary.currentStreakDays, 4);
  assert.equal(summary.longestStreakDays, 4);

  // Day 24 (today) check
  const today = summary.days[23]; // index 23 is day 24
  assert.equal(today.dayOfMonth, 24);
  assert.equal(today.isToday, true);
  assert.equal(today.isActive, true);
  assert.equal(today.ridesCount, 1);

  // 4 active days out of 24 days elapsed = 17% -> 'Occasional Explorer'
  assert.equal(summary.consistencyPercentage, 17);
  assert.equal(summary.habitStatusTitle, 'Occasional Explorer');
});
