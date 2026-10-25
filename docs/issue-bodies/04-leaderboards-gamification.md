# Developer 4 — Leagues / gamification

Repository issue-body reference, refreshed **2026-10-24**. Editing this file does
not update a live GitHub issue or claim new work has started.

- Human: **mangeshraut712**.
- Human branch: `feature/gamification`.
- Ownership: `src/features/leagues/** only`.
- [Issue #4](https://github.com/Roojool/pune-metro-strava/issues/4).
- [Complete role prompt](../../team-prompts/04-leaderboards-gamification.md).

## Merged status and remaining task boundary

Initial #10 and Leagues #16/#24 are merged. #24 includes SAMPLE / DEMO labels, accessible How XP works and the mobile card growth fix. Habit/progress follow-up #31 is merged, adding latest self-reported ride context and next-action links. README/screenshots #21 is also merged.
Verify current coordination in [TEAM_STATUS.md](../../TEAM_STATUS.md) and
[INTEGRATION_BOARD.md](../../INTEGRATION_BOARD.md) before resuming. The original
sprint deadlines are historical; shared contracts remain lead-controlled after
the **14:18 IST, 2026-10-24** freeze.

Verify Pune/Friends/Route sample selectors, local score updates, route-empty states, levels, rolling-seven-day challenge, India-date streaks, achievements and loading/storage recovery. Preserve accessible progress, XP disclosure and narrow-screen card growth. Keep peers and comparisons clearly SAMPLE / DEMO; shared scoring and logging guards remain in the domain.

## Acceptance for an explicitly assigned follow-up

Run typecheck, tests and web export; record actual results and the tested commit.
Preserve accessible labels, failure feedback and responsive layouts. For application
integration, synchronize after the lead merges and run `npm run verify:e2e` before
claiming integrated completion. A bounded docs-only task stops at its requested
PR URL and does not enter the continuation loop.

DevDay Loops House / Urban Mobility demo: **Home → Log PCMC→Civil Court → Passport
→ Leagues → Community → reload**. Manual rides are not verified travel. Peers,
ranks and seeded posts are SAMPLE / DEMO; social state stays local. Fare is
unavailable and distance/time/savings/CO₂e are estimates. Use
[SUBMISSION.md](../../SUBMISSION.md) for the supplied judging weights (Technical
30 / Innovation 25 / Track Fit 25 / Execution 20) and credibility boundary.
Never invent usage or impact metrics.

## Scope and fallback

Keep LeaguesScreen.tsx default export, correctly sorted sample board, current XP, achievements and shared challenge. Do not add server competition, independent scoring or animation dependencies.

No default background location, location uploads, real commute schedules,
credentials, backend provisioning, OAuth, ticketing or store-release claims.
Use separate `ai/*` branches/worktrees for helpers; never duplicate an active
editor or modify another owner's paths. Stop on quota/billing errors and report
shared blockers without repeated retries. See [AGENTS.md](../../AGENTS.md).
