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

const { calculateCleanAirMetrics } = require(path.join(__dirname, 'cleanAirSavings.ts'));

test('calculateCleanAirMetrics handles honest zero state', () => {
  const metrics = calculateCleanAirMetrics([]);
  assert.equal(metrics.totalKm, 0);
  assert.equal(metrics.fuelSavedLiters, 0);
  assert.equal(metrics.fuelExpenseSavedRupees, 0);
  assert.equal(metrics.co2PreventedKg, 0);
  assert.equal(metrics.pm25PreventedGrams, 0);
  assert.equal(metrics.treesAbsorptionEquivalent, 0);
  assert.equal(metrics.roadMinutesSaved, 0);
  assert.equal(metrics.ecoTier, 'seedling');
  assert.equal(metrics.topEcoCorridor, 'None logged yet');
  assert.match(metrics.accessibilitySummary, /0 km/);
});

test('calculateCleanAirMetrics computes realistic environmental savings', () => {
  // 50 km total travel on Pune Metro
  const journeys = [
    { id: '1', from: 'pcmc', to: 'civil-court', kilometers: 20 },
    { id: '2', from: 'civil-court', to: 'pcmc', kilometers: 20 },
    { id: '3', from: 'vanaz', to: 'civil-court', kilometers: 10 },
  ];

  const metrics = calculateCleanAirMetrics(journeys);
  assert.equal(metrics.totalKm, 50);

  // 50 km / 20 km/L = 2.5 L petrol saved
  assert.equal(metrics.fuelSavedLiters, 2.5);

  // 2.5 L * ₹105 = ₹263 saved
  assert.equal(metrics.fuelExpenseSavedRupees, 263);

  // 50 km * 0.12 = 6 kg CO2 prevented
  assert.equal(metrics.co2PreventedKg, 6);

  // 50 km * 0.15 = 7.5 g PM2.5 prevented
  assert.equal(metrics.pm25PreventedGrams, 7.5);

  // 6 kg / 22 kg per tree = ~0.3 tree-years
  assert.equal(metrics.treesAbsorptionEquivalent, 0.3);

  // 50 km * 2.2 = 110 minutes saved in road traffic
  assert.equal(metrics.roadMinutesSaved, 110);

  // 6 kg CO2 is between 5 and 15 kg -> 'sapling'
  assert.equal(metrics.ecoTier, 'sapling');
  assert.equal(metrics.ecoTierTitle, 'Sapling Commuter');

  // Top corridor: PCMC ↔ Civil Court (40 km vs 10 km)
  assert.match(metrics.topEcoCorridor, /(PCMC.*Civil Court|Civil Court.*PCMC)/);
});

test('calculateCleanAirMetrics advances tiers to forest guardian at high mileage', () => {
  // 350 km on Pune Metro -> 42 kg CO2 prevented (>= 35 kg)
  const journeys = [
    { id: '1', from: 'pcmc', to: 'swargate', kilometers: 350 },
  ];

  const metrics = calculateCleanAirMetrics(journeys);
  assert.equal(metrics.totalKm, 350);
  assert.equal(metrics.co2PreventedKg, 42);
  assert.equal(metrics.ecoTier, 'forest_guardian');
  assert.equal(metrics.ecoTierTitle, 'Urban Forest Legend');
  assert.ok(metrics.treesAbsorptionEquivalent >= 1.5);
});
