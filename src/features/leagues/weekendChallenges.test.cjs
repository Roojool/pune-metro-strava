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
  isJourneyInWeekend,
  getWeekendRemainingText,
  calculateWeekendChallenges,
} = require(path.join(__dirname, 'weekendChallenges.ts'));

test('isJourneyInWeekend detects Saturday and Sunday in India Standard Time', () => {
  // Saturday 2026-10-24 10:00 UTC = 15:30 IST (Saturday)
  assert.equal(isJourneyInWeekend('2026-10-24T10:00:00Z'), true);

  // Sunday 2026-10-25 10:00 UTC = 15:30 IST (Sunday)
  assert.equal(isJourneyInWeekend('2026-10-25T10:00:00Z'), true);

  // Friday 2026-10-23 10:00 UTC = 15:30 IST (Friday)
  assert.equal(isJourneyInWeekend('2026-10-23T10:00:00Z'), false);

  // Monday 2026-10-26 10:00 UTC = 15:30 IST (Monday)
  assert.equal(isJourneyInWeekend('2026-10-26T10:00:00Z'), false);

  // Earlier weekend (Oct 17, 2026) rejected relative to active weekend (Oct 24, 2026)
  assert.equal(isJourneyInWeekend('2026-10-17T10:00:00Z', new Date('2026-10-24T12:00:00Z')), false);

  // Invalid timestamp
  assert.equal(isJourneyInWeekend('invalid'), false);
});

test('getWeekendRemainingText provides time remaining or start notice', () => {
  const saturday = new Date('2026-10-24T10:00:00Z');
  const txtSat = getWeekendRemainingText(saturday);
  assert.match(txtSat, /left this weekend/);

  const sunday = new Date('2026-10-25T10:00:00Z');
  const txtSun = getWeekendRemainingText(sunday);
  assert.match(txtSun, /left today/);

  const wednesday = new Date('2026-10-21T10:00:00Z');
  const txtWed = getWeekendRemainingText(wednesday);
  assert.equal(txtWed, 'Starts Saturday 00:00 IST');
});

test('calculateWeekendChallenges tracks Mutha River crossing and long corridor goals', () => {
  const journeys = [
    // Weekend ride 1: Vanaz to Civil Court (Mutha river crossing)
    {
      id: 'j1',
      from: 'vanaz',
      to: 'civil-court',
      stationIds: ['vanaz', 'ideal-colony', 'nal-stop', 'garware-college', 'deccan-gymkhana', 'pmc', 'civil-court'],
      kilometers: 7.5,
      points: 30,
      at: '2026-10-24T06:00:00Z',
    },
    // Weekend ride 2: Vanaz to Ruby Hall Clinic (Crosses river, long route)
    {
      id: 'j2',
      from: 'vanaz',
      to: 'ruby-hall-clinic',
      stationIds: ['vanaz', 'deccan-gymkhana', 'pmc', 'civil-court', 'pune-railway-station', 'ruby-hall-clinic'],
      kilometers: 11.2,
      points: 40,
      at: '2026-10-24T09:00:00Z',
    },
    // Weekend ride 3: Deccan Gymkhana to Civil Court
    {
      id: 'j3',
      from: 'deccan-gymkhana',
      to: 'civil-court',
      stationIds: ['deccan-gymkhana', 'pmc', 'civil-court'],
      kilometers: 3.2,
      points: 30,
      at: '2026-10-24T12:00:00Z',
    },
  ];

  const saturday = new Date('2026-10-24T12:00:00Z');
  const challenges = calculateWeekendChallenges(journeys, saturday);

  // 3 Mutha crossings -> completed
  const riverChallenge = challenges.find(c => c.id === 'mutha-river-sprint');
  assert.ok(riverChallenge);
  assert.equal(riverChallenge.currentProgress, 3);
  assert.equal(riverChallenge.isCompleted, true);

  // 1 ride >= 10 km (j2: 11.2 km) -> completed
  const grandChallenge = challenges.find(c => c.id === 'grand-corridor-conqueror');
  assert.ok(grandChallenge);
  assert.equal(grandChallenge.currentProgress, 1);
  assert.equal(grandChallenge.isCompleted, true);

  // Unique stations (vanaz, civil-court, ruby-hall-clinic, deccan-gymkhana) = 4 >= 3 -> completed
  const trioChallenge = challenges.find(c => c.id === 'weekend-station-trio');
  assert.ok(trioChallenge);
  assert.equal(trioChallenge.currentProgress, 3);
  assert.equal(trioChallenge.isCompleted, true);
});

test('calculateWeekendChallenges handles honest zero state with no weekend activity', () => {
  const weekdayJourneys = [
    {
      id: 'j1',
      from: 'pc-mc',
      to: 'civil-court',
      kilometers: 13.4,
      points: 50,
      at: '2026-10-21T08:00:00Z', // Wednesday
    },
  ];

  const saturday = new Date('2026-10-24T12:00:00Z');
  const challenges = calculateWeekendChallenges(weekdayJourneys, saturday);

  for (const c of challenges) {
    assert.equal(c.currentProgress, 0);
    assert.equal(c.isCompleted, false);
  }
});
