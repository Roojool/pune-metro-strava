import type { Journey, LineId } from '../../domain/models';
import { STATIONS, getStationName } from '../../data/pune';
import type { StationBurnProfile, StationDensitySummary, StationElevationType } from './types';

interface StationPhysicalMetadata {
  elevationType: StationElevationType;
  stairFlights: number;
  kcalPerVisit: number;
}

const STATION_PHYSICAL_METADATA: Record<string, StationPhysicalMetadata> = {
  'civil-court': {
    elevationType: 'underground_interchange',
    stairFlights: 10, // ~33.1m depth, deepest underground metro station in India
    kcalPerVisit: 35,
  },
  'swargate': {
    elevationType: 'underground_interchange',
    stairFlights: 6,
    kcalPerVisit: 28,
  },
  'pcmc': {
    elevationType: 'elevated_terminal',
    stairFlights: 4,
    kcalPerVisit: 24,
  },
  'vanaz': {
    elevationType: 'elevated_terminal',
    stairFlights: 4,
    kcalPerVisit: 24,
  },
  'pune-railway-station': {
    elevationType: 'elevated_terminal',
    stairFlights: 4,
    kcalPerVisit: 25,
  },
  'ramwadi': {
    elevationType: 'elevated_terminal',
    stairFlights: 4,
    kcalPerVisit: 24,
  },
};

const DEFAULT_ELEVATED_METADATA: StationPhysicalMetadata = {
  elevationType: 'elevated_standard',
  stairFlights: 3,
  kcalPerVisit: 20,
};

/**
 * Returns physical stair and calorie exertion metadata for any Pune Metro station.
 */
export function getStationPhysicalProfile(stationId: string): StationPhysicalMetadata {
  return STATION_PHYSICAL_METADATA[stationId] ?? DEFAULT_ELEVATED_METADATA;
}

/**
 * Calculates transit station active burn density and identifies top exertion hubs.
 */
export function calculateStationDensity(
  journeys: Journey[],
  filterLine?: LineId
): StationDensitySummary {
  // Count visits to stations across all journeys (boarding + destination)
  const visitsMap: Record<string, number> = {};
  for (const j of journeys) {
    visitsMap[j.from] = (visitsMap[j.from] || 0) + 1;
    visitsMap[j.to] = (visitsMap[j.to] || 0) + 1;
  }

  // Filter stations based on line selection if provided
  const candidateStations = STATIONS.filter(s => {
    if (!filterLine) return true;
    return s.line === filterLine || s.line === 'interchange';
  });

  const profiles: StationBurnProfile[] = candidateStations.map(station => {
    const meta = getStationPhysicalProfile(station.id);
    const visits = visitsMap[station.id] || 0;
    const totalBurnKcal = visits * meta.kcalPerVisit;
    const estimatedStairsClimbed = visits * meta.stairFlights;

    return {
      stationId: station.id,
      stationName: station.name,
      line: station.line,
      elevationType: meta.elevationType,
      stairFlightsPerVisit: meta.stairFlights,
      activeBurnKcalPerVisit: meta.kcalPerVisit,
      totalVisits: visits,
      totalBurnKcal,
      estimatedStairsClimbed,
    };
  });

  // Visited stations with active burn > 0
  const visitedProfiles = profiles
    .filter(p => p.totalVisits > 0)
    .sort((a, b) => b.totalBurnKcal - a.totalBurnKcal || b.totalVisits - a.totalVisits || a.stationName.localeCompare(b.stationName));

  // Compute total across ALL visited stations before ranking truncation
  const totalStationBurnKcal = visitedProfiles.reduce((sum, s) => sum + s.totalBurnKcal, 0);
  const topStations = visitedProfiles.slice(0, 5);

  // Recommended high-burn stations (e.g. Civil Court) that haven't been visited yet or have low visits
  const recommendedHighBurnStations = profiles
    .filter(p => p.elevationType === 'underground_interchange' || p.elevationType === 'elevated_terminal')
    .sort((a, b) => b.activeBurnKcalPerVisit - a.activeBurnKcalPerVisit || a.totalVisits - b.totalVisits)
    .slice(0, 3);
  const deepestStationName = 'Civil Court (District Court)';

  const accessibilityDescription = topStations.length > 0
    ? `Station Exertion Heatmap: Top active transit hub is ${topStations[0].stationName} with ${topStations[0].totalBurnKcal} kcal burned across ${topStations[0].totalVisits} visits. Total station stairs exertion: ${totalStationBurnKcal} kcal.`
    : 'Station Exertion Heatmap: No station visits recorded yet. Log rides to track which elevated and underground Pune Metro stations burn the most active energy.';

  return {
    topStations,
    recommendedHighBurnStations,
    totalStationBurnKcal,
    deepestStationName,
    accessibilityDescription,
  };
}
