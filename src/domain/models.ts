export type LineId = 'purple' | 'aqua';
export interface User { id: string; name: string; privateProfile: boolean; }
export interface MetroLine { id: LineId; name: string; color: string; stationIds: string[]; }
export interface Station { id: string; name: string; line: LineId | 'interchange'; operational: boolean; }
export interface JourneyCandidate { from: string; to: string; }
export interface Journey extends JourneyCandidate {
  id: string; at: string; kilometers: number; minutes: number; fare: number | null;
  saved: number; co2Kg: number; points: number; stationIds: string[]; source: 'manual';
}
export interface Achievement { id: string; title: string; description: string; icon: string; unlocked: boolean; }
export interface Challenge { id: string; title: string; description: string; progress: number; target: number; }
export interface LeaderboardEntry { id: string; name: string; points: number; sample: boolean; line: LineId; }
export interface Community { id: string; title: string; members: string; subtitle: string; line: LineId | null; }
export interface CommunityPost { id: string; communityId: string; author: string; body: string; at: string; sample: boolean; likes: number; liked: boolean; }
export interface TravelStatistics {
  totalJourneys: number; totalKm: number; totalSavings: number; totalCo2: number;
  points: number; visitedIds: string[]; monthlyJourneys: number; weeklyJourneys: number;
  activeDays: number; streak: number;
}
export interface DemoState { version: 1; journeys: Journey[]; joined: string[]; posts: CommunityPost[]; user: User; }
export type MutationResult = { ok: true; message: string } | { ok: false; message: string };
