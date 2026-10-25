# Developer 5 — Community / social / web

Repository issue-body reference, refreshed **2026-10-24**. Editing this file does
not update a live GitHub issue or claim new work has started.

- Human: **atharvamhaske**.
- Human branch: `feature/community-web`.
- Ownership: `src/features/community/** only`.
- [Issue #5](https://github.com/Roojool/pune-metro-strava/issues/5).
- [Complete role prompt](../../team-prompts/05-community-web.md).

## Merged status and remaining task boundary

Initial #8 and follow-up #29 are merged. An isolated Gemini helper completed #29 by user request, adding recovery, validation tests and share-result handling. The temporary reservation was released; the human branch was untouched.
Verify current coordination in [TEAM_STATUS.md](../../TEAM_STATUS.md) and
[INTEGRATION_BOARD.md](../../INTEGRATION_BOARD.md) before resuming. The original
sprint deadlines are historical; shared contracts remain lead-controlled after
the **14:18 IST, 2026-10-24** freeze.

Verify Purple/Aqua/Pune selection, separate drafts, local posts, reactions, join/leave and commuter cards. Await persistence, show errors and preserve drafts on failed saves. Reject whitespace and posts over 500 characters; verify reload and explicit aggregate sharing, including browser void-success/native dismissal handling. Keep sample identities distinct from local user posts at 390px and 1440px.

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

Keep CommunityScreen.tsx default export, Purple Line composer/feed/reactions and visible local/sample labels. No live chat, moderation backend, profile/navigation or shared layout edits.

No default background location, location uploads, real commute schedules,
credentials, backend provisioning, OAuth, ticketing or store-release claims.
Use separate `ai/*` branches/worktrees for helpers; never duplicate an active
editor or modify another owner's paths. Stop on quota/billing errors and report
shared blockers without repeated retries. See [AGENTS.md](../../AGENTS.md).
