import type { Journey } from '../../domain/models';
import { calculateJourneyCalories, isLineTransferJourney } from './scoring';
import type { LeagueBadge, LeagueBadgeSummary } from './types';

/**
 * Returns true if an ISO date string falls into the Pune morning (08:00-10:30 IST)
 * or evening (17:30-20:00 IST) peak rush hour windows.
 */
export function isPeakRushHour(isoDate: string): boolean {
  try {
    const ms = Date.parse(isoDate);
    if (!Number.isFinite(ms)) return false;
    const istOffsetMs = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(ms + istOffsetMs);
    const totalMinutes = istDate.getUTCHours() * 60 + istDate.getUTCMinutes();

    const morningRushStart = 8 * 60; // 08:00
    const morningRushEnd = 10 * 60 + 30; // 10:30
    const eveningRushStart = 17 * 60 + 30; // 17:30
    const eveningRushEnd = 20 * 60; // 20:00

    return (
      (totalMinutes >= morningRushStart && totalMinutes <= morningRushEnd) ||
      (totalMinutes >= eveningRushStart && totalMinutes <= eveningRushEnd)
    );
  } catch {
    return false;
  }
}

/**
 * Checks if a journey crosses the scenic Mutha River between Civil Court and Mangalwar Peth.
 */
export function isMuthaCrossing(journey: {
  from: string;
  to: string;
  stationIds?: string[];
}): boolean {
  const stations = journey.stationIds ?? [journey.from, journey.to];
  const hasCivilCourt = stations.includes('civil-court');
  const hasMangalwar = stations.includes('mangalwar-peth');
  return hasCivilCourt && hasMangalwar;
}

/**
 * Checks if a journey touches Civil Court (origin, destination, or intermediate stop).
 */
export function touchesCivilCourt(journey: {
  from: string;
  to: string;
  stationIds?: string[];
}): boolean {
  const stations = journey.stationIds ?? [journey.from, journey.to];
  return stations.includes('civil-court');
}

export function getJourneyTimestamp(journey: Journey | { at?: string; date?: string }): string {
  return ('at' in journey && journey.at) || ('date' in journey && journey.date) || '';
}

/**
 * Calculates all Pune Metro League Commuter Badges, tracking progress and unlocked states.
 */
export function calculateLeagueBadges(journeys: Journey[]): LeagueBadgeSummary {
  const sortedJourneys = [...journeys].sort(
    (a, b) => Date.parse(getJourneyTimestamp(a)) - Date.parse(getJourneyTimestamp(b))
  );

  let cumulativeKm = 0;
  let cumulativeCalories = 0;
  let civilCourtCount = 0;
  let muthaCrossings = 0;
  let rushHourRides = 0;
  let lineTransfers = 0;

  let centurionUnlockDate: string | null = null;
  let sinhagadUnlockDate: string | null = null;
  let k2sUnlockDate: string | null = null;
  let civilCourtUnlockDate: string | null = null;
  let muthaUnlockDate: string | null = null;
  let rushHourUnlockDate: string | null = null;
  let lineTransferUnlockDate: string | null = null;
  let greenGuardianUnlockDate: string | null = null;

  for (const j of sortedJourneys) {
    const ts = getJourneyTimestamp(j);
    cumulativeKm += j.kilometers;
    const cals = calculateJourneyCalories(j);
    cumulativeCalories += cals;
    const co2Kg = cumulativeKm * 0.12;

    if (cumulativeKm >= 100 && !centurionUnlockDate) {
      centurionUnlockDate = ts;
    }
    if (cumulativeCalories >= 800 && !sinhagadUnlockDate) {
      sinhagadUnlockDate = ts;
    }
    if (cumulativeCalories >= 2500 && !k2sUnlockDate) {
      k2sUnlockDate = ts;
    }
    if (co2Kg >= 15 && !greenGuardianUnlockDate) {
      greenGuardianUnlockDate = ts;
    }

    if (touchesCivilCourt(j)) {
      civilCourtCount++;
      if (civilCourtCount >= 3 && !civilCourtUnlockDate) {
        civilCourtUnlockDate = ts;
      }
    }

    if (isMuthaCrossing(j)) {
      muthaCrossings++;
      if (muthaCrossings >= 2 && !muthaUnlockDate) {
        muthaUnlockDate = ts;
      }
    }

    if (isPeakRushHour(ts)) {
      rushHourRides++;
      if (rushHourRides >= 5 && !rushHourUnlockDate) {
        rushHourUnlockDate = ts;
      }
    }

    const stationList = j.stationIds ?? [j.from, j.to];
    if (isLineTransferJourney(stationList)) {
      lineTransfers++;
      if (lineTransfers >= 2 && !lineTransferUnlockDate) {
        lineTransferUnlockDate = ts;
      }
    }
  }

  const totalCo2Kg = Math.round(cumulativeKm * 0.12 * 10) / 10;

  const rawBadges: Omit<LeagueBadge, 'progressRatio' | 'isUnlocked'>[] = [
    {
      id: 'civil-court-explorer',
      title: 'Civil Court Explorer',
      marathiTitle: 'सिव्हिल कोर्ट पायोनियर',
      category: 'elevation',
      icon: '🏛️',
      description: 'Traverse Civil Court station (~33.1m depth, India’s deepest) 3 times.',
      tier: 'silver',
      target: 3,
      current: civilCourtCount,
      unit: 'visits',
      rewardXp: 150,
      unlockedDate: civilCourtUnlockDate,
    },
    {
      id: 'centurion-commuter',
      title: 'Pune Centurion',
      marathiTitle: 'शतकवीर प्रवासी',
      category: 'distance',
      icon: '🚇',
      description: 'Log 100+ km of clean electric metro transit across Pune.',
      tier: 'gold',
      target: 100,
      current: Math.round(cumulativeKm * 10) / 10,
      unit: 'km',
      rewardXp: 300,
      unlockedDate: centurionUnlockDate,
    },
    {
      id: 'sinhagad-scaler',
      title: 'Sinhagad Scaler',
      marathiTitle: 'सिंहगड पादत्राणे',
      category: 'elevation',
      icon: '⛰️',
      description: 'Burn 800+ active physical calories (equivalent to 1,200 Sinhagad Fort steps).',
      tier: 'silver',
      target: 800,
      current: cumulativeCalories,
      unit: 'kcal',
      rewardXp: 200,
      unlockedDate: sinhagadUnlockDate,
    },
    {
      id: 'k2s-trekker',
      title: 'K2S Endurance Legend',
      marathiTitle: 'के२एस ट्रेकर',
      category: 'elevation',
      icon: '🥾',
      description: 'Burn 2,500+ active calories (equivalent to the 16 km Katraj-Sinhagad trek).',
      tier: 'diamond',
      target: 2500,
      current: cumulativeCalories,
      unit: 'kcal',
      rewardXp: 500,
      unlockedDate: k2sUnlockDate,
    },
    {
      id: 'mutha-river-voyager',
      title: 'Mutha River Voyager',
      marathiTitle: 'मुठा नदी प्रवासी',
      category: 'exploration',
      icon: '🌉',
      description: 'Cross the Mutha River corridor between Civil Court and Mangalwar Peth 2 times.',
      tier: 'bronze',
      target: 2,
      current: muthaCrossings,
      unit: 'crossings',
      rewardXp: 100,
      unlockedDate: muthaUnlockDate,
    },
    {
      id: 'rush-hour-master',
      title: 'Peak Commute Master',
      marathiTitle: 'पीक अवर मास्टर',
      category: 'consistency',
      icon: '⚡',
      description: 'Complete 5 rides during peak rush hours (8:00–10:30 IST or 17:30–20:00 IST).',
      tier: 'silver',
      target: 5,
      current: rushHourRides,
      unit: 'rides',
      rewardXp: 175,
      unlockedDate: rushHourUnlockDate,
    },
    {
      id: 'green-guardian',
      title: 'CO₂ Green Guardian',
      marathiTitle: 'हरित योद्धा',
      category: 'eco',
      icon: '🌿',
      description: 'Prevent 15+ kg of tailpipe CO₂ emissions by switching from road transit to metro.',
      tier: 'gold',
      target: 15,
      current: totalCo2Kg,
      unit: 'kg',
      rewardXp: 250,
      unlockedDate: greenGuardianUnlockDate,
    },
    {
      id: 'dual-line-harmonizer',
      title: 'Dual-Line Harmonizer',
      marathiTitle: 'दुहेरी मार्ग समन्वयक',
      category: 'exploration',
      icon: '🔄',
      description: 'Complete 2 interchange trips connecting Purple and Aqua lines via Civil Court.',
      tier: 'bronze',
      target: 2,
      current: lineTransfers,
      unit: 'transfers',
      rewardXp: 120,
      unlockedDate: lineTransferUnlockDate,
    },
  ];

  const badges: LeagueBadge[] = rawBadges.map(b => {
    const ratio = b.target > 0 ? Math.min(1, Math.max(0, b.current / b.target)) : 0;
    return {
      ...b,
      progressRatio: Math.round(ratio * 1000) / 1000,
      isUnlocked: b.current >= b.target,
    };
  });

  const earnedCount = badges.filter(b => b.isUnlocked).length;
  const totalCount = badges.length;
  const completionPercent = totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0;

  // Closest badge in progress: highest progress ratio < 1
  const inProgressBadges = badges
    .filter(b => !b.isUnlocked)
    .sort((a, b) => b.progressRatio - a.progressRatio);
  const nextBadge = inProgressBadges.length > 0 ? inProgressBadges[0] : null;

  const accessibilityDescription =
    earnedCount === 0
      ? `You have earned 0 of ${totalCount} Pune Metro commuter badges. Next closest badge is ${nextBadge?.title ?? 'none'}.`
      : `You have earned ${earnedCount} of ${totalCount} Pune Metro commuter badges (${completionPercent}%). ${
          nextBadge ? `Next badge in progress: ${nextBadge.title} at ${Math.round(nextBadge.progressRatio * 100)}%.` : 'All badges unlocked!'
        }`;

  return {
    badges,
    earnedCount,
    totalCount,
    completionPercent,
    nextBadge,
    accessibilityDescription,
  };
}
