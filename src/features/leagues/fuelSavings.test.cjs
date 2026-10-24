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
  calculateFuelSavings,
} = require(path.join(__dirname, 'fuelSavings.ts'));

test('calculateFuelSavings handles honest zero state with empty journeys', () => {
  const summary = calculateFuelSavings([]);
  assert.equal(summary.totalRupeesSavedVsScooter, 0);
  assert.equal(summary.totalRupeesSavedVsAuto, 0);
  assert.equal(summary.totalRupeesSavedVsCar, 0);
  assert.equal(summary.totalMetroFareSpent, 0);
  assert.equal(summary.netEconomicSavings, 0);
  assert.equal(summary.petrolLitersAvoided, 0);
  assert.equal(summary.savingsPersona, 'Budget Smart Explorer');
  assert.match(summary.shareableSavingsText, /No rides logged yet/);
  assert.match(summary.accessibilityDescription, /No rides logged yet/);
});

test('calculateFuelSavings computes scooter and auto savings accurately', () => {
  const journeys = [
    // Ride 1: 14 km (PCMC to Civil Court, fare ₹30)
    {
      id: '1',
      from: 'pcmc',
      to: 'civil-court',
      kilometers: 14,
      fare: 30,
    },
    // Ride 2: 15 km (Vanaz to Ramwadi, fare ₹30)
    {
      id: '2',
      from: 'vanaz',
      to: 'ramwadi',
      kilometers: 15,
      fare: 30,
    },
  ];

  const summary = calculateFuelSavings(journeys);

  // 29 km total
  // Petrol avoided: 29 / 35 = ~0.8 liters
  assert.equal(summary.petrolLitersAvoided, 0.8);
  assert.equal(summary.totalMetroFareSpent, 60);

  // Scooter cost: 29 * 3.5 = 101.5 -> saved vs scooter = 101.5 - 60 = 42
  assert.equal(summary.totalRupeesSavedVsScooter, 42);

  // Auto cost:
  // Ride 1 (14 km): 25 + (14 - 1.5) * 17 = 25 + 212.5 = 237.5
  // Ride 2 (15 km): 25 + (15 - 1.5) * 17 = 25 + 229.5 = 254.5
  // Total auto cost: 492 -> saved vs auto = 492 - 60 = 432
  assert.equal(summary.totalRupeesSavedVsAuto, 432);

  assert.match(summary.puneCulturalSavingEquivalent, /Goodluck/);
});

test('calculateFuelSavings unlocks Bakarwadi equivalent on higher savings volume', () => {
  // 10 journeys of 15 km each = 150 km
  const journeys = Array.from({ length: 10 }, (_, i) => ({
    id: `j-${i}`,
    from: 'vanaz',
    to: 'ramwadi',
    kilometers: 15,
    fare: 25,
  }));

  const summary = calculateFuelSavings(journeys);
  // Total fare: 250
  // Scooter cost: 150 * 3.5 = 525 -> saved = 525 - 250 = 275
  assert.equal(summary.netEconomicSavings, 275);
  assert.equal(summary.savingsPersona, 'Paisa Vasool Commuter');
  assert.equal(summary.savingsPersonaMarathi, 'पैसा वसूल प्रवासी');
  assert.match(summary.puneCulturalSavingEquivalent, /Chitale Bandhu Bakarwadi/);
});
