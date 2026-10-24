import type { Achievement, TravelStatistics } from '@/domain/models';

export type AchievementProgressStats = Pick<TravelStatistics, 'totalJourneys' | 'visitedIds' | 'streak'>;

export interface AchievementGoalProgress {
  current: number;
  target: number;
  remaining: number;
  percent: number;
  valueText: string;
}

export interface AchievementProgressItem {
  achievement: Achievement;
  progress: AchievementGoalProgress | null;
  guidance: string;
}

function goal(current: number, target: number, valueText: string): AchievementGoalProgress {
  return {
    current,
    target,
    remaining: Math.max(0, target - current),
    // Only the visual meter is capped. The recorded count remains visible.
    percent: Math.round(Math.min(100, Math.max(0, current / target * 100))),
    valueText,
  };
}

/** Present shared statistics without making another achievement-unlock decision. */
export function buildAchievementProgress(
  achievements: readonly Achievement[],
  stats: AchievementProgressStats,
): AchievementProgressItem[] {
  return achievements.map(achievement => {
    let progress: AchievementGoalProgress | null = null;
    let guidance = achievement.unlocked
      ? 'Unlocked from your self-reported activity.'
      : 'See the description for this achievement’s requirements.';

    // These display goals mirror the existing shared domain achievements.
    // The supplied achievement.unlocked always remains the source of truth.
    switch (achievement.id) {
      case 'first-ride': {
        progress = goal(stats.totalJourneys, 1,
          `${stats.totalJourneys} ${stats.totalJourneys === 1 ? 'ride' : 'rides'} recorded · goal 1 ride`);
        guidance = achievement.unlocked
          ? 'Your first ride is recorded. This milestone uses your all-time local rides.'
          : 'Log your first completed metro ride to start this milestone.';
        break;
      }
      case 'explorer': {
        const current = stats.visitedIds.length;
        progress = goal(current, 5,
          `${current} unique endpoint ${current === 1 ? 'station' : 'stations'} collected · goal 5 stations`);
        guidance = achievement.unlocked
          ? 'Five-station milestone reached. Your all-time endpoint collection keeps growing.'
          : `${progress.remaining} more unique boarding or exit ${progress.remaining === 1 ? 'station' : 'stations'} to reach 5. Passing through does not count.`;
        break;
      }
      case 'regular': {
        progress = goal(stats.totalJourneys, 5,
          `${stats.totalJourneys} ${stats.totalJourneys === 1 ? 'ride' : 'rides'} recorded · goal 5 rides`);
        guidance = achievement.unlocked
          ? 'Five-ride milestone reached. Your all-time local ride count keeps growing.'
          : `${progress.remaining} more completed ${progress.remaining === 1 ? 'ride' : 'rides'} to reach 5. This is an all-time total.`;
        break;
      }
      case 'consistent': {
        progress = goal(stats.streak, 3,
          `${stats.streak} consecutive India calendar ${stats.streak === 1 ? 'day' : 'days'} · goal 3 days`);
        guidance = achievement.unlocked
          ? 'Your current streak has reached three days. This badge locks again if the streak breaks.'
          : stats.streak === 0
            ? 'Log a completed ride to start a streak, then ride on consecutive India calendar days.'
            : `${progress.remaining} more consecutive ${progress.remaining === 1 ? 'day' : 'days'} to reach 3. Extra rides on the same India calendar day do not add a day.`;
        break;
      }
    }

    return { achievement, progress, guidance };
  });
}
