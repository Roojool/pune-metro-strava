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

export interface ShareFeedbackResult {
  ok: boolean;
  message: string;
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

/**
 * Handles web and native Share.share results.
 * In web browsers, react-native-web delegates to navigator.share() which resolves to undefined (void).
 * In native Android/iOS, Share.share returns { action: 'sharedAction' | 'dismissedAction' }.
 */
export function handleShareResult(result: { action?: string } | void | undefined): ShareFeedbackResult | null {
  if (!result || result.action === 'sharedAction') {
    return { ok: true, message: 'Your commuter card was handed to the share dialog.' };
  }
  if (result.action === 'dismissedAction') {
    return { ok: false, message: 'Sharing cancelled. Your commuter card remains private.' };
  }
  return null;
}
