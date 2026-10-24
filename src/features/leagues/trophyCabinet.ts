import type { Journey } from '../../domain/models';
import { STATIONS } from '../../data/pune';
import { isLineTransferJourney } from './scoring';
import { getJourneyTimestamp } from './leagueBadges';
import type { CommuterTrophy, TrophyCabinetSummary, TrophyRarity } from './types';

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const PURPLE_STATION_IDS = new Set(STATIONS.filter((s) => s.line === 'purple').map((s) => s.id));
const AQUA_STATION_IDS = new Set(STATIONS.filter((s) => s.line === 'aqua').map((s) => s.id));

export function getOriginStation(j: Journey): string {
  return (j as any).fromStationId || j.from || '';
}

export function getDestinationStation(j: Journey): string {
  return (j as any).toStationId || j.to || '';
}

export function getJourneyKm(j: Journey): number {
  return typeof j.kilometers === 'number' ? j.kilometers : (j as any).distanceKm || 0;
}

export function getJourneyCo2Kg(j: Journey): number {
  if (typeof j.co2Kg === 'number') return j.co2Kg;
  if (typeof (j as any).co2SavedGrams === 'number') return (j as any).co2SavedGrams / 1000;
  return 0;
}

export function getJourneyStationList(j: Journey): string[] {
  if (Array.isArray(j.stationIds) && j.stationIds.length > 0) return j.stationIds;
  return [getOriginStation(j), getDestinationStation(j)].filter(Boolean);
}

/**
 * Formats an ISO timestamp into 'DD Mon YYYY' in India Standard Time (UTC+5:30).
 */
export function formatIstDate(isoDate: string): string {
  try {
    const ms = Date.parse(isoDate);
    if (!Number.isFinite(ms)) return 'Recent';
    const istOffsetMs = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(ms + istOffsetMs);
    const d = istDate.getUTCDate();
    const m = MONTH_SHORT[istDate.getUTCMonth()];
    const y = istDate.getUTCFullYear();
    return `${d} ${m} ${y}`;
  } catch {
    return 'Recent';
  }
}

const HISTORIC_CORE_STATIONS = new Set(['pmc', 'mandai', 'kasba-peth']);

const AQUA_WEST_STATIONS = new Set([
  'vanaz', 'anand-nagar', 'ideal-colony', 'nal-stop',
  'garware-college', 'deccan-gymkhana', 'sambhaji-udyan',
]);

const AQUA_EAST_STATIONS = new Set([
  'pmc', 'civil-court', 'mangalwar-peth', 'pune-railway-station',
  'ruby-hall-clinic', 'bund-garden', 'yerawada', 'kalyani-nagar', 'ramwadi',
]);

/**
 * Checks if a journey crosses the Mutha River viaduct between Deccan/Sambhaji Udyan and PMC/Civil Court.
 */
export function isMuthaRiverCrossing(journey: Journey): boolean {
  const from = getOriginStation(journey);
  const to = getDestinationStation(journey);
  const fromWest = AQUA_WEST_STATIONS.has(from);
  const toEast = AQUA_EAST_STATIONS.has(to);
  const fromEast = AQUA_EAST_STATIONS.has(from);
  const toWest = AQUA_WEST_STATIONS.has(to);
  return (fromWest && toEast) || (fromEast && toWest);
}

const RARITY_POINTS: Record<TrophyRarity, number> = {
  bronze: 25,
  silver: 50,
  gold: 100,
  obsidian: 200,
};

/**
 * Evaluates commuter trophies across journeys, streaks, and achievements.
 */
export function calculateTrophyCabinet(
  journeys: Journey[],
  streak: number = 0,
  points: number = 0
): TrophyCabinetSummary {
  // Sort journeys chronologically to determine honest unlock timestamps
  const chronologicalJourneys = [...journeys].sort((a, b) => {
    const ta = Date.parse(getJourneyTimestamp(a)) || 0;
    const tb = Date.parse(getJourneyTimestamp(b)) || 0;
    return ta - tb;
  });

  // Track metrics incrementally
  let coreVisits = 0;
  let coreUnlockDate: string | undefined;

  let muthaCrossings = 0;
  let muthaUnlockDate: string | undefined;

  let hasCivilCourtTransfer = false;
  let civilCourtUnlockDate: string | undefined;

  let purpleKm = 0;
  let purpleKmUnlockDate: string | undefined;

  let hasPurple = false;
  let hasAqua = false;
  let grandSlamUnlockDate: string | undefined;

  let co2SavedKg = 0;
  let co2UnlockDate: string | undefined;

  let totalKm = 0;
  let totalKmUnlockDate: string | undefined;

  for (const j of chronologicalJourneys) {
    const ts = getJourneyTimestamp(j);
    const origin = getOriginStation(j);
    const dest = getDestinationStation(j);
    const km = getJourneyKm(j);
    const co2 = getJourneyCo2Kg(j);
    const stationList = getJourneyStationList(j);

    // 1. Shaniwar Wada Bastion: core visits
    if (HISTORIC_CORE_STATIONS.has(origin)) coreVisits += 1;
    if (HISTORIC_CORE_STATIONS.has(dest)) coreVisits += 1;
    if (coreVisits >= 3 && !coreUnlockDate) {
      coreUnlockDate = formatIstDate(ts);
    }

    // 2. Mutha River Golden Laurel
    if (isMuthaRiverCrossing(j)) {
      muthaCrossings += 1;
      if (muthaCrossings >= 5 && !muthaUnlockDate) {
        muthaUnlockDate = formatIstDate(ts);
      }
    }

    // 3. Civil Court Depths Medallion
    if (
      isLineTransferJourney(stationList) ||
      origin === 'civil-court' ||
      dest === 'civil-court'
    ) {
      if (!hasCivilCourtTransfer) {
        hasCivilCourtTransfer = true;
        civilCourtUnlockDate = formatIstDate(ts);
      }
    }

    // 4. PCMC Corridor Centurion (Purple Line)
    const isPurpleLine =
      (j as any).line === 'purple' ||
      stationList.some((id) => PURPLE_STATION_IDS.has(id));
    if (isPurpleLine) {
      purpleKm += km;
      if (purpleKm >= 50 && !purpleKmUnlockDate) {
        purpleKmUnlockDate = formatIstDate(ts);
      }
    }

    // 5. Twin Corridors Grand Slam
    const isAquaLine =
      (j as any).line === 'aqua' ||
      stationList.some((id) => AQUA_STATION_IDS.has(id));
    if (isPurpleLine) hasPurple = true;
    if (isAquaLine) hasAqua = true;
    if (hasPurple && hasAqua && !grandSlamUnlockDate) {
      grandSlamUnlockDate = formatIstDate(ts);
    }

    // 6. Clean Air Diamond Plaque
    co2SavedKg += co2;
    if (co2SavedKg >= 10 && !co2UnlockDate) {
      co2UnlockDate = formatIstDate(ts);
    }

    // 7. 100K Century Club Shield
    totalKm += km;
    if (totalKm >= 100 && !totalKmUnlockDate) {
      totalKmUnlockDate = formatIstDate(ts);
    }
  }

  // 8. Punekar Commute Flame (Streak >= 5)
  const isFlameUnlocked = streak >= 5;
  const flameUnlockDate = isFlameUnlocked
    ? chronologicalJourneys.length > 0
      ? formatIstDate(getJourneyTimestamp(chronologicalJourneys[chronologicalJourneys.length - 1]))
      : 'Current Streak'
    : undefined;

  // Build the 8 commuter trophies
  const trophies: CommuterTrophy[] = [
    {
      id: 'shaniwar-wada-bastion',
      title: 'Shaniwar Wada Bastion',
      marathiTitle: 'शनिवार वाडा बालेकिल्ला',
      description: 'Connect with Pune historic core. Board or alight at PMC, Mandai, or Kasba Peth 3+ times.',
      criteriaLabel: '3 Historic Core Visits',
      rarity: 'bronze',
      iconName: 'shield',
      isUnlocked: coreVisits >= 3,
      unlockedAtFormatted: coreUnlockDate,
      currentValue: Math.min(3, coreVisits),
      targetValue: 3,
      progressPercent: Math.min(100, Math.round((coreVisits / 3) * 100)),
    },
    {
      id: 'mutha-bridge-laurel',
      title: 'Mutha River Golden Laurel',
      marathiTitle: 'मुठा नदी सुवर्ण मुकुट',
      description: 'Cross the scenic elevated viaduct over the Mutha River between PMC and Deccan 5+ times.',
      criteriaLabel: '5 River Crossings',
      rarity: 'silver',
      iconName: 'compass',
      isUnlocked: muthaCrossings >= 5,
      unlockedAtFormatted: muthaUnlockDate,
      currentValue: Math.min(5, muthaCrossings),
      targetValue: 5,
      progressPercent: Math.min(100, Math.round((muthaCrossings / 5) * 100)),
    },
    {
      id: 'civil-court-depths',
      title: 'Civil Court Depths Medallion',
      marathiTitle: 'दिवाणी न्यायालय पाताळ पदक',
      description: 'Descend into India deepest metro station (~33.1m depth) and complete a station visit or interchange.',
      criteriaLabel: 'Civil Court Deep Station Hub',
      rarity: 'gold',
      iconName: 'layers',
      isUnlocked: hasCivilCourtTransfer,
      unlockedAtFormatted: civilCourtUnlockDate,
      currentValue: hasCivilCourtTransfer ? 1 : 0,
      targetValue: 1,
      progressPercent: hasCivilCourtTransfer ? 100 : 0,
    },
    {
      id: 'pcmc-arterial-centurion',
      title: 'PCMC Corridor Centurion',
      marathiTitle: 'पिंपरी-चिंचवड शतवीर',
      description: 'Log 50+ cumulative kilometers along the industrial Purple Line arterial corridor.',
      criteriaLabel: '50 km on Purple Line',
      rarity: 'silver',
      iconName: 'activity',
      isUnlocked: purpleKm >= 50,
      unlockedAtFormatted: purpleKmUnlockDate,
      currentValue: Math.min(50, Math.round(purpleKm * 10) / 10),
      targetValue: 50,
      progressPercent: Math.min(100, Math.round((purpleKm / 50) * 100)),
    },
    {
      id: 'twin-corridors-grand-slam',
      title: 'Twin Corridors Grand Slam',
      marathiTitle: 'द्वि-मार्ग महाविजय',
      description: 'Travel on both the Purple Line (PCMC-Swargate) and Aqua Line (Vanaz-Ramwadi) corridors.',
      criteriaLabel: 'Both Metro Corridors Ridden',
      rarity: 'gold',
      iconName: 'git-commit',
      isUnlocked: hasPurple && hasAqua,
      unlockedAtFormatted: grandSlamUnlockDate,
      currentValue: (hasPurple ? 1 : 0) + (hasAqua ? 1 : 0),
      targetValue: 2,
      progressPercent: (hasPurple ? 50 : 0) + (hasAqua ? 50 : 0),
    },
    {
      id: 'clean-air-diamond-plaque',
      title: 'Clean Air Diamond Plaque',
      marathiTitle: 'शुद्ध हवा हिरा सन्मान',
      description: 'Prevent over 10 kg of toxic tailpipe CO2 emissions through sustainable electric metro travel.',
      criteriaLabel: '10 kg CO₂ Prevented',
      rarity: 'obsidian',
      iconName: 'wind',
      isUnlocked: co2SavedKg >= 10,
      unlockedAtFormatted: co2UnlockDate,
      currentValue: Math.min(10, Math.round(co2SavedKg * 10) / 10),
      targetValue: 10,
      progressPercent: Math.min(100, Math.round((co2SavedKg / 10) * 100)),
    },
    {
      id: 'century-club-shield',
      title: '100K Century Club Shield',
      marathiTitle: '१०० किमी शतक ढाल',
      description: 'Accumulate 100+ total cumulative kilometers ridden across the entire Pune Metro network.',
      criteriaLabel: '100 km Cumulative Commute',
      rarity: 'obsidian',
      iconName: 'award',
      isUnlocked: totalKm >= 100,
      unlockedAtFormatted: totalKmUnlockDate,
      currentValue: Math.min(100, Math.round(totalKm * 10) / 10),
      targetValue: 100,
      progressPercent: Math.min(100, Math.round((totalKm / 100) * 100)),
    },
    {
      id: 'punekar-commute-flame',
      title: 'Punekar Commute Flame',
      marathiTitle: 'पुणेकर अखंड ज्योत',
      description: 'Maintain an unbroken transit habit of 5 or more consecutive commute days.',
      criteriaLabel: '5-Day Habit Streak',
      rarity: 'gold',
      iconName: 'zap',
      isUnlocked: isFlameUnlocked,
      unlockedAtFormatted: flameUnlockDate,
      currentValue: Math.min(5, streak),
      targetValue: 5,
      progressPercent: Math.min(100, Math.round((streak / 5) * 100)),
    },
  ];

  const unlockedCount = trophies.filter((t) => t.isUnlocked).length;
  const totalTrophies = trophies.length;
  const completionPercent = Math.round((unlockedCount / totalTrophies) * 100);

  const cabinetScore = trophies
    .filter((t) => t.isUnlocked)
    .reduce((sum, t) => sum + RARITY_POINTS[t.rarity], 0);

  // Cabinet rank titles
  let cabinetRankTitle = 'Aspiring Punekar';
  let cabinetRankMarathi = 'प्रारंभिक पुणेकर';

  if (unlockedCount >= 7) {
    cabinetRankTitle = 'Pune Transit Legend';
    cabinetRankMarathi = 'पुणे गौरव नायक';
  } else if (unlockedCount >= 5) {
    cabinetRankTitle = 'City Champion';
    cabinetRankMarathi = 'शहर विजेता';
  } else if (unlockedCount >= 3) {
    cabinetRankTitle = 'Metro Knight';
    cabinetRankMarathi = 'मेट्रो शिलेदार';
  } else if (unlockedCount >= 1) {
    cabinetRankTitle = 'Pace Explorer';
    cabinetRankMarathi = 'मार्ग शोधक';
  }

  // Next target trophy
  const nextTarget = trophies.find((t) => !t.isUnlocked);

  const unlockedList = trophies
    .filter((t) => t.isUnlocked)
    .map((t) => `• 🏆 ${t.title} (${t.marathiTitle}) — ${t.unlockedAtFormatted ?? 'Unlocked'}`)
    .join('\n');

  const shareableShowcaseText = [
    '🏛️ Pune Metro Strava — Commuter Trophy Cabinet',
    `🎖️ Cabinet Rank: ${cabinetRankTitle} (${cabinetRankMarathi})`,
    `✨ Trophies: ${unlockedCount} / ${totalTrophies} Unlocked (${completionPercent}%)`,
    `🌟 Cabinet Score: ${cabinetScore} / 825 pts`,
    '',
    unlockedCount > 0 ? `Earned Medallions:\n${unlockedList}` : 'No medallions unlocked yet.',
    nextTarget
      ? `\nNext In Sight: ${nextTarget.title} (${nextTarget.progressPercent}% achieved)`
      : '\nAll commemorative trophies unlocked! True Pune transit master.',
  ].join('\n');

  const accessibilityDescription = `Commuter Trophy Cabinet: ${cabinetRankTitle} rank. ${unlockedCount} of ${totalTrophies} commemorative trophies unlocked (${completionPercent}%). Total cabinet score: ${cabinetScore} points. ${
    unlockedCount === 0
      ? 'No trophies unlocked yet. Log metro rides to earn historic and corridor medallions.'
      : `Latest unlocked trophy is ${trophies.filter((t) => t.isUnlocked)[unlockedCount - 1].title}.`
  }`;

  return {
    trophies,
    unlockedCount,
    totalTrophies,
    completionPercent,
    cabinetScore,
    cabinetRankTitle,
    cabinetRankMarathi,
    shareableShowcaseText,
    accessibilityDescription,
  };
}
