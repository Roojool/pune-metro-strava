import type {
  EnrichedLeaderboardEntry,
  RivalDuelDetail,
  ScoringMetric,
  SuggestedCatchupRide,
} from './types';

interface RouteProfile {
  label: string;
  stationCount: number;
  kcal: number;
  xp: number;
}

const PUNE_TRANSIT_PROFILES: RouteProfile[] = [
  {
    label: 'PCMC ↔ Civil Court (Purple Line Spine)',
    stationCount: 14,
    kcal: 90,
    xp: 50,
  },
  {
    label: 'Vanaz ↔ Ruby Hall Clinic (Aqua Line Spine)',
    stationCount: 12,
    kcal: 80,
    xp: 45,
  },
  {
    label: 'Civil Court Interchange Walk & Ride',
    stationCount: 8,
    kcal: 75,
    xp: 40,
  },
  {
    label: 'Deccan Gymkhana ↔ PMC (Downtown Hop)',
    stationCount: 3,
    kcal: 45,
    xp: 25,
  },
];

/**
 * Calculates a comprehensive head-to-head "Who Burned More" rival duel.
 * If the user is ranked #1, it analyzes the gap against the #2 chaser.
 * Otherwise, it highlights the rival immediately ahead on the leaderboard.
 */
export function calculateRivalDuelDetail(
  userEntry: EnrichedLeaderboardEntry,
  rankedBoard: EnrichedLeaderboardEntry[],
  metric: ScoringMetric
): RivalDuelDetail | null {
  if (rankedBoard.length <= 1) {
    return null;
  }

  const userIndex = rankedBoard.findIndex(e => e.id === userEntry.id);
  if (userIndex === -1) return null;

  const isLeading = userIndex === 0;
  // If user is #1, compare against #2. Otherwise compare against person ahead (userIndex - 1).
  const rivalIndex = isLeading ? 1 : userIndex - 1;
  const rival = rankedBoard[rivalIndex];
  if (!rival) return null;

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

  const userScore = getMetricValue(userEntry);
  const rivalScore = getMetricValue(rival);
  const scoreDelta = Math.round((userScore - rivalScore) * 10) / 10;
  const targetUnit = getUnit();

  const userCalories = userEntry.caloriesBurned;
  const rivalCalories = rival.caloriesBurned;
  const caloriesDelta = userCalories - rivalCalories;

  const userXp = userEntry.points;
  const rivalXp = rival.points;
  const xpDelta = userXp - rivalXp;

  const userCo2 = userEntry.co2SavedKg;
  const rivalCo2 = rival.co2SavedKg;
  const co2Delta = Math.round((userCo2 - rivalCo2) * 10) / 10;

  // Determine momentum advantage
  let momentumAdvantage: 'user' | 'rival' | 'tied' = 'tied';
  if (userEntry.ridesCount > rival.ridesCount || (userEntry.ridesCount === rival.ridesCount && caloriesDelta > 0)) {
    momentumAdvantage = 'user';
  } else if (rival.ridesCount > userEntry.ridesCount || (rival.ridesCount === userEntry.ridesCount && caloriesDelta < 0)) {
    momentumAdvantage = 'rival';
  }

  // Calculate suggested catchup rides
  const deficit = Math.max(0, -scoreDelta);
  const suggestedCatchups: SuggestedCatchupRide[] = PUNE_TRANSIT_PROFILES.map(profile => {
    let metricPerRide = 0;
    if (metric === 'calories') metricPerRide = profile.kcal;
    else if (metric === 'eco') metricPerRide = 0.5; // average ~0.5 kg CO2 per transit trip
    else metricPerRide = profile.xp;

    const safePerRide = Math.max(0.1, metricPerRide);
    // Calculate rides needed to strictly overtake the rival
    const ridesNeeded = deficit === 0 ? 0 : Math.floor(deficit / safePerRide) + 1;

    return {
      routeLabel: profile.label,
      stationCount: profile.stationCount,
      estimatedKcal: profile.kcal,
      xpValue: profile.xp,
      ridesNeededToOvertake: ridesNeeded,
    };
  });

  // Headline & accessible announcements
  let headline = '';
  let accessibilityAnnouncement = '';

  if (isLeading) {
    headline = `Defending #1 · ${scoreDelta} ${targetUnit} Lead over ${rival.name}`;
    accessibilityAnnouncement = `Leaderboard leader. You are in first place with ${userScore} ${targetUnit}, leading second-place ${rival.name} by ${scoreDelta} ${targetUnit}.`;
  } else {
    const absDeficit = Math.abs(scoreDelta);
    headline = `Chasing Rank #${rivalIndex + 1} (${rival.name}) · ${absDeficit} ${targetUnit} Deficit`;
    accessibilityAnnouncement = `Rival duel against ${rival.name} at rank ${rivalIndex + 1}. You have ${userScore} ${targetUnit} compared to their ${rivalScore} ${targetUnit}, a deficit of ${absDeficit} ${targetUnit}.`;
  }

  return {
    userRank: userIndex + 1,
    rivalName: rival.name,
    rivalRank: rivalIndex + 1,
    userScore,
    rivalScore,
    scoreDelta,
    targetUnit,
    userCalories,
    rivalCalories,
    caloriesDelta,
    userXp,
    rivalXp,
    xpDelta,
    userCo2,
    rivalCo2,
    co2Delta,
    momentumAdvantage,
    suggestedCatchups,
    headline,
    accessibilityAnnouncement,
  };
}
