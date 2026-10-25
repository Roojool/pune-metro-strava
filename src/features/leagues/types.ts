import type { LeaderboardEntry, LineId } from '@/domain/models';

export type LeagueScope = 'Pune' | 'Friends' | 'Route';

export type ScoringMetric = 'xp' | 'calories' | 'eco';

export interface EnrichedLeaderboardEntry extends LeaderboardEntry {
  caloriesBurned: number;
  co2SavedKg: number;
  ridesCount: number;
}

export interface RivalMatchup {
  userRank: number;
  totalParticipants: number;
  hasRivalAbove: boolean;
  rivalName?: string;
  rivalRank?: number;
  rivalScore?: number;
  userScore: number;
  scoreDeficit?: number;
  targetUnit: string;
  recommendation: string;
  isTopRank: boolean;
}

export interface BurnSummary {
  calories: number;
  walkingKmEquivalent: number;
  flightOfStairsEquivalent: number;
  co2SavedKg: number;
  petrolSavedLiters: number;
}

export interface LevelProgress {
  level: number;
  currentXp: number;
  levelFloorXp: number;
  levelCeilingXp: number;
  progressInLevel: number;
  percent: number;
  xpToNextLevel: number;
  nextLevel: number;
  title: string;
}

export type CommuterBurnTierId =
  | 'station-strider'
  | 'elevated-climber'
  | 'interchange-cruiser'
  | 'underground-pioneer'
  | 'transit-legend';

export interface CommuterBurnTier {
  id: CommuterBurnTierId;
  title: string;
  minCalories: number;
  maxCalories: number;
  badge: string;
  description: string;
  perk: string;
}

export interface WeeklyBurnPacing {
  weeklyTargetKcal: number;
  burnedLast7DaysKcal: number;
  remainingKcal: number;
  percent: number;
  isTargetReached: boolean;
  projectedWeeklyKcal: number;
  pacingStatus: 'ahead' | 'on-track' | 'behind';
  summaryText: string;
}

export interface RouteBurnEstimate {
  from: string;
  to: string;
  fromName: string;
  toName: string;
  kilometers: number;
  minutes: number;
  calories: number;
  walkingKmEquivalent: number;
  flightOfStairsEquivalent: number;
  co2SavedKg: number;
  isInterchange: boolean;
  interchangeBonusKcal: number;
  projectedRank?: number;
  overtakeNotice?: string;
  stationCount: number;
}

export interface DailyBurnActivity {
  dateKey: string;
  dayName: string;
  dayOfMonth: number;
  calories: number;
  ridesCount: number;
  isActive: boolean;
  isToday: boolean;
}

export interface ActiveBurnStreakSummary {
  currentStreak: number;
  longestStreak: number;
  activeStreakDays: number;
  twoWeekMatrix: DailyBurnActivity[];
  shieldActive: boolean;
  streakStatusText: string;
}

export interface RivalDuelComparison {
  rivalId: string;
  rivalName: string;
  userScore: number;
  rivalScore: number;
  calorieGap: number;
  userLeads: boolean;
  stairFlightsToBridge: number;
  kmToBridge: number;
  userFavoriteCorridor?: string;
  rivalFavoriteCorridor?: string;
  duelInsight: string;
}


