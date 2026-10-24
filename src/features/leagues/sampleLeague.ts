import type { LeaderboardEntry } from '@/domain/models';
// Fictional demo identities and fixed illustrative XP, not real riders or a live ranking.
// Only the current user's score reflects activity recorded locally on this device.
export const SAMPLE_LEAGUE: LeaderboardEntry[] = [
  { id: 'sample-aarav', name: 'Aarav', points: 240, sample: true, line: 'purple' },
  { id: 'sample-sana', name: 'Sana', points: 180, sample: true, line: 'aqua' },
  { id: 'sample-neha', name: 'Neha', points: 90, sample: true, line: 'purple' },
  { id: 'sample-kabir', name: 'Kabir', points: 40, sample: true, line: 'aqua' },
  { id: 'sample-ishaan', name: 'Ishaan', points: 20, sample: true, line: 'purple' },
  { id: 'sample-meera', name: 'Meera', points: 10, sample: true, line: 'aqua' },
];
