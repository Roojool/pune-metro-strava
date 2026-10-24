import type { Journey } from '../../domain/models';
import { calculateJourneyCalories } from './scoring';
import { getJourneyTimestamp } from './leagueBadges';
import type { MonthDayActivity, MonthlyHabitMatrixSummary } from './types';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const DAY_SHORT_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Converts an ISO timestamp to 'YYYY-MM-DD' in India Standard Time (UTC+5:30).
 */
export function getIstDateKey(isoDate: string): string {
  try {
    const ms = Date.parse(isoDate);
    if (!Number.isFinite(ms)) return '';
    const istOffsetMs = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(ms + istOffsetMs);
    const y = istDate.getUTCFullYear();
    const m = String(istDate.getUTCMonth() + 1).padStart(2, '0');
    const d = String(istDate.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  } catch {
    return '';
  }
}

/**
 * Builds the monthly calendar habit matrix and streak records for Pune Metro commuters.
 */
export function calculateMonthlyHabitMatrix(
  journeys: Journey[],
  now: Date = new Date()
): MonthlyHabitMatrixSummary {
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istNow = new Date(now.getTime() + istOffsetMs);

  const year = istNow.getUTCFullYear();
  const month = istNow.getUTCMonth();
  const currentDayOfMonth = istNow.getUTCDate();
  const monthName = MONTH_NAMES[month];

  // Number of days in current month
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

  // Bucket journeys by IST date
  const dayRidesMap: Record<string, { count: number; calories: number }> = {};

  for (const j of journeys) {
    const ts = getJourneyTimestamp(j);
    const dateKey = getIstDateKey(ts);
    if (!dateKey) continue;

    if (!dayRidesMap[dateKey]) {
      dayRidesMap[dateKey] = { count: 0, calories: 0 };
    }
    dayRidesMap[dateKey].count += 1;
    dayRidesMap[dateKey].calories += calculateJourneyCalories(j);
  }

  const days: MonthDayActivity[] = [];
  let totalMonthRides = 0;
  let totalMonthCalories = 0;
  let activeDaysCount = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayOfWeekIndex = new Date(Date.UTC(year, month, d)).getUTCDay();
    const dayOfWeekShort = DAY_SHORT_NAMES[dayOfWeekIndex];

    const data = dayRidesMap[dateStr] ?? { count: 0, calories: 0 };
    const isActive = data.count > 0;
    const isToday = d === currentDayOfMonth;

    if (isActive) {
      activeDaysCount++;
      totalMonthRides += data.count;
      totalMonthCalories += data.calories;
    }

    days.push({
      dayOfMonth: d,
      dateStr,
      dayOfWeekShort,
      ridesCount: data.count,
      caloriesBurned: data.calories,
      isToday,
      isActive,
    });
  }

  // Calculate streaks up to current day of month
  let longestStreakDays = 0;
  let currentRun = 0;

  for (let d = 1; d <= currentDayOfMonth; d++) {
    const day = days[d - 1];
    if (day.isActive) {
      currentRun++;
      if (currentRun > longestStreakDays) {
        longestStreakDays = currentRun;
      }
    } else {
      currentRun = 0;
    }
  }

  // Current active streak ending today (or yesterday if today has no rides yet)
  let currentStreakDays = 0;
  let probe = currentDayOfMonth - 1; // index in days array

  // If today is active, count back from today
  if (days[probe] && days[probe].isActive) {
    while (probe >= 0 && days[probe].isActive) {
      currentStreakDays++;
      probe--;
    }
  } else if (probe > 0 && days[probe - 1].isActive) {
    // If today is inactive but yesterday was active, streak is alive
    probe--;
    while (probe >= 0 && days[probe].isActive) {
      currentStreakDays++;
      probe--;
    }
  }

  const daysElapsed = Math.max(1, currentDayOfMonth);
  const consistencyPercentage = Math.round((activeDaysCount / daysElapsed) * 100);

  let habitStatusTitle: string;
  let habitStatusSubtitle: string;

  if (activeDaysCount === 0) {
    habitStatusTitle = 'Station Newcomer';
    habitStatusSubtitle = `No rides logged in ${monthName} yet. Take your next Pune Metro ride to ignite your monthly habit matrix!`;
  } else if (consistencyPercentage < 25) {
    habitStatusTitle = 'Occasional Explorer';
    habitStatusSubtitle = `Riding on select errands and weekend trips across Pune. ${activeDaysCount} active days logged this month.`;
  } else if (consistencyPercentage < 55) {
    habitStatusTitle = 'Rising Regular';
    habitStatusSubtitle = `Developing steady transit rhythm across PCMC and Pune city corridors (${consistencyPercentage}% monthly cadence).`;
  } else if (consistencyPercentage < 80) {
    habitStatusTitle = 'Consistent Commuter';
    habitStatusSubtitle = `Outstanding transit habit! Active on ${activeDaysCount} of ${daysElapsed} days this month.`;
  } else {
    habitStatusTitle = 'Iron Transit Champion';
    habitStatusSubtitle = `Incredible daily dedication! Leading Pune’s sustainable commute revolution with ${consistencyPercentage}% monthly coverage.`;
  }

  const accessibilityDescription = `Monthly habit matrix for ${monthName} ${year}: ${activeDaysCount} active days, ${totalMonthRides} rides, ${totalMonthCalories} active kcal burned. Consistency: ${consistencyPercentage}%. Current streak: ${currentStreakDays} days. Longest streak: ${longestStreakDays} days. Status: ${habitStatusTitle}.`;

  return {
    monthName,
    year,
    totalMonthRides,
    totalMonthCalories,
    activeDaysCount,
    daysInMonth,
    consistencyPercentage,
    currentStreakDays,
    longestStreakDays,
    days,
    habitStatusTitle,
    habitStatusSubtitle,
    accessibilityDescription,
  };
}
