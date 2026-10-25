// Run against a local production export in a disposable Playwright CLI session:
// playwright-cli -s=leagues-clock run-code --filename=src/features/leagues/clock-browser-smoke.js --raw
// Synthetic SAMPLE QA rides stay in this browser; no remote writes or verified travel.
async (page) => {
  const assert = (value, message) => { if (!value) throw new Error(message); };
  const home = new URL('.', page.url()).href;
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const at = Date.parse('2026-10-24T12:00:00Z');
  await page.clock.install({ time: new Date(at - 60_000) });
  await page.clock.pauseAt(new Date(at));
  try {
    await page.setViewportSize({ width: 1440, height: 1000 });

    const seed = async dates => {
      await page.goto(home);
      await page.evaluate(dates => {
        localStorage.setItem('metroquest.demo.v1', JSON.stringify({
          version: 1, joined: [], posts: [],
          user: { id: 'you', name: 'SAMPLE Clock QA', privateProfile: true },
          journeys: dates.map((at, index) => ({
            id: `sample-clock-qa-${index}`, at, source: 'manual',
            from: 'pcmc', to: 'sant-tukaram-nagar', stationIds: ['pcmc', 'sant-tukaram-nagar'],
            kilometers: 1.3, minutes: 3, fare: null, saved: 7, co2Kg: 0.1, points: index === 0 ? 50 : 10,
          })),
        }));
      }, dates);
      await page.goto(new URL('leagues', home).href);
      await page.getByText('SAMPLE Clock QA · you', { exact: true }).waitFor();
    };
    const challenge = () => page.getByRole('progressbar', { name: 'The five-ride club progress', exact: true });
    const waitProgress = count => challenge().and(page.locator(`[aria-valuetext="${count} of 5 rides in the last 7 days"]`)).waitFor({ timeout: 5000 });
    const stored = () => page.evaluate(() => localStorage.getItem('metroquest.demo.v1'));

    await seed([at - 7 * 86400000 + 1000, at - 86400000, at - 2 * 86400000, at - 3 * 86400000, at - 4 * 86400000].map(ms => new Date(ms).toISOString()));
    const original = await stored();
    await waitProgress(5);
    await page.clock.runFor(1000);
    assert(await challenge().getAttribute('aria-valuetext') === '5 of 5 rides in the last 7 days', 'The inclusive boundary must still count');
    await page.clock.runFor(1);
    await waitProgress(4);
    await page.getByRole('button', { name: 'Log a completed ride', exact: true }).waitFor();
    assert(await stored() === original, 'Clock updates must never write stored rides or XP');

    // Force clicks only to avoid animation-frame stability waits while the test clock
    // is paused. The full app E2E separately exercises ordinary user clicks.
    // A mounted screen must refresh when navigation returns, even with paused timers.
    await page.getByRole('link', { name: /Home$/ }).click({ force: true });
    await page.clock.setSystemTime(new Date(at + 8 * 86400000));
    await page.getByRole('link', { name: /Leagues$/ }).click({ force: true });
    await waitProgress(0);
    assert(await stored() === original, 'Tab focus must not mutate saved data');

    // Saving between ticks must use the new ride's current time immediately.
    await page.clock.setSystemTime(new Date(at + 8 * 86400000 + 30_000));
    await page.getByRole('button', { name: 'Log a completed ride', exact: true }).click({ force: true });
    await page.getByRole('button', { name: 'Confirm journey', exact: true }).click({ force: true });
    await page.getByRole('heading', { name: 'Hey, SAMPLE Clock QA.', exact: true }).waitFor();
    await page.getByRole('link', { name: /Leagues$/ }).click({ force: true });
    await waitProgress(1);
    assert(JSON.parse(await stored()).journeys.length === 6, 'The new local ride must save exactly once');

    // Simulate browser visibility events through RN Web's actual AppState adapter.
    await page.clock.setSystemTime(new Date(at));
    await seed([new Date(at - 7 * 86400000 + 1000).toISOString()]);
    await waitProgress(1);
    await page.evaluate(() => {
      Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await page.clock.runFor(2000);
    assert(await challenge().getAttribute('aria-valuetext') === '1 of 5 rides in the last 7 days', 'Hidden screen must pause its refresh timer');
    await page.evaluate(() => {
      delete document.visibilityState;
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await waitProgress(0);

    // India midnight expires yesterday's streak grace, not the user's all-time XP.
    await page.clock.setSystemTime(new Date('2026-10-24T18:29:59Z'));
    await seed(['2026-10-23T06:00:00Z', '2026-10-22T06:00:00Z', '2026-10-21T06:00:00Z']);
    const badge = page.getByText('Three-day streak', { exact: true }).locator('..');
    await badge.getByText('UNLOCKED', { exact: true }).waitFor();
    const streak = page.getByText('Current streak', { exact: true }).locator('..');
    assert((await streak.textContent()).includes('3 days'), 'Fixture must begin with a three-day streak');
    const midnightStored = await stored();
    await page.clock.runFor(1000);
    await badge.getByText('TO DISCOVER', { exact: true }).waitFor({ timeout: 5000 });
    assert((await streak.textContent()).includes('0 days'), 'Streak must expire at India midnight');
    assert(await stored() === midnightStored, 'Midnight must leave all-time data intact');

    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      assert(!await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), `Leagues must fit ${width}px`);
    }
    assert(errors.length === 0, `Browser errors: ${errors.join('; ')}`);
    return { rollingExpiry: 'pass', inclusiveBoundary: 'pass', tabFocus: 'pass', newRideBetweenTicks: 'pass', visibilityResume: 'pass', indiaMidnight: 'pass', storageUnchanged: 'pass', widths: [390, 1440], browserErrors: errors };
  } finally {
    await page.clock.resume();
  }
}
