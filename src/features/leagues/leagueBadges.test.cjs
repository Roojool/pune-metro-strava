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
  isPeakRushHour,
  isMuthaCrossing,
  touchesCivilCourt,
  calculateLeagueBadges,
} = require(path.join(__dirname, 'leagueBadges.ts'));

test('isPeakRushHour detects morning and evening rush in IST', () => {
  // 08:30 IST is 03:00 UTC
  assert.equal(isPeakRushHour('2026-10-24T03:00:00Z'), true);
  // 09:15 IST is 03:45 UTC
  assert.equal(isPeakRushHour('2026-10-24T03:45:00Z'), true);
  // 12:00 IST is 06:30 UTC (midday off-peak)
  assert.equal(isPeakRushHour('2026-10-24T06:30:00Z'), false);
  // 18:30 IST is 13:00 UTC (evening peak)
  assert.equal(isPeakRushHour('2026-10-24T13:00:00Z'), true);
  // 23:00 IST is 17:30 UTC (late night)
  assert.equal(isPeakRushHour('2026-10-24T17:30:00Z'), false);
  // Invalid string
  assert.equal(isPeakRushHour('invalid-date'), false);
});

test('touchesCivilCourt and isMuthaCrossing evaluate station itineraries', () => {
  assert.equal(touchesCivilCourt({ from: 'vanaz', to: 'civil-court' }), true);
  assert.equal(touchesCivilCourt({ from: 'pcmc', to: 'swargate', stationIds: ['pcmc', 'civil-court', 'swargate'] }), true);
  assert.equal(touchesCivilCourt({ from: 'vanaz', to: 'ideal-colony' }), false);

  assert.equal(
    isMuthaCrossing({ from: 'civil-court', to: 'mangalwar-peth' }),
    true
  );
  assert.equal(
    isMuthaCrossing({
      from: 'pcmc',
      to: 'ramwadi',
      stationIds: ['pcmc', 'civil-court', 'mangalwar-peth', 'ramwadi'],
    }),
    true
  );
  assert.equal(
    isMuthaCrossing({ from: 'vanaz', to: 'civil-court' }),
    false
  );
});

test('calculateLeagueBadges handles honest zero state', () => {
  const summary = calculateLeagueBadges([]);
  assert.equal(summary.earnedCount, 0);
  assert.equal(summary.totalCount, 8);
  assert.equal(summary.completionPercent, 0);
  assert.ok(summary.nextBadge);
  assert.equal(summary.nextBadge.progressRatio, 0);
  assert.match(summary.accessibilityDescription, /0 of 8/);
});

test('calculateLeagueBadges unlocks badges accurately with thresholds and unlocks dates', () => {
  const journeys = [
    // Ride 1: 08:30 IST (peak rush) - 15 km, passing Civil Court & Mangalwar Peth, cross-line transfer
    {
      id: 'j1',
      date: '2026-10-20T03:00:00Z',
      from: 'pcmc',
      to: 'ramwadi',
      stationIds: ['pcmc', 'civil-court', 'mangalwar-peth', 'ramwadi'],
      kilometers: 15,
      durationMinutes: 30,
      line: 'purple',
    },
    // Ride 2: 18:00 IST (peak rush) - 20 km, passing Civil Court & Mangalwar Peth, cross-line transfer
    {
      id: 'j2',
      date: '2026-10-21T12:30:00Z',
      from: 'pcmc',
      to: 'ramwadi',
      stationIds: ['pcmc', 'civil-court', 'mangalwar-peth', 'ramwadi'],
      kilometers: 20,
      durationMinutes: 35,
      line: 'purple',
    },
    // Ride 3: 09:00 IST (peak rush) - 25 km, Civil Court visit
    {
      id: 'j3',
      date: '2026-10-22T03:30:00Z',
      from: 'pcmc',
      to: 'civil-court',
      stationIds: ['pcmc', 'civil-court'],
      kilometers: 25,
      durationMinutes: 40,
      line: 'purple',
    },
    // Ride 4: 08:15 IST (peak rush) - 20 km
    {
      id: 'j4',
      date: '2026-10-23T02:45:00Z',
      from: 'vanaz',
      to: 'ramwadi',
      stationIds: ['vanaz', 'ramwadi'],
      kilometers: 20,
      durationMinutes: 35,
      line: 'aqua',
    },
    // Ride 5: 19:00 IST (peak rush) - 25 km -> reaches 100 km cumulative!
    {
      id: 'j5',
      date: '2026-10-24T13:30:00Z',
      from: 'vanaz',
      to: 'ramwadi',
      stationIds: ['vanaz', 'ramwadi'],
      kilometers: 25,
      durationMinutes: 40,
      line: 'aqua',
    },
  ];

  const summary = calculateLeagueBadges(journeys);

  // 1. Civil Court Explorer (target 3): j1, j2, j3 = 3 visits -> Unlocked!
  const civilCourtBadge = summary.badges.find(b => b.id === 'civil-court-explorer');
  assert.ok(civilCourtBadge);
  assert.equal(civilCourtBadge.isUnlocked, true);
  assert.equal(civilCourtBadge.unlockedDate, '2026-10-22T03:30:00Z');

  // 2. Centurion (target 100km): total = 15+20+25+20+25 = 105 km -> Unlocked on j5!
  const centurionBadge = summary.badges.find(b => b.id === 'centurion-commuter');
  assert.ok(centurionBadge);
  assert.equal(centurionBadge.isUnlocked, true);
  assert.equal(centurionBadge.unlockedDate, '2026-10-24T13:30:00Z');

  // 3. Mutha River Voyager (target 2): j1, j2 = 2 crossings -> Unlocked on j2!
  const muthaBadge = summary.badges.find(b => b.id === 'mutha-river-voyager');
  assert.ok(muthaBadge);
  assert.equal(muthaBadge.isUnlocked, true);
  assert.equal(muthaBadge.unlockedDate, '2026-10-21T12:30:00Z');

  // 4. Peak Commute Master (target 5 rush rides): all 5 were rush hour -> Unlocked on j5!
  const rushBadge = summary.badges.find(b => b.id === 'rush-hour-master');
  assert.ok(rushBadge);
  assert.equal(rushBadge.isUnlocked, true);
  assert.equal(rushBadge.unlockedDate, '2026-10-24T13:30:00Z');

  // 5. Dual Line Harmonizer (target 2 transfers): j1 and j2 transferred -> Unlocked on j2!
  const transferBadge = summary.badges.find(b => b.id === 'dual-line-harmonizer');
  assert.ok(transferBadge);
  assert.equal(transferBadge.isUnlocked, true);
  assert.equal(transferBadge.unlockedDate, '2026-10-21T12:30:00Z');

  assert.ok(summary.earnedCount >= 5);
  assert.ok(summary.completionPercent >= 50);
});
