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

export type DivisionTier = 'bronze' | 'silver' | 'gold' | 'diamond';

export type DivisionZone = 'promotion' | 'safe' | 'relegation';

export interface DivisionTierInfo {
  tier: DivisionTier;
  title: string;
  badgeColor: string;
  badgeBg: string;
  borderTint: string;
  minPoints: number;
  nextTier?: DivisionTier;
  nextTierPoints?: number;
  description: string;
}

export interface DivisionStanding {
  tierInfo: DivisionTierInfo;
  zone: DivisionZone;
  userRank: number;
  totalParticipants: number;
  userScore: number;
  targetUnit: string;
  pointsToPromote: number;
  pointsToSafety: number;
  bufferOverCutoff: number;
  promotionCutoffScore: number;
  relegationCutoffScore: number;
  promotionRanksCount: number;
  relegationRanksCount: number;
  headline: string;
  subtext: string;
  a11yZoneDescription: string;
}

export interface SuggestedCatchupRide {
  routeLabel: string;
  stationCount: number;
  estimatedKcal: number;
  xpValue: number;
  ridesNeededToOvertake: number;
}

export interface RivalDuelDetail {
  userRank: number;
  rivalName: string;
  rivalRank: number;
  userScore: number;
  rivalScore: number;
  scoreDelta: number; // positive = user ahead, negative = user behind
  targetUnit: string;
  userCalories: number;
  rivalCalories: number;
  caloriesDelta: number;
  userXp: number;
  rivalXp: number;
  xpDelta: number;
  userCo2: number;
  rivalCo2: number;
  co2Delta: number;
  momentumAdvantage: 'user' | 'rival' | 'tied';
  suggestedCatchups: SuggestedCatchupRide[];
  headline: string;
  accessibilityAnnouncement: string;
}

export interface HabitMultiplierInfo {
  streakDays: number;
  isWeekend: boolean;
  streakMultiplier: number;
  weekendBonusMultiplier: number;
  effectiveMultiplier: number;
  bonusPercentageText: string;
  fairPlayNotice: string;
}

export interface WeekendChallenge {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  targetCount: number;
  currentProgress: number;
  rewardXp: number;
  rewardKcal: number;
  isCompleted: boolean;
  badgeTag: string;
  remainingTimeText: string;
}

export interface PersonalBestRecord {
  id: string;
  title: string;
  value: number;
  unit: string;
  subtitle: string;
  achievedOn: string;
}

export interface PersonalBestsSummary {
  records: PersonalBestRecord[];
  favoriteCorridor: string;
  totalLifetimeBurnKcal: number;
  uniqueStationsVisited: number;
  headline: string;
  accessibilitySummary: string;
}
