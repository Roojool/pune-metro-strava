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

const { calculateStreakShield } = require(path.join(__dirname, 'streakShield.ts'));

test('calculateStreakShield handles honest zero state with no streak', () => {
  const summary = calculateStreakShield([], 0, new Date('2026-10-24T12:00:00Z'));
  assert.equal(summary.shieldsAvailable, 0);
  assert.equal(summary.maxShields, 2);
  assert.equal(summary.isStreakAtRisk, false);
  assert.equal(summary.shieldStatusHeadline, 'No Active Streak');
  assert.match(summary.accessibilityDescription, /0 of 2 shields/);
});

test('calculateStreakShield awards 1 shield for 3-day streak and 2 shields for 7-day streak', () => {
  const now = new Date('2026-10-24T10:00:00Z');

  // Streak = 3 -> 1 shield
  const s3 = calculateStreakShield([], 3, now);
  assert.equal(s3.shieldsAvailable, 1);

  // Streak = 5 -> 1 shield
  const s5 = calculateStreakShield([], 5, now);
  assert.equal(s5.shieldsAvailable, 1);

  // Streak = 7 -> 2 shields (capped at max)
  const s7 = calculateStreakShield([], 7, now);
  assert.equal(s7.shieldsAvailable, 2);

  // Streak = 15 -> still capped at 2 shields
  const s15 = calculateStreakShield([], 15, now);
  assert.equal(s15.shieldsAvailable, 2);
});

test('calculateStreakShield detects streak at risk when no ride logged and reset is near', () => {
  // 20:00 UTC = 1:30 AM IST (4 hours before 5:30 AM IST / 00:00 UTC reset)
  const nearMidnight = new Date('2026-10-24T20:00:00Z');

  // No rides today with 5-day streak and 1 shield available
  const summary = calculateStreakShield([], 5, nearMidnight);
  assert.equal(summary.isStreakAtRisk, true);
  assert.equal(summary.shieldsAvailable, 1);
  assert.equal(summary.shieldStatusHeadline, 'Streak Shield Ready');
  assert.match(summary.shieldStatusMessage, /automatically protect/);
});

test('calculateStreakShield confirms streak safe when ride was logged today', () => {
  const now = new Date('2026-10-24T12:00:00Z'); // Day 24 in IST
  const journeys = [
    {
      id: '1',
      date: '2026-10-24T05:00:00Z', // Today
      from: 'pcmc',
      to: 'civil-court',
      kilometers: 14,
    },
  ];

  const summary = calculateStreakShield(journeys, 4, now);
  assert.equal(summary.isStreakAtRisk, false);
  assert.equal(summary.shieldStatusHeadline, 'Streak Safe for Today');
  assert.equal(summary.shieldsAvailable, 1);
});
