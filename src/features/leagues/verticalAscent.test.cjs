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
  getStationVertical,
  calculateVerticalAscent,
} = require(path.join(__dirname, 'verticalAscent.ts'));

test('getStationVertical returns accurate elevation metrics', () => {
  const civilCourt = getStationVertical('civil-court');
  assert.equal(civilCourt.meters, 33);
  assert.equal(civilCourt.flights, 10);

  const swargate = getStationVertical('swargate');
  assert.equal(swargate.meters, 22);

  const standard = getStationVertical('garware-college');
  assert.equal(standard.meters, 12);
  assert.equal(standard.flights, 3);
});

test('calculateVerticalAscent handles honest zero state', () => {
  const summary = calculateVerticalAscent([]);
  assert.equal(summary.totalVerticalMeters, 0);
  assert.equal(summary.totalStairFlights, 0);
  assert.equal(summary.totalStationSteps, 0);
  assert.equal(summary.deepestStationTraversed, 'None yet');
  assert.equal(summary.climberRankTitle, 'Platform Walker');
  assert.match(summary.accessibilityDescription, /0 meters/);
});

test('calculateVerticalAscent aggregates vertical displacement and transfers', () => {
  const journeys = [
    // Ride 1: PCMC (15m) to Civil Court (33m) = 48m vertical
    {
      id: '1',
      from: 'pcmc',
      to: 'civil-court',
      stationIds: ['pcmc', 'civil-court'],
      kilometers: 14,
    },
    // Ride 2: PCMC (15m) to Ramwadi (15m) with Civil Court transfer (+18m) = 48m vertical
    {
      id: '2',
      from: 'pcmc',
      to: 'ramwadi',
      stationIds: ['pcmc', 'civil-court', 'ramwadi'],
      kilometers: 22,
    },
  ];

  const summary = calculateVerticalAscent(journeys);
  // Total = 48 + 48 = 96m
  assert.equal(summary.totalVerticalMeters, 96);
  assert.ok(summary.totalStairFlights >= 20);
  assert.ok(summary.totalStationSteps >= 1000);
  assert.match(summary.deepestStationTraversed, /Civil Court.*33\.1m/);
  assert.equal(summary.climberRankTitle, 'Tekdi Ascent Climber');
  assert.match(summary.landmarkEquivalentName, /Vetal Tekdi/);
});

test('calculateVerticalAscent advances to Sinhagad Fort Pioneer at high vertical', () => {
  // 10 journeys of 48m = 480m (> 300m threshold)
  const journeys = Array.from({ length: 10 }, (_, i) => ({
    id: `j-${i}`,
    from: 'pcmc',
    to: 'civil-court',
    stationIds: ['pcmc', 'civil-court'],
    kilometers: 14,
  }));

  const summary = calculateVerticalAscent(journeys);
  assert.equal(summary.totalVerticalMeters, 480);
  assert.equal(summary.climberRankTitle, 'Sinhagad Fort Pioneer');
  assert.equal(summary.landmarkRatio, 1);
});
