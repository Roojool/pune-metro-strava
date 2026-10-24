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
  calculateTreeOffset,
  PUNE_NATIVE_TREES,
} = require(path.join(__dirname, 'treeOffset.ts'));

test('calculateTreeOffset handles honest zero state with empty journeys', () => {
  const summary = calculateTreeOffset([]);
  assert.equal(summary.kgCo2Saved, 0);
  assert.equal(summary.treeYearsSequestered, 0);
  assert.equal(summary.treeDaysSequestered, 0);
  assert.equal(summary.oxygenGeneratedLiters, 0);
  assert.equal(summary.biodiversityScore, 0);
  assert.equal(summary.activeTier, 'sapling');
  assert.equal(summary.tierTitle, 'Peepal Sapling');
  assert.equal(summary.featuredTree.id, 'peepal');
  assert.match(summary.shareableTreeText, /No journeys logged yet/);
});

test('calculateTreeOffset computes accurate metrics for light commute', () => {
  const journeys = [
    {
      id: '1',
      from: 'pcmc',
      to: 'civil-court',
      kilometers: 14.2,
      at: '2026-10-24T03:30:00Z',
    },
    {
      id: '2',
      from: 'civil-court',
      to: 'vanaz',
      kilometers: 9.8,
      at: '2026-10-24T12:00:00Z',
    },
  ];

  const summary = calculateTreeOffset(journeys);
  // Total km = 24.0. CO2 = 14.2*0.132 + 9.8*0.132 = 1.87 + 1.29 = 3.16 kg
  assert.ok(summary.kgCo2Saved > 3.0 && summary.kgCo2Saved < 3.5);
  assert.equal(summary.activeTier, 'sapling');
  assert.ok(summary.treeDaysSequestered > 40 && summary.treeDaysSequestered < 65);
  assert.ok(summary.oxygenGeneratedLiters > 2000);
  assert.ok(summary.biodiversityScore > 0);
  assert.match(summary.shareableTreeText, /Pune Metro Strava/);
});

test('calculateTreeOffset unlocks Grove tier between 5 and 15 kg CO2', () => {
  const journeys = [
    {
      id: '1',
      from: 'pcmc',
      to: 'swargate',
      co2Kg: 3.5,
      kilometers: 17,
      at: '2026-10-20T03:30:00Z',
    },
    {
      id: '2',
      from: 'swargate',
      to: 'pcmc',
      co2Kg: 3.5,
      kilometers: 17,
      at: '2026-10-21T03:30:00Z',
    },
  ];

  const summary = calculateTreeOffset(journeys);
  assert.equal(summary.kgCo2Saved, 7.0);
  assert.equal(summary.activeTier, 'grove');
  assert.equal(summary.tierTitle, 'Neem Grove Contributor');
  assert.equal(summary.featuredTree.id, 'tamarind');
  assert.ok(summary.treeDaysSequestered > 100);
});

test('calculateTreeOffset unlocks Western Ghats Biosphere Patron for high mileage', () => {
  const journeys = Array.from({ length: 20 }, (_, idx) => ({
    id: `ride-${idx}`,
    from: 'pcmc',
    to: 'swargate',
    co2Kg: 3.5,
    kilometers: 17,
    at: `2026-10-0${(idx % 9) + 1}T03:30:00Z`,
  }));

  // 20 rides * 3.5 kg = 70 kg CO2 saved
  const summary = calculateTreeOffset(journeys);
  assert.equal(summary.kgCo2Saved, 70.0);
  assert.equal(summary.activeTier, 'biosphere_patron');
  assert.equal(summary.tierTitle, 'Western Ghats Biosphere Patron');
  assert.equal(summary.featuredTree.id, 'banyan');
  assert.ok(summary.treesAdoptedCount >= 3);
  assert.ok(summary.oxygenGeneratedLiters >= 50000);
  assert.match(summary.ecologicalTip, /Remarkable impact/);
});

test('calculateTreeOffset verifies all native Pune tree definitions', () => {
  const trees = Object.values(PUNE_NATIVE_TREES);
  assert.equal(trees.length, 5);
  for (const tree of trees) {
    assert.ok(tree.id);
    assert.ok(tree.name);
    assert.ok(tree.marathiName);
    assert.ok(tree.botanicalName);
    assert.ok(tree.annualCo2AbsorptionKg > 15);
    assert.ok(tree.puneHabitat.length > 5);
  }
});
