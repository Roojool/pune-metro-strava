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

const { calculatePuneReplenish } = require(path.join(__dirname, 'puneReplenish.ts'));

test('calculatePuneReplenish handles honest zero state', () => {
  const summary = calculatePuneReplenish([]);
  assert.equal(summary.totalCaloriesBurned, 0);
  assert.equal(summary.estimatedFluidLossMl, 0);
  assert.equal(summary.recommendedWaterGlasses, 0);
  assert.equal(summary.unlockedCount, 0);
  assert.equal(summary.activeRecommendation.id, 'kokum-sharbat');
  assert.equal(summary.items.length, 5);
  assert.match(summary.accessibilityDescription, /0 kcal burned/);
});

test('calculatePuneReplenish computes hydration and unlocks local food milestones', () => {
  // 1 journey of 20 km -> ~45 baseline + 20*12 = 285 kcal
  const journeys = [
    {
      id: '1',
      from: 'pcmc',
      to: 'civil-court',
      kilometers: 20,
    },
  ];

  const summary = calculatePuneReplenish(journeys);
  assert.equal(summary.totalCaloriesBurned, 285);

  // Fluid loss: 285 * 2.5 = 713 ml
  assert.equal(summary.estimatedFluidLossMl, 713);
  // Recommended glasses: 713 / 250 = ~3 glasses
  assert.equal(summary.recommendedWaterGlasses, 3);

  // 285 kcal unlocks:
  // 1. Kokum Sharbat (65 kcal) -> unlocked!
  // 2. Sugarcane Juice (140 kcal) -> unlocked!
  // Bun Maska is 290 kcal -> not quite unlocked (earnedRatio = 285/290 = 0.98)
  assert.equal(summary.unlockedCount, 2);

  const kokum = summary.items.find(i => i.id === 'kokum-sharbat');
  assert.ok(kokum);
  assert.equal(kokum.isUnlocked, true);
  assert.equal(kokum.earnedRatio, 1);

  const bunMaska = summary.items.find(i => i.id === 'bun-maska-chai');
  assert.ok(bunMaska);
  assert.equal(bunMaska.isUnlocked, false);
  assert.equal(bunMaska.earnedRatio, 0.98);

  // Active recommendation is the highest unlocked: Sugarcane juice
  assert.equal(summary.activeRecommendation.id, 'rasvanti-juice');
});

test('calculatePuneReplenish unlocks Sujata Mastani at high burn', () => {
  // 3 journeys of 20 km = ~855 kcal (> 620 kcal Sujata Mastani threshold)
  const journeys = [
    { id: '1', from: 'pcmc', to: 'civil-court', kilometers: 20 },
    { id: '2', from: 'civil-court', to: 'pcmc', kilometers: 20 },
    { id: '3', from: 'vanaz', to: 'ramwadi', kilometers: 20 },
  ];

  const summary = calculatePuneReplenish(journeys);
  assert.ok(summary.totalCaloriesBurned >= 620);
  assert.equal(summary.unlockedCount, 5); // All 5 items unlocked!
  assert.equal(summary.activeRecommendation.id, 'sujata-mastani');
});
