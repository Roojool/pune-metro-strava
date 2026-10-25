## Problem and resulting behavior

Describe the change, its Urban Mobility demo relevance and corrected claims.
Keep SAMPLE / DEMO and estimate labels explicit.

## Scope and ownership

List exact owned paths, branch and linked issue. State whether this is docs-only.
Shared state/models/navigation/configuration changes require lead approval.

## Validation actually performed

- [ ] `npm run typecheck`
- [ ] `npm test`
- [ ] `npm run export:web`
- [ ] Documentation links and scope checked, when applicable
- [ ] Browser flow checked, when applicable: Home → Log PCMC→Civil Court → Passport → Leagues → Community → reload

Record outcomes and tested commit/platform; unchecked means not performed.
Integration requires `npm run verify:e2e` after merge and synchronization.
A PR or build alone is not merged E2E completion. A bounded docs-only assignment
may finish at the PR URL without a continuation loop.

## Evidence and limitations

Link screenshots/results, distinguish historical tests from this run, and state
native/browser gaps. No invented usage metrics, verified travel, real city ranks,
operator fares or measured savings/emissions. See
[submission boundaries](https://github.com/Roojool/pune-metro-strava/blob/main/SUBMISSION.md)
and [limitations](https://github.com/Roojool/pune-metro-strava/blob/main/KNOWN_LIMITATIONS.md).

## Delivery boundary

Name concrete follow-up owners. Do not self-merge or force-push. Preserve requested
authorship and omit unrequested co-author trailers.
