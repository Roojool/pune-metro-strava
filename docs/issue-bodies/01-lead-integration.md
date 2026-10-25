# Developer 1 — Lead / integration

Repository issue-body reference, refreshed **2026-10-24**. Editing this file does
not update a live GitHub issue or claim new work has started.

- Human: **Roojool**.
- Human branch: `feature/core-integration`.
- Ownership: `app/**, src/components/**, src/theme.ts, src/domain/**, src/data/**, src/state/**, tests/**, scripts/**, docs/**, assets/**, package/config/CI files, root Markdown and team-prompts/**`.
- [Issue #1](https://github.com/Roojool/pune-metro-strava/issues/1).
- [Complete role prompt](../../team-prompts/01-lead-integration.md).

## Merged status and remaining task boundary

Baseline #6/#11, continuation tooling #20, browser checks #25, Passport sharing #28 and handoff #30 are merged.
Verify current coordination in [TEAM_STATUS.md](../../TEAM_STATUS.md) and
[INTEGRATION_BOARD.md](../../INTEGRATION_BOARD.md) before resuming. The original
sprint deadlines are historical; shared contracts remain lead-controlled after
the **14:18 IST, 2026-10-24** freeze.

Own the shared shell/contracts/state, integration board and reviewed merge queue. For an assigned integration task, inspect feature diffs and connected callers, check required CI on the exact head, merge sequentially and run the real integrated browser gate. Keep the public demo and submission claims consistent. A docs-only helper edits its assigned Markdown without assuming lead merge authority.

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

Preserve the working baseline and demo-v0.1 historical tag. Do not edit a reserved feature folder or fabricate missing teammate work.

No default background location, location uploads, real commute schedules,
credentials, backend provisioning, OAuth, ticketing or store-release claims.
Use separate `ai/*` branches/worktrees for helpers; never duplicate an active
editor or modify another owner's paths. Stop on quota/billing errors and report
shared blockers without repeated retries. See [AGENTS.md](../../AGENTS.md).
