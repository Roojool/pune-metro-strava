const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

const filename = path.join(__dirname, 'community-card.ts');
const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } });
const loaded = new Module(filename, module);
loaded._compile(compiled.outputText, filename);
const { communityCardSummary, validateCommunityPost } = loaded.exports;

test('validateCommunityPost rejects empty and whitespace-only text', () => {
  assert.equal(validateCommunityPost('').ok, false);
  assert.equal(validateCommunityPost('   ').ok, false);
  assert.equal(validateCommunityPost('\n\t  \n').ok, false);
  assert.match(validateCommunityPost('').message, /between 1 and 500 characters/);
});

test('validateCommunityPost enforces character boundaries', () => {
  const at500 = 'a'.repeat(500);
  const at501 = 'a'.repeat(501);
  const valid = validateCommunityPost(at500);
  assert.equal(valid.ok, true);
  assert.equal(valid.cleanBody?.length, 500);

  const invalid = validateCommunityPost(at501);
  assert.equal(invalid.ok, false);
  assert.match(invalid.message, /between 1 and 500 characters/);
});

test('validateCommunityPost trims whitespace from valid post', () => {
  const res = validateCommunityPost('  Civil Court station tip: north exit is faster!  ');
  assert.equal(res.ok, true);
  assert.equal(res.cleanBody, 'Civil Court station tip: north exit is faster!');
});

test('communityCardSummary includes aggregate metrics and privacy disclaimer', () => {
  const summary = communityCardSummary({ totalJourneys: 3, stationsCount: 5, points: 150 });
  assert.match(summary, /My MetroQuest commuter card/);
  assert.match(summary, /3 self-reported rides · 5 stations collected · 150 XP/);
  assert.match(summary, /Pune Metro · local demo, not verified travel or a live ranking\./);
  // Privacy assertion: must NOT include personal commute details, private names, or specific timestamps
  assert.doesNotMatch(summary, /PCMC|Swargate|Vanaz|Ramwadi|Civil Court/);
  assert.doesNotMatch(summary, /2026-|UTC|AM|PM|commuter_name/);
});

test('communityCardSummary handles honest zero state', () => {
  const summary = communityCardSummary({ totalJourneys: 0, stationsCount: 0, points: 0 });
  assert.match(summary, /0 self-reported rides · 0 stations collected · 0 XP/);
});
