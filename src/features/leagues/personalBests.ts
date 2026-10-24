import type { Journey } from '../../domain/models';
import { getStationName } from '../../data/pune';
import { calculateJourneyCalories } from './scoring';
import type { PersonalBestRecord, PersonalBestsSummary } from './types';

/**
 * Groups journeys by IST calendar day string (YYYY-MM-DD).
 */
function getIstDay(isoString: string): string {
  try {
    const d = new Date(isoString);
    const istTime = new Date(d.getTime() + 5.5 * 60 * 60 * 1000);
    return istTime.toISOString().slice(0, 10);
  } catch {
    return 'unknown';
  }
}

/**
 * Calculates all-time personal best transit records from commuter journey history.
 */
export function calculatePersonalBests(journeys: Journey[]): PersonalBestsSummary {
  if (journeys.length === 0) {
    return {
      records: [
        {
          id: 'max-daily-burn',
          title: 'Daily Burn Record',
          value: 0,
          unit: 'kcal',
          subtitle: 'No rides logged yet',
          achievedOn: 'Today',
        },
        {
          id: 'longest-ride',
          title: 'Longest Single Ride',
          value: 0,
          unit: 'km',
          subtitle: 'Start your first journey',
          achievedOn: 'Today',
        },
        {
          id: 'max-stations',
          title: 'Max Stations Traversed',
          value: 0,
          unit: 'stations',
          subtitle: 'Boarding to destination',
          achievedOn: 'Today',
        },
      ],
      favoriteCorridor: 'None yet',
      totalLifetimeBurnKcal: 0,
      uniqueStationsVisited: 0,
      headline: 'Begin Your Pune Metro Personal Records',
      accessibilitySummary: 'Personal bests: No records yet. Log your first metro ride to begin tracking your records.',
    };
  }

  // 1. Max daily calorie burn
  const dailyCaloriesMap: Record<string, number> = {};
  for (const j of journeys) {
    const day = getIstDay(j.at);
    const kcal = calculateJourneyCalories(j);
    dailyCaloriesMap[day] = (dailyCaloriesMap[day] || 0) + kcal;
  }
  let maxDailyCalories = 0;
  let maxDailyDate = '';
  for (const [day, kcal] of Object.entries(dailyCaloriesMap)) {
    if (kcal > maxDailyCalories) {
      maxDailyCalories = kcal;
      maxDailyDate = day;
    }
  }

  // 2. Longest single ride
  let longestKm = 0;
  let longestRideFrom = '';
  let longestRideTo = '';
  for (const j of journeys) {
    if (j.kilometers > longestKm) {
      longestKm = j.kilometers;
      longestRideFrom = j.from;
      longestRideTo = j.to;
    }
  }

  // 3. Max stations traversed in single journey
  let maxStations = 0;
  for (const j of journeys) {
    const count = j.stationIds ? j.stationIds.length : 2;
    if (count > maxStations) {
      maxStations = count;
    }
  }

  // 4. Favorite corridor
  const corridorCountMap: Record<string, number> = {};
  for (const j of journeys) {
    const pair = [j.from, j.to].sort().join(' ↔ ');
    corridorCountMap[pair] = (corridorCountMap[pair] || 0) + 1;
  }
  let topCorridorKey = '';
  let maxCorridorRides = 0;
  for (const [pair, count] of Object.entries(corridorCountMap)) {
    if (count > maxCorridorRides) {
      maxCorridorRides = count;
      topCorridorKey = pair;
    }
  }
  let favoriteCorridor = 'Varied routes';
  if (topCorridorKey) {
    const [fromId, toId] = topCorridorKey.split(' ↔ ');
    favoriteCorridor = `${getStationName(fromId)} ↔ ${getStationName(toId)} (${maxCorridorRides} rides)`;
  }

  // 5. Unique stations visited
  const uniqueStations = new Set<string>();
  for (const j of journeys) {
    uniqueStations.add(j.from);
    uniqueStations.add(j.to);
  }

  // 6. Total lifetime burn
  const totalLifetimeBurnKcal = journeys.reduce((sum, j) => sum + calculateJourneyCalories(j), 0);

  const records: PersonalBestRecord[] = [
    {
      id: 'max-daily-burn',
      title: 'Daily Burn Record',
      value: maxDailyCalories,
      unit: 'kcal',
      subtitle: `Recorded on ${maxDailyDate || 'recent trip'}`,
      achievedOn: maxDailyDate,
    },
    {
      id: 'longest-ride',
      title: 'Longest Single Ride',
      value: longestKm,
      unit: 'km',
      subtitle: longestRideFrom ? `${getStationName(longestRideFrom)} → ${getStationName(longestRideTo)}` : 'Single trip',
      achievedOn: 'All-time best',
    },
    {
      id: 'max-stations',
      title: 'Max Stations Traversed',
      value: maxStations,
      unit: 'stations',
      subtitle: 'Single continuous journey',
      achievedOn: 'All-time best',
    },
  ];

  const headline = `Commuter Records · ${records[0].value} kcal Day Record`;
  const accessibilitySummary = `Personal Bests: Daily burn record is ${maxDailyCalories} kcal, longest single journey is ${longestKm} km, maximum stations in one trip is ${maxStations}. Most frequent route is ${favoriteCorridor}. Total lifetime transit burn is ${totalLifetimeBurnKcal} kcal.`;

  return {
    records,
    favoriteCorridor,
    totalLifetimeBurnKcal,
    uniqueStationsVisited: uniqueStations.size,
    headline,
    accessibilitySummary,
  };
}
