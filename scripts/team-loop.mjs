import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const ROLES = {
  journey: { branch: 'feature/journey-tracking', folder: 'journey', prompt: '02-journey-tracking.md' },
  passport: { branch: 'feature/passport-stats', folder: 'passport', prompt: '03-passport-statistics.md' },
  leagues: { branch: 'feature/gamification', folder: 'leagues', prompt: '04-leaderboards-gamification.md' },
  community: { branch: 'feature/community-web', folder: 'community', prompt: '05-community-web.md' },
};
export function parseArgs(args) {
  const role = args[0];
  if (!Object.hasOwn(ROLES, role)) throw new Error('Usage: node scripts/team-loop.mjs journey|passport|leagues|community [--minutes 1..30] [--dry-run]');
  let minutes = 30; let dryRun = false;
  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--dry-run') dryRun = true;
    else if (args[i] === '--minutes') {
      minutes = Number(args[++i]);
      if (!Number.isFinite(minutes) || minutes <= 0 || minutes > 30) throw new Error('--minutes must be greater than 0 and at most 30.');
    } else throw new Error(`Unknown option: ${args[i]}`);
  }
  return { role, minutes, dryRun };
}
export function stageFor(pr) {
  if (!pr) return 'fix';
  if (pr.state === 'CLOSED') return 'blocked';
  if (pr.state === 'MERGED') return 'merged';
  const failed = (pr.statusCheckRollup ?? []).some(check => ['FAILURE', 'ERROR', 'TIMED_OUT', 'CANCELLED', 'ACTION_REQUIRED', 'STARTUP_FAILURE'].includes(check.conclusion ?? check.state));
  return failed || pr.reviewDecision === 'CHANGES_REQUESTED' ? 'fix' : 'waiting';
}
export function assertBranch(role, branch) {
  if (branch !== ROLES[role]?.branch) throw new Error(`Refusing branch ${branch}. ${role} requires ${ROLES[role]?.branch}. Never run this on main.`);
}
export function assertOwned(role, filenames) {
  const prefix = `src/features/${ROLES[role].folder}/`;
  if (filenames.some(name => name && !name.replaceAll('\\', '/').startsWith(prefix))) throw new Error('Shared or other-role files changed. Stop and report this blocker to the lead; do not revert another worker’s files.');
}
export function acquireLock(filename) {
  const handle = fs.openSync(filename, 'wx');
  fs.writeFileSync(handle, `${process.pid}\n`);
  let released = false;
  return () => { if (!released) { released = true; fs.closeSync(handle); fs.unlinkSync(filename); } };
}
export function syncBeforeSnapshot(git) {
  git('fetch', 'origin', 'main');
  git('merge', '--no-edit', 'origin/main');
  return git('rev-parse', 'HEAD');
}
function executable(name) {
  for (const directory of (process.env.PATH ?? '').split(path.delimiter)) {
    for (const extension of process.platform === 'win32' ? ['.exe', '.cmd', '.bat', ''] : ['']) {
      const candidate = path.join(directory, name + extension);
      if (fs.existsSync(candidate)) return candidate;
    }
  }
  return null;
}

export async function main(args = process.argv.slice(2)) {
  const { role, minutes, dryRun } = parseArgs(args);
  const spec = ROLES[role];
  const deadline = Date.now() + minutes * 60_000;
  const rtk = executable('rtk');
  const binaries = Object.fromEntries(['git', 'gh', 'codex', 'npm'].map(name => [name, executable(name)]));
  if (!binaries.git) throw new Error('Git is required.');
  function run(name, argv, { input, allowFailure = false, show = false } = {}) {
    let bin = binaries[name]; let commandArgs = argv;
    // Exact Git fields/filenames and gh JSON need raw output, not display filtering.
    const machineOutput = name === 'gh' || name === 'git' && ['branch', 'rev-parse', 'status', 'rev-list', 'diff'].includes(argv[0]);
    if (rtk && name === 'git' && !machineOutput) { bin = rtk; commandArgs = [name, ...argv]; }
    if (!bin) throw new Error(`${name} is not installed or not on PATH.`);
    if (/\.(cmd|bat)$/i.test(bin)) {
      const entry = name === 'codex' ? path.join(path.dirname(bin), 'node_modules/@openai/codex/bin/codex.js') : name === 'npm' ? path.join(path.dirname(bin), 'node_modules/npm/bin/npm-cli.js') : null;
      if (!entry || !fs.existsSync(entry)) throw new Error(`Unsupported ${name} command shim. Use the standard installed CLI; no shell fallback is attempted.`);
      bin = process.execPath; commandArgs = [entry, ...argv];
    }
    const result = spawnSync(bin, commandArgs, { input, encoding: 'utf8', shell: false, timeout: Math.max(1, deadline - Date.now()), maxBuffer: 16 * 1024 * 1024 });
    if (show) { process.stdout.write(result.stdout ?? ''); process.stderr.write(result.stderr ?? ''); }
    if (result.error || result.status !== 0 && !allowFailure) throw new Error(`${name} ${argv[0]} failed or timed out. ${result.error?.message ?? result.stderr ?? ''} Normal approval/authentication may require your attention; no bypass was attempted.`);
    return result;
  }
  const git = (...argv) => run('git', argv).stdout.trim();
  const branch = git('branch', '--show-current');
  assertBranch(role, branch);
  if (dryRun) {
    console.log(`DRY RUN: ${role} on ${branch}; own src/features/${spec.folder}/ only. Maximum 6 Codex calls / ${minutes} minutes. Read PR state, await lead merge, merge origin/main normally, then require npm run verify:e2e and no outstanding code. No agent, push, merge or E2E command was run.`);
    return;
  }
  for (const name of ['gh', 'codex', 'npm']) if (!binaries[name]) throw new Error(`${name} is required on PATH; install/authenticate it normally first.`);
  run('gh', ['auth', 'status']); run('codex', ['login', 'status']);
  const lockPath = path.resolve(git('rev-parse', '--git-path', 'metroquest-team-loop.lock'));
  let release;
  try { release = acquireLock(lockPath); } catch (error) { throw new Error(`Checkout lock unavailable at ${lockPath}: ${error.message}. Stop the existing editor/runner first; do not bypass its lock.`); }
  process.once('exit', release);
  const interrupted = () => { release(); process.exit(130); };
  process.once('SIGINT', interrupted); process.once('SIGTERM', interrupted);
  const repo = 'Roojool/pune-metro-strava';
  const getPR = () => {
    const raw = run('gh', ['pr', 'list', '--repo', repo, '--head', branch, '--state', 'all', '--limit', '20', '--json', 'number,url,state,headRefOid,statusCheckRollup,reviewDecision,updatedAt']).stdout;
    return JSON.parse(raw).sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))[0] ?? null;
  };
  const dirtyFiles = () => run('git', ['status', '--porcelain']).stdout.trimEnd().split('\n').filter(Boolean).map(line => line.slice(3).replace(/^"|"$/g, ''));
  const lastMessage = `output/team/${role}-last.txt`;
  fs.mkdirSync('output/team', { recursive: true });
  let calls = 0; let waitingVerified = false; let noPrVerified = false;
  function agent(reason, pr) {
    if (calls >= 6 || Date.now() >= deadline) return false;
    assertBranch(role, git('branch', '--show-current'));
    assertOwned(role, dirtyFiles());
    const before = syncBeforeSnapshot(git);
    const prompt = `Continue MetroQuest as ${role}. Read AGENTS.md, TEAM_STATUS.md and team-prompts/${spec.prompt}. Own ONLY src/features/${spec.folder}/** on ${branch}. The controller has already fetched and normally merged origin/main before recording your starting commit. Do NOT pull, fetch, merge, rebase, switch/checkout or change branches during this invocation, even if setup instructions in the team prompt mention them; the controller owns synchronization. Reason: ${reason}. PR: ${pr?.url ?? 'none'}. Deadline: ${new Date(deadline).toISOString()}. Do not invent features. Repair only owned integration blockers, run typecheck/tests/export and npm run verify:e2e when available. Check empty/error/mobile states and share privacy. Await repository mutations. Commit only owned files, push ${branch}, open/update a small PR to main if needed. NEVER self-merge, edit shared files, force-push, change dependencies, bypass approvals or claim success without actual browser E2E exit 0. Report shared blockers to the lead. After opening a PR, continue verification within this task rather than ending at PR creation. Stop within the remaining time and report honestly.`;
    calls++;
    run('codex', ['exec', '--sandbox', 'workspace-write', '--output-last-message', lastMessage, '-'], { input: prompt, show: true });
    assertBranch(role, git('branch', '--show-current'));
    assertOwned(role, git('diff', '--name-only', before, 'HEAD').split('\n').filter(Boolean));
    assertOwned(role, dirtyFiles());
    return true;
  }
  try {
    while (Date.now() < deadline) {
      assertBranch(role, git('branch', '--show-current'));
      const pr = getPR(); const stage = stageFor(pr);
      console.log(`${new Date().toISOString()} ${role}: ${stage} ${pr?.url ?? '(no PR)'}; ${calls}/6 agent calls.`);
      if (stage === 'blocked') throw new Error('PR was closed without merge. Stop and ask the lead; this is not a passing result.');
      let unchangedWithoutPr = false;
      if (!pr && noPrVerified && dirtyFiles().length === 0) {
        git('fetch', 'origin', 'main');
        unchangedWithoutPr = git('rev-list', '--count', 'origin/main..HEAD') === '0';
      }
      if (stage === 'merged' || unchangedWithoutPr) {
        assertOwned(role, dirtyFiles());
        git('fetch', 'origin', 'main');
        git('merge', '--no-edit', 'origin/main');
        const e2e = run('npm', ['run', 'verify:e2e'], { allowFailure: true, show: true });
        const outstanding = getPR();
        const sameTree = run('git', ['diff', '--quiet', 'origin/main', 'HEAD'], { allowFailure: true }).status === 0;
        if (e2e.status === 0 && outstanding?.state !== 'OPEN' && sameTree && dirtyFiles().length === 0) {
          console.log('PASS: actual npm run verify:e2e exited 0, with no open PR or unmerged/unsaved code.');
          return;
        }
        if (!agent(e2e.status === 0 ? 'E2E passed but unmerged or unsaved owned code remains; prepare the required PR and await lead integration' : 'Actual browser E2E failed; fix only owned failures and report shared blockers', pr)) break;
      } else if (stage === 'fix') {
        if (!agent('No PR yet, failing PR checks, or requested review changes; finish the smallest owned repair and report verification', pr)) break;
        if (!pr) noPrVerified = true;
      } else if (!waitingVerified) {
        if (!agent('PR awaiting lead integration: verify owned empty/error/mobile flows and share privacy once; do not add scope or self-merge', pr)) break;
        waitingVerified = true;
      } else {
        await new Promise(resolve => setTimeout(resolve, Math.min(30_000, Math.max(0, deadline - Date.now()))));
      }
    }
    throw new Error(`STOPPED: deadline or six-agent-call limit reached. No successful end-to-end completion was established. Last agent report: ${lastMessage}`);
  } finally {
    release(); process.removeListener('exit', release); process.removeListener('SIGINT', interrupted); process.removeListener('SIGTERM', interrupted);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(`BLOCKED: ${error.message}`); process.exitCode = 1; });
}
