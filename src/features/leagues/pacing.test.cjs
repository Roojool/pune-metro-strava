const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

require.extensions['.ts'] = function (module, filename) {
  const code = fs.readFileSync(filename, 'utf8');
  const compiled = ts.transpileModule(code, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  });
  module._compile(compiled.outputText, filename);
};

const {
  COMMUTER_BURN_TIERS,
  getCommuterBurnTier,
  calculateWeeklyBurnPacing,
  estimateRouteBurn,
  calculateUserEntry,
  getEnrichedSampleLeague,
  rankByMetric,
} = require(path.join(__dirname, 'scoring.ts'));

test('getCommuterBurnTier maps calorie thresholds accurately with safe boundary fallbacks', () => {
  assert.equal(getCommuterBurnTier(0).id, 'station-strider');
  assert.equal(getCommuterBurnTier(150).id, 'station-strider');
  assert.equal(getCommuterBurnTier(250).id, 'station-strider');

  assert.equal(getCommuterBurnTier(251).id, 'elevated-climber');
  assert.equal(getCommuterBurnTier(450).id, 'elevated-climber');
  assert.equal(getCommuterBurnTier(600).id, 'elevated-climber');

  assert.equal(getCommuterBurnTier(601).id, 'interchange-cruiser');
  assert.equal(getCommuterBurnTier(900).id, 'interchange-cruiser');
  assert.equal(getCommuterBurnTier(1200).id, 'interchange-cruiser');

  assert.equal(getCommuterBurnTier(1201).id, 'underground-pioneer');
  assert.equal(getCommuterBurnTier(1800).id, 'underground-pioneer');
  assert.equal(getCommuterBurnTier(2500).id, 'underground-pioneer');

  assert.equal(getCommuterBurnTier(2501).id, 'transit-legend');
  assert.equal(getCommuterBurnTier(9999).id, 'transit-legend');

  // Edge cases: negative and NaN
  assert.equal(getCommuterBurnTier(-50).id, 'station-strider');
  assert.equal(getCommuterBurnTier(Number.NaN).id, 'station-strider');
});

test('calculateWeeklyBurnPacing calculates rolling 7-day progress and pacing', () => {
  const now = new Date('2026-10-24T12:00:00Z');

  // Zero state
  const zeroPacing = calculateWeeklyBurnPacing([], now, 500);
  assert.equal(zeroPacing.burnedLast7DaysKcal, 0);
  assert.equal(zeroPacing.remainingKcal, 500);
  assert.equal(zeroPacing.percent, 0);
  assert.equal(zeroPacing.isTargetReached, false);
  assert.equal(zeroPacing.pacingStatus, 'behind');

  // Recent rides within 7 days
  const recentJourneys = [
    {
      id: 'j1',
      from: 'pcmc',
      to: 'civil-court',
      kilometers: 13.4,
      at: '2026-10-23T08:00:00Z', // 1 day ago: ~206 kcal
    },
    {
      id: 'j2',
      from: 'vanaz',
      to: 'civil-court',
      kilometers: 8.5,
      at: '2026-10-21T09:00:00Z', // 3 days ago: 45 + 8.5 * 12 = ~147 kcal
    },
    {
      id: 'old-ride',
      from: 'swargate',
      to: 'pcmc',
      kilometers: 17.4,
      at: '2026-10-10T08:00:00Z', // 14 days ago: must be excluded!
    },
  ];

  const activePacing = calculateWeeklyBurnPacing(recentJourneys, now, 500);
  // Total in window: 206 + 147 = 353 kcal
  assert.equal(activePacing.burnedLast7DaysKcal, 353);
  assert.equal(activePacing.remainingKcal, 147);
  assert.equal(activePacing.percent, 71);
  assert.equal(activePacing.isTargetReached, false);
  assert.equal(activePacing.pacingStatus, 'behind');
  assert.match(activePacing.summaryText, /147 kcal remaining/);

  // On-track case (target 400 kcal, burned 353 kcal -> >= 80% = on-track)
  const onTrackPacing = calculateWeeklyBurnPacing(recentJourneys, now, 400);
  assert.equal(onTrackPacing.pacingStatus, 'on-track');
  assert.match(onTrackPacing.summaryText, /right on track/);

  // Goal exceeded
  const heavyJourneys = [
    ...recentJourneys,
    {
      id: 'j3',
      from: 'pcmc',
      to: 'swargate',
      kilometers: 17.4,
      at: '2026-10-24T06:00:00Z', // today: ~254 kcal
    },
  ];
  // Total: 353 + 254 = 607 kcal (> 500 target)
  const crushedPacing = calculateWeeklyBurnPacing(heavyJourneys, now, 500);
  assert.equal(crushedPacing.burnedLast7DaysKcal, 607);
  assert.equal(crushedPacing.remainingKcal, 0);
  assert.equal(crushedPacing.percent, 100);
  assert.equal(crushedPacing.isTargetReached, true);
  assert.equal(crushedPacing.pacingStatus, 'ahead');
  assert.match(crushedPacing.summaryText, /Goal crushed!/);
});

test('estimateRouteBurn predicts calories, Civil Court transfer bonus, and leaderboard impact', () => {
  // Edge case: Same station
  const sameStation = estimateRouteBurn('pcmc', 'pcmc');
  assert.equal(sameStation.kilometers, 0);
  assert.equal(sameStation.calories, 0);
  assert.match(sameStation.overtakeNotice, /Select two different stations/);

  // Direct route: PCMC to Civil Court
  const directRoute = estimateRouteBurn('pcmc', 'civil-court');
  assert.ok(directRoute.kilometers > 0);
  assert.ok(directRoute.calories > 150);
  assert.equal(directRoute.isInterchange, false);
  assert.equal(directRoute.interchangeBonusKcal, 0);
  assert.equal(directRoute.fromName, 'PCMC');
  assert.equal(directRoute.toName, 'Civil Court (District Court)');

  // Cross-line route traversing Civil Court: Vanaz to PCMC
  const crossLine = estimateRouteBurn('vanaz', 'pcmc');
  assert.ok(crossLine.kilometers > 0);
  assert.equal(crossLine.isInterchange, true);
  assert.equal(crossLine.interchangeBonusKcal, 25);
  // Station count includes origin, intermediate, and destination stations
  assert.ok(crossLine.stationCount >= 8);

  // Simulated leaderboard impact
  const samples = getEnrichedSampleLeague();
  const currentUser = calculateUserEntry('Explorer', 50, [], 'purple'); // 0 calories burned
  const initialBoard = rankByMetric([...samples, currentUser], 'calories');
  const initialRank = initialBoard.findIndex(e => e.id === 'you') + 1;

  // Simulate long ride: PCMC to Swargate (17.4 km, ~254 kcal)
  const simulated = estimateRouteBurn('pcmc', 'swargate', initialBoard, currentUser);
  assert.ok(simulated.projectedRank !== undefined);
  // With 254 kcal, user overtakes sample entries who have less (e.g. Ishaan at 85 kcal, Kabir at 110 kcal)
  assert.ok(simulated.projectedRank < initialRank);
  assert.match(simulated.overtakeNotice, /lift you from Rank/);
});
