const { test } = require('node:test');
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
  calculatePuneMilestoneProgress,
  getTopBurnCorridors,
  PUNE_MILESTONES,
} = require(path.join(__dirname, 'puneBurnEquivalents.ts'));

const {
  filterJourneysByLine,
  getLineEmptyStateGuidance,
  sanitizeParticipantName,
  calculateDailyResetTime,
  calculatePaceCategory,
} = require(path.join(__dirname, 'edgeCases.ts'));

test('calculatePuneMilestoneProgress maps active burn to iconic Pune food and peak milestones', () => {
  // Zero state: 0 kcal -> Poha first milestone, 0%
  const zero = calculatePuneMilestoneProgress(0);
  assert.equal(zero.unlockedCount, 0);
  assert.equal(zero.currentMilestone.id, 'poha-deccan');
  assert.equal(zero.nextMilestone.id, 'poha-deccan');
  assert.equal(zero.progressPercent, 0);
  assert.equal(zero.caloriesRemaining, 200);

  // 200 kcal -> Plate of Poha unlocked, next is Misal Pav (450 kcal)
  const poha = calculatePuneMilestoneProgress(200);
  assert.equal(poha.unlockedCount, 1);
  assert.equal(poha.currentMilestone.id, 'poha-deccan');
  assert.equal(poha.nextMilestone.id, 'misal-karve');
  assert.equal(poha.caloriesRemaining, 250);
  assert.equal(poha.progressPercent, 0);

  // 450 kcal -> Misal Pav unlocked, next is Sinhagad (800 kcal)
  const misal = calculatePuneMilestoneProgress(450);
  assert.equal(misal.unlockedCount, 2);
  assert.equal(misal.currentMilestone.id, 'misal-karve');
  assert.equal(misal.nextMilestone.id, 'sinhagad-steps');
  assert.equal(misal.caloriesRemaining, 350);

  // 3000 kcal -> All Pune milestones unlocked
  const max = calculatePuneMilestoneProgress(3000);
  assert.equal(max.unlockedCount, PUNE_MILESTONES.length);
  assert.equal(max.nextMilestone, null);
  assert.equal(max.progressPercent, 100);
  assert.equal(max.caloriesRemaining, 0);
});

test('getTopBurnCorridors aggregates corridor burn and flags interchange routes', () => {
  const journeys = [
    {
      id: '1',
      from: 'pcmc',
      to: 'civil-court',
      kilometers: 13.4,
      stationIds: ['pcmc', 'civil-court'],
    },
    {
      id: '2',
      from: 'civil-court',
      to: 'pcmc',
      kilometers: 13.4,
      stationIds: ['civil-court', 'pcmc'],
    },
    {
      id: '3',
      from: 'vanaz',
      to: 'pcmc',
      kilometers: 15.0,
      stationIds: ['vanaz', 'civil-court', 'pcmc'],
    },
    {
      id: '4',
      from: 'vanaz',
      to: 'ramwadi',
      kilometers: 15.7,
      stationIds: ['vanaz', 'civil-court', 'ramwadi'],
    },
  ];

  const corridors = getTopBurnCorridors(journeys);
  assert.equal(corridors.length, 3);

  // PCMC <-> Civil Court corridor has 2 rides
  const pcmcCorridor = corridors.find(c => c.corridorKey === 'civil-court::pcmc');
  assert.ok(pcmcCorridor);
  assert.equal(pcmcCorridor.ridesCount, 2);
  assert.ok(pcmcCorridor.totalCalories > 0);
  assert.equal(pcmcCorridor.hasInterchange, false);

  // Vanaz <-> PCMC corridor has interchange
  const transferCorridor = corridors.find(c => c.corridorKey === 'pcmc::vanaz');
  assert.ok(transferCorridor);
  assert.equal(transferCorridor.hasInterchange, true);

  // Vanaz <-> Ramwadi stays on Aqua Line through Civil Court (no line transfer)
  const aquaThroughCorridor = corridors.find(c => c.corridorKey === 'ramwadi::vanaz');
  assert.ok(aquaThroughCorridor);
  assert.equal(aquaThroughCorridor.hasInterchange, false);

  // Empty state
  assert.deepEqual(getTopBurnCorridors([]), []);
});

test('filterJourneysByLine handles single-line and cross-line interchange travel', () => {
  const purpleJourney = {
    id: 'p1',
    from: 'pcmc',
    to: 'civil-court',
    stationIds: ['pcmc', 'kasarwadi', 'civil-court'],
  };
  const aquaJourney = {
    id: 'a1',
    from: 'vanaz',
    to: 'ruby-hall-clinic',
    stationIds: ['vanaz', 'nal-stop', 'civil-court', 'ruby-hall-clinic'],
  };
  const crossJourney = {
    id: 'x1',
    from: 'pcmc',
    to: 'vanaz',
    stationIds: ['pcmc', 'kasarwadi', 'civil-court', 'nal-stop', 'vanaz'],
  };

  const all = [purpleJourney, aquaJourney, crossJourney];

  const purpleOnly = filterJourneysByLine(all, 'purple');
  assert.equal(purpleOnly.length, 2);
  assert.ok(purpleOnly.some(j => j.id === 'p1'));
  assert.ok(purpleOnly.some(j => j.id === 'x1'));

  const aquaOnly = filterJourneysByLine(all, 'aqua');
  assert.equal(aquaOnly.length, 2);
  assert.ok(aquaOnly.some(j => j.id === 'a1'));
  assert.ok(aquaOnly.some(j => j.id === 'x1'));

  // Missing stationIds fallback
  const fallback = [{ id: 'f1', from: 'pcmc', to: 'civil-court' }];
  const filtered = filterJourneysByLine(fallback, 'purple');
  assert.equal(filtered.length, 1);
});

test('getLineEmptyStateGuidance returns authentic Pune Metro station context', () => {
  const purple = getLineEmptyStateGuidance('purple');
  assert.match(purple.guidance, /Pimpri-Chinchwad/);
  assert.ok(purple.suggestedStations.includes('PCMC'));

  const aqua = getLineEmptyStateGuidance('aqua');
  assert.match(aqua.guidance, /Kothrud/);
  assert.ok(aqua.suggestedStations.includes('Vanaz'));
  assert.ok(aqua.suggestedStations.includes('Ramwadi'));
});

test('sanitizeParticipantName protects unicode, devanagari, and empty states', () => {
  assert.equal(sanitizeParticipantName(''), 'Explorer');
  assert.equal(sanitizeParticipantName('   '), 'Explorer');
  assert.equal(sanitizeParticipantName('Aarav'), 'Aarav');
  // Devanagari text preservation
  assert.equal(sanitizeParticipantName('आरव'), 'आरव');
  assert.equal(sanitizeParticipantName('नेहा'), 'नेहा');
  // Long name truncation
  const longName = 'VeryLongPuneExplorerNameThatExceedsLimit';
  const truncated = sanitizeParticipantName(longName, 12);
  assert.ok(truncated.endsWith('…'));
  assert.equal(Array.from(truncated).length, 12);
});

test('calculateDailyResetTime and calculatePaceCategory provide reliable habit metrics', () => {
  const now = new Date('2026-10-24T12:00:00Z');
  const reset = calculateDailyResetTime(now);
  assert.equal(reset.hoursRemaining, 12);
  assert.equal(reset.minutesRemaining, 0);
  assert.match(reset.formattedText, /5:30 AM IST/);

  // Pace classification
  assert.equal(calculatePaceCategory(7, 10).badge, 'Daily Commuter');
  assert.equal(calculatePaceCategory(3, 4).badge, 'Consistent Rider');
  assert.equal(calculatePaceCategory(1, 6).badge, 'Regular Explorer');
  assert.equal(calculatePaceCategory(1, 1).badge, 'Getting Started');
});
