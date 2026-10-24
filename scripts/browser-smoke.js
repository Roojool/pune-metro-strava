// Run in a fresh Playwright CLI session on Home:
// playwright-cli -s=metroquest-qa run-code --filename=scripts/browser-smoke.js
// Creates clearly labeled local QA activity; never sends a community post remotely.
async (page) => {
  const assert = (value, message) => { if (!value) throw new Error(message); };
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  const homeUrl = new URL('.', page.url()).href;
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(homeUrl);
  await page.getByRole('heading', { name: 'Hey, Pune Explorer.', exact: true }).waitFor();
  const navigate = async title => { await page.getByRole('link', { name: new RegExp(`${title}$`) }).click(); };
  const begin = Date.now();
  await page.getByRole('button', { name: 'Log a ride', exact: true }).click();
  await page.getByRole('button', { name: /^Origin:/ }).click();
  await page.getByRole('textbox', { name: 'Search stations', exact: true }).fill('PCMC');
  await page.getByRole('button', { name: 'Select PCMC', exact: true }).click();
  await page.getByRole('button', { name: /^Destination:/ }).click();
  await page.getByRole('textbox', { name: 'Search stations', exact: true }).fill('Civil');
  await page.getByRole('button', { name: 'Select Civil Court (District Court)', exact: true }).click();
  await page.getByRole('button', { name: 'Confirm journey', exact: true }).click();
  await page.getByRole('heading', { name: 'Hey, Pune Explorer.', exact: true }).waitFor();
  const journeyMilliseconds = Date.now() - begin;
  assert(journeyMilliseconds < 10_000, `Quick log took ${journeyMilliseconds}ms`);
  await page.getByText(/^LATEST (?:SELF-REPORTED )?RIDE$/).filter({visible:true}).waitFor();
  await page.getByText('50 XP earned', { exact: true }).filter({visible:true}).waitFor();
  await page.getByText('2 / 28', { exact: true }).filter({visible:true}).waitFor();
  await page.getByRole('button', { name: /^Log again(?: from .+)?$/ }).first().click();
  await page.getByText(/Wait one minute before logging another ride/).waitFor();

  await navigate('Passport');
  await page.getByRole('button', { name: 'PCMC, Collected. Show station details', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Civil Court (District Court), Collected. Show station details', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Range Hill, Unavailable. Show station details', exact: true }).click();
  await page.getByText('NOT OPEN FOR COLLECTION', { exact: true }).waitFor();
  await page.getByText('Estimated ride time', { exact: true }).locator('..').locator('..').getByText('28 min', { exact: true }).waitFor();
  await page.getByRole('tab', { name: 'Explore Aqua Line', exact: true }).click();
  await page.getByRole('button', { name: 'Vanaz, To explore. Show station details', exact: true }).waitFor();

  await navigate('Leagues');
  await page.getByText('UNLOCKED', { exact: true }).locator('..').getByText('First stop', { exact: true }).waitFor();
  await page.getByText('Pune Explorer · you', { exact: true }).waitFor();
  await page.getByRole('button', { name: /^Friends (?:sample )?demo league$/ }).click();
  await page.getByText('Friends preview', { exact: true }).waitFor();
  await page.getByRole('button', { name: /^Route (?:sample )?demo league$/ }).click();
  await page.getByRole('button', { name: /^Aqua Line (?:sample demo )?league$/ }).click();
  await page.getByText('Aqua Line league', { exact: true }).waitFor();

  await navigate('Community');
  await page.getByRole('button', { name: 'Open Purple Line discussion', exact: true }).click();
  const composer = page.getByRole('textbox', { name: 'Write a community post', exact: true });
  await composer.fill('   ');
  assert(await page.getByRole('button', { name: 'Post locally', exact: true }).isDisabled(), 'Whitespace post must be disabled');
  const post = `Sample local MetroQuest QA post · ${Date.now()}`;
  await composer.fill(post);
  await page.getByRole('button', { name: 'Post locally', exact: true }).click();
  const postBody = page.getByText(post, { exact: true });
  await postBody.waitFor();
  const postCard = postBody.locator('..');
  await postCard.getByRole('button', { name: /^Like post by / }).click();
  await postCard.getByRole('button', { name: /^Unlike post by / }).waitFor();
  await page.getByRole('button', { name: 'Join this community', exact: true }).click();
  await page.getByRole('button', { name: 'Joined · leave group', exact: true }).waitFor();
  await page.reload();
  await postBody.waitFor();
  await postCard.getByRole('button', { name: /^Unlike post by / }).waitFor();
  await page.getByRole('button', { name: 'Joined · leave group', exact: true }).waitFor();

  await navigate('Profile');
  await page.getByRole('textbox', { name: 'Display name', exact: true }).fill('Demo Explorer');
  await page.getByRole('button', { name: 'Save profile', exact: true }).click();
  await page.getByText('Profile preference saved. This demo remains local.', { exact: true }).waitFor();
  await page.reload();
  assert(await page.getByRole('textbox', { name: 'Display name', exact: true }).inputValue() === 'Demo Explorer', 'Profile must persist');
  await navigate('Home');
  await page.getByRole('heading', { name: 'Hey, Demo Explorer.', exact: true }).waitFor();
  await page.getByText('50 XP earned', { exact: true }).filter({visible:true}).waitFor();
  await page.getByText('2 / 28', { exact: true }).filter({visible:true}).waitFor();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('tab', { name: 'Home', exact: true }).waitFor();
  for (const title of ['Home','Passport','Leagues','Community','Profile']) {
    await page.getByRole('tab', { name: title, exact: true }).click();
    assert(await page.getByRole('tab', {name:title,exact:true}).getAttribute('aria-selected') === 'true', `${title} tab must be selected`);
    assert(!await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), `${title} must fit 390px`);
    if (title === 'Leagues') {
      const disclosure = page.getByRole('button', { name: 'How XP works', exact: true });
      await disclosure.click();
      assert(await disclosure.getAttribute('aria-expanded') === 'true', 'XP explanation must expand');
      const card = await disclosure.locator('..').locator('..').boundingBox();
      const explanation = await page.getByText('Rides and XP are self-reported, not independently verified.', { exact: true }).boundingBox();
      assert(card && explanation && explanation.y + explanation.height <= card.y + card.height + 2, 'XP explanation must fit its mobile card');
      await disclosure.press('Space');
      assert(await disclosure.getAttribute('aria-expanded') === 'false', 'XP explanation must close with the keyboard');
    }
  }
  await page.reload();
  await page.getByRole('textbox', { name: 'Display name', exact: true }).waitFor();
  assert(errors.length === 0, `Browser errors: ${errors.join('\n')}`);
  return { journeyMilliseconds, journeys: 1, collected: 2, xp: 50, postPersisted: true, reactionPersisted: true, membershipPersisted: true, profilePersisted: true, mobileTabs: 5, browserErrors: errors };
}
