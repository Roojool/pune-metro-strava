Developer 2 — journey tracking

Human: prathadox
Branch: feature/journey-tracking
Ownership: src/features/journey/** only. Required exports: HomeScreen.tsx and LogScreen.tsx, both default React components.

Polish Home dashboard and the fast manual log flow. Search origin/destination from OPEN_STATIONS. Default PCMC → Civil Court. Confirm in under ten seconds. Show route summary, approximate distance/time, recent journeys, one-tap recurring commute and accessible ride history. Await addJourney(from,to), display rejected/failed save messages, prevent double submits, and navigate Home only on success. Show XP/weekly progress from shared state. Explain fares are unavailable and provide the official operator fare link; never invent a fare.

Complete standalone instructions: https://github.com/Roojool/pune-metro-strava/blob/main/team-prompts/02-journey-tracking.md

Acceptance: typecheck, domain tests and web export pass; demonstrate affected flow; sample labels/accessibility retained; no edits outside ownership. Deadline: 2026-10-24 14:50 IST (optional feature freeze). Shared contracts freeze 14:18 IST. AI reservations are released; merge latest main and continue only within your owned folder.

Out of scope: No root routes, shared state/domain/data, navigation, package configuration, GPS, background detection, independent XP logic or direct AsyncStorage calls.
Fallback: Use the already working PCMC → Civil Court quick-log and recent rides. Preserve async save/error handling before visual refinements.

