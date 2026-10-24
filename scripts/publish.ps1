# Repository is already private and published. This helper only reports status.
$ErrorActionPreference = 'Stop'
gh repo view Roojool/pune-metro-strava --json url,isPrivate,defaultBranchRef
if ($LASTEXITCODE -ne 0) { throw 'Authenticate with gh auth login or check repository access.' }
Write-Output 'See CONTRIBUTING.md for invitations and the five existing feature branches.'
