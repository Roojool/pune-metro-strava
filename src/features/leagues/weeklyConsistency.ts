import type { Journey } from '../../domain/models';
import { calculateJourneyCalories } from './scoring';
import type {
  CommuterPersonaType,
  DayRhythm,
  WeeklyConsistencyProfile,
} from './types';

const DAY_NAMES: { short: string; full: string; index: number }[] = [
  { short: 'Mon', full: 'Monday', index: 1 },
  { short: 'Tue', full: 'Tuesday', index: 2 },
  { short: 'Wed', full: 'Wednesday', index: 3 },
  { short: 'Thu', full: 'Thursday', index: 4 },
  { short: 'Fri', full: 'Friday', index: 5 },
  { short: 'Sat', full: 'Saturday', index: 6 },
  { short: 'Sun', full: 'Sunday', index: 0 },
];

/**
 * Maps an ISO timestamp to India Standard Time (UTC+5:30) day of week index (0=Sun, 1=Mon, ..., 6=Sat).
 */
export function getIstDayOfWeek(isoDate: string): number {
  try {
    const ms = Date.parse(isoDate);
    if (!Number.isFinite(ms)) return 1;
    const istOffsetMs = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(ms + istOffsetMs);
    return istDate.getUTCDay();
  } catch {
    return 1;
  }
}

/**
 * Evaluates the weekly transit cadence and commuter rhythm across Monday-Sunday in IST.
 */
export function calculateWeeklyConsistency(journeys: Journey[]): WeeklyConsistencyProfile {
  const dayBuckets: Record<number, { count: number; calories: number }> = {
    0: { count: 0, calories: 0 },
    1: { count: 0, calories: 0 },
    2: { count: 0, calories: 0 },
    3: { count: 0, calories: 0 },
    4: { count: 0, calories: 0 },
    5: { count: 0, calories: 0 },
    6: { count: 0, calories: 0 },
  };

  let totalWeekCalories = 0;

  for (const j of journeys) {
    const timestamp = ('at' in j && j.at) || ('date' in (j as any) && (j as any).date) || '';
    const day = getIstDayOfWeek(timestamp);
    const cals = calculateJourneyCalories(j);
    dayBuckets[day].count += 1;
    dayBuckets[day].calories += cals;
    totalWeekCalories += cals;
  }

  // Find peak day (most rides, break ties with calories)
  let maxRides = 0;
  let maxCals = 0;
  let peakDayIndex = 1; // Default Monday if empty

  for (const dayInfo of DAY_NAMES) {
    const bucket = dayBuckets[dayInfo.index];
    if (
      bucket.count > maxRides ||
      (bucket.count === maxRides && bucket.calories > maxCals && bucket.count > 0)
    ) {
      maxRides = bucket.count;
      maxCals = bucket.calories;
      peakDayIndex = dayInfo.index;
    }
  }

  const days: DayRhythm[] = DAY_NAMES.map(info => {
    const bucket = dayBuckets[info.index];
    return {
      dayIndex: info.index,
      dayShort: info.short,
      dayFull: info.full,
      ridesCount: bucket.count,
      caloriesBurned: bucket.calories,
      isPeakDay: bucket.count > 0 && info.index === peakDayIndex,
    };
  });

  const weekdayRides =
    dayBuckets[1].count +
    dayBuckets[2].count +
    dayBuckets[3].count +
    dayBuckets[4].count +
    dayBuckets[5].count;
  const weekendRides = dayBuckets[6].count + dayBuckets[0].count;
  const totalWeekRides = journeys.length;

  let personaType: CommuterPersonaType;
  let personaTitle: string;
  let personaSubtitle: string;

  if (totalWeekRides === 0) {
    personaType = 'station_newcomer';
    personaTitle = 'Station Newcomer';
    personaSubtitle = 'Log your first Pune Metro ride to build your weekly habit profile!';
  } else if (totalWeekRides <= 2) {
    personaType = 'active_kickstarter';
    personaTitle = 'Transit Kickstarter';
    personaSubtitle = 'Early rhythm detected! A few more rides will unlock tailored habit streaks.';
  } else if (weekendRides / totalWeekRides >= 0.5) {
    personaType = 'weekend_explorer';
    personaTitle = 'Weekend City Explorer';
    personaSubtitle = 'You favor exploring Pune on Saturdays and Sundays across riverside and cultural hubs.';
  } else if (weekdayRides >= 4 && weekdayRides / totalWeekRides >= 0.7) {
    personaType = 'daily_it_commuter';
    personaTitle = 'Daily Tech Corridor Commuter';
    personaSubtitle = 'High-frequency weekday rider conquering PCMC, Deccan, and Aqua line tech corridors.';
  } else {
    personaType = 'balanced_champion';
    personaTitle = 'All-Round Transit Champion';
    personaSubtitle = 'Balanced traveler bridging daily city transit with weekend recreation seamlessly.';
  }

  // Active days count (days with >= 1 ride)
  const activeDaysCount = Object.values(dayBuckets).filter(b => b.count > 0).length;

  let consistencyScore = 0;
  if (totalWeekRides > 0) {
    // 70% based on distribution across days, 30% based on ride volume (capped)
    const distributionComponent = (activeDaysCount / 5) * 70;
    const volumeComponent = Math.min(30, totalWeekRides * 4);
    consistencyScore = Math.min(100, Math.round(distributionComponent + volumeComponent));
  }

  // Monthly projections (assuming 4.3 weeks in an average month)
  const projectedMonthlyCalories = Math.round(totalWeekCalories * 4.3);
  const totalKm = journeys.reduce((sum, j) => sum + j.kilometers, 0);
  const projectedMonthlyCo2Kg = Math.round(totalKm * 0.12 * 4.3 * 10) / 10;

  const peakDayName =
    totalWeekRides > 0
      ? DAY_NAMES.find(d => d.index === peakDayIndex)?.full ?? 'None'
      : 'None';

  const accessibilityDescription =
    totalWeekRides === 0
      ? 'Weekly consistency profile: 0 rides logged. Station Newcomer persona.'
      : `Weekly consistency profile: ${personaTitle}. Score: ${consistencyScore}/100. ${totalWeekRides} total rides (${weekdayRides} weekday, ${weekendRides} weekend). Peak day: ${peakDayName}.`;

  return {
    days,
    totalWeekRides,
    totalWeekCalories,
    weekdayRides,
    weekendRides,
    peakDayName,
    personaType,
    personaTitle,
    personaSubtitle,
    consistencyScore,
    projectedMonthlyCalories,
    projectedMonthlyCo2Kg,
    accessibilityDescription,
  };
}
