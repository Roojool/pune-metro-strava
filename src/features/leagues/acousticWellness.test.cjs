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
  calculateAcousticWellness,
  PUNE_QUIET_HAVENS,
} = require(path.join(__dirname, 'acousticWellness.ts'));

test('calculateAcousticWellness handles honest zero state with empty journeys', () => {
  const summary = calculateAcousticWellness([]);
  assert.equal(summary.quietTransitMinutes, 0);
  assert.equal(summary.roadNoiseMinutesAvoided, 0);
  assert.equal(summary.decibelReductionDba, 27);
  assert.equal(summary.acousticEnergyReductionPercent, 99.8);
  assert.equal(summary.peacefulZoneScore, 0);
  assert.equal(summary.acousticTier, 'acoustic_seeker');
  assert.equal(summary.tierTitle, 'Acoustic Seeker');
  assert.equal(summary.unlockedHavens.filter((h) => h.isUnlocked).length, 0);
  assert.match(summary.shareableAcousticText, /No rides logged yet/);
});

test('calculateAcousticWellness unlocks Sarasbaug and reaches Zen Commuter at 40 mins', () => {
  const journeys = [
    {
      id: '1',
      from: 'pcmc',
      to: 'civil-court',
      minutes: 22,
      at: '2026-10-24T03:30:00Z',
    },
    {
      id: '2',
      from: 'civil-court',
      to: 'vanaz',
      minutes: 18,
      at: '2026-10-24T12:00:00Z',
    },
  ];

  const summary = calculateAcousticWellness(journeys);
  assert.equal(summary.quietTransitMinutes, 40);
  assert.equal(summary.acousticTier, 'zen_commuter');
  assert.equal(summary.tierTitle, 'Zen Commuter');
  assert.ok(summary.peacefulZoneScore > 25);

  const sarasbaug = summary.unlockedHavens.find((h) => h.id === 'sarasbaug_dawn');
  assert.ok(sarasbaug);
  assert.equal(sarasbaug.isUnlocked, true);

  const osho = summary.unlockedHavens.find((h) => h.id === 'osho_teerth');
  assert.ok(osho);
  assert.equal(osho.isUnlocked, false); // needs 60 mins
});

test('calculateAcousticWellness unlocks all havens and achieves Silent Corridor Champion at 240+ mins', () => {
  const journeys = Array.from({ length: 10 }, (_, i) => ({
    id: `ride-${i}`,
    from: 'pcmc',
    to: 'swargate',
    minutes: 26,
    at: `2026-10-0${(i % 9) + 1}T03:30:00Z`,
  }));

  // 10 rides * 26 mins = 260 mins
  const summary = calculateAcousticWellness(journeys);
  assert.equal(summary.quietTransitMinutes, 260);
  assert.equal(summary.acousticTier, 'silent_corridor_champion');
  assert.equal(summary.tierTitle, 'Silent Corridor Champion');

  // All 4 havens must be unlocked
  const unlocked = summary.unlockedHavens.filter((h) => h.isUnlocked);
  assert.equal(unlocked.length, 4);
  assert.match(summary.wellnessTip, /Superb auditory recovery/);
});

test('calculateAcousticWellness verifies all Pune quiet haven specs', () => {
  assert.equal(PUNE_QUIET_HAVENS.length, 4);
  for (const haven of PUNE_QUIET_HAVENS) {
    assert.ok(haven.id);
    assert.ok(haven.name);
    assert.ok(haven.marathiName);
    assert.ok(haven.ambientDecibels <= 55);
    assert.ok(haven.unlockedAtMinutes > 0);
    assert.ok(haven.description.length > 10);
  }
});
