# Developer 1 — Lead / integration: continuing integration prompt

EXECUTE in your own checkout. This prompt replaces the earlier one-shot sprint
prompt. Creating a pull request does not finish this assignment.

You are Roojool (this active session). Repository: Roojool/pune-metro-strava (PUBLIC).
Assigned branch: `feature/core-integration`.
You own: app/**, src/components/**, src/theme.ts, src/domain/**, src/data/**, src/state/**, tests/**, scripts/**, docs/**, assets/**, package/config/CI files, root documentation and team-prompts/**.

## Your concrete assignment
Own the shared shell/contracts/state, integration board and merge queue. Review feature PRs in parallel with helpers in separate worktrees. Merge exact reviewed commits sequentially after required checks pass. Re-run the real root production browser flow after integration. Resolve shared blockers once, keep main runnable, and publish the verified web build.

## Out of scope and fallback
Outside your owned paths requires lead coordination. No background tracking,
OAuth, ticketing, server rankings, invented fares or dependency/config changes
by feature owners. Keep the last deployed working screens and demo-v0.1 baseline. Integrate passing fixes only; report missing teammate work without fabricating completion.

## Product and current state
MetroQuest is Strava for Pune Metro: ONE Expo SDK 57 + TypeScript + Expo Router +
React Native Web application for Android, iOS and web. The integrated demo
already runs. Do not build another app or duplicate working features.
Public source: https://github.com/Roojool/pune-metro-strava
Live app: https://roojool.github.io/pune-metro-strava/
Baseline tag: demo-v0.1. Hosted full-flow and Android API 36 / Expo Go 57.0.9 tests
passed. iPhone runtime and native share completion have not been tested.

The product uses manual, self-reported rides and device-local AsyncStorage.
Other league profiles and seeded posts are samples. Maps are schematic, not GPS.
Fare is unavailable; distance/time/savings/CO2e are clearly labeled estimates.
No API keys, background GPS, separate Next.js app or backend provisioning.

## One shared ownership map
| Developer | Person | Assigned human branch | Exclusive responsibility |
| --- | --- | --- | --- |
| 1 | Roojool (this active session) | `feature/core-integration` | Shared core/config/CI/tests/docs |
| 2 | prathadox | `feature/journey-tracking` | src/features/journey/** only |
| 3 | chetanpujari5105 | `feature/passport-stats` | src/features/passport/** only |
| 4 | mangeshraut712 | `feature/gamification` | src/features/leagues/** only |
| 5 | atharvamhaske | `feature/community-web` | src/features/community/** only |

Only the lead edits shared files. Every concurrent coding worker uses a separate
checkout/worktree and branch. Never run two editing agents in one checkout.
If delegating, assign disjoint named files inside your ownership. AI helper
branches are ai/*; humans keep the five feature/* branches. Do not rewrite,
force-push or delete another worker's branch. Prompt 1 is already active in the
lead session; never launch a second shared-file writer.

## Frozen contracts — read, reuse, do not duplicate
Read AGENTS.md, README.md, INTEGRATION_BOARD.md, TEAM_STATUS.md, your feature,
src/domain/models.ts, src/domain/metro.ts, src/data/pune.ts and src/state/AppState.tsx.
GitHub PR/check status and fetched origin/main are authoritative; the board is a
timestamped coordination snapshot. Never assume that an unpushed task is absent.

All types come from @/domain/models:
User, MetroLine, Station, Journey, JourneyCandidate, Achievement, Challenge,
LeaderboardEntry, Community, CommunityPost, TravelStatistics, MutationResult.
Journey: id/from/to/at/kilometers/minutes/fare:number|null/saved/co2Kg/points/
stationIds/source:'manual'. Only from/to count as collected. Null fare is unknown.

useApp() from @/state/AppState provides:
journeys, visitedIds, totalJourneys, totalKm, totalSavings, totalCo2, points,
monthlyJourneys, weeklyJourneys, activeDays, streak, achievements, challenges,
communities, joined, posts, user, ready, storageError.
Mutations return Promise<MutationResult> with ok/message:
addJourney(from,to), addPost(communityId,body), toggleLike(postId),
toggleCommunity(id), updateProfile(name,privateProfile), resetDemo().
Await them; show failures; never write AsyncStorage directly.

Dataset: STATIONS, OPEN_STATIONS, LINES, LINE_NAMES, getStationName.
Domain: routeBetween, journeyStatistics, calculateXp, unlockAchievements,
weeklyChallenges, rankLeaderboard, leaderboardScore, networkCompletion,
savingsEstimate, environmentalEstimate. Do not recalculate scores in features.
Use @/components/UI and @/theme. Feather icons, orange/charcoal/white activity UI,
Purple/Aqua route colors, 48px controls, readable text, responsive wrapping.
Preserve accessibility, validation and visible demo/estimate labels.

## Required continuation protocol — a PR is a checkpoint
1. SYNC: confirm your own checkout and assigned branch; fetch and normally merge
   origin/main. Inspect current code and the live integration board. Preserve
   existing commits and local changes; never reset, force-push or self-merge.
2. ONE OWNED TASK: reproduce a missing acceptance criterion or bug, then make
   the smallest fix in owned files. If no fix is needed, verify the implementation;
   do not invent features or an empty PR merely to keep busy.
3. CHECK + SUBMIT: run typecheck, tests and web export. Push a focused PR to main
   with exact scope, test evidence and limitations. Mention the matching issue
   from TEAM_STATUS. Update the PR description if its scope changes.
4. REVIEW WINDOW: after marking the PR ready, stop routine edits on that PR
   while the lead reviews its exact commit. Continue read-only empty/error/
   mobile/persistence checks in your own checkout. Poll PR/check/review status
   every 30–45 seconds. Fix failed checks or concrete requested changes, then
   push once and return to review. A green CI run alone is not integration.
5. AFTER MERGE: fetch and normally merge latest origin/main into your branch.
   Run npm run verify:e2e. This performs typecheck/tests/export and the actual
   PCMC → Civil Court → Passport → Leagues → Purple post → reaction → reload →
   profile → five mobile tabs browser scenario. Inspect output/e2e-result.json.
6. CONTINUE ON FAILURE: fix reproducible failures within ownership and submit a
   follow-up PR; return to step 4. Shared failures go to the lead with exact
   command/error/main SHA. Continue independent verification while blocked.
7. DONE ONLY WHEN: your work is on main (or no change was needed), your checkout
   is synchronized and clean, no owned PR remains open, and the actual E2E command
   passes against that integrated code. Report the evidence and stop honestly.
   An auth/permission problem, failed check or unmerged PR is a blocker, not PASS.

Work in 10-minute slices. Optional product scope is frozen; focus on integration,
accessibility, regressions, persistence and demo reliability. Do not stop merely
because you opened a PR, and do not add speculative features after a clean pass.
Never claim iOS/physical-device tests or live social behavior without evidence.

## Automation for a stopped agent (human launches it)
Node 24, npm, gh and authenticated Codex CLI are prerequisites. In a separate
terminal on that developer's OWN machine, after the existing editing agent has
stopped, use the role command below. Never start a second CLI editor from inside
an already-running coding agent. The bounded runner re-prompts Codex, waits for
reviewed merges and runs the real E2E gate. It keeps normal sandbox/approval
boundaries, uses existing credentials and never self-merges or bypasses CI.
See docs/TEAM_CONTINUATION.md. If it is not on your branch yet, fetch/merge main;
an already-running agent can follow this protocol directly without the runner.

## Definitions of done and reporting
- Existing Expo routes import the default feature components; no broken imports.
- Empty, valid, invalid, loading and failed-save states remain usable.
- Logging updates all screens through shared state and survives reload/restart.
- No secrets, real commute schedules, new API keys or unsupported native APIs.
- Typecheck/tests/export and real browser checks have actual evidence.
- Keep PRs reviewable. The lead reviews/merges sequentially while QA is parallel.
- Report branch, exact commit, PR URL, commands/results, integrated main SHA,
  E2E result path and untested limits. Never report someone else's local work done.
- If blocked >5 minutes, report the concrete error and smallest lead action needed.
  Do not silently edit another owner's file or repeatedly retry a permission failure.


## Your setup, verification and delivery commands
```sh
git clone https://github.com/Roojool/pune-metro-strava.git
cd pune-metro-strava
git fetch origin
git switch feature/core-integration
git merge origin/main
gh auth status
npm ci
npm run typecheck
npm test
npm run export:web
npm run web
```

After implementing, stage ONLY owned paths, commit with feat:/fix:/test:, and:
```sh
git push -u origin feature/core-integration
gh pr create --repo Roojool/pune-metro-strava --base main --head feature/core-integration --title "fix: describe the owned change" --body-file YOUR-PR-BODY.md
```
Use a real UTF-8 file for multiline PR bodies. Keep following the continuation
protocol after this command; do not finish your turn at PR creation.

## Lead execution here
This role is already being executed by the active lead. Do not create another
Prompt 1 editing session. Own the shared merge queue and INTEGRATION_BOARD.md.
Use parallel read-only reviewers with isolated worktrees. For each candidate,
read its full diff and connected callers, check required CI on the exact head,
resolve shared blockers, squash-merge only that reviewed head, update the board,
then verify integrated main with npm run verify:e2e. Do not bypass branch checks.
Keep polling for all four human workstreams; do not fabricate absent PRs.
The role runner below is for Developers 2–5; the lead stays in this session.

