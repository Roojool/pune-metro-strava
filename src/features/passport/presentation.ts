import type { TravelStatistics } from '@/domain/models';

export function passportShareSummary(stats: TravelStatistics, stationTotal: number): string {
  return `My MetroQuest Pune passport\n${stats.totalJourneys} self-reported metro journeys\n${stats.visitedIds.length}/${stationTotal} boarding & exit stations collected\n${stats.totalKm.toFixed(1)} km estimated · ${stats.points} XP\nLocal demo · estimates are illustrative · travel is not independently verified.\nMake every ride count.`;
}
