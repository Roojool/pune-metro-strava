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

export type StationElevationType = 'underground_interchange' | 'elevated_terminal' | 'elevated_standard';

export interface StationBurnProfile {
  stationId: string;
  stationName: string;
  line: LineId | 'interchange';
  elevationType: StationElevationType;
  stairFlightsPerVisit: number;
  activeBurnKcalPerVisit: number;
  totalVisits: number;
  totalBurnKcal: number;
  estimatedStairsClimbed: number;
}

export interface StationDensitySummary {
  topStations: StationBurnProfile[];
  recommendedHighBurnStations: StationBurnProfile[];
  totalStationBurnKcal: number;
  deepestStationName: string;
  accessibilityDescription: string;
}

export type LeagueBadgeTier = 'bronze' | 'silver' | 'gold' | 'diamond';

export interface LeagueBadge {
  id: string;
  title: string;
  marathiTitle: string;
  category: 'distance' | 'elevation' | 'consistency' | 'eco' | 'exploration';
  icon: string;
  description: string;
  tier: LeagueBadgeTier;
  target: number;
  current: number;
  unit: string;
  isUnlocked: boolean;
  progressRatio: number; // 0 to 1
  rewardXp: number;
  unlockedDate: string | null;
}

export interface LeagueBadgeSummary {
  badges: LeagueBadge[];
  earnedCount: number;
  totalCount: number;
  completionPercent: number;
  nextBadge: LeagueBadge | null;
  accessibilityDescription: string;
}

export interface DayRhythm {
  dayIndex: number; // 0=Sunday, 1=Monday, ..., 6=Saturday
  dayShort: string; // 'Mon', 'Tue', ...
  dayFull: string;  // 'Monday', 'Tuesday', ...
  ridesCount: number;
  caloriesBurned: number;
  isPeakDay: boolean;
}

export type CommuterPersonaType =
  | 'daily_it_commuter'
  | 'weekend_explorer'
  | 'balanced_champion'
  | 'active_kickstarter'
  | 'station_newcomer';

export interface WeeklyConsistencyProfile {
  days: DayRhythm[];
  totalWeekRides: number;
  totalWeekCalories: number;
  weekdayRides: number;
  weekendRides: number;
  peakDayName: string;
  personaType: CommuterPersonaType;
  personaTitle: string;
  personaSubtitle: string;
  consistencyScore: number; // 0 to 100
  projectedMonthlyCalories: number;
  projectedMonthlyCo2Kg: number;
  accessibilityDescription: string;
}

export type EcoTier = 'seedling' | 'sapling' | 'green_canopy' | 'forest_guardian';

export interface CleanAirMetrics {
  totalKm: number;
  fuelSavedLiters: number;
  fuelExpenseSavedRupees: number;
  co2PreventedKg: number;
  pm25PreventedGrams: number;
  treesAbsorptionEquivalent: number;
  roadMinutesSaved: number;
  ecoTier: EcoTier;
  ecoTierTitle: string;
  ecoTierDescription: string;
  topEcoCorridor: string;
  accessibilitySummary: string;
}

export interface VerticalAscentSummary {
  totalVerticalMeters: number;
  totalStairFlights: number;
  totalStationSteps: number;
  deepestStationTraversed: string;
  maxSingleRideMeters: number;
  landmarkEquivalentName: string;
  landmarkEquivalentMeters: number;
  landmarkRatio: number;
  climberRankTitle: string;
  climberRankSubtitle: string;
  accessibilityDescription: string;
}

export interface MonthDayActivity {
  dayOfMonth: number;
  dateStr: string;
  dayOfWeekShort: string;
  ridesCount: number;
  caloriesBurned: number;
  isToday: boolean;
  isActive: boolean;
}

export interface MonthlyHabitMatrixSummary {
  monthName: string;
  year: number;
  totalMonthRides: number;
  totalMonthCalories: number;
  activeDaysCount: number;
  daysInMonth: number;
  consistencyPercentage: number;
  currentStreakDays: number;
  longestStreakDays: number;
  days: MonthDayActivity[];
  habitStatusTitle: string;
  habitStatusSubtitle: string;
  accessibilityDescription: string;
}

export interface BurnPaceEfficiencySummary {
  averagePaceMinPerKm: number;
  averageSpeedKmh: number;
  burnRateKcalPerKm: number;
  burnRateKcalPerMinute: number;
  totalDistanceKm: number;
  totalDurationMinutes: number;
  totalCaloriesBurned: number;
  roadPaceComparisonMinPerKm: number;
  timeSavingsMultiplier: number;
  efficiencyRatingTitle: string;
  efficiencyRatingSubtitle: string;
  accessibilityDescription: string;
}

export interface PuneReplenishItem {
  id: string;
  name: string;
  marathiName: string;
  category: 'hydration' | 'carb_snack' | 'traditional_treat';
  calorieValue: number;
  icon: string;
  description: string;
  landmarkLocation: string;
  isUnlocked: boolean;
  earnedRatio: number;
}

export interface PuneReplenishSummary {
  estimatedFluidLossMl: number;
  recommendedWaterGlasses: number;
  totalCaloriesBurned: number;
  activeRecommendation: PuneReplenishItem;
  items: PuneReplenishItem[];
  unlockedCount: number;
  hydrationTip: string;
  accessibilityDescription: string;
}

export interface StreakShieldSummary {
  shieldsAvailable: number;
  maxShields: number;
  weeklyCommuteDaysSoFar: number;
  weeklyCommuteTarget: number;
  progressToNextShieldRatio: number;
  isStreakAtRisk: boolean;
  hoursUntilReset: number;
  shieldStatusHeadline: string;
  shieldStatusMessage: string;
  fairPlayNotice: string;
  accessibilityDescription: string;
}

export type EcoCertificateTier = 'provisional' | 'bronze' | 'silver' | 'gold' | 'diamond';

export interface EcoCertificateSummary {
  certificateId: string;
  recipientName: string;
  tier: EcoCertificateTier;
  tierTitle: string;
  tierMarathi: string;
  totalCleanKm: number;
  totalCo2PreventedKg: number;
  totalPm25PreventedGrams: number;
  fuelSavedLiters: number;
  issueDateFormatted: string;
  isEligibleForOfficialCert: boolean;
  nextTierTargetKg: number;
  progressToNextTierRatio: number;
  shareableCertificateText: string;
  accessibilityDescription: string;
}

export interface ConcourseStepsSummary {
  totalEstimatedSteps: number;
  totalConcourseKm: number;
  interchangeSteps: number;
  averageStepsPerRide: number;
  puneParkLapEquivalent: string;
  puneParkLapCount: number;
  stepMilestoneTitle: string;
  stepMilestoneProgress: number;
  stepMilestoneTarget: number;
  accessibilityDescription: string;
}









