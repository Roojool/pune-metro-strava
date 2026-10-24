import { COMMUNITIES, SAMPLE_POSTS } from '../data/community';
import { findStation, routeBetween } from './metro';
import type { DemoState } from './models';
export const STORAGE_KEY = 'metroquest.demo.v1';
export const freshState = (): DemoState => ({ version: 1, journeys: [], joined: [], posts: SAMPLE_POSTS.map(p => ({ ...p })), user: { id: 'you', name: 'Pune Explorer', privateProfile: true } });
export function parseStoredState(raw: string): DemoState {
  const s: unknown = JSON.parse(raw);
  if (!s || typeof s !== 'object') throw new Error('Invalid saved data.');
  const state = s as DemoState;
  if (state.version !== 1 || !Array.isArray(state.journeys) || !Array.isArray(state.joined) || !Array.isArray(state.posts) || !state.user || state.user.id !== 'you' || typeof state.user.name !== 'string' || state.user.name.length > 40 || typeof state.user.privateProfile !== 'boolean') throw new Error('Unsupported saved data.');
  if (state.journeys.length > 20_000 || state.posts.length > 2_000) throw new Error('Saved demo exceeds supported size.');
  for (const j of state.journeys) {
    if (!j || typeof j.id !== 'string' || typeof j.at !== 'string' || !Number.isFinite(Date.parse(j.at)) || !findStation(j.from)?.operational || !findStation(j.to)?.operational || j.from === j.to || j.source !== 'manual' || !Array.isArray(j.stationIds) || j.stationIds.some(id => typeof id !== 'string' || !findStation(id))) throw new Error('Invalid saved journey.');
    for (const key of ['kilometers', 'minutes', 'saved', 'co2Kg', 'points'] as const) if (!Number.isFinite(j[key]) || j[key] < 0) throw new Error('Invalid saved metric.');
    if (j.fare !== null && (!Number.isFinite(j.fare) || j.fare < 0)) throw new Error('Invalid saved fare.');
    const route = routeBetween(j.from,j.to);
    if (route.stationIds.join() !== j.stationIds.join()) throw new Error('Invalid saved route.');
  }
  if (state.joined.some(id => !COMMUNITIES.some(c => c.id === id))) throw new Error('Invalid saved community.');
  for (const p of state.posts) if (!p || typeof p.id !== 'string' || !COMMUNITIES.some(c => c.id === p.communityId) || typeof p.body !== 'string' || !p.body.trim() || p.body.length > 500 || typeof p.author !== 'string' || !Number.isFinite(Date.parse(p.at)) || typeof p.sample !== 'boolean' || typeof p.liked !== 'boolean' || !Number.isInteger(p.likes) || p.likes < 0) throw new Error('Invalid saved post.');
  return state;
}
