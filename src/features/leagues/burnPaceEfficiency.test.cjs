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

const { calculateBurnPaceEfficiency } = require(path.join(__dirname, 'burnPaceEfficiency.ts'));

test('calculateBurnPaceEfficiency handles honest zero state', () => {
  const summary = calculateBurnPaceEfficiency([]);
  assert.equal(summary.totalDistanceKm, 0);
  assert.equal(summary.totalDurationMinutes, 0);
  assert.equal(summary.averageSpeedKmh, 0);
  assert.equal(summary.averagePaceMinPerKm, 0);
  assert.equal(summary.burnRateKcalPerKm, 0);
  assert.equal(summary.efficiencyRatingTitle, 'Pace Explorer');
  assert.match(summary.accessibilityDescription, /0 km/);
});

test('calculateBurnPaceEfficiency calculates speed, pace, and burn density accurately', () => {
  const journeys = [
    // Ride 1: 15 km in 30 minutes
    {
      id: '1',
      from: 'pcmc',
      to: 'civil-court',
      kilometers: 15,
      minutes: 30,
    },
    // Ride 2: 15 km in 30 minutes
    {
      id: '2',
      from: 'civil-court',
      to: 'pcmc',
      kilometers: 15,
      minutes: 30,
    },
  ];

  const summary = calculateBurnPaceEfficiency(journeys);
  assert.equal(summary.totalDistanceKm, 30);
  assert.equal(summary.totalDurationMinutes, 60);

  // 30 km / 1 hour = 30 km/h
  assert.equal(summary.averageSpeedKmh, 30);

  // 60 minutes / 30 km = 2.0 min/km
  assert.equal(summary.averagePaceMinPerKm, 2.0);

  // Road comparison: 4.0 min/km vs 2.0 min/km = 2.0x faster
  assert.equal(summary.timeSavingsMultiplier, 2.0);

  // Calories: each journey ~45 baseline + 15*12 = 225 kcal -> total 450 kcal
  // 450 kcal / 30 km = 15 kcal/km
  assert.equal(summary.burnRateKcalPerKm, 15);
  // 450 kcal / 60 min = 7.5 kcal/min
  assert.equal(summary.burnRateKcalPerMinute, 7.5);

  assert.equal(summary.efficiencyRatingTitle, 'Express Transit Sprinter');
});

test('calculateBurnPaceEfficiency handles journeys without explicit minutes', () => {
  const journeys = [
    {
      id: '1',
      from: 'vanaz',
      to: 'ramwadi',
      kilometers: 10,
    },
  ];

  const summary = calculateBurnPaceEfficiency(journeys);
  assert.equal(summary.totalDistanceKm, 10);
  assert.ok(summary.totalDurationMinutes > 0);
  assert.ok(summary.averageSpeedKmh > 0);
  assert.ok(summary.burnRateKcalPerKm > 0);
});
