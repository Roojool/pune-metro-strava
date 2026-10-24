const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const filename = path.join(__dirname, 'presentation.ts');
const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } });
const loaded = new Module(filename, module);
loaded._compile(compiled.outputText, filename);
const { passportShareSummary } = loaded.exports;

test('share summary includes aggregate progress without exposing journey locations or dates', () => {
  const summary = passportShareSummary({ totalJourneys: 1, totalKm: 13.4, points: 50, visitedIds: ['pcmc', 'civil-court'], journeys: [{ from: 'PCMC', to: 'Civil Court', at: '2026-10-24T08:00:00Z' }] }, 28);
  assert.match(summary, /1 self-reported metro journeys/);
  assert.match(summary, /2\/28 boarding & exit stations collected/);
  assert.match(summary, /13\.4 km estimated · 50 XP/);
  assert.match(summary, /not independently verified/);
  assert.doesNotMatch(summary, /PCMC|Civil Court|2026-10-24|08:00|pcmc|civil-court/);
});

test('empty passport shares an honest zero state', () => {
  const summary = passportShareSummary({ totalJourneys: 0, totalKm: 0, points: 0, visitedIds: [] }, 28);
  assert.match(summary, /0 self-reported metro journeys/);
  assert.match(summary, /0\/28/);
  assert.match(summary, /Local demo/);
});
