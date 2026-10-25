import { useCallback, useMemo, useState } from 'react';
import { AppState } from 'react-native';
import { useFocusEffect } from 'expo-router';
import type { Journey } from '@/domain/models';
import { journeyStatistics, unlockAchievements, weeklyChallenges } from '@/domain/metro';
import { nextLeagueRefreshDelay } from './leagueClock';

export function useLeagueProgress(journeys: Journey[], enabled: boolean) {
  const [clockTick, setClockTick] = useState(0);

  useFocusEffect(useCallback(() => {
    if (!enabled) return;
    let active = AppState.currentState == null || AppState.currentState === 'active';
    let disposed = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const stopTimer = () => {
      if (timer !== undefined) clearTimeout(timer);
      timer = undefined;
    };
    const refresh = () => {
      stopTimer();
      if (disposed || !active) return;
      setClockTick(tick => tick + 1);
      timer = setTimeout(refresh, nextLeagueRefreshDelay(journeys, Date.now()));
    };
    const subscription = AppState.addEventListener('change', state => {
      active = state === 'active';
      if (active) refresh();
      else stopTimer();
    });
    refresh();
    return () => {
      disposed = true;
      stopTimer();
      subscription.remove();
    };
  }, [enabled, journeys]));

  return useMemo(() => {
    // Read time on a journey change too: a newly saved ride must not be compared
    // with the previous timer tick and accidentally treated as a future ride.
    const stats = journeyStatistics(journeys, new Date());
    return {
      streak: stats.streak,
      achievements: unlockAchievements(stats),
      challenges: weeklyChallenges(stats),
    };
  }, [journeys, clockTick]);
}
