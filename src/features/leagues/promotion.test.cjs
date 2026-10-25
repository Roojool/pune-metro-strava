const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

require.extensions['.ts'] = function (module, filename) {
  const code = fs.readFileSync(filename, 'utf8');
  const compiled = ts.transpileModule(code, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  });
  module._compile(compiled.outputText, filename);
};

const {
  calculateLeagueZones,
  getEnrichedSampleLeague,
  calculateUserEntry,
  rankByMetric,
} = require(path.join(__dirname, 'scoring.ts'));

test('calculateLeagueZones correctly classifies promotion, safe, and relegation tiers', () => {
  const samples = getEnrichedSampleLeague();

  // Test Case 1: High-performing user at Rank #1
  const leaderUser = calculateUserEntry('Speedy', 800, [], 'purple');
  leaderUser.caloriesBurned = 900;
  const boardLeader = rankByMetric([...samples, leaderUser], 'calories');

  const zoneLeader = calculateLeagueZones(boardLeader, 'you', 'calories');
  assert.equal(zoneLeader.userZone, 'promotion');
  assert.equal(zoneLeader.userRank, 1);
  assert.equal(zoneLeader.deficitToPromotion, 0);
  assert.match(zoneLeader.zoneBadge, /PROMOTION TIER/);

  // Test Case 2: Middle-of-the-pack user in Safe Zone (e.g. Rank #4)
  const midUser = calculateUserEntry('MidRider', 150, [], 'purple');
  midUser.caloriesBurned = 250;
  const boardMid = rankByMetric([...samples, midUser], 'calories');

  const zoneMid = calculateLeagueZones(boardMid, 'you', 'calories');
  assert.equal(zoneMid.userZone, 'safe');
  assert.ok(zoneMid.deficitToPromotion > 0);
  assert.match(zoneMid.zoneBadge, /SAFE ZONE/);

  // Test Case 3: Zero-state user in Relegation Risk zone
  const zeroUser = calculateUserEntry('Newbie', 0, [], 'purple');
  zeroUser.caloriesBurned = 0;
  const boardZero = rankByMetric([...samples, zeroUser], 'calories');

  const zoneZero = calculateLeagueZones(boardZero, 'you', 'calories');
  assert.equal(zoneZero.userZone, 'relegation');
  assert.equal(zoneZero.bufferFromRelegation, 0);
  assert.ok(zoneZero.deficitToPromotion > 0);
  assert.match(zoneZero.zoneBadge, /RELEGATION RISK/);

  // Test Case 4: Small board (Friends preview with <= 3 participants)
  const smallBoard = boardMid.slice(0, 3);
  const zoneSmall = calculateLeagueZones(smallBoard, smallBoard[2].id, 'calories');
  // Small boards have no relegation risk
  assert.notEqual(zoneSmall.userZone, 'relegation');
});
