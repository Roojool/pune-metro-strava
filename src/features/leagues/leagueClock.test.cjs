const { test } = require('node:test');
const assert = require('node:assert/strict');
const { nextLeagueRefreshDelay } = require('./leagueClock.ts');
const { createJourney, journeyStatistics, unlockAchievements, weeklyChallenges } = require('../../../.test-build/domain/metro.js');

const DAY = 86_400_000;
const now = Date.parse('2026-10-24T12:00:00.000Z');
const rideAt = at => createJourney({ from: 'pcmc', to: 'civil-court' }, [], new Date(at));

test('refreshes just after the inclusive seven-day boundary, without changing all-time XP', () => {
  const rides = [rideAt(now - 7 * DAY), ...[1, 2, 3, 4].map(days => rideAt(now - days * DAY))];
  const before = journeyStatistics(rides, new Date(now));
  const delay = nextLeagueRefreshDelay(rides, now);
  const after = journeyStatistics(rides, new Date(now + delay));
  assert.equal(delay, 1);
  assert.equal(weeklyChallenges(before)[0].progress, 5);
  assert.equal(weeklyChallenges(after)[0].progress, 4);
  assert.equal(after.points, before.points);
  assert.equal(after.totalJourneys, before.totalJourneys);
});

test('schedules the nearest expiry, including when a completed challenge hides surplus rides', () => {
  const rides = [rideAt(now - 7 * DAY + 1200), rideAt(now - 7 * DAY + 600), ...[1, 2, 3, 4].map(days => rideAt(now - days * DAY))];
  assert.equal(nextLeagueRefreshDelay(rides, now), 601);
  assert.equal(weeklyChallenges(journeyStatistics(rides, new Date(now + 601)))[0].progress, 5);
  assert.equal(nextLeagueRefreshDelay(rides, now + 601), 600);
  assert.equal(weeklyChallenges(journeyStatistics(rides, new Date(now + 1201)))[0].progress, 4);
});

test('refreshes at India midnight when yesterday grace expires and the streak badge relocks', () => {
  const beforeMidnight = Date.parse('2026-10-24T18:29:59.999Z');
  const rides = [21, 22, 23].map(day => rideAt(`2026-10-${day}T06:00:00Z`));
  const before = journeyStatistics(rides, new Date(beforeMidnight));
  const delay = nextLeagueRefreshDelay(rides, beforeMidnight);
  const after = journeyStatistics(rides, new Date(beforeMidnight + delay));
  assert.equal(delay, 1);
  assert.equal(before.streak, 3);
  assert.equal(after.streak, 0);
  assert.equal(unlockAchievements(before).find(a => a.id === 'consistent').unlocked, true);
  assert.equal(unlockAchievements(after).find(a => a.id === 'consistent').unlocked, false);
  assert.equal(after.activeDays, before.activeDays);
});

test('uses India midnight across UTC month and year boundaries', () => {
  for (const at of ['2026-10-31T18:29:59.500Z', '2026-12-31T18:29:59.500Z']) {
    assert.equal(nextLeagueRefreshDelay([], Date.parse(at)), 500);
    assert.equal(nextLeagueRefreshDelay([], Date.parse(at) + 500), 60_000);
  }
});

test('schedules a future ride entering the rolling window after a clock correction', () => {
  const rides = [rideAt(now + 900)];
  assert.equal(journeyStatistics(rides, new Date(now)).weeklyJourneys, 0);
  assert.equal(nextLeagueRefreshDelay(rides, now), 900);
  assert.equal(journeyStatistics(rides, new Date(now + 900)).weeklyJourneys, 1);
});

test('empty, expired and distant rides retain a bounded clock check without spinning', () => {
  for (const rides of [[], [rideAt(now - 8 * DAY)], [rideAt(now)], [rideAt(now + DAY)]]) {
    assert.equal(nextLeagueRefreshDelay(rides, now), 60_000);
  }
  assert.equal(nextLeagueRefreshDelay([rideAt(now - 7 * DAY)], now + 1), 60_000);
});

test('does not mutate journey data or propagate invalid dates into timer delays', () => {
  const rides = Object.freeze([Object.freeze({ at: 'invalid' }), Object.freeze({ at: new Date(now - 7 * DAY + 25).toISOString() })]);
  assert.equal(nextLeagueRefreshDelay(rides, now), 26);
  assert.equal(rides[0].at, 'invalid');
});
