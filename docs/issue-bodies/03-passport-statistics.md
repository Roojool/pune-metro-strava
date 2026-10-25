# Developer 3 — Passport / statistics

Repository issue-body reference, refreshed **2026-10-24**. Editing this file does
not update a live GitHub issue or claim new work has started.

- Human: **chetanpujari5105**.
- Human branch: `feature/passport-stats`.
- Ownership: `src/features/passport/** only`.
- [Issue #3](https://github.com/Roojool/pune-metro-strava/issues/3).
- [Complete role prompt](../../team-prompts/03-passport-statistics.md).

## Merged status and remaining task boundary

Initial #7 and first-ride card #26 are merged. The lead opened #26 from the published human branch; shared follow-up #28 handles successful browser sharing without a native result.
Verify current coordination in [TEAM_STATUS.md](../../TEAM_STATUS.md) and
[INTEGRATION_BOARD.md](../../INTEGRATION_BOARD.md) before resuming. The original
sprint deadlines are historical; shared contracts remain lead-controlled after
the **14:18 IST, 2026-10-24** freeze.

Verify Purple/Aqua station exploration, collected/unvisited/unavailable states and endpoint-only stamps. Check the first-ride action, completion, journey/km/minute totals, India monthly summaries and illustrative savings/CO₂e. Preserve aggregate-only sharing without routes, station names or dates; test cancellation/errors and narrow/wide layouts.

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

Keep PassportScreen.tsx default export, line list, station spotlight, first-ride action and aggregate share summary. No geographic service, new dependency or claims of measured impact.

No default background location, location uploads, real commute schedules,
credentials, backend provisioning, OAuth, ticketing or store-release claims.
Use separate `ai/*` branches/worktrees for helpers; never duplicate an active
editor or modify another owner's paths. Stop on quota/billing errors and report
shared blockers without repeated retries. See [AGENTS.md](../../AGENTS.md).
