import type { HabitMultiplierInfo } from './types';

/**
 * Calculates transit habit streaks and weekend bonus multipliers.
 * Follows strict fair-play rules:
 * - Minimum streak of 2 consecutive days for first multiplier tier (+5%).
 * - 3 to 4 consecutive days awards +10%.
 * - 5+ consecutive days awards +15%.
 * - Weekend journeys earn +10% eco bonus.
 * - Max ceiling clamped strictly at 1.25x (+25% bonus) to prevent gaming.
 */
export function calculateHabitMultiplier(
  streakDays: number,
  currentDate: Date = new Date()
): HabitMultiplierInfo {
  const safeStreak = Math.max(0, streakDays);

  // Streak multiplier
  let streakMultiplier = 1.0;
  if (safeStreak >= 5) {
    streakMultiplier = 1.15;
  } else if (safeStreak >= 3) {
    streakMultiplier = 1.1;
  } else if (safeStreak >= 2) {
    streakMultiplier = 1.05;
  }

  // Weekend bonus check (Saturday = 6, Sunday = 0)
  const dayOfWeek = currentDate.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const weekendBonusMultiplier = isWeekend ? 1.1 : 1.0;

  // Composite multiplier with 1.25x ceiling cap
  const rawComposite = streakMultiplier * weekendBonusMultiplier;
  const effectiveMultiplier = Math.min(1.25, Math.round(rawComposite * 100) / 100);

  const bonusPercent = Math.round((effectiveMultiplier - 1.0) * 100);
  const bonusPercentageText =
    bonusPercent > 0 ? `+${bonusPercent}% Habit Bonus Active` : 'Standard Scoring Rate';

  const fairPlayNotice =
    bonusPercent > 0
      ? `Bonus multiplier (${effectiveMultiplier}x) applies to self-reported rides. Streak breaks if no rides are logged for a full calendar day.`
      : 'Maintain 2+ consecutive active transit days to unlock habit multipliers up to +25%.';

  return {
    streakDays: safeStreak,
    isWeekend,
    streakMultiplier,
    weekendBonusMultiplier,
    effectiveMultiplier,
    bonusPercentageText,
    fairPlayNotice,
  };
}
