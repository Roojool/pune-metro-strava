import type { Journey } from '../../domain/models';
import type { WeekendChallenge } from './types';

/**
 * Calculates start and end timestamps (UTC ms) for the active India weekend relative to now.
 * India Standard Time is UTC+5:30.
 * An active weekend runs from Saturday 00:00:00 IST to Sunday 23:59:59.999 IST.
 * If now is Monday through Friday, returns the upcoming weekend boundaries so past weekend rides are excluded.
 */
export function getActiveWeekendBoundaries(now: Date = new Date()): { startUtcMs: number; endUtcMs: number } {
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istNow = new Date(now.getTime() + istOffsetMs);
  const day = istNow.getUTCDay(); // 0: Sun, 1: Mon, ..., 6: Sat

  let daysSinceSaturday = 0;
  if (day === 6) {
    daysSinceSaturday = 0;
  } else if (day === 0) {
    daysSinceSaturday = 1;
  } else {
    // Weekday: upcoming Saturday
    const daysUntilSaturday = 6 - day;
    const saturdayDate = new Date(Date.UTC(istNow.getUTCFullYear(), istNow.getUTCMonth(), istNow.getUTCDate() + daysUntilSaturday));
    const startUtcMs = saturdayDate.getTime() - istOffsetMs;
    const endUtcMs = startUtcMs + (48 * 60 * 60 * 1000) - 1;
    return { startUtcMs, endUtcMs };
  }

  const saturdayDate = new Date(Date.UTC(istNow.getUTCFullYear(), istNow.getUTCMonth(), istNow.getUTCDate() - daysSinceSaturday));
  const startUtcMs = saturdayDate.getTime() - istOffsetMs;
  const endUtcMs = startUtcMs + (48 * 60 * 60 * 1000) - 1;
  return { startUtcMs, endUtcMs };
}

/**
 * Returns whether a given ISO date string falls in the active India weekend relative to now.
 * Saturday & Sunday in IST (UTC+5:30) of the current active weekend window.
 */
export function isJourneyInWeekend(isoString: string, now: Date = new Date()): boolean {
  try {
    const journeyMs = Date.parse(isoString);
    if (!Number.isFinite(journeyMs)) return false;
    const { startUtcMs, endUtcMs } = getActiveWeekendBoundaries(now);
    return journeyMs >= startUtcMs && journeyMs <= endUtcMs;
  } catch {
    return false;
  }
}

/**
 * Calculates remaining hours and minutes until Sunday 23:59 IST.
 */
export function getWeekendRemainingText(now: Date = new Date()): string {
  const istNow = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  const currentDay = istNow.getUTCDay();

  if (currentDay === 6) {
    // Saturday
    const hoursLeft = 47 - istNow.getUTCHours();
    return `${Math.max(1, hoursLeft)}h left this weekend`;
  }
  if (currentDay === 0) {
    // Sunday
    const hoursLeft = 23 - istNow.getUTCHours();
    return `${Math.max(1, hoursLeft)}h left today`;
  }
  return 'Starts Saturday 00:00 IST';
}

/**
 * Derives the active weekend challenges and evaluates current commuter progress.
 */
export function calculateWeekendChallenges(
  journeys: Journey[],
  now: Date = new Date()
): WeekendChallenge[] {
  const weekendJourneys = journeys.filter(j => isJourneyInWeekend(j.at, now));
  const remainingTimeText = getWeekendRemainingText(now);

  // Challenge 1: Mutha River Crossing Sprint
  // Journeys containing Vanaz / Deccan / PMC / Civil Court on Aqua or interchange
  const muthaCrossings = weekendJourneys.filter(j => {
    const list = j.stationIds ?? [j.from, j.to];
    return (
      (list.includes('vanaz') || list.includes('deccan-gymkhana') || list.includes('pmc')) &&
      (list.includes('civil-court') || list.includes('ruby-hall-clinic') || list.includes('ramwadi'))
    );
  }).length;
  const c1Complete = muthaCrossings >= 3;

  // Challenge 2: Grand Corridor Conqueror (10+ km or 10+ stations in single trip)
  const grandCorridorTrips = weekendJourneys.filter(j => {
    const stationCount = j.stationIds ? j.stationIds.length : 2;
    return j.kilometers >= 10 || stationCount >= 10;
  }).length;
  const c2Complete = grandCorridorTrips >= 1;

  // Challenge 3: Weekend Explorer Trio (3 distinct stations visited over weekend)
  const distinctStations = new Set<string>();
  for (const j of weekendJourneys) {
    distinctStations.add(j.from);
    distinctStations.add(j.to);
  }
  const distinctCount = distinctStations.size;
  const c3Complete = distinctCount >= 3;

  return [
    {
      id: 'mutha-river-sprint',
      title: 'Mutha River Crossing Sprint',
      subtitle: 'Vanaz ↔ Civil Court Aqua Corridor',
      description: 'Cross the scenic river corridor 3 times this weekend to earn bonus active energy.',
      targetCount: 3,
      currentProgress: Math.min(3, muthaCrossings),
      rewardXp: 60,
      rewardKcal: 120,
      isCompleted: c1Complete,
      badgeTag: 'RIVER SPRINT',
      remainingTimeText,
    },
    {
      id: 'grand-corridor-conqueror',
      title: 'Grand Corridor Conqueror',
      subtitle: '10+ km Continuous Spine Journey',
      description: 'Ride across 10 or more stations or kilometers in a single continuous transit trek.',
      targetCount: 1,
      currentProgress: Math.min(1, grandCorridorTrips),
      rewardXp: 50,
      rewardKcal: 95,
      isCompleted: c2Complete,
      badgeTag: 'LONG HAUL',
      remainingTimeText,
    },
    {
      id: 'weekend-station-trio',
      title: 'Weekend Explorer Trio',
      subtitle: '3 Distinct Pune Metro Stations',
      description: 'Board or disembark at 3 unique Pune Metro stations over the Saturday-Sunday window.',
      targetCount: 3,
      currentProgress: Math.min(3, distinctCount),
      rewardXp: 40,
      rewardKcal: 80,
      isCompleted: c3Complete,
      badgeTag: 'STATION HOPPER',
      remainingTimeText,
    },
  ];
}
