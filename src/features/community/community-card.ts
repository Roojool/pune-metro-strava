export interface CommuterCardStats {
  totalJourneys: number;
  stationsCount: number;
  points: number;
}

export interface PostValidationResult {
  ok: boolean;
  message?: string;
  cleanBody?: string;
}

/**
 * Formats an aggregate-only summary for commuter card sharing.
 * Contains no station names, travel dates, commute routes, or private user identity.
 */
export function communityCardSummary(stats: CommuterCardStats): string {
  return `My MetroQuest commuter card\n${stats.totalJourneys} self-reported rides · ${stats.stationsCount} stations collected · ${stats.points} XP\nPune Metro · local demo, not verified travel or a live ranking.`;
}

/**
 * Validates a community post body.
 * Rejects empty or whitespace-only input and posts exceeding 500 characters.
 */
export function validateCommunityPost(raw: string): PostValidationResult {
  const cleanBody = (raw ?? '').trim();
  if (!cleanBody || cleanBody.length > 500) {
    return {
      ok: false,
      message: 'Write a post between 1 and 500 characters.',
    };
  }
  return {
    ok: true,
    cleanBody,
  };
}
