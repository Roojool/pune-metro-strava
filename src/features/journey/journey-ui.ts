import type { Journey, Station } from '@/domain/models';

export function searchStations(stations: Station[], query: string): Station[] {
  const term = query.trim().toLocaleLowerCase('en-IN');
  return stations.filter(station => station.operational && station.name.toLocaleLowerCase('en-IN').includes(term));
}

export function recentCommutes(journeys: Journey[]): Journey[] {
  const seen = new Set<string>();
  return journeys.filter(journey => {
    const key = `${journey.from}:${journey.to}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 3);
}
