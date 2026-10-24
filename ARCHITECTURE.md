# MetroQuest architecture

One Expo SDK 57 / TypeScript / Expo Router application serves Android, iOS and web.
`app/` contains navigation and thin feature entry points. `src/components/` and
`src/theme.ts` contain the shared visual system. `src/domain/` owns all contracts
and calculations; `src/data/pune.ts` owns the reference network.

`src/state/AppState.tsx` is the only feature repository. React Context provides
journeys, derived statistics, XP, achievements, community posts and preferences.
AsyncStorage persists a versioned local snapshot. No API keys or remote backend
are needed. Local writes must be hydrated before mutation and errors must be visible.

Feature ownership: lead owns navigation, shared components, models, data, state,
package configuration and CI. Developers 2–5 own `src/features/journey/`,
`src/features/passport/`, `src/features/leagues/`, `src/features/community/`
respectively. Features never calculate independent scores or mutate storage directly.

All journeys are self-reported. Sample league identities and posts are labeled.
Only boarding and exit stations are collected; passing a station is not a visit.
Route geometry, cost and environmental comparisons are illustrative assumptions.
No background GPS, authentication, public ranking or live social network is present.
The Supabase schema is an unapplied future draft.
