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

const { calculatePersonalBests } = require(path.join(__dirname, 'personalBests.ts'));

test('calculatePersonalBests handles empty journey history with honest baseline', () => {
  const res = calculatePersonalBests([]);
  assert.equal(res.totalLifetimeBurnKcal, 0);
  assert.equal(res.uniqueStationsVisited, 0);
  assert.equal(res.records[0].value, 0);
  assert.equal(res.records[1].value, 0);
  assert.equal(res.records[2].value, 0);
  assert.match(res.accessibilitySummary, /No records yet/);
});

test('calculatePersonalBests aggregates multiple rides on same day for daily burn record', () => {
  const journeys = [
    // Day 1 (Morning & Evening commute)
    {
      id: 'j1',
      from: 'pcmc',
      to: 'civil-court',
      kilometers: 13.4,
      points: 50,
      at: '2026-10-22T03:30:00Z', // 9:00 AM IST
    },
    {
      id: 'j2',
      from: 'civil-court',
      to: 'pcmc',
      kilometers: 13.4,
      points: 20,
      at: '2026-10-22T12:30:00Z', // 6:00 PM IST
    },
    // Day 2 (Single short ride)
    {
      id: 'j3',
      from: 'vanaz',
      to: 'garware-college',
      kilometers: 4.5,
      points: 30,
      at: '2026-10-23T04:00:00Z',
    },
  ];

  const res = calculatePersonalBests(journeys);

  // Day 1 has 2 rides: ~206 kcal + ~206 kcal = ~412 kcal
  const dailyRecord = res.records.find(r => r.id === 'max-daily-burn');
  assert.ok(dailyRecord);
  assert.ok(dailyRecord.value > 300);

  // Longest ride: 13.4 km
  const longestRecord = res.records.find(r => r.id === 'longest-ride');
  assert.ok(longestRecord);
  assert.equal(longestRecord.value, 13.4);

  // Favorite corridor: PCMC ↔ Civil Court (2 rides)
  assert.match(res.favoriteCorridor, /Civil Court.*PCMC.*\(2 rides\)|PCMC.*Civil Court.*\(2 rides\)/);

  // Lifetime burn sum
  assert.ok(res.totalLifetimeBurnKcal > dailyRecord.value);

  // Unique stations: pc-mc, civil-court, vanaz, garware-college = 4
  assert.equal(res.uniqueStationsVisited, 4);

  assert.match(res.accessibilitySummary, /Personal Bests/);
});

test('calculatePersonalBests identifies max station count from stationIds', () => {
  const journeys = [
    {
      id: 'j1',
      from: 'pcmc',
      to: 'civil-court',
      stationIds: ['pcmc', 'sant-tukaram-nagar', 'bhosari', 'kasarwadi', 'phugewadi', 'dapodi', 'bopodi', 'shivaji-nagar', 'civil-court'],
      kilometers: 13.4,
      points: 50,
      at: '2026-10-22T03:30:00Z',
    },
  ];

  const res = calculatePersonalBests(journeys);
  const maxStationsRecord = res.records.find(r => r.id === 'max-stations');
  assert.ok(maxStationsRecord);
  assert.equal(maxStationsRecord.value, 9);
});
