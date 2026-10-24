# Sprint plan — revised one-hour delivery

Original sprint started **2026-10-24 13:58 IST**. At 14:15 the user revised the
deadline to **15:15 IST**, made the repository public and requested Strava-style
orange activity screens with map, duration and distance. Revised plan below
supersedes the original phase times; completed baseline work is retained.

| Minutes | Local time | Exit gate |
| --- | --- | --- |
| Completed baseline | 13:58–14:15 | Starter reused; runnable web, shared contracts, repo, invitations, prompts and branches |
| 0–25 | 14:15–14:40 | Isolated feature work; orange activity UI, schematic map, time/distance |
| 25–35 | 14:40–14:50 | Review feature PRs, typecheck/tests/export, sequential integration |
| 35–55 | 14:50–15:10 | Optional scope frozen; browser critical flow/persistence/responsiveness |
| 55–60 | 15:10–15:15 | Final docs/commit/push and demo tag only when checks pass |

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
