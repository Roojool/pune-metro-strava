import type {
  DivisionStanding,
  DivisionTier,
  DivisionTierInfo,
  DivisionZone,
  EnrichedLeaderboardEntry,
  ScoringMetric,
} from './types';

export const DIVISION_TIERS: Record<DivisionTier, DivisionTierInfo> = {
  bronze: {
    tier: 'bronze',
    title: 'Bronze Explorer',
    badgeColor: '#CD7F32',
    badgeBg: '#2A1E14',
    borderTint: '#593D22',
    minPoints: 0,
    nextTier: 'silver',
    nextTierPoints: 150,
    description: 'Beginner tier for commuters starting their Pune Metro transit habit.',
  },
  silver: {
    tier: 'silver',
    title: 'Silver Commuter',
    badgeColor: '#C0C0C0',
    badgeBg: '#1C2226',
    borderTint: '#3B484F',
    minPoints: 150,
    nextTier: 'gold',
    nextTierPoints: 350,
    description: 'Consistent transit riders exploring Purple and Aqua line corridors.',
  },
  gold: {
    tier: 'gold',
    title: 'Gold Transit Master',
    badgeColor: '#FFD700',
    badgeBg: '#29240A',
    borderTint: '#5C5117',
    minPoints: 350,
    nextTier: 'diamond',
    nextTierPoints: 600,
    description: 'High-frequency riders with major calorie burn and CO₂ savings.',
  },
  diamond: {
    tier: 'diamond',
    title: 'Diamond Pune Legend',
    badgeColor: '#55C5E0',
    badgeBg: '#0F262E',
    borderTint: '#1F4F5E',
    minPoints: 600,
    description: 'The premier tier for Pune Metro’s most dedicated everyday champions.',
  },
};

/**
 * Returns the commuter's current division tier info based on cumulative points.
 */
export function getUserDivisionTier(points: number): DivisionTierInfo {
  if (points >= DIVISION_TIERS.diamond.minPoints) return DIVISION_TIERS.diamond;
  if (points >= DIVISION_TIERS.gold.minPoints) return DIVISION_TIERS.gold;
  if (points >= DIVISION_TIERS.silver.minPoints) return DIVISION_TIERS.silver;
  return DIVISION_TIERS.bronze;
}

/**
 * Evaluates division standings, promotion cutoffs, and safety margins
 * for a ranked leaderboard board.
 */
export function calculateDivisionStanding(
  userRank: number,
  totalParticipants: number,
  board: EnrichedLeaderboardEntry[],
  metric: ScoringMetric,
  points: number
): DivisionStanding {
  const tierInfo = getUserDivisionTier(points);

  const getMetricValue = (entry: EnrichedLeaderboardEntry): number => {
    if (metric === 'calories') return entry.caloriesBurned;
    if (metric === 'eco') return entry.co2SavedKg;
    return entry.points;
  };

  const getUnit = (): string => {
    if (metric === 'calories') return 'kcal';
    if (metric === 'eco') return 'kg CO₂';
    return 'XP';
  };

  const targetUnit = getUnit();
  const safeTotal = Math.max(1, totalParticipants);
  const safeRank = Math.min(Math.max(1, userRank), safeTotal);

  // Promotion slots: Top 2 in boards of 4+, Top 1 in small boards
  const promotionRanksCount = safeTotal >= 4 ? 2 : 1;

  // Relegation slots:
  // Bronze tier has NO relegation (seed tier).
  // Other tiers have 2 relegation spots if 6+ participants, 1 if 4-5 participants, 0 if <= 3.
  let relegationRanksCount = 0;
  if (tierInfo.tier !== 'bronze') {
    if (safeTotal >= 6) {
      relegationRanksCount = 2;
    } else if (safeTotal >= 4) {
      relegationRanksCount = 1;
    }
  }

  // Zone determination
  let zone: DivisionZone = 'safe';
  if (safeRank <= promotionRanksCount) {
    zone = 'promotion';
  } else if (relegationRanksCount > 0 && safeRank > safeTotal - relegationRanksCount) {
    zone = 'relegation';
  }

  // Find user's score from board or default
  const userEntry = board.find(e => e.id === 'you');
  const userScore = userEntry ? getMetricValue(userEntry) : 0;

  // Promotion cutoff score: score of the entry currently occupying the last promotion spot
  const promoCutoffEntry = board[promotionRanksCount - 1] ?? board[0];
  const promotionCutoffScore = promoCutoffEntry ? getMetricValue(promoCutoffEntry) : userScore;

  // Relegation cutoff score: lowest safe entry score
  const safeRankIndex = safeTotal - relegationRanksCount - 1;
  const relCutoffEntry =
    relegationRanksCount > 0 && safeRankIndex >= 0 && safeRankIndex < board.length
      ? board[safeRankIndex]
      : board[board.length - 1];
  const relegationCutoffScore = relCutoffEntry ? getMetricValue(relCutoffEntry) : 0;

  // Calculations for gaps and buffers
  const precisionStep = metric === 'eco' ? 0.1 : 1;
  let pointsToPromote = 0;
  let pointsToSafety = 0;
  let bufferOverCutoff = 0;

  if (zone === 'promotion') {
    pointsToPromote = 0;
    pointsToSafety = 0;
    // Buffer over the first non-promoting position (promotionCutoffScore vs rank promotionRanksCount + 1)
    const nextNonPromoEntry = board[promotionRanksCount];
    if (nextNonPromoEntry) {
      bufferOverCutoff = Math.max(0, userScore - getMetricValue(nextNonPromoEntry));
    } else {
      bufferOverCutoff = userScore;
    }
  } else if (zone === 'safe') {
    // Points needed to climb into the promotion zone
    pointsToPromote = Math.max(0, Math.round((promotionCutoffScore - userScore + precisionStep) * 10) / 10);
    // Buffer above the danger zone
    bufferOverCutoff = Math.max(0, Math.round((userScore - relegationCutoffScore) * 10) / 10);
    pointsToSafety = 0;
  } else {
    // Relegation danger zone
    pointsToSafety = Math.max(0, Math.round((relegationCutoffScore - userScore + precisionStep) * 10) / 10);
    pointsToPromote = Math.max(0, Math.round((promotionCutoffScore - userScore + precisionStep) * 10) / 10);
    bufferOverCutoff = 0;
  }

  // Construct communicative headline & subtext
  let headline = '';
  let subtext = '';
  let a11yZoneDescription = '';

  if (zone === 'promotion') {
    const nextTierTitle = tierInfo.nextTier ? DIVISION_TIERS[tierInfo.nextTier].title : 'Top Division';
    headline = tierInfo.nextTier ? `Promotion Zone → ${nextTierTitle}` : 'Division Champion Zone';
    subtext =
      bufferOverCutoff > 0
        ? `Rank #${safeRank} · Holding a ${bufferOverCutoff} ${targetUnit} cushion over the promotion line.`
        : `Rank #${safeRank} · Currently in position for promotion at the end of the rolling 7-day cycle.`;
    a11yZoneDescription = `In promotion zone. Rank ${safeRank} of ${safeTotal} in ${tierInfo.title}. Current lead over cutoff is ${bufferOverCutoff} ${targetUnit}.`;
  } else if (zone === 'relegation') {
    headline = 'Relegation Alert · Safety Line';
    subtext = `Rank #${safeRank} · Earn ${pointsToSafety} more ${targetUnit} before the weekly reset to climb to safety.`;
    a11yZoneDescription = `Warning: In relegation zone. Rank ${safeRank} of ${safeTotal}. Need ${pointsToSafety} ${targetUnit} to reach safety cutoff.`;
  } else {
    headline = 'Safe Zone · Solid Standing';
    subtext = `Rank #${safeRank} · Safe from demotion. ${pointsToPromote} ${targetUnit} away from the promotion threshold.`;
    a11yZoneDescription = `In safe zone. Rank ${safeRank} of ${safeTotal}. ${pointsToPromote} ${targetUnit} away from promotion zone.`;
  }

  return {
    tierInfo,
    zone,
    userRank: safeRank,
    totalParticipants: safeTotal,
    userScore,
    targetUnit,
    pointsToPromote,
    pointsToSafety,
    bufferOverCutoff: Math.round(bufferOverCutoff * 10) / 10,
    promotionCutoffScore,
    relegationCutoffScore,
    promotionRanksCount,
    relegationRanksCount,
    headline,
    subtext,
    a11yZoneDescription,
  };
}
