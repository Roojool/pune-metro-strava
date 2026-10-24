# DevDay Loops House submission

The fields below are ready to paste. Supporting judging notes follow the copy.

## Title

MetroQuest Pune — Make Every Metro Ride Count

## Short pitch

Turn a self-reported Pune Metro ride into a station passport and personal XP.
MetroQuest combines manual journey logging, endpoint stamps, sample leagues and
local route discussions to explore a more engaging everyday transit habit.

## Detailed description

MetroQuest Pune is an Urban Mobility prototype that makes personal metro travel
visible through progress and station discovery. It connects a manually logged
ride to a passport, achievements and route-themed community interactions. The
idea is to encourage curiosity and repeat engagement with public transport; we
have not measured a change in ridership, retention, congestion or emissions.

The working demo starts on Home. Log PCMC to Civil Court manually, then open
Passport to see the boarding and exit stations collected. Shared application
state updates journey totals, personal XP, achievements and challenges. Leagues
shows the current user's local score beside clearly labeled SAMPLE / DEMO
profiles. Community supports local posts, reactions and joining route groups.
Reloading the same browser origin preserves successful saves, demonstrating a
complete local interaction loop without an account or external API key.

One Expo SDK 57, React Native, TypeScript and Expo Router codebase targets web,
Android and iOS. Shared models and calculations keep scoring and station
collection consistent; AsyncStorage persists the device-local snapshot. The
public web demo is available. The recorded handoff includes browser checks and
an earlier Android emulator pass; physical-phone and iOS runtime testing are
not claimed.

All journeys are self-reported, not independently verified. Maps are schematic;
distance, time, savings and CO₂e are estimates or illustrative assumptions, not
measured impact or operator fares. Only boarding and exit stations count as
stamps. Other riders, rankings and seeded posts are sample data. There is no
live social network, remote account sync, ticketing or background location
tracking. Sharing is an explicit aggregate-summary action. This is a working
prototype, not a production transit service or an operator-endorsed product.

## Track

Urban Mobility

## Repository

[github.com/Roojool/pune-metro-strava](https://github.com/Roojool/pune-metro-strava)

## Live demo

[roojool.github.io/pune-metro-strava](https://roojool.github.io/pune-metro-strava/)

## Demo path

**Home → Log PCMC→Civil Court → Passport → Leagues → Community → reload**

Use fresh local state for the expected first-ride result: 1 journey, 2 endpoint
stamps and 50 XP. In Community, choose Purple Line, add a clearly marked demo
post and react before reloading. The selector displays Civil Court as
**Civil Court (District Court)**. Follow the [two-minute script](DEMO_GUIDE.md);
two minutes is a presentation budget, not a measured user-performance claim.

## Team

- Roojool — lead and integration.
- prathadox — Journey.
- chetanpujari5105 — Passport.
- mangeshraut712 — Leagues.
- atharvamhaske — Community.

## Judging notes and evidence

The supplied DevDay Loops House rubric weights are **Technical 30 / Innovation
25 / Track Fit 25 / Execution 20**. These are judging weights, not self-awarded
scores. Claims that contradict code are subject to credibility caps; do not
invent cap thresholds, adoption metrics or impact results.

- **Technical — 30:** shared typed models/calculations, awaited local mutations,
  validation, failure feedback and reload persistence. See
  [ARCHITECTURE.md](ARCHITECTURE.md) and [test evidence](TEAM_STATUS.md).
- **Innovation — 25:** a transit passport, personal progress and route-themed
  sample social interactions. Novelty and behavioral impact are hypotheses,
  not independently established results.
- **Track Fit — 25:** Pune Metro station exploration and a repeat-transit-habit
  concept, with no claim of demonstrated traffic or emissions reduction.
- **Execution — 20:** a public demo, consistent presentation path, merged work,
  screenshots and documented test scope. Build/deployment checks and earlier
  runtime results are recorded separately.

Leagues #16/#24/#31 and README screenshots #21 are merged, along with later Journey,
Passport and Community fixes in [TEAM_STATUS.md](TEAM_STATUS.md).
[KNOWN_LIMITATIONS.md](KNOWN_LIMITATIONS.md) defines the real/sample/estimate
boundary. [LICENSE-NOTE.md](LICENSE-NOTE.md) preserves all-rights-reserved status.
This prepares submission copy; it does not claim a form has been submitted or
that the project meets undisclosed event requirements.
