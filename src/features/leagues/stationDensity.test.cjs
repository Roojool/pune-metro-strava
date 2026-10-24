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

const {
  getStationPhysicalProfile,
  calculateStationDensity,
} = require(path.join(__dirname, 'stationDensity.ts'));

test('getStationPhysicalProfile returns specialized elevation metadata', () => {
  // Civil Court: Deep underground interchange
  const cc = getStationPhysicalProfile('civil-court');
  assert.equal(cc.elevationType, 'underground_interchange');
  assert.equal(cc.stairFlights, 10);
  assert.equal(cc.kcalPerVisit, 35);

  // PCMC: Elevated terminal
  const pcmc = getStationPhysicalProfile('pcmc');
  assert.equal(pcmc.elevationType, 'elevated_terminal');
  assert.equal(pcmc.stairFlights, 4);
  assert.equal(pcmc.kcalPerVisit, 24);

  // Nal Stop: Standard elevated
  const ns = getStationPhysicalProfile('nal-stop');
  assert.equal(ns.elevationType, 'elevated_standard');
  assert.equal(ns.stairFlights, 3);
  assert.equal(ns.kcalPerVisit, 20);
});

test('calculateStationDensity handles empty journey array with honest zero state', () => {
  const density = calculateStationDensity([]);
  assert.equal(density.topStations.length, 0);
  assert.equal(density.totalStationBurnKcal, 0);
  assert.match(density.accessibilityDescription, /No station visits recorded yet/);
});

test('calculateStationDensity counts boarding and destination visits and computes stairs burn', () => {
  const journeys = [
    {
      id: 'j1',
      from: 'pcmc',
      to: 'civil-court',
      kilometers: 13.4,
      points: 50,
      at: '2026-10-22T08:00:00Z',
    },
    {
      id: 'j2',
      from: 'vanaz',
      to: 'civil-court',
      kilometers: 7.5,
      points: 30,
      at: '2026-10-22T14:00:00Z',
    },
  ];

  const density = calculateStationDensity(journeys);

  // Civil Court visited twice (destination on j1, destination on j2)
  const cc = density.topStations.find(s => s.stationId === 'civil-court');
  assert.ok(cc);
  assert.equal(cc.totalVisits, 2);
  assert.equal(cc.totalBurnKcal, 70); // 2 * 35 kcal
  assert.equal(cc.estimatedStairsClimbed, 20); // 2 * 10 flights

  // PCMC visited once: 1 * 24 = 24 kcal
  const pcmc = density.topStations.find(s => s.stationId === 'pcmc');
  assert.ok(pcmc);
  assert.equal(pcmc.totalVisits, 1);
  assert.equal(pcmc.totalBurnKcal, 24);

  // Civil Court is ranked #1 because 70 > 24
  assert.equal(density.topStations[0].stationId, 'civil-court');

  // Total station burn: 70 + 24 + 24 (vanaz) = 118 kcal
  assert.equal(density.totalStationBurnKcal, 118);

  assert.match(density.accessibilityDescription, /Top active transit hub is Civil Court/);
});

test('calculateStationDensity respects line filtering for Purple Line', () => {
  const journeys = [
    {
      id: 'j1',
      from: 'pcmc',
      to: 'civil-court',
      kilometers: 13.4,
      points: 50,
      at: '2026-10-22T08:00:00Z',
    },
    {
      id: 'j2',
      from: 'vanaz',
      to: 'deccan-gymkhana',
      kilometers: 4.5,
      points: 30,
      at: '2026-10-22T14:00:00Z',
    },
  ];

  // Filter for 'purple': Vanaz and Deccan Gymkhana (Aqua) are excluded, but Civil Court (interchange) and PCMC (purple) are included
  const density = calculateStationDensity(journeys, 'purple');
  assert.ok(density.topStations.some(s => s.stationId === 'pcmc'));
  assert.ok(density.topStations.some(s => s.stationId === 'civil-court'));
  assert.ok(!density.topStations.some(s => s.stationId === 'vanaz'));
  assert.ok(!density.topStations.some(s => s.stationId === 'deccan-gymkhana'));
});
