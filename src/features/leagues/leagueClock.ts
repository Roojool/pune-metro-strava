import type { Journey } from '@/domain/models';

const DAY_MS = 86_400_000;
const INDIA_OFFSET_MS = 330 * 60_000;
const CLOCK_CHECK_MS = 60_000;

// Schedule display refreshes only; all scoring, streak and challenge rules stay
// in domain/metro. The minute ceiling also catches device-clock adjustments.
export function nextLeagueRefreshDelay(journeys: readonly Pick<Journey, 'at'>[], now: number): number {
  const nextIndiaMidnight = (Math.floor((now + INDIA_OFFSET_MS) / DAY_MS) + 1) * DAY_MS - INDIA_OFFSET_MS;
  let next = Math.min(now + CLOCK_CHECK_MS, nextIndiaMidnight);
  for (const journey of journeys) {
    const at = Date.parse(journey.at);
    // The shared rolling window includes both endpoints. Expire one millisecond
    // AFTER seven days; a future-dated ride enters when the device clock catches up.
    for (const boundary of [at, at + 7 * DAY_MS + 1]) {
      if (boundary > now) next = Math.min(next, boundary);
    }
  }
  return Math.max(1, next - now);
}
