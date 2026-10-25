# MetroQuest architecture

One Expo SDK 57 / React Native / TypeScript / Expo Router application targets
web, Android and iOS. Its DevDay Loops House / Urban Mobility demo is **Home → Log
PCMC→Civil Court → Passport → Leagues → Community → reload**.
[SUBMISSION.md](SUBMISSION.md) describes the product;
[TEAM_STATUS.md](TEAM_STATUS.md) separates build checks from runtime evidence.

## Modules and data flow

- `app/` holds navigation and thin feature entry points. A deterministic loading
  screen precedes client navigation to avoid static-web hydration differences.
  Exported routes still support direct navigation.
- `src/components/` and `src/theme.ts` define the shared visual system.
- `src/domain/models.ts` defines shared contracts; `src/domain/metro.ts` computes
  routes, XP, achievements, challenges and aggregate statistics.
- `src/data/pune.ts` is a dated network snapshot. `src/data/community.ts` holds
  sample content; league fixtures live in `src/features/leagues/sampleLeague.ts`.
- `src/state/AppState.tsx` provides `useApp()` via React Context and owns all
  AsyncStorage reads/writes and the mutation queue. Features await
  `Promise<MutationResult>` and show errors.
- `src/domain/persistence.ts` initializes and validates the versioned snapshot.
  Hydration precedes mutation; a successful write precedes the visible update.
  Invalid saved data remains until explicit reset.

`addJourney(from, to)` validates open endpoints and local logging limits, creates
a manual journey, persists it, then updates shared state. Home, Passport and
Leagues use that state. Only boarding/exit endpoints count as stamps. Fresh
PCMC → Civil Court earns 50 XP: 10 for the ride and 20 per new endpoint.
Community mutations use the same persistence boundary.

## Contracts and ownership

Shared contracts froze at **14:18 IST on 2026-10-24**; only the lead may change
them. Features import shared models/calculations/state, never write storage
directly and never create independent scoring systems.

Roojool owns shared navigation/components/domain/data/state/configuration/CI.
prathadox owns Journey, chetanpujari5105 Passport, mangeshraut712 Leagues and
atharvamhaske Community within their `src/features/` folders. Exact branches
are in [README.md](README.md); isolation rules are in [AGENTS.md](AGENTS.md).

## Deployment and verification

`npm run export:web` writes `dist/`. The Pages workflow sets `GITHUB_PAGES=true`,
so `app.config.js` prefixes paths with `/pune-metro-strava`. Local/native builds
retain normal paths. CI runs typecheck, tests and web export.
`npm run verify:e2e` separately runs a real browser flow on a temporary production
server and records ignored `output/e2e-result.json`. It does not certify native
runtime or the hosted base path. Share-specific checks use `scripts/share-smoke.js`.

## Trust boundary

All journeys are self-reported. Other league identities/ranks, seeded posts and
like counts are SAMPLE / DEMO. Routes, distance/time and savings/CO₂e are estimates;
fare is unavailable. No authentication, remote database, real public rankings,
background GPS or live social network exists. Supabase SQL is an unapplied draft.

The local snapshot is unencrypted and device/browser-origin specific, with no
cross-device or cross-tab sync. User-triggered share summaries omit routes,
station names and dates. Profile privacy is a local preference, not access control.
See [KNOWN_LIMITATIONS.md](KNOWN_LIMITATIONS.md).
