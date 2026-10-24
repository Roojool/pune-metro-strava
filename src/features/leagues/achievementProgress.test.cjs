const { test } = require('node:test');
const assert = require('node:assert/strict');
const { buildAchievementProgress } = require('./achievementProgress.ts');
const { createJourney, journeyStatistics, unlockAchievements } = require('../../../.test-build/domain/metro.js');

const NOW = new Date('2026-10-24T12:00:00Z');

function record(candidates, start = new Date('2026-10-24T08:00:00Z')) {
  return candidates.reduce((journeys, candidate, index) => [
    createJourney(candidate, journeys, new Date(start.getTime() + index * 120_000)),
    ...journeys,
  ], []);
}

function collection(journeys, now = NOW) {
  const stats = journeyStatistics(journeys, now);
  const achievements = unlockAchievements(stats);
  return buildAchievementProgress(achievements, stats);
}

const byId = (items, id) => items.find(item => item.achievement.id === id);
const commute = { from: 'pcmc', to: 'civil-court' };

test('empty collection exposes each existing goal with zero progress and an actionable next step', () => {
  const items = collection([]);
  assert.deepEqual(items.map(({ achievement, progress }) => [
    achievement.id, achievement.unlocked, progress.current, progress.target,
    progress.remaining, progress.percent,
  ]), [
    ['first-ride', false, 0, 1, 1, 0],
    ['explorer', false, 0, 5, 5, 0],
    ['regular', false, 0, 5, 5, 0],
    ['consistent', false, 0, 3, 3, 0],
  ]);
  for (const item of items) {
    assert.ok(item.guidance.trim().length > 0);
    assert.ok(item.progress.valueText.trim().length > 0);
  }
});

test('a real first ride progresses endpoint collection without counting passed stations', () => {
  const rides = record([commute]);
  assert.ok(rides[0].stationIds.length > 2, 'Fixture must travel through intermediate stations');
  const items = collection(rides);
  assert.equal(byId(items, 'first-ride').achievement.unlocked, true);
  assert.equal(byId(items, 'first-ride').progress.percent, 100);
  assert.equal(byId(items, 'explorer').progress.current, 2);
  assert.equal(byId(items, 'explorer').progress.remaining, 3);
  assert.equal(byId(items, 'explorer').progress.percent, 40);
  assert.equal(byId(items, 'regular').progress.current, 1);
  assert.equal(byId(items, 'consistent').progress.current, 1);
});

test('repeated and reversed rides advance the ride goal without inventing new endpoints or days', () => {
  const rides = record(Array.from({ length: 6 }, (_, index) => index % 2
    ? { from: commute.to, to: commute.from } : commute));
  const items = collection(rides);
  assert.equal(byId(items, 'regular').achievement.unlocked, true);
  assert.deepEqual(byId(items, 'regular').progress, {
    ...byId(items, 'regular').progress,
    current: 6, target: 5, remaining: 0, percent: 100,
  });
  assert.match(byId(items, 'regular').progress.valueText, /6/);
  assert.equal(byId(items, 'explorer').progress.current, 2);
  assert.equal(byId(items, 'explorer').achievement.unlocked, false);
  assert.equal(byId(items, 'consistent').progress.current, 1);
});

test('station collector follows unique boarding and exit counts on both lines at and beyond the goal', () => {
  const routes = [commute, { from: 'vanaz', to: 'ramwadi' }, { from: 'swargate', to: 'pcmc' }, { from: 'mandai', to: 'swargate' }];
  const four = byId(collection(record(routes.slice(0, 2))), 'explorer');
  assert.equal(four.progress.current, 4);
  assert.equal(four.progress.remaining, 1);
  assert.equal(four.achievement.unlocked, false);
  const five = byId(collection(record(routes.slice(0, 3))), 'explorer');
  assert.equal(five.progress.current, 5);
  assert.equal(five.progress.percent, 100);
  assert.equal(five.achievement.unlocked, true);
  const six = byId(collection(record(routes)), 'explorer');
  assert.equal(six.progress.current, 6, 'Visible totals must not be truncated to the goal');
  assert.equal(six.progress.percent, 100, 'Visual meter must remain capped');
  assert.equal(six.progress.remaining, 0);
});

test('India-day streak progress preserves yesterday grace and relocks when the shared streak breaks', () => {
  const dates = ['2026-10-21T18:30:00Z', '2026-10-22T18:30:00Z', '2026-10-23T18:30:00Z'];
  const rides = dates.reduce((all, at) => [createJourney(commute, all, new Date(at)), ...all], []);
  for (const time of ['2026-10-24T18:29:59Z', '2026-10-24T18:30:00Z', '2026-10-25T18:29:59Z']) {
    const streak = byId(collection(rides, new Date(time)), 'consistent');
    assert.equal(streak.achievement.unlocked, true, time);
    assert.equal(streak.progress.current, 3, time);
    assert.equal(streak.progress.remaining, 0, time);
    assert.match(streak.guidance, /streak|day/i);
  }
  const expired = collection(rides, new Date('2026-10-25T18:30:00Z'));
  const streak = byId(expired, 'consistent');
  assert.equal(streak.achievement.unlocked, false);
  assert.equal(streak.progress.current, 0);
  assert.equal(streak.progress.remaining, 3);
  assert.equal(streak.progress.percent, 0);
  assert.equal(byId(expired, 'first-ride').achievement.unlocked, true);
  assert.equal(byId(expired, 'regular').progress.current, 3);
});

test('each displayed target agrees with the shared domain at the unlock boundary', () => {
  const base = journeyStatistics([], NOW);
  for (const [id, field, target] of [
    ['first-ride', 'totalJourneys', 1],
    ['explorer', 'visitedIds', 5],
    ['regular', 'totalJourneys', 5],
    ['consistent', 'streak', 3],
  ]) {
    for (const current of [target - 1, target, target + 1]) {
      const stats = { ...base, [field]: field === 'visitedIds'
        ? ['pcmc', 'civil-court', 'vanaz', 'ramwadi', 'swargate', 'mandai'].slice(0, current) : current };
      const item = byId(buildAchievementProgress(unlockAchievements(stats), stats), id);
      assert.equal(item.progress.target, target, id);
      assert.equal(item.achievement.unlocked, current >= target, id);
      assert.equal(item.progress.current, current, id);
      assert.equal(item.progress.remaining, Math.max(0, target - current), id);
      assert.equal(item.progress.percent, Math.round(Math.min(100, current / target * 100)), id);
    }
  }
});

test('domain unlock decisions remain authoritative and future badges do not get invented goals', () => {
  const stats = journeyStatistics([], NOW);
  const achievements = unlockAchievements(stats);
  achievements[0] = { ...achievements[0], unlocked: true };
  const future = { id: 'future-badge', title: 'Future goal', description: 'A domain-defined goal', icon: 'star', unlocked: false };
  const items = buildAchievementProgress([...achievements, future], stats);
  assert.equal(items[0].achievement.unlocked, true);
  const unknown = byId(items, future.id);
  assert.deepEqual(unknown.achievement, future);
  assert.equal(unknown.progress, null);
  assert.ok(unknown.guidance.length > 0);
  assert.deepEqual(buildAchievementProgress([], stats), []);
});

test('presentation is immutable and needs no route names, travel timestamps, or user profile', () => {
  const stats = journeyStatistics(record([commute]), NOW);
  const minimal = Object.freeze({ totalJourneys: stats.totalJourneys, visitedIds: Object.freeze([...stats.visitedIds]), streak: stats.streak });
  const achievements = Object.freeze(unlockAchievements(stats).map(item => Object.freeze(item)));
  const before = JSON.stringify({ minimal, achievements });
  const items = buildAchievementProgress(achievements, minimal);
  assert.equal(JSON.stringify({ minimal, achievements }), before);
  const output = JSON.stringify(items);
  assert.doesNotMatch(output, /pcmc|civil-court|2026-10|08:00|Pune Explorer/);
  assert.equal(items.length, achievements.length);
});
