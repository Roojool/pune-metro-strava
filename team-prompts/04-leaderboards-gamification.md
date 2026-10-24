# Developer 4 — leagues and gamification

## Mission and context
Deliver MetroQuest, Strava for Metro, in the revised one-hour five-human sprint.
One Expo SDK 57 / TypeScript / Expo Router / React Native Web app supports Android,
iOS and web. Pune commuters manually record rides, collect stations, earn local
XP and interact with a local demo community. No API keys are needed. This is
self-reported local demo data, not verified travel or a live multi-user platform.

Repository: https://github.com/Roojool/pune-metro-strava (PUBLIC).
Primary branch: main. Your assigned branch: `feature/gamification`.
Lead: Roojool / Developer 1. Human roles 2-5: prathadox, chetanpujari5105,
mangeshraut712, atharvamhaske. Invitations were sent; see TEAM_STATUS.md.
AI workers are helpers, not substitutes for human access.

## Exact ownership and collision rules
You own: src/features/leagues/** only. Required export: LeaguesScreen.tsx, default React component.

Read shared files but do not edit files outside this list. Do not create a second
copy of a shared model, repository, scoring method or station dataset. Only
Developer 1 changes package versions, route wrappers, CI, root navigation and
shared interfaces. Request a concrete shared change in your PR or issue instead.
Do not use a shared checkout for concurrent workers.

| Human | Assigned branch | Ownership |
| --- | --- | --- |
| 1 | feature/core-integration | Shared core + integration |
| 2 | feature/journey-tracking | src/features/journey/** |
| 3 | feature/passport-stats | src/features/passport/** |
| 4 | feature/gamification | src/features/leagues/** |
| 5 | feature/community-web | src/features/community/** |

AI implementation branches use `ai/*` with separate worktrees. TEAM_STATUS.md
records active reservations. Never have a human and AI simultaneously own the
same feature: if its reservation is active, inspect/report/verify only until the
lead hands it back, then update from integrated main. Do not push over an AI's
branch. Human feature branches remain distinct and are not claimed as AI workers.
If you invoke further coding subagents, give each a different worktree/branch
and disjoint named files within your ownership. You remain responsible for
integration. Do not delegate shared files.

## Frozen shared interfaces
Read src/domain/models.ts, src/domain/metro.ts, src/data/pune.ts and
src/state/AppState.tsx before editing. Contracts freeze at minute 20.
All User, MetroLine, Station, Journey, JourneyCandidate, Achievement, Challenge,
LeaderboardEntry, Community, CommunityPost and TravelStatistics types live in
src/domain/models.ts.

Use `useApp()` from `@/state/AppState`:
- journeys, visitedIds, totalJourneys, totalKm, totalSavings, totalCo2, points
- weeklyJourneys (rolling seven days), monthlyJourneys (India month), activeDays, streak
- achievements, challenges, communities, joined, posts, user, ready, storageError
- addJourney(from:string,to:string): Promise<MutationResult>
- addPost(communityId:string,body:string): Promise<MutationResult>
- toggleLike(postId:string): Promise<MutationResult>
- toggleCommunity(communityId:string): Promise<MutationResult>
- updateProfile(name:string,privateProfile:boolean): Promise<MutationResult>
- resetDemo(): Promise<MutationResult>

MutationResult is `{ok:boolean;message:string}`. Await mutations, display failures,
disable duplicate submits, and never report saved before success. Do not write
AsyncStorage directly. Store hydration completes when ready is true.
Journey fields: id, from, to, at, kilometers, minutes, fare:number|null, saved,
co2Kg, points, stationIds, source:'manual'. fare=null means unavailable, not zero.
Only from/to count as collected; intermediate stationIds describe the route.

Dataset exports: STATIONS, OPEN_STATIONS, LINES, LINE_NAMES, getStationName.
Domain exports: routeBetween, journeyStatistics, savingsEstimate,
environmentalEstimate, calculateXp, unlockAchievements, weeklyChallenges,
rankLeaderboard, networkCompletion. Use them; don't duplicate calculations.

## Features to implement
EXECUTE now. Latest main already includes an integrated implementation. Inspect
it, verify your acceptance criteria, and fix gaps within your owned files.
Do not stop at a plan or rebuild working features. The demo is already live;
your immediate job is owned verification and small fixes. Continue independent work
when a shared change is blocked; report concrete errors to the lead.

Build XP overview, level progress, unlocked/locked achievements, rolling 7-day challenge, consistency/streak indicators, friends/Pune/route demo league selectors, sorted leaderboard including current user. Use shared achievements/challenges and domain rankLeaderboard. Create clearly labeled sample identities in feature-local fixture file. Current score must update immediately after recording a ride. Celebrate eligible milestones with a simple visual card. Explain one-minute logging cooldown, ten-rides/day cap and self-reported scoring.

## Explicitly out of scope
Do not duplicate or modify XP/achievement/anti-abuse calculations, edit root navigation or shared files, claim real citywide rankings, add backend competition or elaborate animation dependencies.

## UI and UX
Use shared theme and components from @/components/UI: Page, Heading, Card, Pill,
Action, Stat, SectionTitle, Progress, Notice, Icon, styles. Icon uses Feather
names; no extra icon dependency. Strava-inspired orange/charcoal/white with Purple/Aqua route
accents, rounded cards, clear hierarchy, readable text and 48px buttons.
Every interaction needs an accessibilityRole/label and visible feedback.
Support 390px mobile and wide web with flex wrapping and useWindowDimensions.
Avoid browser-only APIs in universal modules. Never hide sample-data labels.
Do not expose exact commute history in a share summary without explicit consent.
Light mode is the MVP; dark mode is post-MVP.

## Setup and verification commands
```powershell
git clone https://github.com/Roojool/pune-metro-strava.git
cd pune-metro-strava
git fetch origin
git switch feature/gamification
git merge origin/main
npm ci
npm run typecheck
npm test
npm run web
npm run export:web
```
If already cloned, reuse your own checkout. Never run a reset or force push to
match another worker. Expo starts on 8081 unless occupied. Keep the terminal open.
Native: npm run start, open SDK-57-compatible Expo Go on the same Wi-Fi.
On Windows iOS testing requires a physical iPhone; do not claim it passed otherwise.

## Deadline and timeboxes
Latest user instruction: one-hour delivery sprint from 14:15 to 15:15 IST on
2026-10-24. This replaces the original 120-minute deadline. Contracts are already
frozen. Spend at most 5 minutes reading/setup, 10 minutes verifying/fixing and 5
minutes verifying. Commit, push and open your PR by 15:00 IST. Stop optional
features at 14:50 IST. Lead integrates and tests through 15:10; final handoff by
15:15. If starting late, fix blockers and complete the existing feature only.
## Definition of done and integration
- Implemented behavior works in the owned module and existing route wrapper.
- TypeScript, domain tests and web export pass with actual result recorded.
- First launch and empty state work; a ride updates every screen via shared state.
- Reload keeps journeys/posts/reactions/profile state on the same device/origin.
- Verify the affected part of PCMC → Civil Court → Passport → Leagues → Purple
  discussion → create local post → reload.
- No broken imports, silent save errors, false verified claims or new API keys.
- No root config changes or unrelated formatting.
- PR description lists behavior, owned files, commands/results, screenshots when
  available, limitations and the relevant issue. Do not claim device tests you
  did not run.

## Commit and PR commands
```powershell
git add <only-your-owned-paths>
git commit -m "feat: implement gamification demo"
git push -u origin feature/gamification
gh pr create --repo Roojool/pune-metro-strava --base main --head feature/gamification --title "feat: Developer 4 — leagues and gamification" --body-file <your-pr-description-file>
```
Use a real UTF-8 file for multiline PR text. Include the matching issue from
TEAM_STATUS.md. Lead reviews every PR, runs checks, then squash merges one at a
time. Do not self-merge, force-push, bypass failing checks or push directly to main.

## Blockers and fallback
If blocked for more than 5 minutes, report in your GitHub issue: exact error,
command, affected file, what you tried and the smallest requested shared change.
Continue independent UI work; don't change a frozen contract yourself.
A correctly sorted sample leaderboard plus current XP, achievements and one shared challenge is enough.
Report completion with branch, commit SHA, PR URL, tests actually run, and
remaining limits. Human contributors must report availability; no assumption
that the lead can control another computer.


## Revised one-hour handoff (latest user instruction)
Repository visibility is now PUBLIC. The hard deadline is 2026-10-24 15:15 IST, revised at 14:15. Finish verification or blocker-fix PRs by 15:00, stop optional scope 14:50, integration/testing by 15:10, final delivery 15:15. These times override older 120-minute template times above. UI must be Strava-inspired: orange #FC4C02, charcoal/white, prominent schematic route map, estimated duration/distance and ride activity summaries. No separate web app, API keys, fabricated GPS tracks or invented fares. Your ownership remains unchanged. Work continuously in your assigned branch until done; after reporting a blocker continue independent fixes. Check TEAM_STATUS and AI reservation handoff before editing. All five prompts are standalone for separate AI sessions on each human developer checkout.
