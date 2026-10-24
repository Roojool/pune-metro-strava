# Known limitations

- Local demo only. No remote accounts, synchronization, real friends/city ranks,
  live communities, moderation, payments or ticket booking.
- Manually self-reported journeys are not verified travel. Cooldown and daily
  cap stop accidental spam, not malicious tampering. No GPS/background tracking.
- Station/open status is a snapshot of the official project profile checked
  2026-10-24. Range Hill cannot be boarded/exited. Planned extensions and depots
  are excluded. The 29 unique listed stations include unavailable Range Hill;
  there are 28 selectable unique stations. Operator counts may count the shared
  interchange once per corridor.
- Distance is proportional to official total corridor lengths: Purple 17.4 km,
  Aqua 15.7 km. Segment lengths are not surveyed. Approximate time is 2.1 min/km
  and does not include waiting, transfers, service hours or live disruptions.
- Fare is null/unavailable. Use the official fare checker. No invented fare is
  presented as an operator price.
- Illustrative savings compare road budget ₹8/km and metro budget ₹2.5/km.
  This metro comparison budget is not a fare. Estimated CO2e avoided compares
  0.12 kg/km road with 0.04 kg/km metro. These are demo assumptions, not measured
  lifecycle emissions or verified financial savings. No emissions credits.
- Only boarded/exited endpoints are collected, not all stations passed.
- Profile public/private is a local preference; nothing is actually published.
- AsyncStorage is device/origin local and unencrypted. Clearing app/browser data
  removes it. Storage failures block saves and show feedback; unreadable existing
  data is preserved until explicit reset. No cross-tab concurrency synchronization.
- Light theme is the sprint design. Dark mode, localization and full geographic
  maps are post-MVP.
- Android/iOS device testing and web browser results are recorded in TEAM_STATUS;
  platform support/export does not imply real-device testing.
- Initial npm audit reports 8 upstream advisories (5 high, 3 moderate) in Expo
  tooling/router transitive packages. No force downgrade or incompatible SDK
  upgrade is applied. Reassess patched compatible versions before production.

Post-MVP: Supabase Auth/Postgres with RLS; trusted scoring and abuse controls;
licensed route geometry and verified fare data; defensible environmental
methodology; opt-in detection with consent; moderation/reporting; real friends
and communities; privacy-preserving sharing; native accessibility/device matrix;
encrypted backups and account export/deletion. Supabase schema remains unapplied.
