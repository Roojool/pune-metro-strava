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
  calculateTrafficRelief,
  PUNE_CHOKE_POINTS,
} = require(path.join(__dirname, 'trafficRelief.ts'));

test('calculateTrafficRelief handles honest zero state with empty journeys', () => {
  const summary = calculateTrafficRelief([]);
  assert.equal(summary.roadKmTraveledAvoided, 0);
  assert.equal(summary.trafficSignalMinutesSaved, 0);
  assert.equal(summary.roadSpaceOccupancySqMHours, 0);
  assert.equal(summary.chokePointsBypassedCount, 0);
  assert.equal(summary.decongestionTier, 'chowk_cruiser');
  assert.equal(summary.tierTitle, 'Chowk Cruiser');
  assert.match(summary.shareableTrafficText, /No rides logged yet/);
});

test('calculateTrafficRelief detects Sancheti & Alka Talkies choke points', () => {
  const journeys = [
    {
      id: '1',
      from: 'pcmc',
      to: 'civil-court',
      kilometers: 14.2,
      stationIds: ['pcmc', 'shivaji-nagar', 'civil-court'],
      at: '2026-10-24T03:30:00Z',
    },
    {
      id: '2',
      from: 'vanaz',
      to: 'civil-court',
      kilometers: 8.5,
      stationIds: ['vanaz', 'nal-stop', 'deccan-gymkhana', 'civil-court'],
      at: '2026-10-24T12:00:00Z',
    },
  ];

  const summary = calculateTrafficRelief(journeys);
  assert.equal(summary.roadKmTraveledAvoided, 22.7);
  assert.ok(summary.trafficSignalMinutesSaved > 15);
  assert.ok(summary.roadSpaceOccupancySqMHours > 50);

  // Check choke points
  const sancheti = summary.chokePoints.find((cp) => cp.id === 'sancheti_junction');
  assert.ok(sancheti);
  assert.equal(sancheti.isBypassed, true);
  assert.equal(sancheti.bypassCount, 2); // both journeys touched civil-court/shivaji-nagar

  const alka = summary.chokePoints.find((cp) => cp.id === 'alka_talkies');
  assert.ok(alka);
  assert.equal(alka.isBypassed, true);

  const nalStop = summary.chokePoints.find((cp) => cp.id === 'nal_stop_karve');
  assert.ok(nalStop);
  assert.equal(nalStop.isBypassed, true);

  assert.ok(summary.chokePointsBypassedCount >= 3);
  assert.notEqual(summary.dominantChokePointBypassed, 'None yet');
});

test('calculateTrafficRelief scales up to Flyover Skipper at 25+ km', () => {
  const journeys = [
    {
      id: '1',
      from: 'pcmc',
      to: 'swargate',
      kilometers: 17.5,
      stationIds: ['pcmc', 'civil-court', 'swargate'],
      at: '2026-10-24T03:30:00Z',
    },
    {
      id: '2',
      from: 'swargate',
      to: 'pcmc',
      kilometers: 17.5,
      stationIds: ['swargate', 'civil-court', 'pcmc'],
      at: '2026-10-24T12:30:00Z',
    },
  ];

  const summary = calculateTrafficRelief(journeys);
  assert.equal(summary.roadKmTraveledAvoided, 35.0);
  assert.equal(summary.decongestionTier, 'flyover_skipper');
  assert.equal(summary.tierTitle, 'Flyover Skipper');
  assert.ok(summary.progressPercent > 0);
  assert.match(summary.congestionReliefTip, /skipping crowded flyovers/);
});

test('calculateTrafficRelief achieves Pune Traffic Legend at 300+ km', () => {
  const journeys = Array.from({ length: 20 }, (_, i) => ({
    id: `j-${i}`,
    from: 'pcmc',
    to: 'swargate',
    kilometers: 17.5,
    at: `2026-10-0${(i % 9) + 1}T03:30:00Z`,
  }));

  const summary = calculateTrafficRelief(journeys);
  assert.equal(summary.roadKmTraveledAvoided, 350.0);
  assert.equal(summary.decongestionTier, 'traffic_legend');
  assert.equal(summary.tierTitle, 'Pune Traffic Decongestant Legend');
  assert.ok(summary.roadSpaceOccupancySqMHours > 900);
  assert.ok(summary.trafficSignalMinutesSaved > 200);
  assert.match(summary.congestionReliefTip, /Phenomenal civic contribution/);
});

test('calculateTrafficRelief checks all 6 choke point definitions', () => {
  assert.equal(PUNE_CHOKE_POINTS.length, 6);
  for (const cp of PUNE_CHOKE_POINTS) {
    assert.ok(cp.id);
    assert.ok(cp.name);
    assert.ok(cp.marathiName);
    assert.ok(cp.roadName);
    assert.ok(cp.bypassStations.length >= 2);
    assert.ok(cp.peakDelayMinutes > 10);
  }
});
