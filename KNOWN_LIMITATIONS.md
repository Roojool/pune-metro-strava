# Known limitations and claim boundaries

MetroQuest is a **DevDay Loops House / Urban Mobility prototype**.
[Live demo](https://roojool.github.io/pune-metro-strava/) ·
[Submission copy](SUBMISSION.md) · [Test evidence](TEAM_STATUS.md).

## Local behavior and SAMPLE / DEMO data

- Journeys are manually self-reported, not independently verified. No GPS,
  background tracking, ticket validation or operator integration.
- The one-minute cooldown and 10-rides-per-UTC-day cap reduce accidental duplication.
  Local storage can be altered; these are not trusted anti-cheat controls.
- Your rides, XP, stamps, posts, reactions, joins and preferences are real local
  state. League peers/ranks, Friends/Route scopes, seeded posts and seeded like
  counts are SAMPLE / DEMO, not real users, demand or engagement.
- No remote accounts/sync, friend graph, live community, moderation, payments or
  ticket booking. The profile privacy switch is a local preference; it does not
  publish a profile or secure an online account.
- Only boarding and exit stations count as collected. Fresh PCMC → Civil Court
  yields 1 journey, 2 stamps and 50 XP: a demo expectation, not a usage statistic.

## Network and estimates

[src/data/pune.ts](src/data/pune.ts) records an operator-profile snapshot dated
2026-10-24. The [official profile](https://punemetrorail.org/project-profile)
lists Purple PCMC–Swargate at 17.4 km and Aqua Vanaz–Ramwadi at 15.7 km. The app
contains 29 unique stations, including unavailable Range Hill, and 28 selectable
stations. The interchange is **Civil Court (District Court)** in the app.
Extensions and depots are excluded; this is not a live service feed.

- Schematic geometry is not a GPS track. Distances divide corridor length
  proportionally among segments; individual lengths are not surveyed.
- Time uses 2.1 minutes/km, rounded with a two-minute minimum; it excludes waits,
  transfer delays, service hours and disruptions.
- Fare is `null`/unavailable. Use the
  [official fare checker](https://punemetrorail.org/fare_chart.aspx). Comparison
  budgets are not operator prices.
- Illustrative savings compare ₹8/km road with ₹2.5/km metro budgets. CO₂e
  compares 0.12 kg/km road with 0.04 kg/km metro. These are demo constants, not
  measured savings, lifecycle emissions, avoided car journeys or emissions credits.
  See [src/domain/metro.ts](src/domain/metro.ts).

## Storage, privacy and platform limits

AsyncStorage holds a versioned, **unencrypted**, device/browser-origin-local
snapshot. Clearing data removes it; another device, profile or origin will not
inherit it. No cross-tab sync or encrypted backup exists. Hydration and successful
persistence precede visible updates; errors are surfaced. Unreadable data stays
until explicit reset. Device-local does not mean secure against device access.

There are no background location uploads. Explicit sharing exports aggregate
summaries; tests check that routes, station names and dates are excluded. Behavior
depends on platform support. Recorded browser share tests used API stubs and sent
no external content. Native chooser completion is untested.

One codebase targets web, Android and iOS. Earlier browser and Android emulator
results are scoped in [TEAM_STATUS.md](TEAM_STATUS.md); physical phones and iOS
runtime remain untested in that handoff. Export success is not a device test;
there is no signed store release. Light theme is the current design. Dark mode,
localization, geographic maps and a full accessibility/device audit remain future
work. Accessible controls and responsive checks do not establish full conformance.

Earlier sprint notes reported upstream dependency advisories. This docs refresh
does not establish a current audit count or security clearance. Review compatible
patches before production; do not force an incompatible SDK change.

## What is not established

No adoption, retention, ridership lift, congestion reduction, measured emissions
impact, independent travel verification or production readiness is claimed.
The two-minute demo is a presentation budget; historical automated timings are
not human usability measurements. The supplied judging weights in
[SUBMISSION.md](SUBMISSION.md) are not scores or guarantees. Code-contradicting
claims are subject to credibility caps.

Future work includes trusted accounts/scoring, consent and abuse controls,
licensed geographic data, validated fare/environmental methodology, real
communities with moderation, secure export/deletion/backups and broader native
and accessibility testing. The Supabase SQL is an **unapplied draft**, not a
running backend or evidence that these capabilities exist.
