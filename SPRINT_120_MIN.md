# 120-minute sprint

Start: **2026-10-24 13:58 IST**. Deadline: **15:58 IST**.

| Minutes | Local time | Exit gate |
| --- | --- | --- |
| 0–15 | 13:58–14:13 | Reuse starter, install, initial web export, private repo baseline |
| 15–20 | 14:13–14:18 | Freeze models/repository; five prompts, issues and branches ready |
| 20–70 | 14:18–15:08 | Isolated feature worktrees and non-overlapping ownership |
| 70–95 | 15:08–15:33 | Stop optional scope; review, checks, sequential squash integration |
| 95–115 | 15:33–15:53 | Web/browser critical flow, persistence, native check if available |
| 115–120 | 15:53–15:58 | Final docs, commit/push, demo tag only if checks pass |

Parallel task plans are the exactly five files in team-prompts/. README has the
exclusive ownership matrix; TEAM_STATUS has live reservations, human handles,
issue/PR links and outcomes. Shared contracts live in src/domain/models.ts and
src/state/AppState.tsx. Lead owns all changes to those contracts.

AI helpers are not human teammates. Each gets an isolated ai/* worktree and one
feature reservation. Human owner can verify/review while reserved, and continues
after integration. No worker edits a different feature or shared package files.
Each role has a working fallback already committed. Failing optional work never
replaces the last working screen. Merge only reviewable, passing changes.

Critical flow: Home → PCMC → Civil Court → save → total rises → Passport endpoint
stamps/statistics → Leagues XP/first achievement → Purple community → post →
reload → persisted state. Fare must not be invented. Sample identities and local
social simulation remain labeled. No signed store build is required.
