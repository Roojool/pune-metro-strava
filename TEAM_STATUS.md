# MetroQuest team, integration and evidence

Documentation snapshot: **2026-10-24**, based on fetched main
`3a1a7fc6a1c42261e73aa41c37269159d508f0f3` and live GitHub PR/workflow reads.
The repository is public. This prepares **DevDay Loops House / Urban Mobility**
submission copy; it does not claim the submission form has been sent.

[Live demo](https://roojool.github.io/pune-metro-strava/) ·
[Source](https://github.com/Roojool/pune-metro-strava) ·
[Submission](SUBMISSION.md) · [Demo guide](DEMO_GUIDE.md) ·
[Limitations](KNOWN_LIMITATIONS.md)

## Five human owners and merged work

- **Roojool — lead**, `feature/core-integration`: shared core/configuration,
  routes/tests/CI/scripts/docs/assets. [Issue #1](https://github.com/Roojool/pune-metro-strava/issues/1).
  Baseline #6/#11; tooling [#20](https://github.com/Roojool/pune-metro-strava/pull/20),
  browser checks [#25](https://github.com/Roojool/pune-metro-strava/pull/25),
  Passport sharing [#28](https://github.com/Roojool/pune-metro-strava/pull/28),
  handoff [#30](https://github.com/Roojool/pune-metro-strava/pull/30): **merged**.
- **prathadox — Journey**, `feature/journey-tracking`, `src/features/journey/**`.
  [Issue #2](https://github.com/Roojool/pune-metro-strava/issues/2); initial #9 and
  follow-up [#23](https://github.com/Roojool/pune-metro-strava/pull/23): **merged**.
- **chetanpujari5105 — Passport**, `feature/passport-stats`, `src/features/passport/**`.
  [Issue #3](https://github.com/Roojool/pune-metro-strava/issues/3); initial #7 and
  first-ride card [#26](https://github.com/Roojool/pune-metro-strava/pull/26): **merged**.
  The lead opened #26 from Chetan's published branch.
- **mangeshraut712 — Leagues**, `feature/gamification`, `src/features/leagues/**`.
  [Issue #4](https://github.com/Roojool/pune-metro-strava/issues/4); initial #10,
  [#16](https://github.com/Roojool/pune-metro-strava/pull/16) and
  [#24](https://github.com/Roojool/pune-metro-strava/pull/24): **merged**.
  #24 includes sample labels, XP explanation and narrow-screen card growth.
  Follow-up [#31](https://github.com/Roojool/pune-metro-strava/pull/31) is also
  **merged**: Pune Metro habit framing, latest self-reported ride/Passport link
  and rolling-week goal follow-up actions.
  README/screenshots [#21](https://github.com/Roojool/pune-metro-strava/pull/21): **merged**.
- **atharvamhaske — Community**, `feature/community-web`, `src/features/community/**`.
  [Issue #5](https://github.com/Roojool/pune-metro-strava/issues/5); initial #8 and
  follow-up [#29](https://github.com/Roojool/pune-metro-strava/pull/29): **merged**.
  At the user's request, an isolated Gemini helper completed #29; this is not
  attributed to a new human branch commit. Atharva remains the human owner.

Initial AI feature reservations and the later Community reservation were released
in the prior handoff. No active feature reservation is asserted by this docs run.
Verify current coordination before editing; unpublished work cannot be inferred
from GitHub. Old invitation notes are not current access evidence. AI helpers
use separate `ai/*` branches/worktrees; human branches remain separate.

## Current baseline checks verified during docs preparation

For main `3a1a7fc6a1c42261e73aa41c37269159d508f0f3`:

- [Demo checks](https://github.com/Roojool/pune-metro-strava/actions/runs/40089108498):
  **success**, verified through GitHub. The workflow runs install, typecheck,
  tests and web export; it does not run the browser E2E gate.
- [Publish web demo](https://github.com/Roojool/pune-metro-strava/actions/runs/40089108489):
  **success**, verified through GitHub. Build/deploy success is not a browser pass.
- Canonical live URL returned **HTTP 200** during this docs refresh. This is a
  reachability check, not a new end-to-end browser or native test.

This docs branch changes Markdown only. Its exact local validation results belong
in the PR description. It stops at PR creation and does not claim merged E2E
completion or wait for a new deployment.

## Historical runtime evidence retained from the handoff

These are prior recorded results, not tests newly performed by the docs editor.

- **Integrated application `368b48823683362fb58f3e1d4f2c6f744e0f267d`:** PR #30 records
  tree equality with tested preview `86bb149c03c1af1cddcff19ac3a905581831cf1b`.
  Recorded checks passed: typecheck, **24 tests**, web export, full browser flow,
  ride/post/reaction/membership/profile persistence, five mobile tabs and zero
  browser errors. Expected fresh flow: 1 ride, 2 stamps, 50 XP.
- **Sharing at that integration:** browser void-success, rejection and aggregate
  payload checks passed. Tests stubbed the browser share API and sent no external
  content. Community QA covered failed saves/retry, draft preservation, post
  length boundaries, corrupted data and 390/1440px layouts.
- **Earlier hosted baseline `a66c0105f20a760bf6261eff4bf36c1a7778399c`:** the handoff
  records a full live-URL browser pass at 14:36 IST on 2026-10-24, including reload
  persistence and mobile tabs. Its [CI](https://github.com/Roojool/pune-metro-strava/actions/runs/40080504483)
  and [deployment](https://github.com/Roojool/pune-metro-strava/actions/runs/40080504565)
  are historical links, not evidence for later runtime behavior.
- **Earlier Android emulator pass, 14:56 IST:** Android API 36 / Expo Go 57.0.9
  completed the ride/passport/XP and local social/restart flow after safe-area
  fix [#14](https://github.com/Roojool/pune-metro-strava/pull/14). See the
  [committed capture](docs/screenshots/android-home.png). Detailed artifacts were
  recorded under ignored `output/android/` in the tester's checkout and are not
  assumed present here. Earlier 11-test/Doctor/native-export results belong to
  that baseline, not the later 24-test application snapshot.

**Not tested in the recorded handoff:** physical Android phones, iPhone/iOS
simulator runtime and native share chooser completion. Native export success
does not establish runtime behavior. No production readiness, adoption metrics
or human logging-time study is claimed.

## Reproduce and report

Use Node 24 and `npm ci`, then `npm run verify:e2e`. This runs typecheck/tests/web
export and the real local production-browser flow, recording ignored
`output/e2e-result.json`. For individual smoke scripts, a prepared Playwright CLI
session can run `scripts/browser-smoke.js` and `scripts/share-smoke.js` against a
served export. Missing tools or a failed command are not a pass.

The shared presentation path is **Home → Log PCMC→Civil Court → Passport → Leagues
→ Community → reload**. Two minutes is the presentation budget. Rides are manual,
social comparisons are SAMPLE / DEMO and savings/CO₂e are illustrative.
See [INTEGRATION_BOARD.md](INTEGRATION_BOARD.md) for next ownership boundaries.
