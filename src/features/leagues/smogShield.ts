import type { Journey } from '../../domain/models';
import { getStationName } from '../../data/pune';
import type { SmogShieldSummary, SmogShieldTier } from './types';

function getOriginStation(j: Journey): string {
  return (j as any).fromStationId || j.from || '';
}

function getDestinationStation(j: Journey): string {
  return (j as any).toStationId || j.to || '';
}

function getJourneyDurationMinutes(j: Journey): number {
  if (typeof j.minutes === 'number' && j.minutes > 0) return j.minutes;
  const km = typeof j.kilometers === 'number' ? j.kilometers : (j as any).distanceKm || 6;
  return Math.round(km * 1.8);
}

/**
 * Calculates lung health benefits, PM2.5 smog avoidance, and filtered air volume.
 */
export function calculateSmogShield(journeys: Journey[]): SmogShieldSummary {
  if (!journeys || journeys.length === 0) {
    return {
      pm25AvoidedMicrograms: 0,
      smogMinutesAvoided: 0,
      filteredAirLiters: 0,
      hillStationFreshAirDays: 0,
      smogShieldTier: 'bronze',
      smogShieldTitle: 'Clean Air Novice',
      smogShieldMarathi: 'स्वच्छ हवा नवशिक्या',
      highestProtectionCorridor: 'None logged yet',
      healthBenefitText:
        'Log your Pune Metro rides to track how much roadside PM2.5 smog and vehicle exhaust your lungs avoid.',
      shareableShieldText:
        '🛡️ Pune Metro Strava — Smog Shield & Clean Air Protection\nNo rides logged yet. Ride electric metro lines to shield your lungs from roadside vehicle emissions!',
      accessibilityDescription:
        'Smog Shield: No rides logged yet. Travel inside filtered air-conditioned metro coaches to avoid roadside toxic exhaust.',
    };
  }

  let totalMinutes = 0;
  const corridorVisits: Record<string, number> = {};

  for (const j of journeys) {
    const mins = getJourneyDurationMinutes(j);
    totalMinutes += mins;

    const from = getOriginStation(j);
    const to = getDestinationStation(j);
    if (from && to) {
      const key = `${getStationName(from)} ↔ ${getStationName(to)}`;
      corridorVisits[key] = (corridorVisits[key] || 0) + 1;
    }
  }

  // 1. Smog minutes avoided (minutes inside sealed, filtered metro environment instead of street traffic)
  const smogMinutesAvoided = totalMinutes;

  // 2. Filtered air inhaled: adult breaths ~8 liters/min at light activity
  const filteredAirLiters = totalMinutes * 8;

  // 3. PM2.5 particulate matter avoided (~0.45 micrograms per minute vs roadside Pune congestion)
  const pm25AvoidedMicrograms = Math.round(totalMinutes * 0.45 * 10) / 10;

  // 4. Hill station clean air equivalent days (~250 micrograms PM2.5 avoided = 1 day of Mahabaleshwar/Lonavala fresh air)
  const hillStationFreshAirDays = Math.round((pm25AvoidedMicrograms / 250) * 10) / 10;

  // 5. Tier assignment
  let smogShieldTier: SmogShieldTier = 'bronze';
  let smogShieldTitle = 'Clean Air Novice';
  let smogShieldMarathi = 'स्वच्छ हवा नवशिक्या';

  if (pm25AvoidedMicrograms >= 500) {
    smogShieldTier = 'platinum';
    smogShieldTitle = 'Western Ghats Air Master';
    smogShieldMarathi = 'सह्याद्री शुद्ध हवा नायक';
  } else if (pm25AvoidedMicrograms >= 200) {
    smogShieldTier = 'gold';
    smogShieldTitle = 'Pure Breath Sentinel';
    smogShieldMarathi = 'शुद्ध श्वास शिलेदार';
  } else if (pm25AvoidedMicrograms >= 50) {
    smogShieldTier = 'silver';
    smogShieldTitle = 'Urban Lung Protector';
    smogShieldMarathi = 'फुफ्फुस रक्षक';
  }

  // 6. Top corridor
  let highestProtectionCorridor = 'None logged yet';
  let maxCount = 0;
  for (const [corridor, count] of Object.entries(corridorVisits)) {
    if (count > maxCount) {
      maxCount = count;
      highestProtectionCorridor = corridor;
    }
  }

  const healthBenefitText =
    hillStationFreshAirDays >= 1
      ? `Bypassing road congestion has shielded your lungs from toxic exhaust equivalent to ${hillStationFreshAirDays} days of breathing pure Western Ghats hill station air in Mahabaleshwar.`
      : `Filtered metro transit has kept ${pm25AvoidedMicrograms} µg of toxic fine dust and diesel soot out of your bronchial system.`;

  const shareableShieldText = [
    '🛡️ Pune Metro Strava — Smog Shield & Clean Air Protection',
    `🎖️ Status: ${smogShieldTitle} (${smogShieldMarathi})`,
    `🫁 PM2.5 Inhalation Avoided: ${pm25AvoidedMicrograms} µg`,
    `⏱️ Roadside Smog Avoided: ${smogMinutesAvoided} minutes in filtered transit`,
    `🌬️ Clean Air Inhaled: ~${filteredAirLiters.toLocaleString()} liters`,
    `🏔️ Hill Station Equivalent: ~${hillStationFreshAirDays} days of Western Ghats pure air`,
    `📍 Top Protected Route: ${highestProtectionCorridor}`,
  ].join('\n');

  const accessibilityDescription = `Smog Shield: Status ${smogShieldTitle}. Avoided ${pm25AvoidedMicrograms} micrograms of PM2.5 particulates over ${smogMinutesAvoided} minutes in filtered metro air. Inhaled ${filteredAirLiters} liters of clean cabin air. Equivalent to ${hillStationFreshAirDays} days of fresh hill station air.`;

  return {
    pm25AvoidedMicrograms,
    smogMinutesAvoided,
    filteredAirLiters,
    hillStationFreshAirDays,
    smogShieldTier,
    smogShieldTitle,
    smogShieldMarathi,
    highestProtectionCorridor,
    healthBenefitText,
    shareableShieldText,
    accessibilityDescription,
  };
}
