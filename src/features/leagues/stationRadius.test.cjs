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
  calculateStationRadius,
} = require(path.join(__dirname, 'stationRadius.ts'));

test('calculateStationRadius handles honest zero state with empty journeys', () => {
  const summary = calculateStationRadius([]);
  assert.equal(summary.totalEstimatedWalkKm, 0);
  assert.equal(summary.totalWalkSteps, 0);
  assert.equal(summary.firstLastMileBurnKcal, 0);
  assert.equal(summary.activeCommuteMultiplier, 1.0);
  assert.equal(summary.unlockedCatchmentsCount, 0);
  assert.equal(summary.totalCatchments, 6);
  assert.equal(summary.topWalkableHub, 'None logged yet');
  assert.equal(summary.pedestrianPersona, 'Emerging Pedestrian');
  assert.match(summary.shareableRadiusText, /No rides logged yet/);
  assert.match(summary.accessibilityDescription, /No journeys logged yet/);

  for (const c of summary.catchments) {
    assert.equal(c.isUnlocked, false);
    assert.equal(c.visitCount, 0);
  }
});

test('calculateStationRadius calculates walking distance and unlocks catchments', () => {
  const journeys = [
    // Ride 1: Deccan Gymkhana to Sambhaji Udyan (2 visits to Deccan catchment)
    {
      id: '1',
      fromStationId: 'deccan-gymkhana',
      toStationId: 'sambhaji-udyan',
      line: 'aqua',
    },
    // Ride 2: PMC to Mandai (2 visits to Peth catchment)
    {
      id: '2',
      fromStationId: 'pmc',
      toStationId: 'mandai',
      line: 'purple',
    },
  ];

  const summary = calculateStationRadius(journeys);

  // 2 rides = ~2.6 km walked, ~3,400 steps, +130 kcal extra burn
  assert.equal(summary.totalEstimatedWalkKm, 2.6);
  assert.equal(summary.totalWalkSteps, 3400);
  assert.equal(summary.firstLastMileBurnKcal, 130);
  assert.equal(summary.activeCommuteMultiplier, 2.3);

  // Both Deccan and Peth should be unlocked
  const deccan = summary.catchments.find((c) => c.id === 'deccan-fc-road');
  assert.ok(deccan);
  assert.equal(deccan.isUnlocked, true);
  assert.equal(deccan.visitCount, 2);
  assert.equal(deccan.totalKmWalked, 1.6); // 2 * 800m = 1.6 km

  const peth = summary.catchments.find((c) => c.id === 'peth-heritage');
  assert.ok(peth);
  assert.equal(peth.isUnlocked, true);
  assert.equal(peth.visitCount, 2);
  assert.equal(peth.totalKmWalked, 1.5); // 2 * 750m = 1.5 km

  assert.equal(summary.unlockedCatchmentsCount, 2);
  assert.equal(summary.pedestrianPersona, 'Urban Neighborhood Walker');
  assert.match(summary.shareableRadiusText, /Urban Neighborhood Walker/);
});

test('calculateStationRadius elevates persona to Pune Master Flâneur at 5 unlocked catchments', () => {
  // Construct journeys visiting stations in 5 different catchments
  const journeys = [
    // Deccan (2 visits)
    { id: '1', from: 'deccan-gymkhana', to: 'sambhaji-udyan' },
    // Peth (2 visits)
    { id: '2', from: 'pmc', to: 'mandai' },
    // Civil Court (2 visits)
    { id: '3', from: 'civil-court', to: 'shivajinagar' },
    // Kalyani / KP (2 visits)
    { id: '4', from: 'kalyani-nagar', to: 'bund-garden' },
    // Karve / Kothrud (2 visits)
    { id: '5', from: 'nal-stop', to: 'ideal-colony' },
  ];

  const summary = calculateStationRadius(journeys);
  assert.equal(summary.unlockedCatchmentsCount, 5);
  assert.equal(summary.pedestrianPersona, 'Pune Master Flâneur');
  assert.equal(summary.pedestrianPersonaMarathi, 'पुणे नगर परिभ्रमण नायक');
});
