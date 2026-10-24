# MetroQuest integration board

Lead-owned snapshot, 2026-10-24 16:15 IST. Fetch origin/main and inspect live
GitHub PR/check status before acting; this file does not lock remote agents.

The app is live at https://roojool.github.io/pune-metro-strava/ and baseline
demo-v0.1 is preserved. Hosted E2E and Android emulator verification passed.
Optional product scope is frozen. Current work is integration and reliability.

| Workstream | Owner | Published status | Next action |
| --- | --- | --- | --- |
| Lead/shared | Roojool, this session | Continuation tooling #20 and browser gate #25 merged | Review and integrate exact passing heads; verify release |
| Journey | prathadox | PR #23 reviewed and merged as 3d5e3e2 | Sync main and run integrated E2E |
| Passport | chetanpujari5105 | First-ride card reviewed and merged through lead-opened upstream PR #26 | Sync main and run integrated E2E |
| Leagues | mangeshraut712 | PR #16, #24 and README/screenshots PR #21 merged | Sync main and run integrated E2E |
| Community | Lead-authorized AGY Gemini 3.8 Flash (High) helper | No new Atharva branch commits found; helper running in ai/community-gemini | Verify/fix only src/features/community/** and submit evidence |

Community is temporarily reserved to the named helper by the user's explicit
request. It has a separate worktree and cannot edit shared files or Atharva's
branch. If Atharva resumes, coordinate with the lead before editing that feature.
The five human roles remain defined; this helper does not impersonate a teammate.

Three independent helpers reviewed/watched work in parallel. Main merges are
sequential and tied to exact reviewed head commits with successful required CI.
Do not repeatedly add cosmetic commits while a ready PR is being reviewed.
Continue read-only QA during that window; push concrete fixes when needed.

Every teammate uses its assigned prompt and ownership. After merge, synchronize
normally and run npm run verify:e2e. Failure means fix within ownership or report
a shared blocker. PR creation and a green unit-test job alone do not mean E2E PASS.
