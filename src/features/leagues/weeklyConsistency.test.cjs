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
  getIstDayOfWeek,
  calculateWeeklyConsistency,
} = require(path.join(__dirname, 'weeklyConsistency.ts'));

test('getIstDayOfWeek converts UTC timestamps accurately to IST day of week', () => {
  // Sunday 2026-10-18 20:00 UTC is Monday 2026-10-19 01:30 IST -> Day 1 (Mon)
  assert.equal(getIstDayOfWeek('2026-10-18T20:00:00Z'), 1);

  // Wednesday 2026-10-21 12:00 UTC is Wednesday 2026-10-21 17:30 IST -> Day 3 (Wed)
  assert.equal(getIstDayOfWeek('2026-10-21T12:00:00Z'), 3);

  // Saturday 2026-10-24 08:00 UTC is Saturday 2026-10-24 13:30 IST -> Day 6 (Sat)
  assert.equal(getIstDayOfWeek('2026-10-24T08:00:00Z'), 6);

  // Invalid date fallback
  assert.equal(getIstDayOfWeek('invalid'), 1);
});

test('calculateWeeklyConsistency handles empty journey array', () => {
  const profile = calculateWeeklyConsistency([]);
  assert.equal(profile.totalWeekRides, 0);
  assert.equal(profile.totalWeekCalories, 0);
  assert.equal(profile.weekdayRides, 0);
  assert.equal(profile.weekendRides, 0);
  assert.equal(profile.personaType, 'station_newcomer');
  assert.equal(profile.consistencyScore, 0);
  assert.equal(profile.peakDayName, 'None');
  assert.equal(profile.days.length, 7);
  assert.match(profile.accessibilityDescription, /Station Newcomer/);
});

test('calculateWeeklyConsistency classifies daily tech commuter profile', () => {
  // 5 rides on Monday, Tuesday, Wednesday, Thursday, Friday (all weekdays)
  const journeys = [
    { id: '1', date: '2026-10-19T04:00:00Z', from: 'pcmc', to: 'civil-court', kilometers: 10 }, // Mon
    { id: '2', date: '2026-10-20T04:00:00Z', from: 'pcmc', to: 'civil-court', kilometers: 10 }, // Tue
    { id: '3', date: '2026-10-21T04:00:00Z', from: 'pcmc', to: 'civil-court', kilometers: 10 }, // Wed
    { id: '4', date: '2026-10-22T04:00:00Z', from: 'pcmc', to: 'civil-court', kilometers: 10 }, // Thu
    { id: '5', date: '2026-10-23T04:00:00Z', from: 'pcmc', to: 'civil-court', kilometers: 10 }, // Fri
  ];

  const profile = calculateWeeklyConsistency(journeys);
  assert.equal(profile.totalWeekRides, 5);
  assert.equal(profile.weekdayRides, 5);
  assert.equal(profile.weekendRides, 0);
  assert.equal(profile.personaType, 'daily_it_commuter');
  assert.ok(profile.consistencyScore >= 70);
  assert.ok(profile.projectedMonthlyCalories > 0);
  assert.ok(profile.projectedMonthlyCo2Kg > 0);
});

test('calculateWeeklyConsistency classifies weekend explorer profile', () => {
  // 3 rides on Saturday and Sunday
  const journeys = [
    { id: '1', date: '2026-10-24T05:00:00Z', from: 'vanaz', to: 'ramwadi', kilometers: 12 }, // Sat
    { id: '2', date: '2026-10-24T12:00:00Z', from: 'ramwadi', to: 'vanaz', kilometers: 12 }, // Sat
    { id: '3', date: '2026-10-25T08:00:00Z', from: 'civil-court', to: 'ideal-colony', kilometers: 6 }, // Sun
  ];

  const profile = calculateWeeklyConsistency(journeys);
  assert.equal(profile.totalWeekRides, 3);
  assert.equal(profile.weekdayRides, 0);
  assert.equal(profile.weekendRides, 3);
  assert.equal(profile.personaType, 'weekend_explorer');
  assert.equal(profile.peakDayName, 'Saturday');
});
