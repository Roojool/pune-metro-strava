const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const ts = require('typescript');

require.extensions['.ts'] = function (module, filename) {
  const code = fs.readFileSync(filename, 'utf8');
  const compiled = ts.transpileModule(code, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  });
  module._compile(compiled.outputText, filename);
};

const {
  calculateCommuterAudit,
} = require(path.join(__dirname, 'commuterAudit.ts'));

test('calculateCommuterAudit handles honest zero state with clean provisional score', () => {
  const summary = calculateCommuterAudit([]);
  assert.equal(summary.trustScore, 100);
  assert.equal(summary.trustTier, 'provisional');
  assert.equal(summary.trustTierTitle, 'Provisional Account');
  assert.equal(summary.totalJourneysAudited, 0);
  assert.equal(summary.rapidSpamChecksPassed, true);
  assert.equal(summary.dailyCapCompliant, true);
  assert.equal(summary.flaggedAnomaliesCount, 0);
  assert.match(summary.shareableAuditText, /No rides logged yet/);
});

test('calculateCommuterAudit flags rapid duplicate logs (< 60s)', () => {
  const journeys = [
    // Ride 1 at 09:00:00
    {
      id: '1',
      from: 'pcmc',
      to: 'civil-court',
      at: '2026-10-24T03:30:00Z',
    },
    // Ride 2 only 20 seconds later at 09:00:20 (SPAM)
    {
      id: '2',
      from: 'civil-court',
      to: 'swargate',
      at: '2026-10-24T03:30:20Z',
    },
  ];

  const summary = calculateCommuterAudit(journeys);
  assert.equal(summary.rapidSpamChecksPassed, false);
  assert.equal(summary.flaggedAnomaliesCount, 1);
  assert.match(summary.integrityFlags[0].message, /Rapid log interval detected/);
  // Score deducted: 100 - 15 = 85
  assert.equal(summary.trustScore, 85);
});

test('calculateCommuterAudit flags daily cap exceeding (> 10 rides / day)', () => {
  // 12 rides logged on the same calendar day, spaced by 5 minutes
  const journeys = Array.from({ length: 12 }, (_, i) => ({
    id: `j-${i}`,
    from: 'vanaz',
    to: 'ramwadi',
    at: new Date(Date.parse('2026-10-24T04:00:00Z') + i * 300000).toISOString(),
  }));

  const summary = calculateCommuterAudit(journeys);
  assert.equal(summary.dailyCapCompliant, false);
  assert.ok(summary.integrityFlags.some((f) => f.type === 'daily_cap_exceeded'));
  assert.equal(summary.rapidSpamChecksPassed, true); // spaced by 5 min
});

test('calculateCommuterAudit flags identical origin and destination', () => {
  const journeys = [
    {
      id: 'loop',
      from: 'civil-court',
      to: 'civil-court',
      at: '2026-10-24T05:00:00Z',
    },
  ];

  const summary = calculateCommuterAudit(journeys);
  assert.ok(summary.integrityFlags.some((f) => f.type === 'same_station_endpoint'));
});

test('calculateCommuterAudit awards Fair Play Champion to clean compliant profile', () => {
  // 5 properly spaced rides across 2 days
  const journeys = [
    { id: '1', from: 'pcmc', to: 'civil-court', at: '2026-10-20T04:00:00Z' },
    { id: '2', from: 'civil-court', to: 'swargate', at: '2026-10-20T06:00:00Z' },
    { id: '3', from: 'swargate', to: 'pcmc', at: '2026-10-21T04:00:00Z' },
    { id: '4', from: 'vanaz', to: 'ramwadi', at: '2026-10-21T06:00:00Z' },
    { id: '5', from: 'ramwadi', to: 'vanaz', at: '2026-10-21T08:00:00Z' },
  ];

  const summary = calculateCommuterAudit(journeys);
  assert.equal(summary.trustScore, 100);
  assert.equal(summary.flaggedAnomaliesCount, 0);
  assert.equal(summary.trustTier, 'fair_play_champion');
  assert.equal(summary.trustTierTitle, 'Punekar Fair Play Champion');
  assert.equal(summary.trustTierMarathi, 'पुणेकर सत्यनिष्ठ विजेता');
  assert.match(summary.shareableAuditText, /Fair Play Champion/);
});
