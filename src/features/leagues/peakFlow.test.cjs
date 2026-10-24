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
  getIstHourAndMinute,
  classifyTransitWindow,
  calculatePeakFlow,
} = require(path.join(__dirname, 'peakFlow.ts'));

test('getIstHourAndMinute converts UTC timestamps accurately to IST', () => {
  // 03:00 UTC -> +5:30 -> 08:30 IST
  const t1 = getIstHourAndMinute('2026-10-24T03:00:00Z');
  assert.equal(t1.hour, 8);
  assert.equal(t1.minute, 30);

  // 13:15 UTC -> +5:30 -> 18:45 IST
  const t2 = getIstHourAndMinute('2026-10-24T13:15:00Z');
  assert.equal(t2.hour, 18);
  assert.equal(t2.minute, 45);

  // Invalid date fallback
  const t3 = getIstHourAndMinute('invalid-date');
  assert.equal(t3.hour, 12);
  assert.equal(t3.minute, 0);
});

test('classifyTransitWindow correctly identifies all 5 transit windows in IST', () => {
  // 07:15 IST (01:45 UTC) -> Early Bird
  assert.equal(classifyTransitWindow('2026-10-24T01:45:00Z'), 'early_bird');

  // 09:00 IST (03:30 UTC) -> Morning Rush
  assert.equal(classifyTransitWindow('2026-10-24T03:30:00Z'), 'morning_rush');

  // 14:00 IST (08:30 UTC) -> Midday Off-Peak
  assert.equal(classifyTransitWindow('2026-10-24T08:30:00Z'), 'midday_offpeak');

  // 18:30 IST (13:00 UTC) -> Evening Rush
  assert.equal(classifyTransitWindow('2026-10-24T13:00:00Z'), 'evening_rush');

  // 21:00 IST (15:30 UTC) -> Night Owl
  assert.equal(classifyTransitWindow('2026-10-24T15:30:00Z'), 'night_owl');
});

test('calculatePeakFlow handles honest zero state with empty journeys', () => {
  const summary = calculatePeakFlow([]);
  assert.equal(summary.totalRides, 0);
  assert.equal(summary.peakRidesCount, 0);
  assert.equal(summary.offPeakRidesCount, 0);
  assert.equal(summary.peakRidesPercent, 0);
  assert.equal(summary.offPeakRidesPercent, 0);
  assert.equal(summary.crowdStaminaKcal, 0);
  assert.equal(summary.gridBalancerPoints, 0);
  assert.equal(summary.dominantPersona, 'Transit Explorer');
  assert.match(summary.shareableFlowText, /No rides logged yet/);
  assert.match(summary.accessibilityDescription, /No rides logged yet/);
  assert.equal(summary.windowBreakdown.length, 5);
});

test('calculatePeakFlow computes peak vs off-peak and stamina bonuses', () => {
  const journeys = [
    // Ride 1: 08:30 IST (morning rush)
    {
      id: '1',
      from: 'pcmc',
      to: 'civil-court',
      stationIds: ['pcmc', 'civil-court'],
      at: '2026-10-24T03:00:00Z',
      kilometers: 14,
    },
    // Ride 2: 18:30 IST (evening rush)
    {
      id: '2',
      from: 'civil-court',
      to: 'pcmc',
      stationIds: ['civil-court', 'pcmc'],
      at: '2026-10-24T13:00:00Z',
      kilometers: 14,
    },
    // Ride 3: 14:00 IST (midday off-peak)
    {
      id: '3',
      from: 'vanaz',
      to: 'ramwadi',
      stationIds: ['vanaz', 'ramwadi'],
      at: '2026-10-24T08:30:00Z',
      kilometers: 15,
    },
  ];

  const summary = calculatePeakFlow(journeys);
  assert.equal(summary.totalRides, 3);
  assert.equal(summary.peakRidesCount, 2);
  assert.equal(summary.offPeakRidesCount, 1);
  assert.equal(summary.peakRidesPercent, 67); // 2/3 = 66.6% -> 67%
  assert.equal(summary.offPeakRidesPercent, 33);
  assert.equal(summary.crowdStaminaKcal, 50); // 2 * 25
  assert.equal(summary.gridBalancerPoints, 15); // 1 * 15
  assert.equal(summary.dominantPersona, 'Rush Hour Warrior');
  assert.equal(summary.dominantPersonaMarathi, 'गर्दीतील शिलेदार');
  assert.match(summary.efficiencyTip, /Shifting even 1 commute/);
  assert.match(summary.shareableFlowText, /Rush Hour Warrior/);
});

test('calculatePeakFlow classifies Off-Peak Optimizer when majority trips occur midday', () => {
  const journeys = [
    // 3 midday trips (12:00, 13:00, 14:00 IST)
    { id: '1', from: 'vanaz', to: 'deccan-gymkhana', at: '2026-10-24T06:30:00Z' },
    { id: '2', from: 'deccan-gymkhana', to: 'pmc', at: '2026-10-24T07:30:00Z' },
    { id: '3', from: 'pmc', to: 'vanaz', at: '2026-10-24T08:30:00Z' },
    // 1 morning rush trip (08:30 IST)
    { id: '4', from: 'pcmc', to: 'civil-court', at: '2026-10-24T03:00:00Z' },
  ];

  const summary = calculatePeakFlow(journeys);
  assert.equal(summary.dominantPersona, 'Off-Peak Optimizer');
  assert.equal(summary.dominantPersonaMarathi, 'संतुलित प्रवासी');
  assert.equal(summary.offPeakRidesCount, 3);
  assert.equal(summary.gridBalancerPoints, 45); // 3 * 15
});
