import { LINES } from '../../data/pune';
import type { Journey, LineId } from '../../domain/models';

/**
 * Robustly filters journeys by metro line.
 * Handles single-line journeys, cross-line transfers through Civil Court interchange,
 * and ensures safe fallback if stationIds array is absent.
 */
export function filterJourneysByLine(journeys: Journey[], line: LineId): Journey[] {
  const selectedLine = LINES.find(l => l.id === line);
  if (!selectedLine) return [];
  const routeIds = new Set(selectedLine.stationIds);

  return journeys.filter(j => {
    const list = Array.isArray(j.stationIds) && j.stationIds.length > 0
      ? j.stationIds
      : [j.from, j.to];
    const matchCount = list.filter(id => routeIds.has(id)).length;
    // A journey belongs to this line if at least 2 stations along the route belong to it
    return matchCount >= 2;
  });
}

/**
 * Contextual, accessible guidance for line-specific empty states in the route league.
 */
export function getLineEmptyStateGuidance(line: LineId): {
  lineName: string;
  guidance: string;
  suggestedStations: string[];
} {
  if (line === 'purple') {
    return {
      lineName: 'Purple Line (Line 1)',
      guidance:
        'The Purple Line links Pimpri-Chinchwad to central Pune via Khadki, Shivajinagar, and Civil Court. Take a ride across this north-south corridor to earn route XP and active burn.',
      suggestedStations: ['PCMC', 'Bhosari', 'Shivajinagar', 'Civil Court (District Court)'],
    };
  }
  return {
    lineName: 'Aqua Line (Line 2)',
    guidance:
      'The Aqua Line traverses east-west through Kothrud, Deccan Gymkhana, PMC, Pune Railway Station, and Ramwadi. Log a trip along this corridor to enter the Aqua Line league.',
    suggestedStations: ['Vanaz', 'Nal Stop', 'Garware College', 'Civil Court (District Court)', 'Ramwadi'],
  };
}

/**
 * Sanitizes and truncates rider names safely preserving Unicode, Devanagari, and emoji integrity.
 */
export function sanitizeParticipantName(name: string, maxLength = 24): string {
  const trimmed = name.trim();
  if (!trimmed) return 'Explorer';
  const chars = Array.from(trimmed);
  if (chars.length <= maxLength) return trimmed;
  return `${chars.slice(0, maxLength - 1).join('')}…`;
}

/**
 * Calculates countdown until the next daily demo limit reset (00:00 UTC = 5:30 AM IST).
 */
export function calculateDailyResetTime(now = new Date()): {
  hoursRemaining: number;
  minutesRemaining: number;
  formattedText: string;
} {
  const utcNow = now.getTime();
  const nextResetDate = new Date(now);
  nextResetDate.setUTCHours(24, 0, 0, 0);
  const diffMs = Math.max(0, nextResetDate.getTime() - utcNow);

  const hoursRemaining = Math.floor(diffMs / (3600 * 1000));
  const minutesRemaining = Math.floor((diffMs % (3600 * 1000)) / (60 * 1000));

  return {
    hoursRemaining,
    minutesRemaining,
    formattedText: `${hoursRemaining}h ${minutesRemaining}m (at 5:30 AM IST)`,
  };
}

/**
 * Classifies habit momentum for commuter motivation.
 */
export function calculatePaceCategory(streak: number, activeDays: number): {
  badge: string;
  description: string;
} {
  if (streak >= 7) {
    return {
      badge: 'Daily Commuter',
      description: 'Remarkable momentum! Riding every single day across Pune.',
    };
  }
  if (streak >= 3) {
    return {
      badge: 'Consistent Rider',
      description: 'Strong rhythm. Consecutive daily transit habits in motion.',
    };
  }
  if (activeDays >= 5) {
    return {
      badge: 'Regular Explorer',
      description: 'Steadily building your metro footprint around the city.',
    };
  }
  return {
    badge: 'Getting Started',
    description: 'Every single ride counts toward your habit and active fitness.',
  };
}
