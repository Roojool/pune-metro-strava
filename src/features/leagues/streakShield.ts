import type { Journey } from '../../domain/models';
import { getIstDateKey } from './monthlyHabitMatrix';
import { getJourneyTimestamp } from './leagueBadges';
import type { StreakShieldSummary } from './types';

/**
 * Calculates commuter streak shield protections, reset countdowns, and fair-play status.
 */
export function calculateStreakShield(
  journeys: Journey[],
  streakDays: number,
  now: Date = new Date()
): StreakShieldSummary {
  const maxShields = 2;
  const weeklyCommuteTarget = 4;

  // Calculate hours remaining until UTC midnight (5:30 AM IST next morning)
  const nowMs = now.getTime();
  const nextMidnightUtcMs = Math.ceil(nowMs / 86400000) * 86400000;
  const hoursUntilReset = Math.max(0, Math.round((nextMidnightUtcMs - nowMs) / 3600000));

  // Determine distinct commute days in the past 7 days (rolling weekly window)
  const rolling7DaysMs = 7 * 86400000;
  const cutoffMs = nowMs - rolling7DaysMs;
  const uniqueWeeklyDates = new Set<string>();
  const todayKey = getIstDateKey(now.toISOString());
  let rodeToday = false;

  for (const j of journeys) {
    const ts = getJourneyTimestamp(j);
    const ms = Date.parse(ts);
    if (!Number.isFinite(ms)) continue;

    const dateKey = getIstDateKey(ts);
    if (dateKey === todayKey) {
      rodeToday = true;
    }
    if (ms >= cutoffMs && dateKey) {
      uniqueWeeklyDates.add(dateKey);
    }
  }

  const weeklyCommuteDaysSoFar = uniqueWeeklyDates.size;

  // Shield inventory: 1 shield earned at 3+ streak days, 2 shields earned at 7+ streak days
  let shieldsAvailable = 0;
  if (streakDays >= 7) {
    shieldsAvailable = 2;
  } else if (streakDays >= 3) {
    shieldsAvailable = 1;
  }

  // Progress to next shield (toward 4 weekly commute days)
  const progressToNextShieldRatio = Math.min(
    1,
    Math.round((weeklyCommuteDaysSoFar / weeklyCommuteTarget) * 100) / 100
  );

  // Streak is at risk if commuter has an active streak, has not ridden today, and <= 8 hours remain before 5:30 AM IST reset
  const isStreakAtRisk = streakDays > 0 && !rodeToday && hoursUntilReset <= 8;

  let shieldStatusHeadline: string;
  let shieldStatusMessage: string;

  if (streakDays === 0) {
    shieldStatusHeadline = 'No Active Streak';
    shieldStatusMessage = 'Log a ride to ignite your habit streak. Reach a 3-day streak to earn your first Streak Shield!';
  } else if (isStreakAtRisk) {
    if (shieldsAvailable > 0) {
      shieldStatusHeadline = 'Streak Shield Ready';
      shieldStatusMessage = `No ride logged today. ${shieldsAvailable} Streak Shield will automatically protect your ${streakDays}-day streak at 5:30 AM IST!`;
    } else {
      shieldStatusHeadline = 'Streak at Risk!';
      shieldStatusMessage = `${hoursUntilReset}h remaining before 5:30 AM IST daily reset. Log a ride today to keep your ${streakDays}-day streak alive!`;
    }
  } else if (rodeToday) {
    shieldStatusHeadline = 'Streak Safe for Today';
    shieldStatusMessage = `Ride logged today! Your ${streakDays}-day streak is secured with ${shieldsAvailable}/${maxShields} Streak Shields in reserve.`;
  } else {
    shieldStatusHeadline = `${streakDays}-Day Streak Protected`;
    shieldStatusMessage = `${hoursUntilReset}h until daily reset (5:30 AM IST). ${shieldsAvailable}/${maxShields} shields available.`;
  }

  const fairPlayNotice =
    'Streak Shields protect habit consistency across rest days without fabricating unridden journeys or unearned XP.';

  const accessibilityDescription = `Streak shield status: ${shieldsAvailable} of ${maxShields} shields available. Streak: ${streakDays} days. ${hoursUntilReset} hours until 5:30 AM IST daily reset. ${shieldStatusHeadline}.`;

  return {
    shieldsAvailable,
    maxShields,
    weeklyCommuteDaysSoFar,
    weeklyCommuteTarget,
    progressToNextShieldRatio,
    isStreakAtRisk,
    hoursUntilReset,
    shieldStatusHeadline,
    shieldStatusMessage,
    fairPlayNotice,
    accessibilityDescription,
  };
}
