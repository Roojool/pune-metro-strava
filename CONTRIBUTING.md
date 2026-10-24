# Contributing to the public demo sprint

Accept your GitHub invitation. Read README, AGENTS, TEAM_STATUS and your complete
team-prompts file. Keep your assigned branch and only edit owned files.

```sh
git clone https://github.com/Roojool/pune-metro-strava.git
cd pune-metro-strava
git fetch origin
git switch feature/YOUR-ASSIGNED-BRANCH
git merge origin/main
npm ci
npm run web
```

Only Developer 1 changes shared code, package configuration, routes and CI. Human
feature owners and AI helpers never simultaneously own the same files. Check
the active reservations in TEAM_STATUS before editing. Give every concurrent
AI worker a separate worktree/branch and disjoint file list; do not reuse one
working tree. AI branches are ai/*; humans keep feature/*.

Await repository mutations; show errors. No direct AsyncStorage writes in
features, duplicated domain models, secrets, real commute data in screenshots,
fabricated verified travel or unlabeled sample profiles. No force pushes or
direct main pushes by feature workers. Preserve validation and accessibility.

Before a PR: npm run typecheck, npm test, npm run export:web. Record real results,
affected demo flow and limitations. Commit only owned files. Push your feature
branch and open a PR to main with --body-file for a multiline description.
Lead reviews diffs/checks and squash merges sequentially. Do not bypass failures.

If blocked >5 minutes, report exact error/command/file and smallest requested
shared change in your issue. Stop optional features at minute 70.

## Four collaborators

Assigned in supplied order: prathadox (2), chetanpujari5105 (3), mangeshraut712 (4),
atharvamhaske (5). Invitations require acceptance by each user. If an invitation
fails, a lead with repository admin access may retry:

```sh
gh api -X PUT repos/Roojool/pune-metro-strava/collaborators/USERNAME -f permission=push
```

Never create another repo just because authentication or a permission is missing.
Repository is public by revised user instruction. Real backend/security/moderation work is post-MVP.
