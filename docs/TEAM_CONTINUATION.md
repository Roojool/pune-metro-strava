# Bounded teammate integration and verification

This guide is for **explicitly assigned application integration work**. Current
user instructions take precedence. A bounded docs-only run ending at a PR URL
must stop there: do not launch this runner or wait for a merge. Submission fields
are in [SUBMISSION.md](../SUBMISSION.md), with the two-minute Urban Mobility path
in [DEMO_GUIDE.md](../DEMO_GUIDE.md). The old sprint deadline is historical.

## Human launch after the existing editor stops

Use the developer's **own checkout**, never the lead's or a checkout with an
active editor. Read [TEAM_STATUS.md](../TEAM_STATUS.md),
[INTEGRATION_BOARD.md](../INTEGRATION_BOARD.md) and the exact role prompt. The
runner cannot control another person's computer. Its supported human branches are:

- `journey`: `feature/journey-tracking`, only `src/features/journey/**`.
- `passport`: `feature/passport-stats`, only `src/features/passport/**`.
- `leagues`: `feature/gamification`, only `src/features/leagues/**`.
- `community`: `feature/community-web`, only `src/features/community/**`.

Example for Journey; substitute exactly one matching role:

```sh
git fetch origin
git merge origin/main
npm ci
npm run team:continue -- journey --minutes 30 --dry-run
npm run team:continue -- journey --minutes 30
```

The runner rejects main, another role's branch and `ai/*` docs branches. AI
helpers still require separate branches/worktrees, but this particular runner
is restricted to the listed human branches. Do not run multiple role commands
in one checkout.

Prerequisites are Node/npm, Git, authenticated GitHub CLI, the installed and
authenticated Codex CLI, and a working Playwright CLI/browser for E2E. The app
needs no API keys. The runner uses the existing CLI account/configuration; it
does not select a model or service tier. Normal auth/approval requirements apply.
Do not bypass them. Stop on `insufficient_quota` or billing errors, without retries.

## What the existing script does

[scripts/team-loop.mjs](../scripts/team-loop.mjs) allows at most six agent calls
and 30 minutes, or a smaller `--minutes` value. It acquires a checkout lock in Git
metadata. Remove a stale lock only after confirming its owner stopped. It uses
native RTK Git commands when available; exact Git fields/filenames and GitHub JSON
use raw CLI output so filtering cannot corrupt parsing.

The controller normally fetches/merges main before each agent call, then records
the ownership baseline. The invoked agent must not fetch/pull/merge/rebase/switch
branches during that call; the controller owns synchronization. Conflicts stop
for the lead. The runner never self-merges, force-pushes or bypasses CI.

Missing PRs, failed checks and requested changes trigger a scoped repair. An open
PR with passing/pending checks triggers one verification call, then 30-second
status polls. No needed change means verify once, not invent an empty PR. After
merge, it synchronizes and runs **`npm run verify:e2e`**. PASS requires exit zero,
no open PR, the same tree as main and no unsaved code. A failed/unavailable gate,
a closed unmerged PR, conflicts, permission blocks or exhausted limits are not PASS.
Last responses are in ignored `output/team/<role>-last.txt`; E2E evidence is in
ignored `output/e2e-result.json`. This documents script behavior, not a claim that
any teammate has launched it or that it passed in this checkout.

## Already-running agents

Continue only the assigned scope; do not start a nested editor. For integration,
review the exact PR/check state, verify owned empty/error/mobile/persistence/share
behavior and fix concrete failures. After a lead merge, synchronize and run the
actual browser gate before claiming completion. Report the tested SHA, real
outcomes and untested limits; stop at the user's task/time/credit boundary.

Preserve **Home → Log PCMC→Civil Court → Passport → Leagues → Community → reload**,
manual-travel disclosure, SAMPLE / DEMO identities and illustrative estimates.
Build/export success is not real-device proof. The supplied judging weights and
credibility boundary are in [SUBMISSION.md](../SUBMISSION.md).
