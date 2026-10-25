# Contributing to MetroQuest Pune

The public [repository](https://github.com/Roojool/pune-metro-strava) prepares a
**DevDay Loops House / Urban Mobility** submission. Read [README.md](README.md),
[SPRINT_120_MIN.md](SPRINT_120_MIN.md), [AGENTS.md](AGENTS.md),
[TEAM_STATUS.md](TEAM_STATUS.md), [INTEGRATION_BOARD.md](INTEGRATION_BOARD.md) and
your exact [team prompt](team-prompts/) before editing. Submission claims in
[SUBMISSION.md](SUBMISSION.md) must match code and recorded evidence.

## Ownership and setup

- Roojool: `feature/core-integration`, shared core/configuration/routes/CI/docs.
- prathadox: `feature/journey-tracking`, only `src/features/journey/**`.
- chetanpujari5105: `feature/passport-stats`, only `src/features/passport/**`.
- mangeshraut712: `feature/gamification`, only `src/features/leagues/**`.
- atharvamhaske: `feature/community-web`, only `src/features/community/**`.

In your own checkout on the assigned branch, synchronize normally:

```sh
git fetch origin
git merge origin/main
npm ci
npm run web
```

Use Node 24 to match CI. AI helpers require separate `ai/*` branches **and
worktrees**, with disjoint named files. Never start a second editor/runner in an
active checkout. Check reservations; a dated handoff cannot reveal unpublished
changes. Never reset another person's work, force-push or push directly to main
as a feature worker. Shared contracts froze at **14:18 IST on 2026-10-24** and
remain lead-only. An explicitly assigned docs helper may edit authorized Markdown;
that does not authorize application, package or contract changes.

## Implementation and claims

Await mutations and surface failures. Import shared models/calculations and
`useApp()`; only AppState writes AsyncStorage. Preserve accessible labels,
readable responsive layouts and validation. Keep fixtures **SAMPLE / DEMO**.
Manual rides are not verified travel; savings/CO₂e are not measured impact and
comparison budgets are not fares. Never commit credentials, expose home/work
schedules, request default background location or send location data to third parties.

Use **Home → Log PCMC→Civil Court → Passport → Leagues → Community → reload**.
No invented metrics or production claims. Supplied judging weights are Technical
30 / Innovation 25 / Track Fit 25 / Execution 20; claims contradicting code face
credibility caps. See [SUBMISSION.md](SUBMISSION.md).

## Checks and PR delivery

```sh
npm run typecheck
npm test
npm run export:web
```

Record actual outcomes, exact scope, affected flow and untested platforms. For
docs, check local links and Markdown-only scope. Stage named owned files. Preserve
requested Git authorship and omit unrequested co-author trailers. Push the assigned
branch and open a PR to `main`; use a UTF-8 file with `gh pr create --body-file`.

For integration assignments, a PR is a checkpoint: address concrete review/CI
failures, synchronize after the lead merges and run `npm run verify:e2e` before
claiming integrated E2E completion. The lead reviews exact commits and merges
sequentially without bypassing checks. An explicitly **bounded docs-only run
that stops at a PR URL** ends at that checkpoint; do not start a continuation
runner or wait for merge.

Report shared blockers with exact command/error and the smallest needed lead
action. Stop on `insufficient_quota` or billing errors; do not retry in a loop.
[docs/TEAM_CONTINUATION.md](docs/TEAM_CONTINUATION.md) describes optional bounded
integration tooling. Original sprint times are historical. Verify access live;
old invitation notes do not establish current permissions. Public visibility
does not grant an open-source license; see [LICENSE-NOTE.md](LICENSE-NOTE.md).
