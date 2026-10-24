export interface LeagueShareData {
  rank: number;
  totalParticipants: number;
  leagueTitle: string;
  points: number;
  caloriesBurned: number;
  level: number;
  milestoneName?: string;
  isZeroState?: boolean;
}

/**
 * Generates an aggregate, privacy-preserving share summary for a commuter's league standing.
 * Strict Privacy Rule: Never exposes personal commute times, home/work locations, or exact travel dates.
 */
export function generateLeagueShareSummary(data: LeagueShareData): string {
  if (data.isZeroState || (data.points === 0 && data.caloriesBurned === 0)) {
    return [
      '🚇 My MetroQuest Pune Commuter Card',
      '🌱 Starting my everyday Pune Metro transit habit · 0 XP · 0 kcal burned',
      'Self-reported local exploration demo · not verified travel.',
      'https://roojool.github.io/pune-metro-strava/',
    ].join('\n');
  }

  const milestonePart = data.milestoneName ? ` (${data.milestoneName})` : '';

  return [
    '🚇 My MetroQuest Pune Leagues Card',
    `🏆 Rank #${data.rank} of ${data.totalParticipants} · ${data.leagueTitle}`,
    `⚡ ${data.points} XP · Level ${data.level} Explorer`,
    `🔥 ${data.caloriesBurned} active commute kcal burned${milestonePart}`,
    'Make Pune Metro a habit · local self-reported demo, not verified travel.',
    'https://roojool.github.io/pune-metro-strava/',
  ].join('\n');
}

/**
 * Normalizes native Share and Web Share API results into user feedback.
 */
export function handleLeagueShareResult(result: unknown): { ok: boolean; message: string } {
  if (
    result === undefined ||
    (result && typeof result === 'object' && (result as { action?: string }).action === 'sharedAction')
  ) {
    return { ok: true, message: 'League card handed to the share dialog.' };
  }
  return { ok: false, message: 'Sharing is unavailable here.' };
}
