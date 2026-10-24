const test = require('node:test');
const assert = require('node:assert/strict');
const configure = require('../app.config.js');
test('Pages base path is build-only and preserves native/default config', () => {
  const previous = process.env.GITHUB_PAGES;
  const config = { name: 'MetroQuest', experiments: { typedRoutes: true }, platforms: ['web','android','ios'] };
  try {
    delete process.env.GITHUB_PAGES;
    assert.deepEqual(configure({ config }),config);
    process.env.GITHUB_PAGES = 'true';
    const pages = configure({ config });
    assert.equal(pages.experiments.baseUrl,'/pune-metro-strava');
    assert.equal(pages.experiments.typedRoutes,true);
    assert.deepEqual(pages.platforms,config.platforms);
    assert.equal(config.experiments.baseUrl,undefined);
  } finally {
    if (previous === undefined) delete process.env.GITHUB_PAGES;
    else process.env.GITHUB_PAGES = previous;
  }
});
