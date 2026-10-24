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
  formatIstDate,
  isMuthaRiverCrossing,
  calculateTrophyCabinet,
} = require(path.join(__dirname, 'trophyCabinet.ts'));

test('formatIstDate converts timestamps accurately to IST format', () => {
  // 2026-10-24T03:00:00Z -> +5:30 -> 2026-10-24 08:30 IST -> '24 Oct 2026'
  const formatted = formatIstDate('2026-10-24T03:00:00Z');
  assert.equal(formatted, '24 Oct 2026');

  // Edge case: invalid string
  assert.equal(formatIstDate('invalid'), 'Recent');
});

test('isMuthaRiverCrossing detects river crossings across Aqua Line', () => {
  // Nal Stop (West) to Ruby Hall Clinic (East) crosses Mutha River
  const crossing = {
    id: '1',
    fromStationId: 'nal-stop',
    toStationId: 'ruby-hall-clinic',
    line: 'aqua',
  };
  assert.equal(isMuthaRiverCrossing(crossing), true);

  // Nal Stop to Deccan Gymkhana (both West) does not cross the river
  const nonCrossing = {
    id: '2',
    fromStationId: 'nal-stop',
    toStationId: 'deccan-gymkhana',
    line: 'aqua',
  };
  assert.equal(isMuthaRiverCrossing(nonCrossing), false);
});

test('calculateTrophyCabinet handles honest zero state with no journeys or streak', () => {
  const summary = calculateTrophyCabinet([], 0, 0);

  assert.equal(summary.unlockedCount, 0);
  assert.equal(summary.totalTrophies, 8);
  assert.equal(summary.completionPercent, 0);
  assert.equal(summary.cabinetScore, 0);
  assert.equal(summary.cabinetRankTitle, 'Aspiring Punekar');
  assert.equal(summary.cabinetRankMarathi, 'प्रारंभिक पुणेकर');
  assert.match(summary.shareableShowcaseText, /No medallions unlocked yet/);
  assert.match(summary.accessibilityDescription, /No trophies unlocked yet/);

  // All trophies should be locked
  for (const t of summary.trophies) {
    assert.equal(t.isUnlocked, false);
    assert.equal(t.progressPercent, 0);
  }
});

test('calculateTrophyCabinet evaluates Shaniwar Wada Bastion on 3 historic core visits', () => {
  // Trip 1: PCMC to PMC (1 core visit)
  // Trip 2: Mandai to Swargate (1 core visit)
  // Trip 3: Kasba Peth to Mandai (2 core visits -> total 4 >= 3)
  const journeys = [
    {
      id: '1',
      fromStationId: 'pcmc',
      toStationId: 'pmc',
      line: 'purple',
      at: '2026-10-20T04:00:00Z',
    },
    {
      id: '2',
      fromStationId: 'mandai',
      toStationId: 'swargate',
      line: 'purple',
      at: '2026-10-21T04:00:00Z',
    },
    {
      id: '3',
      fromStationId: 'kasba-peth',
      toStationId: 'mandai',
      line: 'purple',
      at: '2026-10-22T04:00:00Z',
    },
  ];

  const summary = calculateTrophyCabinet(journeys, 1, 60);
  const bastion = summary.trophies.find((t) => t.id === 'shaniwar-wada-bastion');

  assert.ok(bastion);
  assert.equal(bastion.isUnlocked, true);
  assert.equal(bastion.unlockedAtFormatted, '22 Oct 2026');
  assert.equal(bastion.progressPercent, 100);
});

test('calculateTrophyCabinet evaluates Civil Court Depths and Twin Corridors Grand Slam', () => {
  const journeys = [
    // Ride 1: PCMC to Civil Court (Purple Line)
    {
      id: '1',
      fromStationId: 'pcmc',
      toStationId: 'civil-court',
      line: 'purple',
      at: '2026-10-24T03:00:00Z',
      distanceKm: 13.9,
      co2SavedGrams: 1600,
    },
    // Ride 2: Vanaz to Ramwadi (Aqua Line)
    {
      id: '2',
      fromStationId: 'vanaz',
      toStationId: 'ramwadi',
      line: 'aqua',
      at: '2026-10-24T05:00:00Z',
      distanceKm: 15.7,
      co2SavedGrams: 1800,
    },
  ];

  const summary = calculateTrophyCabinet(journeys, 2, 80);

  // Civil Court Depths
  const civilCourtTrophy = summary.trophies.find((t) => t.id === 'civil-court-depths');
  assert.ok(civilCourtTrophy);
  assert.equal(civilCourtTrophy.isUnlocked, true);

  // Twin Corridors Grand Slam
  const grandSlam = summary.trophies.find((t) => t.id === 'twin-corridors-grand-slam');
  assert.ok(grandSlam);
  assert.equal(grandSlam.isUnlocked, true);
  assert.equal(grandSlam.progressPercent, 100);

  // Check Cabinet rank progression
  assert.equal(summary.unlockedCount, 2);
  assert.equal(summary.cabinetRankTitle, 'Pace Explorer');
  assert.equal(summary.cabinetScore, 200); // 100 + 100
});

test('calculateTrophyCabinet unlocks Punekar Commute Flame at streak 5', () => {
  const summary = calculateTrophyCabinet([], 5, 100);
  const flame = summary.trophies.find((t) => t.id === 'punekar-commute-flame');

  assert.ok(flame);
  assert.equal(flame.isUnlocked, true);
  assert.equal(flame.currentValue, 5);
  assert.equal(flame.progressPercent, 100);
  assert.equal(summary.unlockedCount, 1);
  assert.equal(summary.cabinetScore, 100);
});

test('calculateTrophyCabinet unlocks Century Club and Clean Air Plaque at thresholds', () => {
  // Single massive journey accumulating 105 km and 11 kg CO2
  const journey = {
    id: 'heavy',
    fromStationId: 'pcmc',
    toStationId: 'civil-court',
    line: 'purple',
    at: '2026-10-24T08:00:00Z',
    distanceKm: 105,
    co2SavedGrams: 11000,
  };

  const summary = calculateTrophyCabinet([journey], 6, 500);

  const century = summary.trophies.find((t) => t.id === 'century-club-shield');
  assert.ok(century);
  assert.equal(century.isUnlocked, true);

  const ecoPlaque = summary.trophies.find((t) => t.id === 'clean-air-diamond-plaque');
  assert.ok(ecoPlaque);
  assert.equal(ecoPlaque.isUnlocked, true);

  const pcmcCenturion = summary.trophies.find((t) => t.id === 'pcmc-arterial-centurion');
  assert.ok(pcmcCenturion);
  assert.equal(pcmcCenturion.isUnlocked, true);

  // Also flame unlocked because streak=6
  const flame = summary.trophies.find((t) => t.id === 'punekar-commute-flame');
  assert.ok(flame);
  assert.equal(flame.isUnlocked, true);

  // Total unlocked = 5 (century, eco, pcmc, flame, civil court)
  assert.equal(summary.unlockedCount, 5);
  assert.equal(summary.cabinetRankTitle, 'City Champion');
  assert.match(summary.shareableShowcaseText, /City Champion/);
});
