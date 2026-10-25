# MetroQuest integration and submission board

Snapshot: **2026-10-24**, fetched main `3a1a7fc6a1c42261e73aa41c37269159d508f0f3`.
Live GitHub status and fetched commits override this dated document; it does not
lock remote agents or describe unpublished work. Optional product scope remains
frozen. [Live demo](https://roojool.github.io/pune-metro-strava/) ·
[Submission](SUBMISSION.md) · [Evidence](TEAM_STATUS.md).

## Integrated work

- **Lead — Roojool:** tooling #20, browser gates #25, Passport share handling #28
  and completed handoff #30 merged. Shared contracts/configuration stay lead-owned.
- **Journey — prathadox:** #23 merged; preserve manual logging, errors and history.
- **Passport — chetanpujari5105:** first-ride guidance #26 merged from the published
  human branch through a lead-opened upstream PR.
- **Leagues — mangeshraut712:** #16/#24 merged; SAMPLE / DEMO labels, XP explanation
  and mobile card fix retained. Habit/progress follow-up #31 and README/screenshots
  #21 also merged.
- **Community — atharvamhaske:** #29 merged. An isolated Gemini helper completed
  that follow-up by user request; the human branch was untouched and the helper
  stopped. The temporary reservation was released.

[TEAM_STATUS.md](TEAM_STATUS.md) links each PR and distinguishes original feature
work, later fixes and helper contributions. Verify new reservations before editing.

## Verification boundary

Main `3a1a7fc` has passing CI and Pages deployment runs, checked during this docs
refresh, and the live URL returned HTTP 200. The previous handoff records runtime
checks for application `368b488` matching preview `86bb149`: typecheck, 24 tests,
web export, full browser flow and share API regression checks. The share tests
stubbed browser APIs and sent no external content. Older hosted and Android
emulator passes are separately scoped in TEAM_STATUS. Physical phones, iOS runtime
and native share completion remain untested in that record.

## Submission handoff

Use [SUBMISSION.md](SUBMISSION.md) for DevDay Loops House / Urban Mobility fields,
and [DEMO_GUIDE.md](DEMO_GUIDE.md) for **Home → Log PCMC→Civil Court → Passport →
Leagues → Community → reload**. Keep manual-travel, SAMPLE / DEMO and estimate
boundaries visible. Supplied weights are Technical 30 / Innovation 25 / Track Fit
25 / Execution 20; code-contradicting claims face credibility caps.

The bounded docs refresh owns Markdown only on `ai/docs-refresh-20261024` and
ends when its PR URL is ready. The lead owns any later review/merge/deployment;
this task does not start an integration loop or submit an external form.

For separately assigned application integration, inspect the exact diff and
required CI, merge sequentially, synchronize normally and run
`npm run verify:e2e` before reporting integrated E2E completion. Fix within
ownership or report the shared blocker. Do not add cosmetic churn during review,
force-push, self-merge as a feature worker or duplicate active editors.
