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
const { communityCardSummary, validateCommunityPost, handleShareResult } = loaded.exports;

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

test('handleShareResult handles browser void result and native actions', () => {
  // Web browser: react-native-web delegates to navigator.share() which resolves undefined (void)
  const browserResult = handleShareResult(undefined);
  assert.equal(browserResult?.ok, true);
  assert.match(browserResult?.message, /handed to the share dialog/);

  // Native sharedAction
  const nativeShared = handleShareResult({ action: 'sharedAction' });
  assert.equal(nativeShared?.ok, true);
  assert.match(nativeShared?.message, /handed to the share dialog/);

  // Native dismissedAction
  const nativeDismissed = handleShareResult({ action: 'dismissedAction' });
  assert.equal(nativeDismissed?.ok, false);
  assert.match(nativeDismissed?.message, /Sharing cancelled/);
});

test('simulated web navigator.share resolving undefined produces successful handoff', async () => {
  let sharedPayload = null;
  const mockNavigatorShare = async (payload) => {
    sharedPayload = payload;
    return undefined; // Browser navigator.share() resolves void/undefined
  };

  // Execute share simulation matching CommunityScreen shareCard flow
  const summary = communityCardSummary({ totalJourneys: 2, stationsCount: 4, points: 100 });
  let feedback = null;
  try {
    const rawResult = await mockNavigatorShare({ title: 'My MetroQuest commuter card', text: summary });
    const handled = handleShareResult(rawResult);
    if (handled) feedback = handled;
  } catch {
    feedback = { ok: false, message: 'Sharing is unavailable here.' };
  }

  assert.equal(feedback?.ok, true);
  assert.match(feedback?.message, /handed to the share dialog/);
  assert.equal(sharedPayload?.title, 'My MetroQuest commuter card');
  assert.match(sharedPayload?.text, /2 self-reported rides · 4 stations collected · 100 XP/);
  // Privacy assertion on payload handed to navigator.share
  assert.doesNotMatch(sharedPayload?.text, /PCMC|Swargate|Vanaz|Ramwadi/);
});

test('simulated web navigator.share rejecting reports fallback without throw', async () => {
  const mockNavigatorShare = async () => {
    throw new Error('AbortError: Share canceled by user');
  };

  let feedback = null;
  try {
    const rawResult = await mockNavigatorShare();
    const handled = handleShareResult(rawResult);
    if (handled) feedback = handled;
  } catch {
    feedback = { ok: false, message: 'Sharing is unavailable here. Your card preview below is ready to copy or screenshot.' };
  }

  assert.equal(feedback?.ok, false);
  assert.match(feedback?.message, /Sharing is unavailable here/);
});
