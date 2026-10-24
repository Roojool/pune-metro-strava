# Developer 3 — Passport / statistics

Role owner: **chetanpujari5105**. Human branch: `feature/passport-stats`.
Owned paths: `src/features/passport/** only`.
Use this prompt only for an assigned task in your own checkout; reading it does
not authorize a new editor, integration loop or changes beyond the user's scope.

## Current handoff — 2026-10-24

Initial #7 and first-ride card #26 are merged. The lead opened #26 from the published human branch; shared follow-up #28 handles successful browser sharing without a native result.
See [TEAM_STATUS.md](../TEAM_STATUS.md) for linked evidence.

## Concrete assignment when resumed

Verify Purple/Aqua station exploration, collected/unvisited/unavailable states and endpoint-only stamps. Check the first-ride action, completion, journey/km/minute totals, India monthly summaries and illustrative savings/CO₂e. Preserve aggregate-only sharing without routes, station names or dates; test cancellation/errors and narrow/wide layouts.

Keep PassportScreen.tsx default export, line list, station spotlight, first-ride action and aggregate share summary. No geographic service, new dependency or claims of measured impact.

## Product and submission boundaries

MetroQuest is a **DevDay Loops House / Urban Mobility** prototype: one Expo SDK
57 + React Native + TypeScript + Expo Router app targeting web, Android and iOS.
[Repository](https://github.com/Roojool/pune-metro-strava) ·
[Live demo](https://roojool.github.io/pune-metro-strava/) ·
[Submission](../SUBMISSION.md) · [Demo guide](../DEMO_GUIDE.md).

Canonical presentation: **Home → Log PCMC→Civil Court → Passport → Leagues →
Community → reload**. Fresh local state yields 1 journey, 2 endpoint stamps and
50 XP. Two minutes is a presentation budget, not a user-study result.
Rides are manual/self-reported; only boarded/exited stations count. Maps are
schematic, fare is unavailable and distance/time/savings/CO₂e are estimates.
League identities/ranks and seeded posts are **SAMPLE / DEMO**. Posts/reactions/
joins persist locally, with no live social network or cross-device sync.
No background GPS, location uploads, API keys or applied backend. Explicit share
actions use aggregate summaries; local storage is unencrypted.

Supplied judging weights: Technical 30 / Innovation 25 / Track Fit 25 / Execution
20. Code-contradicting claims face credibility caps. Do not invent adoption,
impact, verified travel or production readiness. Prior browser/Android emulator
evidence is commit-scoped in TEAM_STATUS, not fresh verification. Physical phones,
iOS runtime and native share completion remain untested in the recorded handoff.

## Shared ownership and preparation

Read [README](../README.md), [SPRINT_120_MIN](../SPRINT_120_MIN.md),
[CONTRIBUTING](../CONTRIBUTING.md), [AGENTS](../AGENTS.md),
[TEAM_STATUS](../TEAM_STATUS.md), [INTEGRATION_BOARD](../INTEGRATION_BOARD.md),
[TEAM_CONTINUATION](../docs/TEAM_CONTINUATION.md), this exact prompt and connected
source before editing. Live GitHub/fetched main override dated status; unpublished
work cannot be inferred. Verify reservations before starting.

- Roojool: `feature/core-integration`, shared core/configuration/CI/tests/docs.
- prathadox: `feature/journey-tracking`, `src/features/journey/**`.
- chetanpujari5105: `feature/passport-stats`, `src/features/passport/**`.
- mangeshraut712: `feature/gamification`, `src/features/leagues/**`.
- atharvamhaske: `feature/community-web`, `src/features/community/**`.

Only the lead changes shared contracts, frozen at **14:18 IST on 2026-10-24**.
AI helpers require separate `ai/*` branches **and worktrees**, with disjoint named
files. Never run two editing agents/runners in one checkout or launch a duplicate
lead editor. Do not reset, force-push or delete another worker's branch. Feature
workers do not push directly to main or edit package/configuration files.

## Frozen APIs — reuse, do not duplicate

Read `src/domain/models.ts`, `src/domain/metro.ts`, `src/data/pune.ts` and
`src/state/AppState.tsx`. Models include User, MetroLine, Station, Journey,
JourneyCandidate, Achievement, Challenge, LeaderboardEntry, Community,
CommunityPost, TravelStatistics and MutationResult.
Journey fields: id/from/to/at/kilometers/minutes/fare/saved/co2Kg/points/stationIds/
source. `source` is `'manual'`; `fare: number | null`, with null meaning unknown.
`at` records logging time, not independently measured travel time.

`useApp()` from `@/state/AppState` provides journeys, visitedIds, totalJourneys,
totalKm, totalSavings, totalCo2, points, monthlyJourneys, weeklyJourneys, activeDays,
streak, achievements, challenges, communities, joined, posts, user, ready,
storageError. Mutations return `Promise<MutationResult>` with `ok` and `message`:
`addJourney(from,to)`, `addPost(communityId,body)`, `toggleLike(postId)`,
`toggleCommunity(id)`, `updateProfile(name,privateProfile)`, `resetDemo()`.
Await results and show failures; only AppState writes AsyncStorage.

Dataset exports: STATIONS, OPEN_STATIONS, LINES, LINE_NAMES, getStationName.
Domain exports: routeBetween, journeyStatistics, calculateXp, unlockAchievements,
weeklyChallenges, rankLeaderboard, leaderboardScore, networkCompletion,
savingsEstimate, environmentalEstimate. Import rather than recalculate.
Use `@/components/UI` and `@/theme`; preserve accessible labels, readable responsive
wrapping and visible demo/estimate labels. Never expose home/work schedules or secrets.

## Bounded execution and verification

1. Confirm your checkout, task scope and branch. For a human feature task,
   fetch and normally merge main before editing; preserve local work. When the
   continuation controller invokes you, it already owns synchronization: do not
   fetch/pull/merge/rebase/switch branches inside that invocation.
2. Reproduce one owned bug or acceptance gap and make the smallest fix. If none
   exists, verify and report; do not invent a feature or empty PR.
3. Run `npm run typecheck`, `npm test`, `npm run export:web`. Record actual outcomes,
   tested SHA and untested limits. Docs-only work also checks links/scope.
4. Stage owned paths, preserve requested authorship, commit and push the assigned
   branch. Open a focused PR to main using a UTF-8 file with `--body-file`. Omit
   unrequested co-author trailers. Never self-merge as a feature worker.
5. If assigned integration, handle concrete review/CI failures within the user's
   time budget. After the lead merges, synchronize and run `npm run verify:e2e`.
   Integrated completion requires an actual pass on synchronized clean code, no
   open owned PR and no unmerged work. The result is in `output/e2e-result.json`.

A user's explicit bounded task overrides continuation defaults. **A docs-only
assignment ending at the PR URL stops there**; do not launch a runner, poll for
merge or claim E2E completion. Original sprint times are historical. Stop on
`insufficient_quota` or billing errors. Report missing permissions, shared blockers
or failed commands with the exact error and smallest needed lead action; no
repeated retries, scope expansion or fabricated passes.

## Human setup and PR commands

Use Node 24 and the assigned human checkout. AI helpers keep their separately
assigned `ai/*` branch/worktree and do not switch to the human branch.

```sh
git fetch origin
git switch feature/passport-stats
git merge origin/main
npm ci
npm run typecheck
npm test
npm run export:web
```

After staging only owned files and committing, push and open the scoped PR:

```sh
git push -u origin feature/passport-stats
gh pr create --repo Roojool/pune-metro-strava --base main --head feature/passport-stats --title "fix: describe the owned change" --body-file /path/to/pr-body.md
```

Replace the body-file placeholder with a real UTF-8 file. Link
[issue #3](https://github.com/Roojool/pune-metro-strava/issues/3).
Use `docs:` for documentation-only commits. Report the branch, commit, PR URL,
actual checks and limitations. For integration, also report the tested main SHA
and E2E result; a PR URL alone is not merged completion.

## Optional human-launched integration runner

Only after the existing editor stops, and only for assigned integration work:

```sh
npm run team:continue -- passport --minutes 30 --dry-run
npm run team:continue -- passport --minutes 30
```

The runner requires the exact human branch, existing CLI authentication and a
working browser setup. It allows at most six calls/30 minutes and uses existing
model configuration. It is not for docs-only work or nested editing. See
[the continuation guide](../docs/TEAM_CONTINUATION.md).
