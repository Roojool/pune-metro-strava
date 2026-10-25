# Developer 2 — Journey / Home

Repository issue-body reference, refreshed **2026-10-24**. Editing this file does
not update a live GitHub issue or claim new work has started.

- Human: **prathadox**.
- Human branch: `feature/journey-tracking`.
- Ownership: `src/features/journey/** only`.
- [Issue #2](https://github.com/Roojool/pune-metro-strava/issues/2).
- [Complete role prompt](../../team-prompts/02-journey-tracking.md).

## Merged status and remaining task boundary

Initial #9 and follow-up #23 are merged; the latter improves history, accessible controls and recovery.
Verify current coordination in [TEAM_STATUS.md](../../TEAM_STATUS.md) and
[INTEGRATION_BOARD.md](../../INTEGRATION_BOARD.md) before resuming. The original
sprint deadlines are historical; shared contracts remain lead-controlled after
the **14:18 IST, 2026-10-24** freeze.

Verify manual logging, origin/destination search, default PCMC → Civil Court, recent/recurring routes and ride history. Check schematic route context and estimated distance/time. Await saves, show errors, prevent duplicate submits and navigate Home only on success. Confirm shared Passport/XP updates and reload persistence. Preserve the official fare link; never invent a fare.

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

Keep HomeScreen.tsx and LogScreen.tsx default exports, quick log, route preview and async error handling. Do not rewrite working screens or add independent XP/storage logic.

No default background location, location uploads, real commute schedules,
credentials, backend provisioning, OAuth, ticketing or store-release claims.
Use separate `ai/*` branches/worktrees for helpers; never duplicate an active
editor or modify another owner's paths. Stop on quota/billing errors and report
shared blockers without repeated retries. See [AGENTS.md](../../AGENTS.md).
