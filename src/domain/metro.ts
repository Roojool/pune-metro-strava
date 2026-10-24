import { LINES, OPEN_STATIONS, STATIONS } from '../data/pune';
import type { Achievement, Challenge, Journey, JourneyCandidate, LeaderboardEntry, TravelStatistics } from './models';

// shortcut: proportional corridor segments, replace with surveyed lengths before navigation use.
const lineKm = { purple: 17.4, aqua: 15.7 };
export const ESTIMATES = { roadRupeesPerKm: 8, metroBudgetPerKm: 2.5, roadKgPerKm: 0.12, metroKgPerKm: 0.04 };
export const findStation = (id: string) => STATIONS.find(s => s.id === id);
export function routeBetween(from: string, to: string): { stationIds: string[]; kilometers: number; minutes: number } {
  if (from === to || !findStation(from)?.operational || !findStation(to)?.operational) throw new Error('Choose two different open stations.');
  const queue = [{ id: from, stationIds: [from], kilometers: 0 }];
  const seen = new Set([from]);
  while (queue.length) {
    const current = queue.shift()!;
    if (current.id === to) return { stationIds: current.stationIds, kilometers: Math.round(current.kilometers * 10) / 10, minutes: Math.max(2, Math.round(current.kilometers * 2.1)) };
    for (const line of LINES) {
      const index = line.stationIds.indexOf(current.id);
      if (index < 0) continue;
      for (const next of [line.stationIds[index - 1], line.stationIds[index + 1]]) {
        if (!next || seen.has(next)) continue;
        seen.add(next);
        queue.push({ id: next, stationIds: [...current.stationIds, next], kilometers: current.kilometers + lineKm[line.id] / (line.stationIds.length - 1) });
      }
    }
  }
  throw new Error('No supported metro route found.');
}
export const savingsEstimate = (km: number) => Math.round(km * (ESTIMATES.roadRupeesPerKm - ESTIMATES.metroBudgetPerKm));
export const environmentalEstimate = (km: number) => Math.round(km * (ESTIMATES.roadKgPerKm - ESTIMATES.metroKgPerKm) * 100) / 100;
export function calculateXp(candidate: JourneyCandidate, journeys: Journey[]): number {
  const visited = new Set(journeys.flatMap(j => [j.from, j.to]));
  return 10 + [candidate.from, candidate.to].filter(id => !visited.has(id)).length * 20;
}
export function createJourney(candidate: JourneyCandidate, journeys: Journey[], now = new Date()): Journey {
  const route = routeBetween(candidate.from, candidate.to);
  if (!Number.isFinite(now.getTime())) throw new Error('Invalid journey date.');
  if (journeys.some(j => Math.abs(now.getTime() - Date.parse(j.at)) < 60_000)) throw new Error('Ride already recorded. Wait one minute before logging another ride.');
  const day = now.toISOString().slice(0, 10);
  if (journeys.filter(j => j.at.slice(0, 10) === day).length >= 10) throw new Error('Daily demo limit reached (10 rides).');
  return { ...candidate, ...route, id: `${now.getTime()}-${Math.random().toString(36).slice(2, 10)}`, at: now.toISOString(), source: 'manual', fare: null, saved: savingsEstimate(route.kilometers), co2Kg: environmentalEstimate(route.kilometers), points: calculateXp(candidate, journeys) };
}
const indiaDay = (date: Date) => new Date(date.getTime() + 330 * 60_000).toISOString().slice(0, 10);
export function journeyStatistics(journeys: Journey[], now = new Date()): TravelStatistics {
  const today = indiaDay(now);
  const days = new Set(journeys.map(j => indiaDay(new Date(j.at))));
  let streak = 0;
  let cursor = new Date(now);
  if (!days.has(today)) cursor = new Date(cursor.getTime() - 86_400_000);
  while (days.has(indiaDay(cursor))) { streak++; cursor = new Date(cursor.getTime() - 86_400_000); }
  const sum = (key: 'kilometers' | 'saved' | 'co2Kg' | 'points') => journeys.reduce((n, j) => n + j[key], 0);
  return { totalJourneys: journeys.length, totalKm: sum('kilometers'), totalSavings: sum('saved'), totalCo2: sum('co2Kg'), points: sum('points'), visitedIds: [...new Set(journeys.flatMap(j => [j.from,j.to]))], monthlyJourneys: journeys.filter(j => indiaDay(new Date(j.at)).slice(0,7) === today.slice(0,7)).length, weeklyJourneys: journeys.filter(j => Date.parse(j.at) >= now.getTime() - 7 * 86_400_000 && Date.parse(j.at) <= now.getTime()).length, activeDays: days.size, streak };
}
export function unlockAchievements(stats: TravelStatistics): Achievement[] {
  return [
    { id: 'first-ride', title: 'First stop', description: 'Record your first journey', icon: 'flag', unlocked: stats.totalJourneys > 0 },
    { id: 'explorer', title: 'Station collector', description: 'Board or exit at 5 stations', icon: 'map', unlocked: stats.visitedIds.length >= 5 },
    { id: 'regular', title: 'Finding your rhythm', description: 'Record 5 journeys', icon: 'repeat', unlocked: stats.totalJourneys >= 5 },
    { id: 'consistent', title: 'Three-day streak', description: 'Ride on 3 consecutive days', icon: 'zap', unlocked: stats.streak >= 3 },
  ];
}
export function weeklyChallenges(stats: TravelStatistics): Challenge[] {
  return [{ id: 'weekly-five', title: 'The five-ride club', description: 'Record 5 rides in the last 7 days', target: 5, progress: Math.min(stats.weeklyJourneys,5) }];
}
export const leaderboardScore = (journeys: Journey[]) => journeyStatistics(journeys).points;
export function rankLeaderboard(entries: LeaderboardEntry[]): LeaderboardEntry[] { return [...entries].sort((a,b) => b.points - a.points || a.name.localeCompare(b.name)); }
export const networkCompletion = (visitedIds: string[]) => Math.round(visitedIds.filter(id => OPEN_STATIONS.some(s => s.id === id)).length / OPEN_STATIONS.length * 100);
