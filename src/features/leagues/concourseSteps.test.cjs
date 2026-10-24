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
  getStationStepProfile,
  calculateConcourseSteps,
} = require(path.join(__dirname, 'concourseSteps.ts'));

test('getStationStepProfile returns accurate step counts', () => {
  const cc = getStationStepProfile('civil-court');
  assert.equal(cc.entrySteps, 420);
  assert.equal(cc.exitSteps, 380);

  const elevated = getStationStepProfile('nal-stop');
  assert.equal(elevated.entrySteps, 180);
  assert.equal(elevated.exitSteps, 160);
});

test('calculateConcourseSteps handles honest zero state', () => {
  const summary = calculateConcourseSteps([]);
  assert.equal(summary.totalEstimatedSteps, 0);
  assert.equal(summary.totalConcourseKm, 0);
  assert.equal(summary.interchangeSteps, 0);
  assert.equal(summary.averageStepsPerRide, 0);
  assert.equal(summary.puneParkLapCount, 0);
  assert.equal(summary.stepMilestoneTitle, 'Concourse Walker');
  assert.match(summary.accessibilityDescription, /0 steps logged/);
});

test('calculateConcourseSteps computes steps and handles interchange walks', () => {
  const journeys = [
    // Ride 1: PCMC (entry 240) to Civil Court (exit 380) = 620 steps
    {
      id: '1',
      from: 'pcmc',
      to: 'civil-court',
      stationIds: ['pcmc', 'civil-court'],
      kilometers: 14,
    },
    // Ride 2: PCMC (entry 240) to Ramwadi (exit 220) with Civil Court transfer (+450) = 910 steps
    {
      id: '2',
      from: 'pcmc',
      to: 'ramwadi',
      stationIds: ['pcmc', 'civil-court', 'ramwadi'],
      kilometers: 22,
    },
  ];

  const summary = calculateConcourseSteps(journeys);
  // Total steps: 620 + 910 = 1,530 steps
  assert.equal(summary.totalEstimatedSteps, 1530);
  assert.equal(summary.interchangeSteps, 450);
  assert.equal(summary.averageStepsPerRide, 765);

  // 1,530 * 0.75m / 1000 = 1.1 km
  assert.equal(summary.totalConcourseKm, 1.1);

  // 1,530 steps / 400m lap (530 steps) = 2.9 laps
  assert.equal(summary.puneParkLapCount, 2.9);
  assert.match(summary.puneParkLapEquivalent, /Deccan Gymkhana/);

  // Progress to 5K milestone: 1530 / 5000 = 0.31
  assert.equal(summary.stepMilestoneTitle, '5K Active Transit Stepper');
  assert.equal(summary.stepMilestoneProgress, 0.31);
});
