# MetroQuest two-minute demo

For **DevDay Loops House · Urban Mobility**. Open the
[live demo](https://roojool.github.io/pune-metro-strava/); paste-ready fields are
in [SUBMISSION.md](SUBMISSION.md).

**Home → Log PCMC→Civil Court → Passport → Leagues → Community → reload**

## Prepare before presenting

Use one browser tab and keep the same origin. Fresh state has zero rides and XP;
seeded community posts and sample league profiles are already present. Profile's
two-step reset deletes local demo data if you need a fresh walkthrough. Do not
reset somebody else's history. Confirm the page loads before presenting; a past
deployment pass is not a guarantee of current availability.

## Suggested narration and timing

1. **0:00–0:15 — Home.** “MetroQuest explores a more engaging Pune Metro habit
   through personal progress and station discovery. This is a local prototype.”
2. **0:15–0:40 — Log.** Tap **Log a ride**, retain **PCMC → Civil Court**, and
   confirm once. The selector uses **Civil Court (District Court)**. Say “This
   is self-reported; the app does not verify that I traveled.” Wait for the
   successful save and Home update before continuing.
3. **0:40–1:00 — Passport.** Show the endpoint stamps. Fresh state should show
   **1 journey, 2 stamps, 50 XP**. “Passed stations are not collected; distance,
   time, savings and CO₂e are illustrative estimates.”
4. **1:00–1:20 — Leagues.** Show XP and **How XP works**. “My score comes from
   local rides. Other profiles and Pune/Friends/Route ranks are SAMPLE / DEMO,
   not real city competition.”
5. **1:20–1:45 — Community.** Select **Purple Line**, post “Demo: exploring Pune
   Metro”, and react. “Posts, reactions and joins stay in this device's local
   feed; seeded identities are fictional.” Avoid personal commute details.
6. **1:45–2:00 — Reload.** Reload the same origin and show the ride and post/reaction.
   “This demonstrates local persistence. We have not measured adoption or a
   change in travel behavior.”

These intervals allocate presentation time; they are not a user study.
First-ride XP is 10 for the ride plus 20 per new endpoint. Existing rides change
totals. Repeat logging within one minute is rejected; the demo caps rides at
10 per **UTC day**. These guards do not verify travel or resist device tampering.

If a save fails, show the error and retry after resolving storage access. Do not
narrate failed saves as persistent. Clearing data or changing origin/port/device
does not preserve the same history. Unreadable saved data remains until explicit
reset; that reset is destructive and optional.

## Local setup and checks

Use Node 24, matching CI, and npm:

```sh
npm ci
npm run typecheck
npm test
npm run export:web
npm run web
```

Use Expo's printed development URL. For a production export, run
`npx expo serve --port 8090` and open `http://localhost:8090/`. No app API keys
are required. `npm run verify:e2e` reruns typecheck/tests/export, starts a temporary
static server and browser, and checks the full flow, profile persistence and
mobile tabs. It needs a working Playwright CLI/browser setup and records actual
results in ignored `output/e2e-result.json`. See [TEAM_STATUS.md](TEAM_STATUS.md).
Local root-path checks do not prove the hosted Pages base path works.

## Native development

Run `npm run start` with an Expo Go client compatible with SDK 57; check
[Expo's download page](https://expo.dev/go) and follow Expo's connection instructions.
An Android emulator must be installed; an iOS simulator requires macOS/Xcode.
For SDK mismatch errors, use the
[official troubleshooting guide](https://docs.expo.dev/troubleshooting/expo-go-version-mismatch/)
instead of changing dependencies for a presentation.

The handoff records an earlier Android API 36 / Expo Go 57.0.9 emulator pass.
Physical Android/iPhone, iOS simulator runtime and native share completion remain
untested in that record. Native bundle export is not runtime validation.
The hosted web demo is the submission walkthrough.

## Hosted build and optional sharing

[GitHub Pages](https://roojool.github.io/pune-metro-strava/) is the canonical demo.
The Publish web demo workflow checks and exports `main` with `GITHUB_PAGES=true`;
`app.config.js` then uses `/pune-metro-strava` as its base. Local and native builds
retain their normal paths. See the dated [deployment evidence](TEAM_STATUS.md).

Sharing is outside the two-minute path. Passport and Community share aggregate
summaries only after an explicit action. Recorded browser share tests used API
stubs and sent no external shares; native chooser completion is untested.
Never expose home/work schedules for a demo.
