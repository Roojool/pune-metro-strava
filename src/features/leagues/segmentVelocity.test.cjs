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
  calculateSegmentVelocity,
} = require(path.join(__dirname, 'segmentVelocity.ts'));

test('calculateSegmentVelocity handles honest zero state with empty journeys', () => {
  const summary = calculateSegmentVelocity([]);
  assert.equal(summary.totalSegmentsCompleted, 0);
  assert.equal(summary.localLegendCrownsCount, 0);
  assert.equal(summary.totalTimeSavedMinutes, 0);
  assert.equal(summary.favoriteSegment, 'None traversed yet');
  assert.equal(summary.segmentPersona, 'Segment Explorer');
  assert.match(summary.shareableSegmentsText, /No segments completed yet/);
  assert.match(summary.accessibilityDescription, /No segments traversed yet/);

  for (const seg of summary.segments) {
    assert.equal(seg.isCompleted, false);
    assert.equal(seg.isLocalLegend, false);
    assert.equal(seg.timesTraversed, 0);
  }
});

test('calculateSegmentVelocity detects direct and reverse segment traversals', () => {
  const journeys = [
    // Forward direction: PCMC to Civil Court
    {
      id: '1',
      from: 'pcmc',
      to: 'civil-court',
      stationIds: ['pcmc', 'civil-court'],
      kilometers: 13.9,
      minutes: 24,
    },
    // Reverse direction: Civil Court to PCMC
    {
      id: '2',
      from: 'civil-court',
      to: 'pcmc',
      stationIds: ['civil-court', 'pcmc'],
      kilometers: 13.9,
      minutes: 24,
    },
  ];

  const summary = calculateSegmentVelocity(journeys);
  const arterial = summary.segments.find((s) => s.id === 'pcmc-civil-court');

  assert.ok(arterial);
  assert.equal(arterial.isCompleted, true);
  assert.equal(arterial.timesTraversed, 2);
  assert.equal(arterial.isLocalLegend, false); // needs 3
  // 2 traversals * (55 road mins - 24 metro mins = 31 mins saved) = 62 mins
  assert.equal(arterial.totalMinutesSaved, 62);
  assert.equal(summary.totalTimeSavedMinutes, 62);
  assert.equal(summary.totalSegmentsCompleted, 1);
  assert.equal(summary.favoriteSegment, 'The North-South Arterial Sprint');
});

test('calculateSegmentVelocity awards Local Legend crown on 3+ traversals', () => {
  const journeys = [
    { id: '1', from: 'vanaz', to: 'ramwadi', stationIds: ['vanaz', 'ramwadi'] },
    { id: '2', from: 'ramwadi', to: 'vanaz', stationIds: ['ramwadi', 'vanaz'] },
    { id: '3', from: 'vanaz', to: 'ramwadi', stationIds: ['vanaz', 'ramwadi'] },
  ];

  const summary = calculateSegmentVelocity(journeys);
  const crosser = summary.segments.find((s) => s.id === 'vanaz-ramwadi');

  assert.ok(crosser);
  assert.equal(crosser.isCompleted, true);
  assert.equal(crosser.timesTraversed, 3);
  assert.equal(crosser.isLocalLegend, true); // Local Legend crowned!
  assert.equal(summary.localLegendCrownsCount, 1);
  // 3 * (65 - 28) = 3 * 37 = 111 minutes saved
  assert.equal(crosser.totalMinutesSaved, 111);
  assert.equal(summary.totalTimeSavedMinutes, 111);
  assert.match(summary.shareableSegmentsText, /Local Legend Crowns: 1 Earned 👑/);
});

test('calculateSegmentVelocity detects segment traversals via through routes', () => {
  // A long route from PCMC to Swargate traverses Phugewadi-Dapodi, PCMC-Civil Court, and Peth underground
  const journey = {
    id: 'long',
    from: 'pcmc',
    to: 'swargate',
    stationIds: [
      'pcmc',
      'phugewadi',
      'dapodi',
      'civil-court',
      'mandai',
      'swargate',
    ],
  };

  const summary = calculateSegmentVelocity([journey]);

  const arterial = summary.segments.find((s) => s.id === 'pcmc-civil-court');
  assert.ok(arterial && arterial.isCompleted);

  const flyby = summary.segments.find((s) => s.id === 'industrial-flyby');
  assert.ok(flyby && flyby.isCompleted);

  const peth = summary.segments.find((s) => s.id === 'peth-underground');
  assert.ok(peth && peth.isCompleted);

  assert.equal(summary.totalSegmentsCompleted, 3);
});
