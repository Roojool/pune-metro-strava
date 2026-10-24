// Run in a fresh local production browser with Playwright CLI run-code.
// The browser share stub checks payloads without sending anything externally.
async (page) => {
  const assert = (value, message) => { if (!value) throw new Error(message); };
  const home = new URL('.', page.url()).href;
  await page.goto(home);
  await page.getByRole('button', { name: 'Log a ride', exact: true }).click();
  await page.getByRole('button', { name: 'Confirm journey', exact: true }).click();
  await page.getByRole('button', { name: 'Log a ride', exact: true }).waitFor();
  for (const [route, label, success, unavailable] of [
    ['community', 'Share my card', 'Your commuter card was handed to the share dialog.', 'Sharing is unavailable here. Your card preview below is ready to copy or screenshot.'],
    ['passport', 'Share my passport summary', 'Share action completed. Your summary contains totals only, with no routes or travel dates.', 'Sharing is unavailable or was cancelled. You can select and copy the passport summary below. No data has been published by MetroQuest.'],
  ]) {
    await page.goto(new URL(route, home).href);
    await page.evaluate(() => {
      Object.defineProperty(navigator, 'share', { configurable: true, value: async payload => { window.qaSharePayload = payload; } });
    });
    const button = page.getByRole('button', { name: label, exact: true });
    await button.click();
    await page.getByText(success, { exact: true }).waitFor();
    const payload = await page.evaluate(() => window.qaSharePayload);
    assert(payload && typeof payload.text === 'string' && payload.text.includes('50 XP'), `${route} must share earned aggregate progress`);
    assert(!/PCMC|Civil Court|Pune Explorer|Demo Explorer|\d{4}-\d{2}-\d{2}/.test(payload.text), `${route} must omit routes, names and travel dates`);
    assert(!payload.url, `${route} must not add a private route URL`);
    await page.evaluate(() => {
      Object.defineProperty(navigator, 'share', { configurable: true, value: async () => { throw new Error('QA share unavailable'); } });
    });
    await button.click();
    await page.getByText(unavailable, { exact: true }).waitFor();
    assert(await button.isEnabled(), `${route} must recover from sharing failure`);
  }
  return { webVoidSuccess: true, failureRecovery: true, aggregateOnlyPayloads: true, externalSharesSent: 0 };
}
