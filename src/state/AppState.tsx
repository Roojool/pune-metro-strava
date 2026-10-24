import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COMMUNITIES } from '../data/community';
import { createJourney, journeyStatistics, unlockAchievements, weeklyChallenges } from '../domain/metro';
import { freshState, parseStoredState, STORAGE_KEY } from '../domain/persistence';
import type { Achievement, Challenge, Community, DemoState, MutationResult, TravelStatistics } from '../domain/models';
export type { Journey, Community } from '../domain/models';
export const DEMO_ESTIMATE = { fare: 'Check official fare', alternateFare: 'Illustrative comparison', co2Kg: 'Route-based estimate' };
export interface AppRepository extends DemoState, TravelStatistics {
  ready: boolean; storageError: string | null; communities: Community[];
  achievements: Achievement[]; challenges: Challenge[];
  addJourney: (from: string, to: string) => Promise<MutationResult>;
  toggleCommunity: (id: string) => Promise<MutationResult>;
  addPost: (communityId: string, body: string) => Promise<MutationResult>;
  toggleLike: (id: string) => Promise<MutationResult>;
  updateProfile: (name: string, privateProfile: boolean) => Promise<MutationResult>;
  resetDemo: () => Promise<MutationResult>;
}
const Ctx = createContext<AppRepository | null>(null);
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [snapshot, setSnapshot] = useState<DemoState>(freshState);
  const current = useRef(snapshot);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const writable = useRef(false);
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      const loaded = raw ? parseStoredState(raw) : freshState();
      if (alive) { current.current = loaded; setSnapshot(loaded); writable.current = true; }
    }).catch(() => {
      if (alive) setStorageError('Saved data could not be loaded. It has been preserved. Reload to retry, or explicitly reset local demo data in Profile.');
    }).finally(() => { if (alive) setReady(true); });
    return () => { alive = false; };
  }, []);
  function mutate(change: (s: DemoState) => DemoState, message: string, reset = false): Promise<MutationResult> {
    const task = queue.current.then(async (): Promise<MutationResult> => {
      if (!ready) return { ok: false, message: 'Your passport is still loading. Try again in a moment.' };
      if (!writable.current && !reset) return { ok: false, message: 'Saved data needs attention. Reload or reset in Profile.' };
      try {
        const next = change(current.current);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        current.current = next; setSnapshot(next); writable.current = true; setStorageError(null);
        return { ok: true, message };
      } catch (error) {
        const description = error instanceof Error ? error.message : 'Could not save on this device.';
        return { ok: false, message: description };
      }
    });
    queue.current = task;
    return task;
  }
  const stats = journeyStatistics(snapshot.journeys);
  const value: AppRepository = {
    ...snapshot, ...stats, ready, storageError, communities: COMMUNITIES,
    achievements: unlockAchievements(stats), challenges: weeklyChallenges(stats),
    addJourney: (from, to) => mutate(s => ({ ...s, journeys: [createJourney({ from, to }, s.journeys), ...s.journeys] }), 'Journey saved. Your passport and XP are updated.'),
    toggleCommunity: id => mutate(s => {
      if (!COMMUNITIES.some(c => c.id === id)) throw new Error('Unknown community.');
      return { ...s, joined: s.joined.includes(id) ? s.joined.filter(x => x !== id) : [...s.joined,id] };
    }, 'Community preference saved locally.'),
    addPost: (communityId, body) => mutate(s => {
      const text = body.trim();
      if (!COMMUNITIES.some(c => c.id === communityId)) throw new Error('Choose a community.');
      if (!text || text.length > 500) throw new Error('Write a post between 1 and 500 characters.');
      if (s.posts.length >= 2_000) throw new Error('Local demo post limit reached.');
      return { ...s, posts: [{ id: `post-${Date.now()}-${Math.random().toString(36).slice(2,8)}`, communityId, author: s.user.name, body: text, at: new Date().toISOString(), sample: false, likes: 0, liked: false }, ...s.posts] };
    }, 'Posted to your local demo feed.'),
    toggleLike: id => mutate(s => {
      if (!s.posts.some(p => p.id === id)) throw new Error('Post not found.');
      return { ...s, posts: s.posts.map(p => p.id === id ? { ...p, liked: !p.liked, likes: Math.max(0,p.likes + (p.liked ? -1 : 1)) } : p) };
    }, 'Reaction saved locally.'),
    updateProfile: (name, privateProfile) => mutate(s => {
      if (!name.trim() || name.trim().length > 40) throw new Error('Choose a name between 1 and 40 characters.');
      return { ...s, user: { ...s.user, name: name.trim(), privateProfile } };
    }, 'Profile preference saved. This demo remains local.'),
    resetDemo: () => mutate(() => freshState(), 'Local demo reset.', true),
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export function useApp() { const state = useContext(Ctx); if (!state) throw new Error('Wrap app in AppProvider'); return state; }
