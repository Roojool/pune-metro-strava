// Run on a fresh local Home page with Playwright CLI run-code --filename=<this file>.
// Writes sample QA rides only to this browser's local demo storage.
async (page) => {
  const assert = (value, message) => { if (!value) throw new Error(message); };
  const home = new URL('.', page.url()).href;
  await page.goto(home);
  await page.getByRole('button', { name: 'Log a ride', exact: true }).click();
  const swapContainer = await page.getByRole('button', { name: 'Swap origin and destination', exact: true }).locator('..').boundingBox();
  assert(swapContainer && swapContainer.height >= 48, 'The swap touch target must fit inside its parent');
  await page.getByRole('button', { name: /^Origin:/ }).click();
  await page.getByRole('textbox', { name: 'Search stations', exact: true }).fill('Range');
  await page.getByText('No station found', { exact: true }).waitFor();
  await page.keyboard.press('Escape');
  await page.getByRole('textbox', { name: 'Search stations', exact: true }).waitFor({ state: 'hidden' });

  // A failed storage write must keep the form open and allow a retry.
  await page.evaluate(() => {
    window.qaSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === 'metroquest.demo.v1') throw new Error('QA storage unavailable');
      return window.qaSetItem.call(this, key, value);
    };
  });
  await page.getByRole('button', { name: 'Confirm journey', exact: true }).click();
  await page.getByRole('alert').getByText('QA storage unavailable', { exact: true }).waitFor();
  assert(new URL(page.url()).pathname.endsWith('/log'), 'A failed save must stay on the form');
  await page.evaluate(() => { Storage.prototype.setItem = window.qaSetItem; delete window.qaSetItem; });
  await page.getByRole('button', { name: 'Confirm journey', exact: true }).click();
  await page.getByRole('button', { name: 'Log a ride', exact: true }).waitFor();
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('metroquest.demo.v1')));
  assert(stored.journeys.length === 1, 'Retry must save exactly one ride');

  // Extend the real saved journey into seven clearly local history fixtures.
  await page.evaluate(() => {
    const state = JSON.parse(localStorage.getItem('metroquest.demo.v1'));
    state.journeys = Array.from({ length: 7 }, (_, index) => ({
      ...state.journeys[0], id: `sample-qa-ride-${index}`,
      at: new Date(Date.now() - (index + 1) * 86400000).toISOString(),
    }));
    localStorage.setItem('metroquest.demo.v1', JSON.stringify(state));
  });
  await page.reload();
  const historyRows = page.getByLabel(/^Manual ride from /);
  await page.getByRole('button', { name: 'Show older rides', exact: true }).waitFor({ timeout: 5000 });
  assert(await historyRows.count() === 5, 'History initially shows five recent rides');
  await page.getByRole('button', { name: 'Show older rides', exact: true }).click();
  assert(await historyRows.count() === 7, 'Expanded history must include older rides');
  await page.getByRole('button', { name: 'Show recent rides', exact: true }).click();
  assert(await historyRows.count() === 5, 'History can collapse again');

  // The same shortcut must save once and reject rapid repeats.
  const repeat = page.getByRole('button', { name: /^Log again/ });
  const repeatCard = repeat.locator('..').locator('..');
  await repeat.click();
  await repeatCard.getByText('Journey saved. Your passport and XP are updated.', { exact: true }).waitFor({ timeout: 5000 });
  await repeat.click();
  await repeatCard.getByRole('alert').getByText(/Wait one minute/).waitFor();
  assert(await page.evaluate(() => JSON.parse(localStorage.getItem('metroquest.demo.v1')).journeys.length) === 8, 'Duplicate must not persist');
  await page.reload();
  await page.getByRole('button', { name: 'Show older rides', exact: true }).waitFor();
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.getByRole('button', { name: 'Show older rides', exact: true }).click();
    assert(!await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), `Home must fit ${width}px`);
    await page.screenshot({ path: `output/journey-${width}.png`, fullPage: true });
    await page.getByRole('button', { name: 'Show recent rides', exact: true }).click();
  }
  // Unreadable saved data must remain intact and offer recovery, not an empty dashboard.
  await page.evaluate(() => localStorage.setItem('metroquest.demo.v1', 'unreadable QA data'));
  await page.reload();
  await page.getByRole('button', { name: 'Open profile for recovery options', exact: true }).waitFor({ timeout: 5000 });
  assert(await page.getByRole('button', { name: 'Log a ride', exact: true }).count() === 0, 'Home must not offer writes after a load failure');
  await page.goto(new URL('log', home).href);
  await page.getByRole('button', { name: 'Open profile for recovery options', exact: true }).waitFor();
  assert(await page.getByRole('button', { name: 'Confirm journey', exact: true }).count() === 0, 'Log must not offer writes after a load failure');
  assert(await page.evaluate(() => localStorage.getItem('metroquest.demo.v1')) === 'unreadable QA data', 'Failed hydration must preserve saved data');
  return { saveFailure: 'pass', retry: 'pass', history: 'pass', duplicate: 'pass', reload: 'pass', recovery: 'pass', widths: [390, 1440] };
}
