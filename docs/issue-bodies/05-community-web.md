Developer 5 — community, social and web

Human: atharvamhaske
Branch: feature/community-web
Ownership: src/features/community/** only. Required export: CommunityScreen.tsx, default React component. Web polish is limited to this feature; send shared-layout suggestions to Developer 1.

Polish Purple/Aqua/Pune community selection and route discussion view. Show clearly labeled sample posts, create a local post, react/unreact, join/leave and display helpful save/error states. Use shared posts, joined, addPost, toggleLike and toggleCommunity. Trim/validate post text, 1–500 characters. Show commuter identity initials and clear demo labels. Make the feature usable at 390px and 1440px, with clear touch targets and explicit Share action for a privacy-conscious social summary.

Complete standalone instructions: https://github.com/Roojool/pune-metro-strava/blob/main/team-prompts/05-community-web.md

Acceptance: typecheck, domain tests and web export pass; demonstrate affected flow; sample labels/accessibility retained; no edits outside ownership. Deadline: 2026-10-24 15:08 IST (optional feature freeze). Shared contracts freeze 14:18 IST. See TEAM_STATUS.md for AI reservations; never edit a reserved feature until lead handoff.

Out of scope: No edits to profile, Home, sidebar, shared UI, package config, data fixtures outside owned folder, state, navigation, moderation service or live chat. No claims of real connected users.
Fallback: Keep the local Purple Line feed, composer and reactions. Reuse shared cards/buttons instead of custom social features.

