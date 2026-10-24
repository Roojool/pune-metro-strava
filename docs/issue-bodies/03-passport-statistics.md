Developer 3 — passport and statistics

Human: chetanpujari5105
Branch: feature/passport-stats
Ownership: src/features/passport/** only. Required export: PassportScreen.tsx, default React component.

Build a polished Metro Passport with Purple/Aqua line selector and a touchable station explorer. Differentiate collected, unvisited and unavailable Range Hill. Count only boarding/exit stations. Show completion from OPEN_STATIONS, total journeys, estimated kilometers, current-month summary, illustrative savings/CO2e and attractive progress cards. Use shared repository totals and domain networkCompletion. Provide explicit share action with a previewable stats layout that does not reveal routes or dates; React Native Share is sufficient.

Complete standalone instructions: https://github.com/Roojool/pune-metro-strava/blob/main/team-prompts/03-passport-statistics.md

Acceptance: typecheck, domain tests and web export pass; demonstrate affected flow; sample labels/accessibility retained; no edits outside ownership. Deadline: 2026-10-24 15:08 IST (optional feature freeze). Shared contracts freeze 14:18 IST. See TEAM_STATUS.md for AI reservations; never edit a reserved feature until lead handoff.

Out of scope: No root routes, shared code, package config, full geographic maps, invented fares, emissions accuracy claims, automatic collection of every passed station, or direct storage access.
Fallback: Keep working station stamps and shared totals; use a text share summary and line list rather than a custom map.

