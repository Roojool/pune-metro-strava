const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

// npm test compiles the shared domain first. Load the owned TS selector without
// adding a test framework or changing shared TypeScript/package configuration.
const root = path.resolve(__dirname, '../../..');
const cache = new Map();
function loadFeature(name) {
  if (cache.has(name)) return cache.get(name);
  const filename = path.join(__dirname, `${name}.ts`);
  const loaded = new Module(filename, module);
  loaded.require = request => request.startsWith('../../')
    ? require(path.join(root, '.test-build', request.slice(6)))
    : request.startsWith('./') ? loadFeature(request.slice(2)) : require(request);
  loaded._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, filename);
  cache.set(name, loaded.exports);
  return loaded.exports;
}
const { leagueStandings, standingLabel } = loadFeature('standingsModel');
const { SAMPLE_LEAGUE } = loadFeature('sampleLeague');
const { createJourney, leaderboardScore } = require('../../../.test-build/domain/metro.js');
const { LINES, OPEN_STATIONS } = require('../../../.test-build/data/pune.js');
const user = { id: 'you', name: 'Pune Explorer', privateProfile: true };
const now = new Date('2026-10-24T08:00:00Z');
const ride = (from, to, previous = [], minutes = 0) =>
  createJourney({ from, to }, previous, new Date(now.getTime() + minutes * 60_000));
const select = (scope, line, journeys, profile = user) =>
  leagueStandings(scope, line, journeys, profile, leaderboardScore(journeys));

test('empty Pune, Friends and both route boards include one honest zero-score local rider', () => {
  for (const scope of ['Pune', 'Friends', 'Route']) for (const line of ['purple', 'aqua']) {
    const result = select(scope, line, []);
    assert.equal(result.currentScore, 0);
    assert.equal(result.sampleCount, scope === 'Pune' ? 6 : 3);
    assert.equal(result.rank, result.board.length);
    assert.equal(result.board.filter(entry => !entry.sample).length, 1);
    assert.deepEqual(result.board.at(-1), { id: 'you', name: user.name, points: 0, sample: false, line });
    if (scope === 'Route') assert.ok(result.board.every(entry => entry.line === line));
  }
});

test('Pune and Friends use shared all-time XP and their intended sample profiles', () => {
  const journeys = [ride('pcmc', 'civil-court')];
  const pune = select('Pune', 'purple', journeys);
  const friends = select('Friends', 'aqua', journeys);
  assert.deepEqual(pune.board.map(entry => entry.points), [240, 180, 90, 50, 40, 20, 10]);
  assert.deepEqual(friends.board.map(entry => entry.id), ['sample-aarav', 'sample-sana', 'sample-neha', 'you']);
  assert.equal(pune.rank, 4);
  assert.equal(friends.currentScore, pune.currentScore);
  assert.equal(friends.title, 'Friends preview');
});

test('Civil Court as an endpoint does not credit a ride to the unused line', () => {
  for (const [from, to, used, unused] of [
    ['pcmc', 'civil-court', 'purple', 'aqua'],
    ['civil-court', 'pcmc', 'purple', 'aqua'],
    ['vanaz', 'civil-court', 'aqua', 'purple'],
    ['civil-court', 'vanaz', 'aqua', 'purple'],
  ]) {
    const journeys = [ride(from, to)];
    assert.equal(select('Route', used, journeys).currentScore, 50);
    assert.equal(select('Route', unused, journeys).currentScore, 0);
    assert.equal(select('Route', unused, journeys).routeJourneys.length, 0);
  }
});

test('transfers in both directions retain full awarded XP in each route without inflating Pune total', () => {
  for (const [from, to] of [['pcmc', 'ramwadi'], ['ramwadi', 'pcmc']]) {
    const first = ride(from, to);
    const repeat = ride(from, to, [first], 2);
    assert.equal(repeat.points, 10);
    for (const line of ['purple', 'aqua']) {
      const result = select('Route', line, [repeat, first]);
      assert.equal(result.currentScore, 60);
      assert.deepEqual(result.routeJourneys, [repeat, first]);
    }
    assert.equal(select('Pune', 'purple', [repeat, first]).currentScore, 60);
  }
});

test('route scores retain endpoint bonuses already earned on another line', () => {
  const purple = ride('pcmc', 'civil-court');
  const aqua = ride('civil-court', 'vanaz', [purple], 2);
  assert.equal(aqua.points, 30);
  assert.equal(select('Route', 'purple', [aqua, purple]).currentScore, 50);
  assert.equal(select('Route', 'aqua', [aqua, purple]).currentScore, 30);
  assert.equal(select('Pune', 'aqua', [aqua, purple]).currentScore, 80);
});

test('every supported directed route credits exactly the lines with a traversed segment', () => {
  let checked = 0;
  for (const from of OPEN_STATIONS) for (const to of OPEN_STATIONS) {
    if (from.id === to.id) continue;
    const journey = ride(from.id, to.id);
    for (const line of LINES) {
      const usesSegment = journey.stationIds.slice(1).some((id, index) => {
        const first = line.stationIds.indexOf(journey.stationIds[index]);
        const second = line.stationIds.indexOf(id);
        return first >= 0 && second >= 0 && Math.abs(first - second) === 1;
      });
      const result = select('Route', line.id, [journey]);
      assert.equal(result.currentScore, usesSegment ? journey.points : 0, `${from.id} → ${to.id}, ${line.id}`);
      checked++;
    }
  }
  assert.equal(checked, 1512);
});

test('ties follow shared name ordering and find the local rider by id even when names match', () => {
  const first = ride('pcmc', 'civil-court');
  const journeys = [first, ...Array.from({ length: 4 }, (_, i) => ride('pcmc', 'civil-court', [first], i + 2))];
  assert.equal(leaderboardScore(journeys), 90);
  for (const [name, expectedRank] of [['A demo rider', 3], ['Z demo rider', 4], ['Neha', 4]]) {
    const result = select('Pune', 'purple', journeys, { ...user, name });
    assert.equal(result.rank, expectedRank);
    assert.equal(result.board[result.rank - 1].id, 'you');
    assert.equal(result.board[result.rank - 1].sample, false);
  }
});

test('profile whitespace is normalized, blank names fall back, and selection never mutates inputs', () => {
  const journeys = Object.freeze([Object.freeze(ride('pcmc', 'civil-court'))]);
  const before = JSON.stringify(SAMPLE_LEAGUE);
  for (const [name, expected] of [['  Demo rider  ', 'Demo rider'], ['  ', 'You']]) {
    for (const scope of ['Route', 'Friends', 'Pune']) {
      const result = select(scope, 'aqua', journeys, Object.freeze({ ...user, name }));
      assert.equal(result.board.find(entry => entry.id === 'you').name, expected);
    }
  }
  assert.equal(JSON.stringify(SAMPLE_LEAGUE), before);
});

test('row descriptions include position, board size, complete name, XP and score provenance', () => {
  assert.equal(standingLabel(SAMPLE_LEAGUE[0], 1, 7),
    'Position 1 of 7, Aarav, 240 XP. Fictional sample profile.');
  const local = select('Pune', 'purple', [], { ...user, name: 'Aarav' }).board.at(-1);
  assert.equal(standingLabel(local, 7, 7),
    'Position 7 of 7, Aarav, you, 0 XP. Your local, self-reported score.');
});
