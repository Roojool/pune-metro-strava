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
  calculateGreenTraction,
  PUNE_SOLAR_STATIONS,
} = require(path.join(__dirname, 'greenTraction.ts'));

test('calculateGreenTraction handles honest zero state with empty journeys', () => {
  const summary = calculateGreenTraction([]);
  assert.equal(summary.cleanTractionKwh, 0);
  assert.equal(summary.solarSolarKwh, 0);
  assert.equal(summary.regenerativeBrakingKwh, 0);
  assert.equal(summary.solarBulbHours, 0);
  assert.equal(summary.solarTractionTier, 'solar_sprout');
  assert.equal(summary.tierTitle, 'Solar Sprout');
  assert.equal(summary.solarStationsVisitedCount, 0);
  assert.match(summary.shareableSolarText, /No rides logged yet/);
});

test('calculateGreenTraction computes clean energy and detects solar stations', () => {
  const journeys = [
    {
      id: '1',
      from: 'pcmc',
      to: 'civil-court',
      kilometers: 14.2,
      stationIds: ['pcmc', 'sant-tukaram-nagar', 'bhosari', 'civil-court'],
      at: '2026-10-24T03:30:00Z',
    },
    {
      id: '2',
      from: 'vanaz',
      to: 'civil-court',
      kilometers: 9.8,
      stationIds: ['vanaz', 'anand-nagar', 'garware-college', 'civil-court'],
      at: '2026-10-24T12:00:00Z',
    },
  ];

  const summary = calculateGreenTraction(journeys);
  // Total km = 24.0. Clean traction = 24 * 0.08 = 1.92 kWh. Solar = 1.92 * 0.65 = 1.25 kWh
  assert.equal(summary.cleanTractionKwh, 1.92);
  assert.equal(summary.solarSolarKwh, 1.25);
  assert.ok(summary.regenerativeBrakingKwh > 0.3);
  assert.ok(summary.solarBulbHours >= 120);

  // Solar stations visited: sant-tukaram-nagar, bhosari, vanaz, anand-nagar, garware-college = all 5
  assert.equal(summary.solarStationsVisitedCount, 5);
  assert.ok(summary.gridIndependenceScore > 50);
});

test('calculateGreenTraction unlocks PV Pioneer tier at 2.0+ kWh solar', () => {
  const journeys = [
    {
      id: '1',
      from: 'pcmc',
      to: 'swargate',
      kilometers: 25.0,
      stationIds: ['pcmc', 'sant-tukaram-nagar', 'swargate'],
      at: '2026-10-24T03:30:00Z',
    },
    {
      id: '2',
      from: 'swargate',
      to: 'pcmc',
      kilometers: 25.0,
      stationIds: ['swargate', 'bhosari', 'pcmc'],
      at: '2026-10-24T12:00:00Z',
    },
  ];

  // 50 km * 0.08 = 4.0 kWh traction. 4.0 * 0.65 = 2.6 kWh solar
  const summary = calculateGreenTraction(journeys);
  assert.equal(summary.solarTractionTier, 'pv_pioneer');
  assert.equal(summary.tierTitle, 'Photovoltaic Pioneer');
  assert.ok(summary.progressPercent > 0);
  assert.ok(summary.regenerativeBrakingKwh >= 0.7);
});

test('calculateGreenTraction achieves Renewable Traction Maestro at 15+ kWh solar', () => {
  const journeys = Array.from({ length: 15 }, (_, i) => ({
    id: `ride-${i}`,
    from: 'pcmc',
    to: 'swargate',
    kilometers: 20.0,
    at: `2026-10-0${(i % 9) + 1}T03:30:00Z`,
  }));

  // 15 * 20 km = 300 km. 300 * 0.08 = 24 kWh traction. 24 * 0.65 = 15.6 kWh solar
  const summary = calculateGreenTraction(journeys);
  assert.equal(summary.solarTractionTier, 'traction_maestro');
  assert.equal(summary.tierTitle, 'Renewable Traction Maestro');
  assert.ok(summary.solarBulbHours >= 1500);
  assert.match(summary.solarTractionTip, /Supercharged green transit/);
});

test('calculateGreenTraction verifies all solar station array specs', () => {
  assert.equal(PUNE_SOLAR_STATIONS.length, 5);
  for (const st of PUNE_SOLAR_STATIONS) {
    assert.ok(st.stationId);
    assert.ok(st.name);
    assert.ok(st.marathiName);
    assert.ok(st.solarCapacityKwp >= 100);
    assert.ok(st.annualSolarYieldMwh >= 150);
  }
});
