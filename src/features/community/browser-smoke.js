// Run against an open /community page with: playwright-cli -s=SESSION run-code --filename=src/features/community/browser-smoke.js
// Creates one clearly labeled local QA post; it does not contact a social backend.
async (page) => {
  const assert = (condition, message) => { if (!condition) throw new Error(message); };
  await page.getByRole('button', { name: 'Open Purple Line discussion', exact: true }).click();
  const composer = page.getByRole('textbox', { name: 'Write a community post', exact: true });
  await composer.fill('   ');
  assert(await page.getByRole('button', { name: 'Post locally', exact: true }).isDisabled(), 'Whitespace post must stay disabled');
  await composer.fill('Purple draft');
  await page.getByRole('button', { name: 'Open Aqua Line discussion', exact: true }).click();
  await composer.fill('Aqua draft');
  await page.getByRole('button', { name: 'Open Purple Line discussion', exact: true }).click();
  assert(await composer.inputValue() === 'Purple draft', 'Draft must remain attached to its community');
  const post = `Sample community QA post · ${Date.now()}`;
  await composer.fill(post);
  await page.getByRole('button', { name: 'Post locally', exact: true }).click();
  const postBody = page.getByText(post, { exact: true });
  await postBody.waitFor({ state: 'visible' });
  assert(await composer.inputValue() === '', 'Successful posting must clear only the submitted draft');
  const card = postBody.locator('..');
  await card.getByRole('button', { name: /^Like post by / }).click();
  await card.getByRole('button', { name: /^Unlike post by / }).waitFor({ state: 'visible' });
  const join = page.getByRole('button', { name: 'Join this community', exact: true });
  if (await join.count()) await join.click();
  await page.getByRole('button', { name: 'Joined · leave group', exact: true }).waitFor({ state: 'visible' });
  await page.reload();
  await postBody.waitFor({ state: 'visible' });
  await card.getByRole('button', { name: /^Unlike post by / }).waitFor({ state: 'visible' });
  await page.getByRole('button', { name: 'Joined · leave group', exact: true }).waitFor({ state: 'visible' });
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    assert(!overflow, `Community page must fit ${width}px without horizontal overflow`);
  }
  return { postSaved: true, reactionSaved: true, membershipSaved: true, reloadPassed: true, separateDrafts: true, layouts: [390, 1440] };
}
