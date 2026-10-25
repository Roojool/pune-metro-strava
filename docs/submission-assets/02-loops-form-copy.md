# Loops House submission form: paste-ready copy

## Title
MetroQuest · Pune

## Tagline
Make every ride count.

## Track
Urban Mobility

## Links
- **Live demo:** https://roojool.github.io/pune-metro-strava/
- **Repo:** https://github.com/Roojool/pune-metro-strava

## Short pitch (1–2 sentences)
MetroQuest is a Strava-style passport for Pune Metro. You log a ride, collect a stamp for the station you boarded at and the one you exited at, earn XP and talk with other riders on your line. It's one Expo app with no API keys, and all your data stays on your device.

## Detailed description

**The problem.** Pune Metro's Purple and Aqua lines are open, but nothing gives riders a reason to keep using them, try a new station or feel part of a community of riders. Fitness apps made runs and rides rewarding. Public transit has nothing like that.

**What we built.** MetroQuest · Pune is a working prototype with five sections:
- **Home:** your activity feed, ride totals and a schematic route view.
- **Log a ride:** a quick manual log from boarding station to exit station. PCMC → Civil Court is the default. It shows an estimated distance and time, and links to Pune Metro's official fare checker for real fares.
- **Passport:** station stamps for the stations where you boarded and exited. Stations you only passed through don't count. It also shows estimated stats.
- **Leagues:** XP, levels, achievements and a "How XP works" explainer, set against a **sample** league board.
- **Community:** discussion spaces for each line (for example Purple Line), where you can post and react locally.

**Tech.** Expo SDK 57, React Native Web and TypeScript. There's one codebase for web, Android and iOS. No API keys are needed. Data is stored locally with AsyncStorage, so rides, posts, reactions and preferences survive a reload. A one-minute cooldown and a cap of 10 rides per day stop accidental duplicate logs. The app has typecheck, domain tests and a browser smoke test, and it deploys to GitHub Pages.

**Being honest about what this is.**
- The leagues and the other rider identities are **SAMPLE / DEMO**. They're a local simulation, not a live Pune leaderboard, and the app labels them that way.
- Distances, times and CO₂e figures are **estimates** from stated assumptions, not measurements. We don't calculate fares.
- There's **no GPS, ticketing or authentication**. Rides are self-reported.
- Station names come from a punemetrorail.org project-profile snapshot taken 2026-10-24. **Range Hill can't be selected.**

**Team.** Roojool (lead and integration), prathadox (Journey), chetanpujari5105 (Passport), mangeshraut712 (Leagues), atharvamhaske (Community).

**What's next.** Real accounts and a trusted backend, so leagues and communities can go live. Opt-in trip verification with the rider's consent. Verified fare and route data. Moderation.
