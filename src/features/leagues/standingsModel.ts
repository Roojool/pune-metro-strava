import { LINES } from '../../data/pune';
import { leaderboardScore, rankLeaderboard } from '../../domain/metro';
import type { Journey, LeaderboardEntry, LineId, User } from '../../domain/models';
import { SAMPLE_LEAGUE } from './sampleLeague';

export type LeagueScope = 'Pune' | 'Friends' | 'Route';

// Select the board here; awarded XP and ordering remain owned by the domain.
export function leagueStandings(scope: LeagueScope, line: LineId, journeys: Journey[], user: User, points: number) {
  const selectedLine = LINES.find(candidate => candidate.id === line)!;
  const routeJourneys = journeys.filter(journey =>
    journey.stationIds.filter(id => selectedLine.stationIds.includes(id)).length >= 2);
  const currentScore = scope === 'Route' ? leaderboardScore(routeJourneys) : points;
  const samples = scope === 'Friends' ? SAMPLE_LEAGUE.slice(0, 3)
    : scope === 'Route' ? SAMPLE_LEAGUE.filter(entry => entry.line === line) : SAMPLE_LEAGUE;
  const current: LeaderboardEntry = {
    id: user.id, name: user.name.trim() || 'You', points: currentScore, sample: false, line,
  };
  const board = rankLeaderboard([...samples, current]);
  return {
    board, currentScore, routeJourneys, selectedLine, sampleCount: samples.length,
    rank: board.findIndex(entry => entry.id === user.id) + 1,
    title: scope === 'Route' ? `${selectedLine.name} league`
      : scope === 'Friends' ? 'Friends preview' : 'Pune explorers',
  };
}

export function standingLabel(entry: LeaderboardEntry, position: number, total: number) {
  return `Position ${position} of ${total}, ${entry.name}${entry.sample ? '' : ', you'}, ${entry.points} XP. ${entry.sample ? 'Fictional sample profile' : 'Your local, self-reported score'}.`;
}
