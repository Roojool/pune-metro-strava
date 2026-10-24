# Keep the four teammate agents working through verification

Run this in each human’s **own checkout**, after their existing editing agent has
stopped. Do not run it in the lead checkout or while another agent edits that
checkout. The runner cannot control a teammate’s computer remotely.

```sh
git fetch origin
git merge origin/main
node scripts/team-loop.mjs journey --minutes 30
node scripts/team-loop.mjs passport --minutes 30
node scripts/team-loop.mjs leagues --minutes 30
node scripts/team-loop.mjs community --minutes 30
```

Pick **one command** matching your exact branch: journey requires
`feature/journey-tracking`, passport requires `feature/passport-stats`, leagues
requires `feature/gamification`, community requires `feature/community-web`.
The runner refuses main or a different role’s branch. Each role may change only
its `src/features/<role-folder>/**`; shared blockers go to the lead.

Prerequisites: Node/npm, Git, authenticated GitHub CLI, and Codex CLI authenticated
with your existing account/config. No new API key is needed. RTK is used for Git
and PR commands when installed. Normal Codex approval/authentication requirements
remain in force. Exact machine-readable Git fields/filenames and GitHub JSON use
raw CLI output so display filtering cannot corrupt parsing; synchronization uses
native RTK Git commands when available. If approvals block, the runner reports failure rather than bypassing
them. `--dry-run` verifies role/branch and prints the plan without running an agent.

The controller normally fetches/merges main before each agent call and only then
records the starting commit for ownership checks. The invoked agent must not
pull, merge, rebase or change branches; this prevents legitimate shared updates
from being mistaken for out-of-scope agent edits. Conflicts stop for the lead.

The loop is bounded to 30 minutes (or a smaller --minutes value) and six agent
calls. It acquires an exclusive checkout lock under Git’s own metadata directory.
Do not remove a lock until you have confirmed its owner process has stopped.
Clean termination releases it; an abrupt OS kill may leave a stale lock.

No PR, failing checks or review changes trigger an owned repair. An open PR with
pending/passing checks triggers one owned empty/error/mobile/privacy verification,
then 30-second polls while the lead integrates it. The runner never self-merges.
If no change/PR is needed, one owned verification call followed by no commits
ahead of main also permits the actual E2E gate. Never invent an empty PR or feature.
After merge it fetches and normally merges origin/main, then actually executes
`npm run verify:e2e`. It reports PASS only if that command exits zero and the
branch has no open PR, no differing tree from origin/main and no unsaved code.
An unavailable verification command is a failure, never a simulated pass. Closed
unmerged PRs, merge conflicts, approval blocks and limits stop with an honest
BLOCKED report. Last agent responses are in `output/team/<role>-last.txt`.

## Paste into an already-running teammate Codex session

> Read the latest AGENTS.md, TEAM_STATUS.md, your updated team-prompts file and
> docs/TEAM_CONTINUATION.md. Stay on your exact assigned feature branch and edit
> only your feature folder. Opening a PR is not completion: keep reviewing its
> checks, fix owned failures, verify empty/error/mobile states and share privacy,
> and report shared blockers to the lead. Never self-merge or add new scope. Once
> the lead merges your PR, fetch and normally merge origin/main, then run the
> actual npm run verify:e2e browser gate. Continue repairing owned failures and
> sending small PRs until that gate exits zero with no open PR or unmerged code,
> or the sprint deadline is reached. Report actual results. Do not start the
> team-loop runner while this editing session is still active; hand control back
> first, then the human may run the matching command in their own checkout.

This script does not provision permissions, grant new access, publish credentials,
force-push, change models, bypass sandbox approvals or guarantee another person
has launched it. It coordinates only the checkout where the human runs it.
