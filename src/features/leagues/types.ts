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

export type TrophyRarity = 'bronze' | 'silver' | 'gold' | 'obsidian';

export interface CommuterTrophy {
  id: string;
  title: string;
  marathiTitle: string;
  description: string;
  criteriaLabel: string;
  rarity: TrophyRarity;
  iconName: string;
  isUnlocked: boolean;
  unlockedAtFormatted?: string;
  currentValue: number;
  targetValue: number;
  progressPercent: number;
}

export interface TrophyCabinetSummary {
  trophies: CommuterTrophy[];
  unlockedCount: number;
  totalTrophies: number;
  completionPercent: number;
  cabinetScore: number;
  cabinetRankTitle: string;
  cabinetRankMarathi: string;
  shareableShowcaseText: string;
  accessibilityDescription: string;
}

export type TransitWindowId =
  | 'early_bird'
  | 'morning_rush'
  | 'midday_offpeak'
  | 'evening_rush'
  | 'night_owl';

export interface WindowDistribution {
  id: TransitWindowId;
  label: string;
  hoursLabel: string;
  count: number;
  percent: number;
  isPeak: boolean;
  caloriesBurned: number;
}

export interface PeakFlowSummary {
  totalRides: number;
  peakRidesCount: number;
  offPeakRidesCount: number;
  peakRidesPercent: number;
  offPeakRidesPercent: number;
  crowdStaminaKcal: number;
  gridBalancerPoints: number;
  dominantPersona: string;
  dominantPersonaMarathi: string;
  windowBreakdown: WindowDistribution[];
  efficiencyTip: string;
  shareableFlowText: string;
  accessibilityDescription: string;
}

export interface NeighborhoodCatchment {
  id: string;
  name: string;
  marathiName: string;
  associatedStations: string[];
  walkRadiusMeters: number;
  prominentLandmarks: string[];
  visitCount: number;
  isUnlocked: boolean;
  totalKmWalked: number;
}

export interface StationRadiusSummary {
  totalEstimatedWalkKm: number;
  totalWalkSteps: number;
  firstLastMileBurnKcal: number;
  activeCommuteMultiplier: number;
  unlockedCatchmentsCount: number;
  totalCatchments: number;
  catchments: NeighborhoodCatchment[];
  topWalkableHub: string;
  pedestrianPersona: string;
  pedestrianPersonaMarathi: string;
  shareableRadiusText: string;
  accessibilityDescription: string;
}

export interface MetroSegment {
  id: string;
  title: string;
  marathiTitle: string;
  line: LineId | 'interchange';
  fromStationId: string;
  toStationId: string;
  distanceKm: number;
  standardMinutes: number;
  roadMinutes: number;
  timesTraversed: number;
  isCompleted: boolean;
  isLocalLegend: boolean;
  bestPaceMinPerKm?: number;
  totalMinutesSaved: number;
}

export interface SegmentVelocitySummary {
  totalSegmentsCompleted: number;
  localLegendCrownsCount: number;
  totalTimeSavedMinutes: number;
  segments: MetroSegment[];
  favoriteSegment: string;
  segmentPersona: string;
  segmentPersonaMarathi: string;
  shareableSegmentsText: string;
  accessibilityDescription: string;
}

export type SmogShieldTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface SmogShieldSummary {
  pm25AvoidedMicrograms: number;
  smogMinutesAvoided: number;
  filteredAirLiters: number;
  hillStationFreshAirDays: number;
  smogShieldTier: SmogShieldTier;
  smogShieldTitle: string;
  smogShieldMarathi: string;
  highestProtectionCorridor: string;
  healthBenefitText: string;
  shareableShieldText: string;
  accessibilityDescription: string;
}

export interface FuelSavingsSummary {
  totalRupeesSavedVsScooter: number;
  totalRupeesSavedVsAuto: number;
  totalRupeesSavedVsCar: number;
  totalMetroFareSpent: number;
  netEconomicSavings: number;
  petrolLitersAvoided: number;
  puneCulturalSavingEquivalent: string;
  savingsPersona: string;
  savingsPersonaMarathi: string;
  shareableSavingsText: string;
  accessibilityDescription: string;
}

export interface IntermodalHub {
  id: string;
  stationId: string;
  hubName: string;
  marathiName: string;
  connectingModes: string[];
  interchangeStairsFlights: number;
  visitCount: number;
  isUnlocked: boolean;
}

export interface IntermodalTransitSummary {
  totalIntermodalVisits: number;
  unlockedHubsCount: number;
  totalHubs: number;
  intermodalConnectivityScore: number;
  intermodalTransferKcal: number;
  hubs: IntermodalHub[];
  dominantFeederMode: string;
  intermodalPersona: string;
  intermodalPersonaMarathi: string;
  shareableIntermodalText: string;
  accessibilityDescription: string;
}

export type AuditTrustTier = 'provisional' | 'verified_commuter' | 'fair_play_champion';

export interface AuditFlag {
  type: string;
  message: string;
  journeyId?: string;
}

export interface CommuterAuditSummary {
  trustScore: number;
  trustTier: AuditTrustTier;
  trustTierTitle: string;
  trustTierMarathi: string;
  totalJourneysAudited: number;
  rapidSpamChecksPassed: boolean;
  dailyCapCompliant: boolean;
  velocityPlausibilityRatio: number;
  flaggedAnomaliesCount: number;
  integrityFlags: AuditFlag[];
  auditVerificationBadge: string;
  shareableAuditText: string;
  accessibilityDescription: string;
}

export type PuneTreeSpeciesId = 'peepal' | 'neem' | 'banyan' | 'tamarind' | 'gulmohar';

export interface PuneTreeSpecies {
  id: PuneTreeSpeciesId;
  name: string;
  marathiName: string;
  botanicalName: string;
  annualCo2AbsorptionKg: number;
  icon: string;
  significance: string;
  puneHabitat: string;
}

export type TreeCanopyTier = 'sapling' | 'grove' | 'forest_guardian' | 'canopy_champion' | 'biosphere_patron';

export interface TreeOffsetSummary {
  kgCo2Saved: number;
  treeYearsSequestered: number;
  treeDaysSequestered: number;
  oxygenGeneratedLiters: number;
  biodiversityScore: number;
  activeTier: TreeCanopyTier;
  tierTitle: string;
  tierTitleMarathi: string;
  featuredTree: PuneTreeSpecies;
  treesAdoptedCount: number;
  nextTierTargetKg: number;
  progressToNextTierPercent: number;
  ecologicalTip: string;
  shareableTreeText: string;
  accessibilityDescription: string;
}

export interface PuneChokePoint {
  id: string;
  name: string;
  marathiName: string;
  roadName: string;
  bypassStations: string[];
  peakDelayMinutes: number;
  bypassCount: number;
  isBypassed: boolean;
}

export type DecongestionTier = 'chowk_cruiser' | 'flyover_skipper' | 'grid_unclogger' | 'flow_master' | 'traffic_legend';

export interface TrafficReliefSummary {
  roadKmTraveledAvoided: number;
  trafficSignalMinutesSaved: number;
  roadSpaceOccupancySqMHours: number;
  chokePointsBypassedCount: number;
  totalChokePoints: number;
  chokePoints: PuneChokePoint[];
  decongestionTier: DecongestionTier;
  tierTitle: string;
  tierTitleMarathi: string;
  dominantChokePointBypassed: string;
  nextTierKm: number;
  progressPercent: number;
  congestionReliefTip: string;
  shareableTrafficText: string;
  accessibilityDescription: string;
}

export type AcousticTier = 'acoustic_seeker' | 'zen_commuter' | 'decibel_shield_master' | 'silent_corridor_champion';

export interface PuneQuietHaven {
  id: string;
  name: string;
  marathiName: string;
  ambientDecibels: number;
  description: string;
  unlockedAtMinutes: number;
  isUnlocked: boolean;
}

export interface AcousticWellnessSummary {
  quietTransitMinutes: number;
  roadNoiseMinutesAvoided: number;
  averageCoachDba: number;
  roadwayPeakDba: number;
  decibelReductionDba: number;
  acousticEnergyReductionPercent: number;
  peacefulZoneScore: number;
  acousticTier: AcousticTier;
  tierTitle: string;
  tierTitleMarathi: string;
  unlockedHavens: PuneQuietHaven[];
  nextTierMinutes: number;
  progressPercent: number;
  wellnessTip: string;
  shareableAcousticText: string;
  accessibilityDescription: string;
}

export type GreenTractionTier = 'solar_sprout' | 'pv_pioneer' | 'grid_guardian' | 'traction_maestro';

export interface SolarStationArray {
  stationId: string;
  name: string;
  marathiName: string;
  solarCapacityKwp: number;
  annualSolarYieldMwh: number;
  isVisited: boolean;
}

export interface GreenTractionSummary {
  cleanTractionKwh: number;
  solarSolarKwh: number;
  regenerativeBrakingKwh: number;
  solarBulbHours: number;
  gridIndependenceScore: number;
  solarTractionTier: GreenTractionTier;
  tierTitle: string;
  tierTitleMarathi: string;
  solarStationsVisitedCount: number;
  totalSolarStations: number;
  solarStations: SolarStationArray[];
  nextTierKwh: number;
  progressPercent: number;
  solarTractionTip: string;
  shareableSolarText: string;
  accessibilityDescription: string;
}





