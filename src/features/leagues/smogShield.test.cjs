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
  calculateSmogShield,
} = require(path.join(__dirname, 'smogShield.ts'));

test('calculateSmogShield handles honest zero state with empty journeys', () => {
  const summary = calculateSmogShield([]);
  assert.equal(summary.pm25AvoidedMicrograms, 0);
  assert.equal(summary.smogMinutesAvoided, 0);
  assert.equal(summary.filteredAirLiters, 0);
  assert.equal(summary.hillStationFreshAirDays, 0);
  assert.equal(summary.smogShieldTier, 'bronze');
  assert.equal(summary.smogShieldTitle, 'Clean Air Novice');
  assert.equal(summary.highestProtectionCorridor, 'None logged yet');
  assert.match(summary.shareableShieldText, /No rides logged yet/);
  assert.match(summary.accessibilityDescription, /No rides logged yet/);
});

test('calculateSmogShield calculates air volume, particulate avoidance and corridor', () => {
  const journeys = [
    // Ride 1: 25 mins
    {
      id: '1',
      from: 'pcmc',
      to: 'civil-court',
      minutes: 25,
      kilometers: 14,
    },
    // Ride 2: 25 mins
    {
      id: '2',
      from: 'pcmc',
      to: 'civil-court',
      minutes: 25,
      kilometers: 14,
    },
  ];

  const summary = calculateSmogShield(journeys);

  // 50 total minutes
  assert.equal(summary.smogMinutesAvoided, 50);
  // 50 min * 8 L/min = 400 L
  assert.equal(summary.filteredAirLiters, 400);
  // 50 min * 0.45 µg/min = 22.5 µg
  assert.equal(summary.pm25AvoidedMicrograms, 22.5);
  // Tier: < 50 µg is bronze
  assert.equal(summary.smogShieldTier, 'bronze');
  assert.match(summary.highestProtectionCorridor, /(PCMC|Civil Court)/);
});

test('calculateSmogShield advances tiers and hill station equivalents on high transit volumes', () => {
  // 1200 minutes of commute (~20 hours over a month)
  const heavyJourneys = Array.from({ length: 48 }, (_, i) => ({
    id: `j-${i}`,
    from: 'vanaz',
    to: 'ramwadi',
    minutes: 25,
    kilometers: 15,
  }));

  const summary = calculateSmogShield(heavyJourneys);
  // 48 * 25 mins = 1200 mins
  assert.equal(summary.smogMinutesAvoided, 1200);
  // 1200 * 0.45 = 540 µg avoided -> Platinum tier (>= 500 µg)!
  assert.equal(summary.pm25AvoidedMicrograms, 540);
  assert.equal(summary.smogShieldTier, 'platinum');
  assert.equal(summary.smogShieldTitle, 'Western Ghats Air Master');
  assert.equal(summary.smogShieldMarathi, 'सह्याद्री शुद्ध हवा नायक');
  // 540 / 250 = ~2.2 hill station days
  assert.equal(summary.hillStationFreshAirDays, 2.2);
  assert.match(summary.healthBenefitText, /Western Ghats hill station air in Mahabaleshwar/);
});
