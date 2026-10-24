// After npm run export:web, serve dist with Expo and open a fresh Playwright CLI session:
// playwright-cli -s=league-achievements run-code --filename=src/features/leagues/achievement-progress-smoke.js
// Creates only local, explicitly labelled demo fixtures. No data is sent to other users.
async (page) => {
  const assert = (value, message) => { if (!value) throw new Error(message); };
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  const homeUrl = new URL('.', page.url()).href;
  const leaguesUrl = new URL('leagues', homeUrl).href;
  const key = 'metroquest.demo.v1';
  const titles = ['First stop', 'Station collector', 'Finding your rhythm', 'Three-day streak'];
  const heading = page.getByRole('heading', { name: 'The little wins collection', exact: true });
  const card = title => page.getByRole('heading', { name: title, exact: true }).locator('..');

  async function checkMeters(percentages, counts) {
    await heading.waitFor();
    for (let index = 0; index < titles.length; index++) {
      const meter = page.getByRole('progressbar', { name: `${titles[index]} progress`, exact: true });
      await meter.waitFor();
      assert(await meter.count() === 1, `${titles[index]} must expose exactly one named meter`);
      assert(await card(titles[index]).getByRole('progressbar').count() === 1,
        `${titles[index]} decorative meter must be hidden from assistive technology`);
      assert(await meter.getAttribute('aria-valuemin') === '0', 'Meter minimum must be zero');
      assert(await meter.getAttribute('aria-valuemax') === '100', 'Meter maximum must be 100');
      assert(await meter.getAttribute('aria-valuenow') === String(percentages[index]), `${titles[index]} percentage mismatch`);
      const value = await meter.getAttribute('aria-valuetext');
      assert(value && value.startsWith(`${counts[index]} `) && value.includes('goal'), `${titles[index]} must announce recorded counts and goal: ${value}`);
      await card(titles[index]).getByText(value, { exact: true }).waitFor();
    }
  }

  async function checkLayout(width) {
    await page.setViewportSize({ width, height: 900 });
    await heading.scrollIntoViewIfNeeded();
    assert(!await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), `Document overflows at ${width}px`);
    for (const title of titles) {
      const fits = await card(title).evaluate(element => {
        const outer = element.getBoundingClientRect();
        return outer.width > 0 && outer.left >= -1 && outer.right <= window.innerWidth + 1
          && [...element.querySelectorAll('*')].every(child => {
            const inner = child.getBoundingClientRect();
            return inner.width === 0 || (inner.left >= outer.left - 1 && inner.right <= outer.right + 1
              && inner.top >= outer.top - 1 && inner.bottom <= outer.bottom + 1);
          });
      });
      assert(fits, `${title} content must fit its card at ${width}px`);
    }
  }

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(homeUrl);
  await page.evaluate(storageKey => localStorage.removeItem(storageKey), key);
  await page.goto(leaguesUrl);
  await checkMeters([0, 0, 0, 0], [0, 0, 0, 0]);
  for (const title of titles) await card(title).getByText('TO DISCOVER', { exact: true }).waitFor();
  await page.getByText('0 OF 4 UNLOCKED', { exact: true }).waitFor();

  // Use the actual save flow to prove the new collection follows AppState mutations.
  await page.getByRole('button', { name: 'Log your first ride', exact: true }).click();
  await page.getByRole('button', { name: 'Confirm journey', exact: true }).click();
  await page.getByRole('heading', { name: 'Hey, Pune Explorer.', exact: true }).waitFor();
  await page.getByRole('link', { name: /Leagues$/ }).click();
  await checkMeters([100, 40, 20, 33], [1, 2, 1, 1]);
  await card('First stop').getByText('UNLOCKED', { exact: true }).waitFor();
  await card('Station collector').getByText(/3 more unique boarding or exit stations/).waitFor();
  await page.reload();
  await checkMeters([100, 40, 20, 33], [1, 2, 1, 1]);

  const stored = await page.evaluate(storageKey => JSON.parse(localStorage.getItem(storageKey)), key);
  assert(stored.journeys.length === 1 && stored.journeys[0].source === 'manual', 'A real local save is required before fixtures');
  // Six same-route rides on three prior India days: yesterday keeps a three-day streak active.
  const day = 86_400_000;
  const todayIndia = Math.floor((Date.now() + 330 * 60_000) / day) * day - 330 * 60_000;
  const completed = {
    ...stored,
    user: { ...stored.user, name: 'Demo achievement QA' },
    journeys: Array.from({ length: 6 }, (_, index) => ({
      ...stored.journeys[0],
      id: `demo-achievement-${index}`,
      at: new Date(todayIndia - (3 - Math.floor(index / 2)) * day + 3_600_000 + (index % 2) * 120_000).toISOString(),
      points: index === 0 ? 50 : 10,
    })).reverse(),
  };
  await page.evaluate(({ storageKey, state }) => localStorage.setItem(storageKey, JSON.stringify(state)), { storageKey: key, state: completed });
  await page.reload();
  await checkMeters([100, 40, 100, 100], [6, 2, 6, 3]);
  await page.getByText('3 OF 4 UNLOCKED', { exact: true }).waitFor();
  await card('Three-day streak').getByText('UNLOCKED', { exact: true }).waitFor();
  for (const width of [320, 390, 768, 1440]) await checkLayout(width);

  // Increase the collection's text by 200%, preserving native wrapping behavior.
  await heading.locator('..').locator('..').evaluate(element => {
    const text = [...element.querySelectorAll('*')].filter(child => child.childNodes.length
      && [...child.childNodes].some(node => node.nodeType === Node.TEXT_NODE));
    const sizes = text.map(child => ({ child, size: getComputedStyle(child).fontSize, line: getComputedStyle(child).lineHeight }));
    for (const { child, size, line } of sizes) {
      child.style.fontSize = `${parseFloat(size) * 2}px`;
      if (line !== 'normal') child.style.lineHeight = `${parseFloat(line) * 2}px`;
    }
  });
  for (const width of [320, 390, 1440]) await checkLayout(width);

  const expired = { ...completed, journeys: completed.journeys.map(ride => ({ ...ride, at: new Date(Date.parse(ride.at) - 4 * day).toISOString() })) };
  await page.evaluate(({ storageKey, state }) => localStorage.setItem(storageKey, JSON.stringify(state)), { storageKey: key, state: expired });
  await page.reload();
  await checkMeters([100, 40, 100, 0], [6, 2, 6, 0]);
  await card('Three-day streak').getByText('TO DISCOVER', { exact: true }).waitFor();
  await page.getByText('2 OF 4 UNLOCKED', { exact: true }).waitFor();

  await page.evaluate(storageKey => localStorage.setItem(storageKey, '{invalid'), key);
  await page.reload();
  await page.getByRole('button', { name: 'Open profile for recovery options', exact: true }).waitFor();
  assert(await heading.count() === 0, 'Unreadable saved state must not show fabricated achievement progress');
  await page.evaluate(storageKey => localStorage.removeItem(storageKey), key);
  await page.reload();
  await checkMeters([0, 0, 0, 0], [0, 0, 0, 0]);
  assert(errors.length === 0, `Browser errors: ${errors.join('\n')}`);
  return {
    passed: true, emptyGoals: 4, firstRidePersisted: true, passedStationsExcluded: true,
    uncappedRideCounts: true, streakRelocked: true, recoveryGated: true,
    widths: [320, 390, 768, 1440], enlargedTextWidths: [320, 390, 1440], browserErrors: errors,
  };
}
