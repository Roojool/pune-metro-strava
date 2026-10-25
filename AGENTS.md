# Agent instructions for MetroQuest Pune

Read `README.md`, `SPRINT_120_MIN.md` and `CONTRIBUTING.md` first. Before editing,
read `TEAM_STATUS.md`, your exact `team-prompts/0N-*.md`, `INTEGRATION_BOARD.md`
and `docs/TEAM_CONTINUATION.md`. The lead prompt defines documentation ownership;
an assigned docs helper does not become the integration lead.
On the original Windows workstation, read `C:\Users\roojo\.codex\RTK.md` and use
native RTK commands where supported. Elsewhere, use available local RTK guidance;
if it or RTK is absent, report that and use standard CLI commands.

## Task bounds and ownership

The current user's explicit scope and stopping condition take precedence over
standing continuation instructions. A bounded docs-only task requesting a PR URL
ends at that URL: do not start a runner, wait for merge or claim E2E completion.
For assigned application integration, a PR is a checkpoint: handle owned review
fixes, synchronize after merge and run `npm run verify:e2e` before reporting
integrated E2E completion. Stop on `insufficient_quota` or billing errors.

Never launch a second editing agent/runner inside an active editor's checkout.
AI helpers use separate `ai/*` branches **and worktrees**, with disjoint named
files. Never let two workers edit one checkout. Do not modify another role's
folder or package/configuration files. Human branches remain
`feature/core-integration`, `feature/journey-tracking`, `feature/passport-stats`,
`feature/gamification` and `feature/community-web`; see README's ownership list.
No direct main pushes by feature workers, no force pushes. Visibility is public.
Preserve requested authorship; omit unrequested co-author trailers.

Shared contracts froze at **14:18 IST on 2026-10-24**; only Roojool, the lead,
may approve changes. Import models from `src/domain/models.ts`, calculations
from `src/domain/metro.ts`, and state from `src/state/AppState.tsx`. Await all
mutation results and surface errors. AsyncStorage writes belong only to AppState.

## Submission and verification

Target **DevDay Loops House / Urban Mobility**. Read `SUBMISSION.md` and preserve
**Home → Log PCMC→Civil Court → Passport → Leagues → Community → reload**.
Supplied judging weights: Technical 30 / Innovation 25 / Track Fit 25 / Execution
20; code-contradicting claims face credibility caps. Never invent metrics, cap
thresholds, awards or successful tests.

Scope remains one Expo SDK 57, Expo Router, React Native and TypeScript app for
web, Android and iOS. Preserve accessible button labels and readable responsive
layouts. Keep sample identities/rankings/posts labeled **SAMPLE / DEMO**. Manual
trips are not independently verified; estimates are not measured impact or fares.
Never request default background location, expose home/work schedules, commit
credentials or send location data to third parties.

Run `npm run typecheck`, `npm test` and `npm run export:web` before integration.
Typecheck before suggesting completion; record real results and limitations.
For docs, also check links and Markdown-only scope. Build/export success is not
browser, native or production proof. Retain commit/platform scope for historical
evidence. Supabase SQL is unapplied, social behavior is local/sample, and public
repository visibility does not grant an open-source license.
