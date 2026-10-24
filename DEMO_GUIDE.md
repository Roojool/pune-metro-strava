# MetroQuest demo guide

## Start locally

```sh
npm ci
npm run typecheck
npm test
npm run web
```

Open the URL printed by Expo (normally http://localhost:8081). For a reproducible
static demo, npm run export:web then serve dist/ with a static server. Keep the
same URL/port to preserve browser storage. No API keys required.

## Two-minute story

1. Start on Home. Fresh installations begin with zero journeys and XP.
2. Tap Log a ride. Default origin PCMC and destination Civil Court are ready;
   choose/search different open stations if desired.
3. Confirm journey. The save is awaited, Home total rises, and first ride earns
   50 XP (10 ride + 20 for each new endpoint).
4. Open Passport: PCMC and Civil Court are collected. Intermediate stations are
   route context, not falsely collected. Inspect estimated statistics.
5. Open Leagues: current XP/ranking and First stop achievement update. Other
   identities are sample profiles; this is not a live city leaderboard.
6. Open Community → Purple Line. Create a sample local post and react to it.
7. Reload/restart the same app. Journeys, posts, reactions and preferences remain.

One-minute logging cooldown prevents accidental duplicates; maximum 10 rides
per UTC day. These local checks do not verify physical travel or resist device
tampering. Use Profile’s explicit two-step reset only when you want a clean demo.

## Android

Install SDK-57-compatible Expo Go from https://expo.dev/go (or current store build
if it supports 57). Run npm run start, connect phone and computer to the same
Wi-Fi, and scan Expo’s QR. Allow local-network access. If using an Android
emulator, start it in Android Studio and press a in Expo CLI. No signed build needed.
If the SDK mismatch message appears, install the matching client rather than
silently changing project versions. Run the critical flow on the actual device.

## iOS

On this Windows machine use a physical iPhone with SDK-57-compatible Expo Go;
scan the QR with Camera on the same Wi-Fi. Expo Go distribution can differ during
SDK transitions: check https://docs.expo.dev/troubleshooting/expo-go-version-mismatch/.
If the store client does not support 57, use the official matching TestFlight/eas
go route or a development build; it may require Apple developer access and is
not a sprint blocker. The iOS simulator requires macOS/Xcode. Do not claim iPhone
testing until a real iPhone has run the flow.

## Web deployment

npm run export:web produces dist/. Upload that folder to a static host (for
example an existing authorized Vercel/Netlify project). No deployment credentials
are required for the tested local demo. Use HTTPS for external sharing. Storage
is per origin, so local history will not appear on a different hosted URL.
External publishing is optional and should never delay the working demo.
