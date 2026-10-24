import type { Journey } from '../../domain/models';
import { isLineTransferJourney } from './scoring';
import type { VerticalAscentSummary } from './types';

interface StationVerticalProfile {
  meters: number;
  flights: number;
  steps: number;
  name: string;
}

const STATION_VERTICAL_MAP: Record<string, StationVerticalProfile> = {
  'civil-court': {
    meters: 33, // India's deepest metro station ~33.1m
    flights: 10,
    steps: 340,
    name: 'Civil Court (District Court)',
  },
  swargate: {
    meters: 22,
    flights: 6,
    steps: 236,
    name: 'Swargate Underground',
  },
  pcmc: {
    meters: 15,
    flights: 4,
    steps: 164,
    name: 'PCMC Elevated Terminal',
  },
  vanaz: {
    meters: 15,
    flights: 4,
    steps: 164,
    name: 'Vanaz Elevated Terminal',
  },
  ramwadi: {
    meters: 15,
    flights: 4,
    steps: 164,
    name: 'Ramwadi Elevated Terminal',
  },
  'pune-railway-station': {
    meters: 16,
    flights: 4,
    steps: 175,
    name: 'Pune Railway Station',
  },
};

const DEFAULT_ELEVATED_VERTICAL: StationVerticalProfile = {
  meters: 12,
  flights: 3,
  steps: 128,
  name: 'Standard Elevated Station',
};

const PUNE_LANDMARKS = [
  { name: 'Shaniwar Wada Bastion', meters: 12 },
  { name: 'Aga Khan Palace Terrace', meters: 25 },
  { name: 'Hinjawadi Tech Tower', meters: 45 },
  { name: 'Vetal Tekdi Hill Summit', meters: 110 },
  { name: 'Sinhagad Fort Darwaza', meters: 320 },
];

/**
 * Returns station vertical profile for a given station id.
 */
export function getStationVertical(stationId: string): StationVerticalProfile {
  return STATION_VERTICAL_MAP[stationId] ?? DEFAULT_ELEVATED_VERTICAL;
}

/**
 * Calculates cumulative vertical ascent, stair flights, and Pune landmark equivalents.
 */
export function calculateVerticalAscent(journeys: Journey[]): VerticalAscentSummary {
  if (journeys.length === 0) {
    return {
      totalVerticalMeters: 0,
      totalStairFlights: 0,
      totalStationSteps: 0,
      deepestStationTraversed: 'None yet',
      maxSingleRideMeters: 0,
      landmarkEquivalentName: 'Shaniwar Wada Bastion (12m)',
      landmarkEquivalentMeters: 12,
      landmarkRatio: 0,
      climberRankTitle: 'Platform Walker',
      climberRankSubtitle: 'Log your first ride to begin climbing Pune Metro’s vertical concourses!',
      accessibilityDescription: 'Vertical ascent: 0 meters climbed, 0 stair flights. Platform Walker rank.',
    };
  }

  let totalVerticalMeters = 0;
  let totalStairFlights = 0;
  let totalStationSteps = 0;
  let maxSingleRideMeters = 0;
  let hasCivilCourt = false;
  let hasSwargate = false;

  for (const j of journeys) {
    const originProfile = getStationVertical(j.from);
    const destProfile = getStationVertical(j.to);

    let rideMeters = originProfile.meters + destProfile.meters;
    let rideFlights = originProfile.flights + destProfile.flights;
    let rideSteps = originProfile.steps + destProfile.steps;

    const stationList = j.stationIds ?? [j.from, j.to];
    if (stationList.includes('civil-court')) hasCivilCourt = true;
    if (stationList.includes('swargate')) hasSwargate = true;

    // Concourse transfer at Civil Court adds platform climbing exertion
    if (isLineTransferJourney(stationList)) {
      rideMeters += 18;
      rideFlights += 5;
      rideSteps += 220;
    }

    if (rideMeters > maxSingleRideMeters) {
      maxSingleRideMeters = rideMeters;
    }

    totalVerticalMeters += rideMeters;
    totalStairFlights += rideFlights;
    totalStationSteps += rideSteps;
  }

  const deepestStationTraversed = hasCivilCourt
    ? 'Civil Court (District Court, 33.1m depth)'
    : hasSwargate
    ? 'Swargate Underground (22m depth)'
    : 'Elevated Stations (~12-15m)';

  // Determine current or upcoming landmark equivalent
  let landmark = PUNE_LANDMARKS[0];
  for (const lm of PUNE_LANDMARKS) {
    landmark = lm;
    if (totalVerticalMeters < lm.meters) {
      break;
    }
  }

  const landmarkRatio = Math.min(1, Math.round((totalVerticalMeters / landmark.meters) * 100) / 100);

  let climberRankTitle: string;
  let climberRankSubtitle: string;

  if (totalVerticalMeters < 30) {
    climberRankTitle = 'Concourse Stepper';
    climberRankSubtitle = 'Warm-up climber conquering everyday station stairs.';
  } else if (totalVerticalMeters < 100) {
    climberRankTitle = 'Tekdi Ascent Climber';
    climberRankSubtitle = 'Solid stamina conquering heights equivalent to Pune’s iconic Tekdis.';
  } else if (totalVerticalMeters < 300) {
    climberRankTitle = 'Western Ghat Voyager';
    climberRankSubtitle = 'High-altitude commuter conquering multi-tier interchange depth.';
  } else {
    climberRankTitle = 'Sinhagad Fort Pioneer';
    climberRankSubtitle = 'Legendary stair conqueror matching the mighty climb of Sinhagad Fort!';
  }

  const accessibilityDescription = `Vertical concourse ascent: ${totalVerticalMeters} meters gained, ${totalStairFlights} stair flights, ~${totalStationSteps} steps taken. Rank: ${climberRankTitle}. Goal: ${landmark.name} (${landmark.meters}m, ${Math.round(landmarkRatio * 100)}%).`;

  return {
    totalVerticalMeters,
    totalStairFlights,
    totalStationSteps,
    deepestStationTraversed,
    maxSingleRideMeters,
    landmarkEquivalentName: `${landmark.name} (${landmark.meters}m)`,
    landmarkEquivalentMeters: landmark.meters,
    landmarkRatio,
    climberRankTitle,
    climberRankSubtitle,
    accessibilityDescription,
  };
}
