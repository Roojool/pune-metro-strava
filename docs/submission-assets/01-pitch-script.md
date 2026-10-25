# MetroQuest · Pune — Pitch + Live Demo Script

**Make every ride count.**
Live demo: https://roojool.github.io/pune-metro-strava/
Repo: https://github.com/Roojool/pune-metro-strava

> Before going on stage: open the live demo in a fresh browser profile (or use **Profile → two-step reset**) so Home shows 0 rides / 0 XP. Keep the tab open on **Home**. Don't log a test ride in the last minute before you present, because there's a one-minute cooldown between logs.

---

## 60-second pitch (speaker: Roojool)

> Pune Metro now runs two lines, Purple and Aqua. But riding it is a bit of a chore. You tap in, you tap out, and nothing about the trip stays with you.
>
> Runners and cyclists have Strava. Every run counts for something: a streak, a badge, a friend cheering you on. We asked why a metro ride can't feel like that.
>
> MetroQuest is a metro passport for Pune. You log a ride, and the station you boarded at and the one you got off at go into your passport as stamps. You earn XP, keep a streak and talk with other riders on your line.
>
> There are five of us, and each person built one part: Journey, Passport, Leagues and Community, plus integration. It's one Expo app written in TypeScript. It runs on the web today and builds for Android and iOS. It needs no API keys and keeps everything on your device.
>
> Here's what's real and what isn't. Your rides, stamps and posts are real local data. The league rivals are sample profiles, and we label them that way in the app. Distances and CO₂ figures are estimates. We'd rather show you something honest that works than a fake city leaderboard.
>
> Let me show you.

*(~140 words, about 55–60 seconds at a relaxed pace.)*

---

## 2-minute live demo (driver clicks, speaker talks)

| # | Time | Click path | What to say |
|---|------|-----------|-------------|
| 1 | 0:00–0:15 | Live demo open on **Home** | "This is a fresh install, so it shows zero rides and zero XP. Home is your activity feed. The route on it is a schematic of the Pune Metro network, not GPS." |
| 2 | 0:15–0:40 | Tap **Log a ride** → leave the default **PCMC → Civil Court** → point at the estimate line and the "Journey at a glance" card | "Logging is manual. You pick the station you boarded at and the one you exited at. PCMC to Civil Court is already filled in. The app shows an estimated distance and time based on the official corridor lengths. We don't calculate fares, so this button sends you to Pune Metro's official fare checker instead." |
| 3 | 0:40–0:50 | Tap **Confirm journey** → back to **Home** | "Confirm. The save completes, and Home now shows one ride. Your first ride is worth 50 XP: 10 for the ride and 20 for each new endpoint station." |
| 4 | 0:50–1:10 | Tap **Passport** tab | "This is the passport. PCMC and Civil Court are stamped. The stations you passed through in between aren't, because you didn't get on or off there. The stats on this screen are estimates, and the app says so." |
| 5 | 1:10–1:30 | Tap **Leagues** tab → point at the **SAMPLE / DEMO** pill → scroll to **How XP works** | "Leagues. My XP and the First stop achievement have updated. The other riders are sample profiles running on this device, and the pill says that clearly. This is not a live Pune leaderboard. If we had real accounts, this is the screen that would plug into them." |
| 6 | 1:30–1:50 | Tap **Community** tab → select **Purple Line** → type *"First ride logged: PCMC to Civil Court!"* → **Post locally** → like it | "Community is organised by line. I'll post on Purple Line and like it. Nothing leaves this device. The button says 'Post locally' for that reason." |
| 7 | 1:50–2:00 | **Reload the browser tab** → show Home / Community again | "Now I'll reload the page. The ride, the stamps, the post and the like are all still there, because they're stored with AsyncStorage. That's MetroQuest: make every ride count. Questions?" |

### If something goes wrong
- **"Wait a minute" message on Confirm:** that's the one-minute duplicate-ride cooldown working. Say so and carry on with the Passport tab.
- **Wi-Fi drops:** run `npm run web` locally (http://localhost:8081). Keep a screen recording ready as a backup.
- **Already has data:** go to Profile and use the two-step reset, or just demo with the existing rides and mention it.

### Lines to avoid on stage
- "Thousands of riders" / "live city leaderboard" / "tracks your trip automatically". None of these are true.
- "Saves X kg of CO₂". Say "estimated CO₂e based on demo assumptions" instead.
