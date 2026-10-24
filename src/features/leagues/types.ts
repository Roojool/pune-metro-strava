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
