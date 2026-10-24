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
  calculateIntermodalTransit,
} = require(path.join(__dirname, 'intermodalTransit.ts'));

test('calculateIntermodalTransit handles honest zero state with empty journeys', () => {
  const summary = calculateIntermodalTransit([]);
  assert.equal(summary.totalIntermodalVisits, 0);
  assert.equal(summary.unlockedHubsCount, 0);
  assert.equal(summary.totalHubs, 6);
  assert.equal(summary.intermodalConnectivityScore, 0);
  assert.equal(summary.intermodalTransferKcal, 0);
  assert.equal(summary.dominantFeederMode, 'Local Walking Feeder');
  assert.equal(summary.intermodalPersona, 'Local Corridor Rider');
  assert.match(summary.shareableIntermodalText, /No intermodal trips logged yet/);
  assert.match(summary.accessibilityDescription, /No multi-modal hub visits logged yet/);
});

test('calculateIntermodalTransit tracks hub visits and stair exertion', () => {
  const journeys = [
    // Ride 1: Pune Railway Station to Civil Court
    {
      id: '1',
      from: 'pune-railway-station',
      to: 'civil-court',
      stationIds: ['pune-railway-station', 'civil-court'],
    },
    // Ride 2: Swargate to Shivajinagar
    {
      id: '2',
      from: 'swargate',
      to: 'shivajinagar',
      stationIds: ['swargate', 'shivajinagar'],
    },
  ];

  const summary = calculateIntermodalTransit(journeys);

  // 4 hubs visited (Pune Station, Civil Court, Swargate, Shivajinagar)
  assert.equal(summary.unlockedHubsCount, 4);
  assert.equal(summary.totalIntermodalVisits, 4);

  // Stair flights exertion:
  // Pune Station: 4 flights * 4 kcal = 16
  // Civil Court: 10 flights * 4 kcal = 40
  // Swargate: 6 flights * 4 kcal = 24
  // Shivajinagar: 5 flights * 4 kcal = 20
  // Total = 100 kcal
  assert.equal(summary.intermodalTransferKcal, 100);

  // Score: (4/6) * 60 + (4 * 4) = 40 + 16 = 56
  assert.equal(summary.intermodalConnectivityScore, 56);
  assert.equal(summary.intermodalPersona, 'Multi-Modal Transit Pioneer');
  assert.equal(summary.intermodalPersonaMarathi, 'बहुविध वाहतूक प्रणेता');
});

test('calculateIntermodalTransit elevates persona to Regional Commute Master at 5+ hubs', () => {
  // Journey covering 5 hubs
  const journeys = [
    { id: '1', from: 'pune-railway-station', to: 'civil-court' },
    { id: '2', from: 'swargate', to: 'shivajinagar' },
    { id: '3', from: 'ramwadi', to: 'civil-court' },
  ];

  const summary = calculateIntermodalTransit(journeys);
  // Unlocked hubs: pune-railway-station, civil-court, swargate, shivajinagar, ramwadi = 5 hubs!
  assert.equal(summary.unlockedHubsCount, 5);
  assert.equal(summary.intermodalPersona, 'Regional Commute Master');
  assert.equal(summary.intermodalPersonaMarathi, 'प्रादेशिक वाहतूक सम्राट');
  assert.match(summary.shareableIntermodalText, /Regional Commute Master/);
});
