import type { Community, CommunityPost } from '../domain/models';
export const COMMUNITIES: Community[] = [
  { id: 'purple', title: 'Purple Line', members: 'Local demo community', subtitle: 'PCMC ↔ Swargate · your daily crew', line: 'purple' },
  { id: 'aqua', title: 'Aqua Line', members: 'Local demo community', subtitle: 'Vanaz ↔ Ramwadi · explore the east and west', line: 'aqua' },
  { id: 'pune', title: 'Pune Metro Club', members: 'Local demo community', subtitle: 'Station discoveries, commuter tips and little wins', line: null },
];
export const SAMPLE_POSTS: CommunityPost[] = [
  { id: 'sample-purple-1', communityId: 'purple', author: 'Aarav · sample profile', body: 'A small commute, a better morning. What do you love about your metro ride?', at: '2026-10-24T02:30:00.000Z', sample: true, likes: 12, liked: false },
  { id: 'sample-purple-2', communityId: 'purple', author: 'Neha · sample profile', body: 'Purple Line explorers: try collecting a new station stamp this week. Board or exit there to count it!', at: '2026-10-23T12:30:00.000Z', sample: true, likes: 8, liked: false },
  { id: 'sample-aqua-1', communityId: 'aqua', author: 'Sana · sample profile', body: 'The window seat, a good playlist, and the city going by. That is my kind of commute.', at: '2026-10-23T03:00:00.000Z', sample: true, likes: 17, liked: false },
  { id: 'sample-pune-1', communityId: 'pune', author: 'MetroQuest · sample post', body: 'Welcome aboard! This is a local demo feed. Your posts and reactions stay on this device.', at: '2026-10-23T02:00:00.000Z', sample: true, likes: 4, liked: false },
];
