const { test } = require('node:test');
const assert = require('node:assert/strict');

test('E2E validation rejects partial runs, failed persistence, browser errors and slow logging', async () => {
  const { validateSmokeResult } = await import('../scripts/verify-e2e.mjs');
  const complete = { journeyMilliseconds: 1500, journeys: 1, collected: 2, xp: 50, postPersisted: true, reactionPersisted: true, membershipPersisted: true, profilePersisted: true, mobileTabs: 5, browserErrors: [] };
  assert.equal(validateSmokeResult(complete), complete);
  for (const invalid of [null, {}, { ...complete, journeys: 0 }, { ...complete, collected: 1 }, { ...complete, xp: 0 }, { ...complete, profilePersisted: false }, { ...complete, membershipPersisted: false }, { ...complete, postPersisted: false }, { ...complete, reactionPersisted: false }, { ...complete, mobileTabs: 4 }, { ...complete, browserErrors: ['Runtime crash'] }, { ...complete, browserErrors: undefined }, { ...complete, journeyMilliseconds: 10_000 }]) {
    assert.throws(() => validateSmokeResult(invalid));
  }
});
