// Run against a production export in a FRESH, disposable browser session:
// playwright-cli -s=leagues-standings open http://localhost:8090/
// playwright-cli -s=leagues-standings run-code --filename=src/features/leagues/standings.browser.js
// This test records three local demo rides and edits a demo display name.
async (page) => {
  const assert = (condition, message) => { if (!condition) throw new Error(message); };
  const errors = [];
  const onError = error => errors.push(error.message);
  const onConsole = message => { if (message.type() === 'error') errors.push(message.text()); };
  page.on('pageerror', onError);
  page.on('console', onConsole);
  const home = new URL('.', page.url()).href;
  const open = async route => page.goto(new URL(route, home).href);
  const standings = title => page.getByRole('list', { name: `${title} sample standings`, exact: true });
  const select = async (name, key = 'Enter') => {
    const button = page.getByRole('button', { name: `${name} sample demo league`, exact: true });
    await button.focus();
    await button.press(key);
    assert(await button.getAttribute('aria-pressed') === 'true', `${name} must expose its selected state`);
    assert(await button.evaluate(element => element === document.activeElement), `${name} must retain keyboard focus`);
  };
  const checkBoard = async (title, expectedScores, ownName = 'Pune Explorer') => {
    const list = standings(title);
    await list.waitFor();
    const rows = list.getByRole('listitem');
    assert(await rows.count() === expectedScores.length, `${title}: incorrect board size`);
    const names = await rows.evaluateAll(elements => elements.map(element => element.getAttribute('aria-label')));
    expectedScores.forEach((score, index) => {
      assert(names[index].startsWith(`Position ${index + 1} of ${expectedScores.length}, `), `${title}: missing ordinal context`);
      assert(names[index].includes(`, ${score} XP.`), `${title}: wrong score/order at position ${index + 1}`);
      assert(names[index].endsWith(names[index].includes(', you,')
        ? 'Your local, self-reported score.' : 'Fictional sample profile.'), `${title}: missing score provenance`);
    });
    assert(names.filter(name => name.includes(`, ${ownName}, you,`)).length === 1, 'Exactly one identified local rider is required');
    assert(await list.locator('[tabindex="0"]').count() === 0, 'Static standings must not add keyboard tab stops');
    const tree = await list.ariaSnapshot();
    assert((tree.match(/listitem /g) || []).length === expectedScores.length, 'Every row must reach the accessibility tree');
    assert(!/\n\s+- (text|generic):/.test(tree), 'Decorative avatars and repeated row text must not be separately announced');
    return list;
  };
  const log = async (from, to, minute) => {
    await page.clock.setFixedTime(new Date(Date.UTC(2026, 9, 24, 8, minute)));
    await open('log');
    await page.getByRole('button', { name: /^Origin:/ }).click();
    await page.getByRole('textbox', { name: 'Search stations', exact: true }).fill(from);
    await page.getByRole('button', { name: `Select ${from}`, exact: true }).click();
    await page.getByRole('button', { name: /^Destination:/ }).click();
    await page.getByRole('textbox', { name: 'Search stations', exact: true }).fill(to);
    await page.getByRole('button', { name: `Select ${to}`, exact: true }).click();
    await page.getByRole('button', { name: 'Confirm journey', exact: true }).click();
    await page.getByRole('heading', { name: /^Hey, / }).waitFor();
  };
  const rename = async name => {
    await page.getByRole('link', { name: /Profile$/ }).click();
    await page.getByRole('textbox', { name: 'Display name', exact: true }).fill(name);
    await page.getByRole('button', { name: 'Save profile', exact: true }).click();
    await page.getByText('Profile preference saved. This demo remains local.', { exact: true }).waitFor();
    // Use SPA navigation so the mounted Leagues screen must react to AppState updates.
    await page.getByRole('link', { name: /Leagues$/ }).click();
  };
  try {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await open('leagues');
    await page.getByText('Pune Explorer · you', { exact: true }).waitFor();
    await checkBoard('Pune explorers', [240, 180, 90, 40, 20, 10, 0]);
    await select('Friends', 'Space');
    await checkBoard('Friends preview', [240, 180, 90, 0]);
    await select('Route');
    await select('Aqua Line', 'Space');
    await checkBoard('Aqua Line league', [180, 40, 10, 0]);
    await page.getByText(/^No rides on Aqua Line yet\./).waitFor();
    await select('Pune');
    await select('Route');
    assert(await page.getByRole('button', { name: 'Aqua Line sample demo league', exact: true }).getAttribute('aria-pressed') === 'true', 'Route choice must survive scope switches');

    await log('PCMC', 'Civil Court (District Court)', 0);
    await open('leagues');
    await checkBoard('Pune explorers', [240, 180, 90, 50, 40, 20, 10]);
    await select('Route');
    await checkBoard('Purple Line league', [240, 90, 50, 20]);
    await select('Aqua Line');
    await checkBoard('Aqua Line league', [180, 40, 10, 0]);

    // First transfer earns one new endpoint bonus; repeat rides add only 10 XP.
    await log('PCMC', 'Vanaz', 2);
    await log('Vanaz', 'PCMC', 4);
    await open('leagues');
    await checkBoard('Pune explorers', [240, 180, 90, 90, 40, 20, 10]);
    await select('Route');
    await checkBoard('Purple Line league', [240, 90, 90, 20]);
    await select('Aqua Line');
    await checkBoard('Aqua Line league', [180, 40, 40, 10]);

    await select('Pune');
    await rename('A demo rider');
    let list = await checkBoard('Pune explorers', [240, 180, 90, 90, 40, 20, 10], 'A demo rider');
    assert((await list.getByRole('listitem').nth(2).getAttribute('aria-label')).includes('A demo rider, you'), 'Name change must reorder an XP tie');
    await rename('Neha');
    list = await checkBoard('Pune explorers', [240, 180, 90, 90, 40, 20, 10], 'Neha');
    assert((await list.getByRole('listitem').nth(2).getAttribute('aria-label')).endsWith('Fictional sample profile.'), 'Same-name sample must keep its identity');
    assert((await list.getByRole('listitem').nth(3).getAttribute('aria-label')).includes('Neha, you'), 'Same-name current rider must keep its identity');

    const longName = 'W'.repeat(40);
    await rename(longName);
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const scope of ['Pune', 'Friends', 'Route']) {
        await select(scope);
        const list = page.getByRole('list', { name: /sample standings$/ });
        const ownRow = list.getByRole('listitem', { name: new RegExp(`${longName}, you`) });
        await ownRow.scrollIntoViewIfNeeded();
        const fits = await ownRow.evaluate(row => {
          const bounds = row.getBoundingClientRect();
          const walker = document.createTreeWalker(row, NodeFilter.SHOW_TEXT);
          let text;
          while ((text = walker.nextNode())) {
            if (!text.textContent.trim()) continue;
            const range = document.createRange();
            range.selectNodeContents(text);
            for (const rect of range.getClientRects()) {
              if (rect.left < bounds.left - 1 || rect.right > bounds.right + 1 ||
                rect.top < bounds.top - 1 || rect.bottom > bounds.bottom + 1) return false;
            }
          }
          return true;
        });
        assert(fits, `${width}px ${scope}: long name, score and provenance must fit inside the row`);
        assert(!await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), `${width}px: document overflow`);
        if (width < 1180) {
          const footer = await page.getByText('Equal XP scores are ordered by name.', { exact: true }).boundingBox();
          const nextSection = await page.getByRole('heading', { name: 'One week. One small goal.', exact: true }).boundingBox();
          const card = await list.locator('..').boundingBox();
          assert(footer && card && footer.y + footer.height <= card.y + card.height,
            `${width}px ${scope}: standings footer must fit inside its card`);
          assert(card && nextSection && card.y + card.height < nextSection.y,
            `${width}px ${scope}: weekly goal must not overlap the standings footer`);
        }
      }
    }
    await page.reload();
    await checkBoard('Pune explorers', [240, 180, 90, 90, 40, 20, 10], longName);
    assert(errors.length === 0, `Browser errors: ${errors.join('; ')}`);
    return { passed: true, manualDemoRides: 3, routeScores: { purple: 90, aqua: 40 },
      sameNameTie: true, profilePersisted: true, widths: [320, 390, 768, 1440], browserErrors: errors };
  } finally {
    page.off('pageerror', onError);
    page.off('console', onConsole);
  }
}
