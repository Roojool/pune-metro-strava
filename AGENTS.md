# Agent instructions for MetroQuest Pune

Read `C:\Users\roojo\.codex\RTK.md` on this Windows workstation and use native RTK commands where supported.

Read `TEAM_STATUS.md` and your exact `team-prompts/0N-*.md` before editing.
Read INTEGRATION_BOARD.md and docs/TEAM_CONTINUATION.md for the current handoff.
A PR is a checkpoint: continue owned verification/review fixes, synchronize after
merge, and run npm run verify:e2e before reporting end-to-end completion.
Never launch a second editing agent/runner inside an active editor's checkout.
Shared contracts freeze at 14:18 IST on 2026-10-24; only the lead may change them.
Human branches are `feature/core-integration`, `feature/journey-tracking`,
`feature/passport-stats`, `feature/gamification`, `feature/community-web`.
AI helpers use separate `ai/*` branches AND worktrees. Never let two workers
edit one checkout. Assign disjoint files to any child workers. Never modify
another role's folder or package/config files. See README ownership table.

Feature modules import models from `src/domain/models.ts`, calculations from
`src/domain/metro.ts`, and state from `src/state/AppState.tsx`. Await all mutation
results and surface errors. AsyncStorage writes belong only to AppState.
Run `npm run typecheck`, `npm test`, `npm run export:web` before integration.
No direct main pushes by feature workers, no force pushes, visibility is public by revised user instruction.

Scope: Expo SDK 57, Expo Router, React Native, TypeScript. One app for web, Android and iOS. No Next.js monorepo in the first two hours.

Read README.md, SPRINT_120_MIN.md and CONTRIBUTING.md first. Work only inside the assigned files/branch. Preserve the AppState contract unless the team lead explicitly approves edits. Implement accessible button labels and readable responsive layouts. Keep all sample data clearly marked demo. Do NOT represent a manually logged trip as independently verified. Never request default background location, expose home/work commute schedules, commit credentials, or send location data to third parties. Typecheck before suggesting completion. No production claims without actual successful tests.
