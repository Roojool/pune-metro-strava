# Judge Q&A: likely questions, short honest answers

Rule for the team: **if the code doesn't do it, we don't claim it.** If you don't know an answer, say "we haven't built that yet" and move on.

**1. Are the leagues real? Who are these other riders?**
No. The other riders are sample profiles simulated on your device, and the screen says **SAMPLE / DEMO**. Your own XP and rank position are real local data. A live board needs accounts and a trusted backend, and that's the next step.

**2. How do you know someone actually took the ride? Is there GPS?**
We don't, and there's no GPS. Rides are logged by hand. We chose that deliberately for a hackathon build, and it also respects privacy because there's no background location tracking. A one-minute cooldown and a 10-rides-per-day cap prevent accidental duplicates. That won't stop someone who sets out to cheat. Real verification would need opt-in detection or ticketing data, which we don't have.

**3. Why Urban Mobility?**
The point is to get people riding the metro more often and trying stations they've never used, which is a behaviour-change problem in mobility. Pune has new metro lines, and they need people using them regularly. We used gamification and community to make the habit stick.

**4. What's the tech stack?**
Expo SDK 57, React Native Web and TypeScript. It's one codebase that runs on the web today and builds for Android and iOS. Data is stored on the device with AsyncStorage. No API keys, no backend. It has typecheck, domain tests and a browser smoke test, and it deploys to GitHub Pages.

**5. What's real and what's demo?**
Real, stored locally: your rides, XP, passport stamps, posts, likes and preferences. They survive a reload. Demo: league rivals and sample community identities. Estimated: distance, time and CO₂e. Not built: fares, GPS, ticketing and login.

**6. Where do the CO₂ and distance numbers come from?**
Distance is a proportional share of the official corridor lengths: 17.4 km for Purple and 15.7 km for Aqua. CO₂e and "savings" come from simple stated assumptions comparing road and metro. They're illustrative estimates, not measured emissions, and the app labels them that way.

**7. Where's the station data from? Why can't I pick Range Hill?**
The station names and open status come from a snapshot of the punemetrorail.org project profile taken on 2026-10-24. Range Hill isn't selectable in that build, so we excluded it rather than pretending it works.

**8. Why stamp only the boarding and exit stations?**
Because those are the stations you actually visited. Counting every station you passed through would make the passport meaningless. The fun is in getting off somewhere new.

**9. How did five people build this without stepping on each other?**
Each person had one lane: prathadox did Journey, chetanpujari5105 Passport, mangeshraut712 Leagues and atharvamhaske Community, while Roojool led integration. Everyone worked in separate feature folders, branches and PRs, and changes were merged one at a time. The repo history shows it.

**10. Is this feasible as a real product? What would you build next?**
The client side is already a real app. To go live we'd add accounts and a backend with proper access rules, trusted scoring and abuse controls, verified fare and route data, opt-in trip verification and community moderation. We'd also want to work with the operator. We haven't spoken to Pune Metro yet, and we're not claiming any partnership.

### Bonus: quick one-liners
- *"How many users do you have?"* None outside the team and testers. It's a hackathon prototype.
- *"Does it work on phones?"* The web demo works in a mobile browser, and it has been run on an Android emulator through Expo Go. We haven't tested it on a physical iPhone.
- *"Why no fares?"* We didn't want to show prices we can't verify, so the app links to the official fare checker.
