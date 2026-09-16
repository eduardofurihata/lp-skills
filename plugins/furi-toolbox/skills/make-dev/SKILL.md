---
name: make-dev
description: 'Use when the user types /make-dev — makes `make dev` the one command that runs this project: fresh clone, port conflicts, "another dev server is already running", Makefile updates, hot reload or auto-migrations that should just work, and Actions on the local self-hosted runner.'
disable-model-invocation: true
---

# /make-dev

One command — `make dev` — starts any local project with **hot reload live and migrations applied**, without conflicting with other projects.

## Contract — proven, never assumed

All three **with a real probe**: (1) **serving** on its deterministic port, from the process it launched; (2) **migrations applied**, zero pending, automatic; (3) **hot reload live**. Can't prove one → fix, re-prove.

**Modes:** *Create* · *Update* (patch via `Edit`, show the diff, never regenerate) · *Heal* (retry **once**, stop). Create/Update also wire CI.

## `make dev`, in order

1. **Free the port AND the dev-server lock, and prove both free.** They are independent: a `next-server` that got SIGTERM can close its socket and stay alive holding `.next/dev/lock` — the port says "free", the launch dies. Find the holder by **open fd on the lock file and by `cwd`** (never by the PID inside it — PIDs recycle), TERM → wait → KILL, prove nobody holds it. Never `pkill -f <pattern>`, never an ancestor of the killer, never `rm` the lock (it lives on the inode).
2. **Dependencies up and healthy** (real readiness probe, bounded retry).
3. **Migrations, automatic and idempotent** — tool detected from project files.
4. **Launch in watch mode** on the deterministic port; monorepo → every process concurrently. Detect failure from the **log line**, not process death — on a clash only the child dies. Clash → free again, relaunch **once**.
5. **Verify**, then the **links banner** — last thing on screen, one `Name → http://localhost:<port>` per user-facing service.

## Hot reload

The framework's watcher. In Docker/VM, both: source **bind-mounted**, not `COPY`, **and polling** when events don't propagate (`CHOKIDAR_USEPOLLING`, `WATCHPACK_POLLING`). `node_modules` out of mount and watcher.

## CI on the self-hosted runner

Every job: `runs-on: ${{ vars.RUNNER_LABEL || 'ubuntu-latest' }}` + `gh variable set RUNNER_LABEL --body self-hosted` — set = zero minutes, unset = hosted. **Prove the runner is online** (`gh api …/actions/runners`); missing → register as a service, asking first. **Private repos only.** The runner's env is not your shell — verify with a real run. Machine off = queued; `schedule:` and prod deploys may stay hosted.

## Verify

**Serving:** the listener descends from the launched PID (`/proc/<pid>/status` → `PPid`) — a response alone proves nothing. **Migrated:** zero pending. **Hot reload:** a real **edit-probe** — reversible change, recompile logged, revert. **CI:** `gh run view` names the runner.

## Heal

Read stderr, patch so the next `make dev` passes alone, retry once; unknown → report and ask. Fails despite a kill step → strengthen the proof, never "run `kill <pid>`". Nothing reloads → polling, mount or excluded dir. CI queued forever → no online runner; never revert to hosted.

Deterministic port per project, in the Makefile. **System tools**: print the install command, stop.
