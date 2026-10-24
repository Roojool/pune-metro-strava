import type { Journey } from '../../domain/models';
import { calculateJourneyCalories } from './scoring';
import { getJourneyTimestamp } from './leagueBadges';
import type { PeakFlowSummary, TransitWindowId, WindowDistribution } from './types';

/**
 * Extracts hour and minute in India Standard Time (UTC+5:30).
 */
export function getIstHourAndMinute(isoDate: string): { hour: number; minute: number } {
  try {
    const ms = Date.parse(isoDate);
    if (!Number.isFinite(ms)) return { hour: 12, minute: 0 };
    const istOffsetMs = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(ms + istOffsetMs);
    return { hour: istDate.getUTCHours(), minute: istDate.getUTCMinutes() };
  } catch {
    return { hour: 12, minute: 0 };
  }
}

/**
 * Classifies an ISO timestamp into one of the 5 authentic Pune Metro transit windows.
 */
export function classifyTransitWindow(isoDate: string): TransitWindowId {
  const { hour, minute } = getIstHourAndMinute(isoDate);
  const totalMinutes = hour * 60 + minute;

  // Morning Rush: 08:00 (480 min) to 10:29 (629 min)
  if (totalMinutes >= 480 && totalMinutes <= 629) {
    return 'morning_rush';
  }
  // Evening Rush: 17:30 (1050 min) to 20:29 (1229 min)
  if (totalMinutes >= 1050 && totalMinutes <= 1229) {
    return 'evening_rush';
  }
  // Early Bird: before 08:00 (480 min)
  if (totalMinutes < 480) {
    return 'early_bird';
  }
  // Midday Off-Peak: 10:30 (630 min) to 17:29 (1049 min)
  if (totalMinutes >= 630 && totalMinutes < 1050) {
    return 'midday_offpeak';
  }
  // Night Owl: 20:30 (1230 min) onwards
  return 'night_owl';
}

const WINDOW_METADATA: Record<
  TransitWindowId,
  { label: string; hoursLabel: string; isPeak: boolean }
> = {
  early_bird: {
    label: 'Early Bird',
    hoursLabel: '06:00 – 07:59 IST',
    isPeak: false,
  },
  morning_rush: {
    label: 'Morning Rush',
    hoursLabel: '08:00 – 10:29 IST',
    isPeak: true,
  },
  midday_offpeak: {
    label: 'Midday Off-Peak',
    hoursLabel: '10:30 – 17:29 IST',
    isPeak: false,
  },
  evening_rush: {
    label: 'Evening Rush',
    hoursLabel: '17:30 – 20:29 IST',
    isPeak: true,
  },
  night_owl: {
    label: 'Night Owl',
    hoursLabel: '20:30 – 22:30 IST',
    isPeak: false,
  },
};

/**
 * Computes peak versus off-peak transit flow, crowd stamina, and grid balancer rewards.
 */
export function calculatePeakFlow(journeys: Journey[]): PeakFlowSummary {
  if (!journeys || journeys.length === 0) {
    const emptyBreakdown: WindowDistribution[] = (
      [
        'early_bird',
        'morning_rush',
        'midday_offpeak',
        'evening_rush',
        'night_owl',
      ] as TransitWindowId[]
    ).map((id) => ({
      id,
      label: WINDOW_METADATA[id].label,
      hoursLabel: WINDOW_METADATA[id].hoursLabel,
      count: 0,
      percent: 0,
      isPeak: WINDOW_METADATA[id].isPeak,
      caloriesBurned: 0,
    }));

    return {
      totalRides: 0,
      peakRidesCount: 0,
      offPeakRidesCount: 0,
      peakRidesPercent: 0,
      offPeakRidesPercent: 0,
      crowdStaminaKcal: 0,
      gridBalancerPoints: 0,
      dominantPersona: 'Transit Explorer',
      dominantPersonaMarathi: 'मार्ग शोधक',
      windowBreakdown: emptyBreakdown,
      efficiencyTip:
        'Log your daily Pune Metro commutes to discover your travel rhythm and earn grid balancer points.',
      shareableFlowText:
        '⏱️ Pune Metro Strava — Commute Transit Rhythm\nNo rides logged yet. Begin logging rides to analyze your peak versus off-peak commute patterns!',
      accessibilityDescription:
        'Transit Rhythm: No rides logged yet. Travel during peak or off-peak windows to analyze your commute flow.',
    };
  }

  const windowCounts: Record<TransitWindowId, { count: number; calories: number }> = {
    early_bird: { count: 0, calories: 0 },
    morning_rush: { count: 0, calories: 0 },
    midday_offpeak: { count: 0, calories: 0 },
    evening_rush: { count: 0, calories: 0 },
    night_owl: { count: 0, calories: 0 },
  };

  for (const j of journeys) {
    const rawTs = getJourneyTimestamp(j);
    const win = classifyTransitWindow(rawTs);
    windowCounts[win].count += 1;
    windowCounts[win].calories += calculateJourneyCalories(j);
  }

  const totalRides = journeys.length;
  const peakRidesCount =
    windowCounts.morning_rush.count + windowCounts.evening_rush.count;
  const offPeakRidesCount = totalRides - peakRidesCount;

  const peakRidesPercent = Math.round((peakRidesCount / totalRides) * 100);
  const offPeakRidesPercent = 100 - peakRidesPercent;

  // Physical exertion bonus: Standing & core balance in packed rush hour trains (+25 kcal per peak ride)
  const crowdStaminaKcal = peakRidesCount * 25;

  // Grid decongestion bonus: 15 points per off-peak ride
  const gridBalancerPoints = offPeakRidesCount * 15;

  // Window breakdown
  const windowBreakdown: WindowDistribution[] = (
    [
      'early_bird',
      'morning_rush',
      'midday_offpeak',
      'evening_rush',
      'night_owl',
    ] as TransitWindowId[]
  ).map((id) => {
    const count = windowCounts[id].count;
    const caloriesBurned = windowCounts[id].calories;
    const percent = Math.round((count / totalRides) * 100);
    return {
      id,
      label: WINDOW_METADATA[id].label,
      hoursLabel: WINDOW_METADATA[id].hoursLabel,
      count,
      percent,
      isPeak: WINDOW_METADATA[id].isPeak,
      caloriesBurned,
    };
  });

  // Dominant Persona Classification
  let dominantPersona = 'All-Day Urban Nomad';
  let dominantPersonaMarathi = 'पुणे नगर प्रवासी';

  if (peakRidesPercent >= 60) {
    dominantPersona = 'Rush Hour Warrior';
    dominantPersonaMarathi = 'गर्दीतील शिलेदार';
  } else if (windowCounts.early_bird.count / totalRides >= 0.35) {
    dominantPersona = 'Early Bird Pioneer';
    dominantPersonaMarathi = 'प्रभात प्रवासी';
  } else if (windowCounts.midday_offpeak.count / totalRides >= 0.4) {
    dominantPersona = 'Off-Peak Optimizer';
    dominantPersonaMarathi = 'संतुलित प्रवासी';
  } else if (windowCounts.night_owl.count / totalRides >= 0.35) {
    dominantPersona = 'Night Owl Cruiser';
    dominantPersonaMarathi = 'रात्रसंचार प्रवासी';
  }

  // Actionable Efficiency Tip
  let efficiencyTip =
    'Well-balanced transit schedule across peak and off-peak hours on Pune Metro.';
  if (peakRidesPercent >= 60) {
    efficiencyTip =
      'Tip: Shifting even 1 commute by 30 mins before 8:00 AM or after 10:30 AM earns Grid Balancer points and avoids station crush load.';
  } else if (offPeakRidesPercent >= 60) {
    efficiencyTip =
      'Great habit! Off-peak travel maximizes seating comfort and preserves transit grid capacity for essential rush hour commuters.';
  }

  const shareableFlowText = [
    '⏱️ Pune Metro Strava — Commute Transit Rhythm',
    `🎖️ Commuter Persona: ${dominantPersona} (${dominantPersonaMarathi})`,
    `⚡ Peak Rush: ${peakRidesPercent}% (${peakRidesCount} rides) · +${crowdStaminaKcal} kcal core stamina`,
    `🌱 Off-Peak Balancer: ${offPeakRidesPercent}% (${offPeakRidesCount} rides) · +${gridBalancerPoints} Grid Balancer XP`,
    `💡 ${efficiencyTip}`,
  ].join('\n');

  const accessibilityDescription = `Transit Rhythm: Persona ${dominantPersona}. ${peakRidesCount} peak rush rides (${peakRidesPercent}%) and ${offPeakRidesCount} off-peak rides (${offPeakRidesPercent}%). Earned ${crowdStaminaKcal} kcal crowd stamina and ${gridBalancerPoints} grid balancer points. ${efficiencyTip}`;

  return {
    totalRides,
    peakRidesCount,
    offPeakRidesCount,
    peakRidesPercent,
    offPeakRidesPercent,
    crowdStaminaKcal,
    gridBalancerPoints,
    dominantPersona,
    dominantPersonaMarathi,
    windowBreakdown,
    efficiencyTip,
    shareableFlowText,
    accessibilityDescription,
  };
}
