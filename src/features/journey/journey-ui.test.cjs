const { test } = require('node:test');
const assert = require('node:assert/strict');
const { searchStations, recentCommutes } = require('./journey-ui.ts');

test('station search ignores whitespace/case and never offers unavailable stations', () => {
  const stations = [
    { id: 'pcmc', name: 'PCMC', operational: true },
    { id: 'civil-court', name: 'Civil Court (District Court)', operational: true },
    { id: 'range-hill', name: 'Range Hill', operational: false },
  ];
  assert.deepEqual(searchStations(stations, '  ciVIL ').map(s => s.id), ['civil-court']);
  assert.equal(searchStations(stations, '').length, 2);
  assert.deepEqual(searchStations(stations, 'unmatched'), []);
  assert.deepEqual(searchStations(stations, 'range'), []);
});

test('recent commute shortcuts preserve newest unique directional routes', () => {
  const rides = [
    { id: 'new', from: 'pcmc', to: 'civil-court' },
    { id: 'duplicate', from: 'pcmc', to: 'civil-court' },
    { id: 'return', from: 'civil-court', to: 'pcmc' },
    { id: 'aqua', from: 'vanaz', to: 'ramwadi' },
    { id: 'extra', from: 'vanaz', to: 'civil-court' },
  ];
  assert.deepEqual(recentCommutes(rides).map(j => j.id), ['new', 'return', 'aqua']);
  assert.deepEqual(recentCommutes([]), []);
});
