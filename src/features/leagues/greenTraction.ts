import type { Journey } from '../../domain/models';
import type { GreenTractionSummary, GreenTractionTier, SolarStationArray } from './types';

export const PUNE_SOLAR_STATIONS: SolarStationArray[] = [
  {
    stationId: 'sant-tukaram-nagar',
    name: 'Sant Tukaram Nagar Solar Array',
    marathiName: 'संत तुकाराम नगर सौर प्रकल्प',
    solarCapacityKwp: 180,
    annualSolarYieldMwh: 260,
    isVisited: false,
  },
  {
    stationId: 'bhosari',
    name: 'Bhosari Concourse PV Canopy',
    marathiName: 'भोसरी छत सौर ऊर्जा केंद्र',
    solarCapacityKwp: 160,
    annualSolarYieldMwh: 230,
    isVisited: false,
  },
  {
    stationId: 'anand-nagar',
    name: 'Anand Nagar Rooftop Solar Farm',
    marathiName: 'आनंद नगर रूफटॉप सोलर फार्म',
    solarCapacityKwp: 140,
    annualSolarYieldMwh: 200,
    isVisited: false,
  },
  {
    stationId: 'garware-college',
    name: 'Garware College Clean Power Deck',
    marathiName: 'गरवारे कॉलेज हरित ऊर्जा संकुल',
    solarCapacityKwp: 150,
    annualSolarYieldMwh: 215,
    isVisited: false,
  },
  {
    stationId: 'vanaz',
    name: 'Vanaz Depot Solar Generation Hub',
    marathiName: 'वनाज आगार सौर निर्मिती केंद्र',
    solarCapacityKwp: 250,
    annualSolarYieldMwh: 360,
    isVisited: false,
  },
];

function getJourneyKm(j: Journey): number {
  if (typeof j.kilometers === 'number' && j.kilometers > 0) return j.kilometers;
  if (typeof (j as any).distanceKm === 'number' && (j as any).distanceKm > 0) return (j as any).distanceKm;
  return 6.0;
}

function getOriginStation(j: Journey): string {
  return (j as any).fromStationId || j.from || '';
}

function getDestinationStation(j: Journey): string {
  return (j as any).toStationId || j.to || '';
}

function getStationSet(j: Journey): Set<string> {
  const set = new Set<string>();
  const from = getOriginStation(j);
  const to = getDestinationStation(j);
  if (from) set.add(from.toLowerCase().trim());
  if (to) set.add(to.toLowerCase().trim());
  if (Array.isArray(j.stationIds)) {
    for (const s of j.stationIds) {
      if (s) set.add(s.toLowerCase().trim());
    }
  }
  return set;
}

/**
 * Calculates solar microgrid power, regenerative braking recapture, and clean traction electricity.
 */
export function calculateGreenTraction(journeys: Journey[]): GreenTractionSummary {
  const solarStations: SolarStationArray[] = PUNE_SOLAR_STATIONS.map((s) => ({
    ...s,
    isVisited: false,
  }));

  if (!journeys || journeys.length === 0) {
    return {
      cleanTractionKwh: 0,
      solarSolarKwh: 0,
      regenerativeBrakingKwh: 0,
      solarBulbHours: 0,
      gridIndependenceScore: 0,
      solarTractionTier: 'solar_sprout',
      tierTitle: 'Solar Sprout',
      tierTitleMarathi: 'सौर अंकुर',
      solarStationsVisitedCount: 0,
      totalSolarStations: solarStations.length,
      solarStations,
      nextTierKwh: 2.0,
      progressPercent: 0,
      solarTractionTip:
        'Log your Pune Metro rides to track how much clean solar electricity and regenerative braking power fuels your commute.',
      shareableSolarText:
        '☀️ Pune Metro Strava — Solar Traction Power\nNo rides logged yet. Ride electric Pune Metro lines powered by Maharashtra rooftop solar microgrids!',
      accessibilityDescription:
        'Solar Traction Power: No rides logged yet. Zero kWh clean energy recorded. Next milestone: Solar Sprout at 2.0 kWh.',
    };
  }

  let totalKm = 0;
  const visitedSolarStationIds = new Set<string>();

  for (const j of journeys) {
    totalKm += getJourneyKm(j);
    const stationSet = getStationSet(j);

    for (const station of solarStations) {
      if (stationSet.has(station.stationId)) {
        station.isVisited = true;
        visitedSolarStationIds.add(station.stationId);
      }
    }
  }

  // Pune Metro 3-car EMU consumes ~0.08 kWh of electrical traction energy per passenger-km
  const cleanTractionKwh = Math.round(totalKm * 0.08 * 100) / 100;
  // ~65% of Pune Metro electricity is sourced from solar rooftop arrays and green energy grid
  const solarSolarKwh = Math.round(cleanTractionKwh * 0.65 * 100) / 100;
  // ~18% kinetic deceleration energy fed back into catenary via regenerative braking
  const regenerativeBrakingKwh = Math.round(cleanTractionKwh * 0.18 * 100) / 100;
  // 1 kWh powers a 10W high-efficiency LED bulb for 100 hours
  const solarBulbHours = Math.round(solarSolarKwh * 100);

  const solarStationsVisitedCount = visitedSolarStationIds.size;

  // Grid independence score (0 to 100)
  const gridIndependenceScore = Math.min(
    100,
    Math.round(solarStationsVisitedCount * 12 + solarSolarKwh * 10 + journeys.length * 2)
  );

  let solarTractionTier: GreenTractionTier = 'solar_sprout';
  let tierTitle = 'Solar Sprout';
  let tierTitleMarathi = 'सौर अंकुर';
  let nextTierKwh = 2.0;
  let prevTierBaseKwh = 0;

  if (solarSolarKwh >= 15.0) {
    solarTractionTier = 'traction_maestro';
    tierTitle = 'Renewable Traction Maestro';
    tierTitleMarathi = 'अक्षय ऊर्जा सम्राट';
    nextTierKwh = 30.0;
    prevTierBaseKwh = 15.0;
  } else if (solarSolarKwh >= 6.0) {
    solarTractionTier = 'grid_guardian';
    tierTitle = 'Green Grid Guardian';
    tierTitleMarathi = 'हरित ग्रिड रक्षक';
    nextTierKwh = 15.0;
    prevTierBaseKwh = 6.0;
  } else if (solarSolarKwh >= 2.0) {
    solarTractionTier = 'pv_pioneer';
    tierTitle = 'Photovoltaic Pioneer';
    tierTitleMarathi = 'सौर ऊर्जा प्रणेता';
    nextTierKwh = 6.0;
    prevTierBaseKwh = 2.0;
  }

  const range = nextTierKwh - prevTierBaseKwh;
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round(((solarSolarKwh - prevTierBaseKwh) / range) * 100))
  );

  let solarTractionTip = '';
  if (solarTractionTier === 'traction_maestro') {
    solarTractionTip = `Supercharged green transit! Your ${solarSolarKwh} kWh of solar power could light a standard LED bulb for ${solarBulbHours.toLocaleString()} hours!`;
  } else if (solarTractionTier === 'grid_guardian') {
    solarTractionTip = `Excellent solar footprint! Regenerative braking captured ${regenerativeBrakingKwh} kWh back into Pune Metro's catenary power grid.`;
  } else if (solarTractionTier === 'pv_pioneer') {
    solarTractionTip = `Great clean power rhythm! You have connected with ${solarStationsVisitedCount} rooftop solar generating stations.`;
  } else {
    solarTractionTip = `Pune Metro harnesses clean sunlight across elevated station canopies. ${(nextTierKwh - solarSolarKwh).toFixed(2)} kWh to next tier.`;
  }

  const shareableSolarText = `☀️ Pune Metro Strava — Solar Traction Power\n` +
    `Tier: ${tierTitle} (${tierTitleMarathi})\n` +
    `• Clean Traction: ${cleanTractionKwh} kWh\n` +
    `• Solar Photovoltaic Share: ${solarSolarKwh} kWh (65% green mix)\n` +
    `• Regenerative Braking Recaptured: ${regenerativeBrakingKwh} kWh\n` +
    `• Solar LED Lighting: ${solarBulbHours.toLocaleString()} hours equivalent\n` +
    `Solar Stations Visited: ${solarStationsVisitedCount} of ${solarStations.length}\n` +
    `#PuneMetro #SolarPower #GreenTraction #Punekar`;

  const accessibilityDescription =
    `Solar Traction Power: ${tierTitle} (${tierTitleMarathi}). ` +
    `${cleanTractionKwh} kWh clean traction energy utilized across ${journeys.length} rides. ` +
    `${solarSolarKwh} kWh solar PV energy generated. ${regenerativeBrakingKwh} kWh kinetic braking recaptured. ` +
    `${solarStationsVisitedCount} solar stations visited. Grid score: ${gridIndependenceScore} of 100.`;

  return {
    cleanTractionKwh,
    solarSolarKwh,
    regenerativeBrakingKwh,
    solarBulbHours,
    gridIndependenceScore,
    solarTractionTier,
    tierTitle,
    tierTitleMarathi,
    solarStationsVisitedCount,
    totalSolarStations: solarStations.length,
    solarStations,
    nextTierKwh,
    progressPercent,
    solarTractionTip,
    shareableSolarText,
    accessibilityDescription,
  };
}
