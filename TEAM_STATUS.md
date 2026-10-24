# Sprint team status

Start: 2026-10-24 13:58 IST. Hard deadline: 15:58 IST.
Four human developers retain their own branches and GitHub access. AI workers
are separate helpers; no claim that humans have begun work or tested devices.

| Human | GitHub | Branch | Exclusive feature ownership | Status |
| --- | --- | --- | --- | --- |
| 1 Lead | Roojool | feature/core-integration | app/, shared core/config/CI/docs | Active |
| 2 Journey | prathadox | feature/journey-tracking | src/features/journey/ | Prompt ready; availability unconfirmed |
| 3 Passport | chetanpujari5105 | feature/passport-stats | src/features/passport/ | Prompt ready; availability unconfirmed |
| 4 Leagues | mangeshraut712 | feature/gamification | src/features/leagues/ | Prompt ready; availability unconfirmed |
| 5 Community | atharvamhaske | feature/community-web | src/features/community/ | Prompt ready; availability unconfirmed |

AI reservations will be listed here before work starts. While a feature is
reserved to an AI helper, its human owner should inspect, test or review rather
than change the same files; after lead integration the human merges latest main
and continues. No AI worker pushes to a human branch. The lead alone performs
shared edits and merges. Features must not edit each other's directories.

## GitHub setup

Private repo: https://github.com/Roojool/pune-metro-strava. Baseline: 90c4602.
All five human feature branches originate from that same working baseline.
Write-access invitations sent to all four supplied usernames; acceptance pending.

| Role | Issue | Prompt |
| --- | --- | --- |
| Lead | [#1](https://github.com/Roojool/pune-metro-strava/issues/1) | team-prompts/01-lead-integration.md |
| Journey | [#2](https://github.com/Roojool/pune-metro-strava/issues/2) | team-prompts/02-journey-tracking.md |
| Passport | [#3](https://github.com/Roojool/pune-metro-strava/issues/3) | team-prompts/03-passport-statistics.md |
| Leagues | [#4](https://github.com/Roojool/pune-metro-strava/issues/4) | team-prompts/04-leaderboards-gamification.md |
| Community | [#5](https://github.com/Roojool/pune-metro-strava/issues/5) | team-prompts/05-community-web.md |

## Active AI reservations

| Worker | Branch | Separate worktree | Exclusive files |
| --- | --- | --- | --- |
| Journey helper | ai/journey-demo | ../metroquest-workers/journey | src/features/journey/** |
| Passport helper | ai/passport-demo | ../metroquest-workers/passport | src/features/passport/** |
| Community helper | ai/community-demo | ../metroquest-workers/community | src/features/community/** |
| Lead (root) | feature/core-integration | current project checkout | Shared core, root files, src/features/leagues/** temporary reservation |

Human Developers 2–5: inspect/test/review while your feature is reserved. Lead
will record handoff when these implementations merge. Your feature branch is
untouched by AI workers. This avoids simultaneous human/AI file ownership.

## Baseline checks

- npm install: passed (578 initial packages; SDK-compatible storage/icons added).
- TypeScript: passed after removing obsolete baseUrl setting.
- Domain tests: 6 passed.
- Expo static web export: passed, all five tabs plus log route.
- Expo dev server: running at http://localhost:8081; browser rendered Home.
- Expo Doctor: obsolete newArchEnabled removed; recheck pending.
- Browser critical interaction scenario: pending after feature integration.
- Android: adb available, no device/emulator attached. Not tested.
- iOS: no iPhone connected/tested. Not tested.
- CI: definition in docs/github-actions-check.yml; GitHub workflow scope requested.
- Web deployment: not deployed; local server is available.
