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

const { calculateHabitMultiplier } = require(path.join(__dirname, 'habitScoring.ts'));

test('calculateHabitMultiplier handles baseline with no streak on a weekday', () => {
  // Wednesday 2026-10-21 (getDay() = 3)
  const wednesday = new Date('2026-10-21T12:00:00Z');
  const info0 = calculateHabitMultiplier(0, wednesday);
  assert.equal(info0.effectiveMultiplier, 1.0);
  assert.equal(info0.streakMultiplier, 1.0);
  assert.equal(info0.isWeekend, false);
  assert.equal(info0.bonusPercentageText, 'Standard Scoring Rate');

  const info1 = calculateHabitMultiplier(1, wednesday);
  assert.equal(info1.effectiveMultiplier, 1.0);
});

test('calculateHabitMultiplier scales streak bonuses for 2, 3, and 5+ active days', () => {
  const wednesday = new Date('2026-10-21T12:00:00Z');

  const info2 = calculateHabitMultiplier(2, wednesday);
  assert.equal(info2.streakMultiplier, 1.05);
  assert.equal(info2.effectiveMultiplier, 1.05);
  assert.match(info2.bonusPercentageText, /\+5% Habit Bonus Active/);

  const info3 = calculateHabitMultiplier(3, wednesday);
  assert.equal(info3.streakMultiplier, 1.1);
  assert.equal(info3.effectiveMultiplier, 1.1);
  assert.match(info3.bonusPercentageText, /\+10% Habit Bonus Active/);

  const info5 = calculateHabitMultiplier(5, wednesday);
  assert.equal(info5.streakMultiplier, 1.15);
  assert.equal(info5.effectiveMultiplier, 1.15);
  assert.match(info5.bonusPercentageText, /\+15% Habit Bonus Active/);
});

test('calculateHabitMultiplier awards weekend transit bonus and enforces 1.25x cap', () => {
  // Saturday 2026-10-24 (getDay() = 6)
  const saturday = new Date('2026-10-24T12:00:00Z');
  const infoWeekend = calculateHabitMultiplier(0, saturday);
  assert.equal(infoWeekend.isWeekend, true);
  assert.equal(infoWeekend.weekendBonusMultiplier, 1.1);
  assert.equal(infoWeekend.effectiveMultiplier, 1.1);
  assert.match(infoWeekend.bonusPercentageText, /\+10% Habit Bonus Active/);

  // 5-day streak on Saturday: 1.15 * 1.1 = 1.265, but must be clamped at 1.25 max
  const infoCapped = calculateHabitMultiplier(5, saturday);
  assert.equal(infoCapped.effectiveMultiplier, 1.25);
  assert.match(infoCapped.bonusPercentageText, /\+25% Habit Bonus Active/);
  assert.match(infoCapped.fairPlayNotice, /1.25x/);
});
