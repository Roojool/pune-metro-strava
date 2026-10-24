Developer 4 — leagues and gamification

Human: mangeshraut712
Branch: feature/gamification
Ownership: src/features/leagues/** only. Required export: LeaguesScreen.tsx, default React component.

Build XP overview, level progress, unlocked/locked achievements, rolling 7-day challenge, consistency/streak indicators, friends/Pune/route demo league selectors, sorted leaderboard including current user. Use shared achievements/challenges and domain rankLeaderboard. Create clearly labeled sample identities in feature-local fixture file. Current score must update immediately after recording a ride. Celebrate eligible milestones with a simple visual card. Explain one-minute logging cooldown, ten-rides/day cap and self-reported scoring.

Complete standalone instructions: https://github.com/Roojool/pune-metro-strava/blob/main/team-prompts/04-leaderboards-gamification.md

Acceptance: typecheck, domain tests and web export pass; demonstrate affected flow; sample labels/accessibility retained; no edits outside ownership. Deadline: 2026-10-24 14:50 IST (optional feature freeze). Shared contracts freeze 14:18 IST. AI reservations are released; merge latest main and continue only within your owned folder.

Out of scope: Do not duplicate or modify XP/achievement/anti-abuse calculations, edit root navigation or shared files, claim real citywide rankings, add backend competition or elaborate animation dependencies.
Fallback: A correctly sorted sample leaderboard plus current XP, achievements and one shared challenge is enough.

