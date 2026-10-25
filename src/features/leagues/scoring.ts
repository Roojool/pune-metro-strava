import type { Journey, LineId } from '../../domain/models';
import { SAMPLE_LEAGUE } from './sampleLeague';
import { getStationName } from '../../data/pune';
import { routeBetween } from '../../domain/metro';
import type {
  BurnSummary,
  CommuterBurnTier,
  EnrichedLeaderboardEntry,
  LevelProgress,
  RivalMatchup,
  RouteBurnEstimate,
  ScoringMetric,
  WeeklyBurnPacing,
} from './types';

/**
 * Calculates estimated active commute calories burned during a Pune Metro journey.
 * Commuters burn active walking/stair-climbing energy entering elevated/underground stations,
 * walking through concourses and interchanges, and stabilizing during transit.
 */
export function calculateJourneyCalories(journey: {
  kilometers: number;
  stationIds?: string[];
  from: string;
  to: string;
}): number {
  if (journey.kilometers <= 0) return 0;
  // Baseline active calories: 25 kcal entry walk/stairs + 20 kcal exit walk/stairs
  let kcal = 45;

  // Interstation & platform transit active stabilization (~12 kcal per km)
  kcal += journey.kilometers * 12;

  // Civil Court interchange transfer walk adds additional platform stairs and concourse distance
  const stationList = journey.stationIds ?? [journey.from, journey.to];
  const isInterchange =
    stationList.includes('civil-court') &&
    journey.from !== 'civil-court' &&
    journey.to !== 'civil-court';
  if (isInterchange) {
    kcal += 25;
  }

  return Math.round(kcal);
}

/**
 * Calculates total active commute calories across all logged journeys.
 */
export function calculateTotalCalories(journeys: Journey[]): number {
  return journeys.reduce((sum, j) => sum + calculateJourneyCalories(j), 0);
}

/**
 * Derives comprehensive Strava-style active burn and environmental savings summary.
 */
export function calculateBurnSummary(journeys: Journey[]): BurnSummary {
  const calories = calculateTotalCalories(journeys);
  const co2SavedKg =
    Math.round(journeys.reduce((sum, j) => sum + (j.co2Kg || 0), 0) * 100) / 100;
  // Walking equivalent: average ~65 kcal burned per km of walking
  const walkingKmEquivalent = Math.round((calories / 65) * 10) / 10;
  // Flight of stairs equivalent: ~3.5 kcal per typical 15-step flight
  const flightOfStairsEquivalent = Math.round(calories / 3.5);
  // Petrol saved: burning 1 litre of petrol produces ~2.31 kg CO2
  const petrolSavedLiters = Math.round((co2SavedKg / 2.31) * 10) / 10;

  return {
    calories,
    walkingKmEquivalent,
    flightOfStairsEquivalent,
    co2SavedKg,
    petrolSavedLiters,
  };
}

/**
 * Static baseline data for sample league participants with realistic
 * calorie burn and CO2 savings corresponding to their illustrative XP.
 */
const SAMPLE_METRICS_MAP: Record<
  string,
  { calories: number; co2Kg: number; rides: number }
> = {
  'sample-aarav': { calories: 580, co2Kg: 4.2, rides: 6 },
  'sample-sana': { calories: 430, co2Kg: 3.1, rides: 5 },
  'sample-neha': { calories: 210, co2Kg: 1.6, rides: 2 },
  'sample-kabir': { calories: 110, co2Kg: 0.8, rides: 1 },
  'sample-ishaan': { calories: 85, co2Kg: 0.6, rides: 1 },
  'sample-meera': { calories: 65, co2Kg: 0.4, rides: 1 },
};

/**
 * Enriches SAMPLE_LEAGUE entries with realistic burn and eco metrics.
 */
export function getEnrichedSampleLeague(): EnrichedLeaderboardEntry[] {
  return SAMPLE_LEAGUE.map(entry => {
    const metrics = SAMPLE_METRICS_MAP[entry.id] ?? {
      calories: Math.round(entry.points * 2.2),
      co2Kg: Math.round(entry.points * 0.018 * 10) / 10,
      rides: Math.max(1, Math.round(entry.points / 35)),
    };
    return {
      ...entry,
      caloriesBurned: metrics.calories,
      co2SavedKg: metrics.co2Kg,
      ridesCount: metrics.rides,
    };
  });
}

/**
 * Builds the current user's enriched leaderboard entry.
 */
export function calculateUserEntry(
  userName: string,
  currentScore: number,
  relevantJourneys: Journey[],
  line: LineId
): EnrichedLeaderboardEntry {
  const caloriesBurned = calculateTotalCalories(relevantJourneys);
  const co2SavedKg =
    Math.round(
      relevantJourneys.reduce((sum, j) => sum + (j.co2Kg || 0), 0) * 100
    ) / 100;

  return {
    id: 'you',
    name: userName.trim() || 'You',
    points: currentScore,
    sample: false,
    line,
    caloriesBurned,
    co2SavedKg,
    ridesCount: relevantJourneys.length,
  };
}

/**
 * Ranks leaderboard entries deterministically by the requested scoring metric.
 */
export function rankByMetric(
  entries: EnrichedLeaderboardEntry[],
  metric: ScoringMetric
): EnrichedLeaderboardEntry[] {
  return [...entries].sort((a, b) => {
    if (metric === 'calories') {
      const diff = b.caloriesBurned - a.caloriesBurned;
      if (diff !== 0) return diff;
      const pointDiff = b.points - a.points;
      if (pointDiff !== 0) return pointDiff;
      return a.name.localeCompare(b.name);
    }
    if (metric === 'eco') {
      const diff = b.co2SavedKg - a.co2SavedKg;
      if (diff !== 0) return diff;
      const pointDiff = b.points - a.points;
      if (pointDiff !== 0) return pointDiff;
      return a.name.localeCompare(b.name);
    }
    // Default: 'xp'
    const diff = b.points - a.points;
    if (diff !== 0) return diff;
    const calDiff = b.caloriesBurned - a.caloriesBurned;
    if (calDiff !== 0) return calDiff;
    return a.name.localeCompare(b.name);
  });
}

/**
 * Computes head-to-head "Who Burned More" rival matchup.
 * Highlights the closest competitor ranked directly ahead of the user.
 */
export function calculateRivalMatchup(
  userEntry: EnrichedLeaderboardEntry,
  rankedBoard: EnrichedLeaderboardEntry[],
  metric: ScoringMetric
): RivalMatchup {
  const totalParticipants = rankedBoard.length;
  const userIndex = rankedBoard.findIndex(e => e.id === userEntry.id);
  const userRank = userIndex >= 0 ? userIndex + 1 : totalParticipants;

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

  if (userIndex === 0) {
    return {
      userRank: 1,
      totalParticipants,
      hasRivalAbove: false,
      userScore,
      targetUnit: getUnit(),
      recommendation:
        "You're currently leading this league! Log another ride to protect your #1 spot.",
      isTopRank: true,
    };
  }

  const rival = userIndex > 0 ? rankedBoard[userIndex - 1] : rankedBoard[0];
  const rivalScore = rival ? getMetricValue(rival) : 0;
  const rawDeficit = Math.max(0, rivalScore - userScore);
  const scoreDeficit = Math.round(rawDeficit * 10) / 10;
  const rivalRank = userRank - 1;

  let recommendation = '';
  if (metric === 'calories') {
    recommendation =
      scoreDeficit <= 50
        ? `Burn ${scoreDeficit} more kcal (~1 metro trip) to overtake ${rival.name}!`
        : `Burn ${scoreDeficit} more kcal with stairs and walking to overtake ${rival.name}!`;
  } else if (metric === 'eco') {
    recommendation = `Save ${scoreDeficit} more kg CO₂ by choosing metro over car to pass ${rival.name}!`;
  } else {
    recommendation = `Earn ${scoreDeficit} more XP by riding or discovering a new station to overtake ${rival.name}!`;
  }

  return {
    userRank,
    totalParticipants,
    hasRivalAbove: !!rival,
    rivalName: rival?.name,
    rivalRank,
    rivalScore,
    userScore,
    scoreDeficit,
    targetUnit: getUnit(),
    recommendation,
    isTopRank: false,
  };
}

/**
 * Calculates level milestones and progression details.
 */
export function calculateLevelProgress(points: number): LevelProgress {
  const level = Math.floor(points / 100) + 1;
  const levelFloorXp = (level - 1) * 100;
  const levelCeilingXp = level * 100;
  const progressInLevel = points % 100;
  const percent = Math.round(Math.min(100, Math.max(0, progressInLevel)));
  const xpToNextLevel = 100 - progressInLevel;
  const nextLevel = level + 1;

  const LEVEL_TITLES = [
    'Explorer Rookie',
    'Corridor Commuter',
    'Twin-Line Navigator',
    'Pune Metro Champion',
    'Master Transit Legend',
  ];
  const title = LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)];

  return {
    level,
    currentXp: points,
    levelFloorXp,
    levelCeilingXp,
    progressInLevel,
    percent,
    xpToNextLevel,
    nextLevel,
    title,
  };
}

/**
 * Commuter Burn Tiers representing physical transit habit milestones.
 */
export const COMMUTER_BURN_TIERS: CommuterBurnTier[] = [
  {
    id: 'station-strider',
    title: 'Station Strider',
    minCalories: 0,
    maxCalories: 250,
    badge: '🚶 Platform Walker',
    description: 'Beginning your active Pune Metro routine with steady station entry steps.',
    perk: 'Base Active Habit',
  },
  {
    id: 'elevated-climber',
    title: 'Elevated Climber',
    minCalories: 251,
    maxCalories: 600,
    badge: '🧗 Viaduct Ascender',
    description: 'Scaling elevated station concourses and viaduct stairwells across Pune.',
    perk: 'Stair Master Badge',
  },
  {
    id: 'interchange-cruiser',
    title: 'Interchange Cruiser',
    minCalories: 601,
    maxCalories: 1200,
    badge: '⚡ Civil Court Navigator',
    description: 'Tackling the multi-level transfer hub linking Purple and Aqua lines.',
    perk: 'Interchange Velocity',
  },
  {
    id: 'underground-pioneer',
    title: 'Underground Pioneer',
    minCalories: 1201,
    maxCalories: 2500,
    badge: '🚇 33m Depth Master',
    description: 'Mastering the deep underground tunnels from Shivajinagar to Swargate.',
    perk: 'Deep Corridor Stamina',
  },
  {
    id: 'transit-legend',
    title: 'Pune Transit Legend',
    minCalories: 2501,
    maxCalories: Infinity,
    badge: '👑 Green Transit Champion',
    description: 'Peak physical commuter endurance! Pune’s highest tier of active green transit.',
    perk: 'All-City Hall of Fame',
  },
];

/**
 * Derives current commuter burn tier based on all-time active calories.
 */
export function getCommuterBurnTier(totalCalories: number): CommuterBurnTier {
  const safeCalories = Math.max(0, Number.isFinite(totalCalories) ? totalCalories : 0);
  for (let i = COMMUTER_BURN_TIERS.length - 1; i >= 0; i--) {
    if (safeCalories >= COMMUTER_BURN_TIERS[i].minCalories) {
      return COMMUTER_BURN_TIERS[i];
    }
  }
  return COMMUTER_BURN_TIERS[0];
}

/**
 * Computes weekly commuter calorie burn pacing against a target (default: 500 kcal).
 * Aligns with the 7-day rolling window used for weekly challenges.
 */
export function calculateWeeklyBurnPacing(
  journeys: Journey[],
  now = new Date(),
  targetKcal = 500
): WeeklyBurnPacing {
  const safeNow = Number.isFinite(now.getTime()) ? now.getTime() : Date.now();
  const sevenDaysAgo = safeNow - 7 * 86_400_000;

  const recentJourneys = journeys.filter(j => {
    const time = Date.parse(j.at);
    return Number.isFinite(time) && time >= sevenDaysAgo && time <= safeNow;
  });

  const burnedLast7DaysKcal = calculateTotalCalories(recentJourneys);
  const remainingKcal = Math.max(0, targetKcal - burnedLast7DaysKcal);
  const percent = Math.min(100, Math.round((burnedLast7DaysKcal / targetKcal) * 100));
  const isTargetReached = burnedLast7DaysKcal >= targetKcal;

  const daysInWindow = Math.max(1, (safeNow - sevenDaysAgo) / 86_400_000);
  const dailyRate = burnedLast7DaysKcal / daysInWindow;
  const projectedWeeklyKcal = Math.round(dailyRate * 7);

  let pacingStatus: 'ahead' | 'on-track' | 'behind' = 'on-track';
  if (burnedLast7DaysKcal >= targetKcal) {
    pacingStatus = 'ahead';
  } else if (projectedWeeklyKcal >= targetKcal * 0.8) {
    pacingStatus = 'on-track';
  } else {
    pacingStatus = 'behind';
  }

  let summaryText = '';
  if (isTargetReached) {
    summaryText = `Goal crushed! You burned ${burnedLast7DaysKcal} kcal in the last 7 days (+${burnedLast7DaysKcal - targetKcal} kcal over target).`;
  } else if (pacingStatus === 'on-track') {
    summaryText = `${remainingKcal} kcal to reach your weekly ${targetKcal} kcal goal. You are right on track!`;
  } else {
    summaryText = `${remainingKcal} kcal remaining. Take a couple of brisk station stair climbs to catch up.`;
  }

  return {
    weeklyTargetKcal: targetKcal,
    burnedLast7DaysKcal,
    remainingKcal,
    percent,
    isTargetReached,
    projectedWeeklyKcal,
    pacingStatus,
    summaryText,
  };
}

/**
 * Predicts and simulates active commute calorie burn, stair climbing, and leaderboard impact
 * for any planned route across the Pune Metro network.
 */
export function estimateRouteBurn(
  from: string,
  to: string,
  currentRankedBoard?: EnrichedLeaderboardEntry[],
  currentUser?: EnrichedLeaderboardEntry
): RouteBurnEstimate {
  const fromName = getStationName(from);
  const toName = getStationName(to);

  if (from === to || !from || !to) {
    return {
      from,
      to,
      fromName,
      toName,
      kilometers: 0,
      minutes: 0,
      calories: 0,
      walkingKmEquivalent: 0,
      flightOfStairsEquivalent: 0,
      co2SavedKg: 0,
      isInterchange: false,
      interchangeBonusKcal: 0,
      stationCount: 0,
      overtakeNotice: 'Select two different stations along Pune Metro to simulate commute burn.',
    };
  }

  try {
    const route = routeBetween(from, to);
    const stationList = route.stationIds;
    const isInterchange =
      stationList.includes('civil-court') &&
      from !== 'civil-court' &&
      to !== 'civil-court';
    const interchangeBonusKcal = isInterchange ? 25 : 0;

    const calories = calculateJourneyCalories({
      kilometers: route.kilometers,
      stationIds: route.stationIds,
      from,
      to,
    });

    const walkingKmEquivalent = Math.round((calories / 65) * 10) / 10;
    const flightOfStairsEquivalent = Math.round(calories / 3.5);
    const co2SavedKg = Math.round(route.kilometers * (0.12 - 0.04) * 100) / 100;

    let projectedRank: number | undefined;
    let overtakeNotice: string | undefined;

    if (currentRankedBoard && currentUser) {
      const simulatedUser: EnrichedLeaderboardEntry = {
        ...currentUser,
        caloriesBurned: currentUser.caloriesBurned + calories,
        co2SavedKg: Math.round((currentUser.co2SavedKg + co2SavedKg) * 100) / 100,
        ridesCount: currentUser.ridesCount + 1,
      };

      const otherEntries = currentRankedBoard.filter(e => e.id !== currentUser.id);
      const simulatedBoard = rankByMetric([...otherEntries, simulatedUser], 'calories');
      const newRank = simulatedBoard.findIndex(e => e.id === currentUser.id) + 1;
      const currentRank = currentRankedBoard.findIndex(e => e.id === currentUser.id) + 1;

      projectedRank = newRank;

      if (newRank < currentRank) {
        overtakeNotice = `🔥 Taking this ride will lift you from Rank #${currentRank} to Rank #${newRank} (+${calories} kcal)!`;
      } else if (newRank === 1) {
        overtakeNotice = `👑 Taking this ride widens your #1 league lead by +${calories} kcal!`;
      } else {
        const nextAbove = simulatedBoard[newRank - 2];
        const deficit = nextAbove ? nextAbove.caloriesBurned - simulatedUser.caloriesBurned : 0;
        overtakeNotice = `Takes you to ${simulatedUser.caloriesBurned} kcal (Rank #${newRank}). ${deficit > 0 ? `${deficit} kcal behind ${nextAbove.name}.` : ''}`;
      }
    }

    return {
      from,
      to,
      fromName,
      toName,
      kilometers: route.kilometers,
      minutes: route.minutes,
      calories,
      walkingKmEquivalent,
      flightOfStairsEquivalent,
      co2SavedKg,
      isInterchange,
      interchangeBonusKcal,
      projectedRank,
      overtakeNotice,
      stationCount: route.stationIds.length,
    };
  } catch {
    return {
      from,
      to,
      fromName,
      toName,
      kilometers: 0,
      minutes: 0,
      calories: 0,
      walkingKmEquivalent: 0,
      flightOfStairsEquivalent: 0,
      co2SavedKg: 0,
      isInterchange: false,
      interchangeBonusKcal: 0,
      stationCount: 0,
      overtakeNotice: 'Unable to calculate route between these stations.',
    };
  }
}

