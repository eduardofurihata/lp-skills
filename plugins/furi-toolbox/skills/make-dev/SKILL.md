---
name: make-dev
description: 'Use when the user types /make-dev — makes `make dev` the one command that runs this project. Covers a freshly-cloned project''s first run, port conflicts (EADDRINUSE / "address already in use"), a dev server that refuses to start with "another dev server is already running" (a framework lock held by a leftover process), a Makefile that needs updating after the project gained services or dependencies, hot reload or auto-migrations that are not working and should be set up so the next run just works, and running the repo''s Actions on the local self-hosted runner instead of burning GitHub-hosted minutes.'
disable-model-invocation: true
---

# /make-dev

One command — `make dev` — to start any local project with **hot reload live and migrations already applied**, without conflicting with other projects on the same machine. After it runs, editing any source file shows up in the running app/screen, and the DB schema is current — with **zero extra commands**. No `migrate`, no manual restart, no second terminal.

## Outcome contract (non-negotiable)

`make dev` is done only when **all three** hold and are **proven**, not assumed:

1. **App is serving** on its deterministic port.
2. **Migrations applied** — zero pending, schema current. Ran automatically inside `make dev`, never by hand.
3. **Hot reload live** — a change to any watched source file reaches the running app without re-running `make dev` or anything else.

If any of the three can't be proven, **fix the setup and re-prove** — never hand back a half-working `make dev`. "Hot reload works by default" and "the migrate command exited 0" are not proof; verify each with a real probe (see Verify).

## Modes (auto-detected)

- **Create** — no Makefile → write one that satisfies the outcome contract.
- **Update** — Makefile exists but the project changed (new service, migration tool, or missing watch/migrate step) → patch in place, never regenerate (preserves customizations).
- **Heal** — last `make dev` failed, or hot reload / migrations aren't working → diagnose, patch, retry **once**, then stop.

Create and Update also wire the repo's CI to the self-hosted runner (see CI runner) — same trip, one less thing burning money.

## What `make dev` must do, in order

1. **Free the port AND the framework's dev-server lock — and verify both are free** (see Principles) before binding. They are independent resources: a free port proves nothing about the lock.
2. **Bring up dependencies** (DB, cache, queues — via compose or equivalent) and **wait until each is actually healthy**, not just started. Migrating a DB that's still booting fails — poll readiness (healthcheck, `pg_isready`, a real connection probe) with a bounded retry.
3. **Run migrations automatically** — idempotent, every run. Detect the tool from project files; run its "apply pending" command. Seed only when the DB is empty (optional).
4. **Launch the app in watch mode** on the deterministic port. Full-stack/monorepo → run every watched process (frontend + backend) concurrently so a change anywhere reloads. Detect a failed launch from the **log line**, not from process death: on a port/lock clash only the framework's child exits (Next: `next-server`), while the `pnpm`/`next dev` parent stays alive with no server — waiting for it to die waits the whole timeout. If the log shows the port or lock taken (`EADDRINUSE`, "already running"), run the same free-port + free-lock steps and relaunch **once**: the window between step 1 and this step (DB up, migrations, seed) is long enough for another terminal to take the port.
5. **Verify the outcome contract** and report what was proven.
6. **Print the links banner** — the final output: a boxed list of every user-facing service and its URL (see Links banner).

## Hot reload

A running watcher is necessary but not sufficient — it silently fails to see edits in common setups. Make it actually fire:

- **Use the framework's watch mechanism**: dev-server HMR (Vite, Next, etc.) for frontends; a restart-on-change runner for backends (`--watch`, nodemon, ts-node-dev, `air`, `watchexec`, `uvicorn --reload`, spring-boot-devtools, …).
- **Containers break native file events.** If the app runs in Docker/a VM, both must hold or edits never reach the watcher: (a) source is **bind-mounted**, not baked in with `COPY`; (b) **enable polling** when host→container FS events don't propagate (`CHOKIDAR_USEPOLLING=true`, `WATCHPACK_POLLING=true`, framework `--poll`, or the tool's equivalent).
- **Don't overmount or overwatch.** Keep `node_modules`/build output out of the bind mount (anonymous volume) and excluded from the watcher — otherwise installs break and watching crawls.

## Migrations

- **Auto-applied by `make dev`**, after the DB is healthy, before (or as) the app boots. The user never types a migrate command for the local env to work.
- **Detect the tool from project files** (Prisma, Drizzle, Knex, TypeORM, Sequelize, Alembic, Django, Rails/ActiveRecord, Flyway, Liquibase, golang-migrate, …) and run its idempotent "apply pending" command.
- **Idempotent**: a second `make dev` with nothing pending is a no-op, not an error.

## CI runner (self-hosted)

A push shouldn't cost money. If the repo has `.github/workflows/`, every job runs on **this machine's self-hosted runner**, not on GitHub-hosted minutes.

**One switch, all workflows.** Every job's `runs-on` is the same expression, never a hardcoded image:

```yaml
runs-on: ${{ vars.RUNNER_LABEL || 'ubuntu-latest' }}
```

with the repo variable `RUNNER_LABEL=self-hosted` (`gh variable set RUNNER_LABEL --body self-hosted`). Set → every workflow lands on the local runner, zero minutes. Unset → hosted fallback, so a fresh clone, another machine, or a collaborator without the runner still gets green CI. Flipping the variable inverts the whole repo without touching a file.

**The runner has to exist and be online** — a label pointing at nothing means jobs queue forever, silently. Prove it: `gh api repos/{owner}/{repo}/actions/runners` shows a runner `online` whose labels include the one you set. Missing → register it (`./config.sh --url <repo-url> --token <registration-token>`, then `./svc.sh install && ./svc.sh start` so it survives reboot). Installing a system service needs explicit consent — ask, same as any system tool.

**Non-negotiables before flipping the switch:**

- **Private repos only.** A self-hosted runner executes whatever a workflow says, on the user's actual machine. Never on a public repo, and never where `pull_request` from forks can reach it.
- **The runner's env is not your shell.** A systemd runner starts from a bare environment — node/nvm, Docker, language toolchains must resolve there, or CI fails with "command not found" while it works in your terminal. Verify with a real run, not by reasoning about PATH.
- **Machine off = job queued, not failed.** Fine for push CI; think twice for `schedule:` workflows and prod deploys that must fire at 3am. Those may deliberately stay hosted — say so in a comment on the job, don't leave it to be rediscovered.

**Update mode:** a new workflow file arrives with the same `runs-on` expression as the others. A hardcoded `ubuntu-latest` anywhere is a leak — patch it.

## Verify (prove the outcome, don't trust flags)

Same ethos as freeing the port — prove each contract item with a real probe:

- **Serving**: hit the port (HTTP/health) and get a real response **from the process `make dev` launched** — walk the listener's parent chain (`/proc/<pid>/status` → `PPid`, not field 4 of `/proc/<pid>/stat`: a `comm` like `next-server (v16.3.0)` has a space and breaks the positional split) up to the launched PID. A response alone is not proof: on a dirty machine the *old* server answers the health check in the same second the new one dies on the lock, and `make dev` prints "serving" with a PID file pointing at a corpse — the next `make down` kills nothing.
- **Migrated**: run the tool's status/"current" check and assert **zero pending** — don't trust that apply "probably" ran.
- **CI runner** (when workflows exist): after the next push, `gh run list` → `gh run view <id>` and read which runner picked the job up. Job on the local runner = wired. Job on `ubuntu-latest`, or queued with nothing consuming it, = not wired; fix and re-check.
- **Hot reload**: do a **real edit-probe** — make a trivial, reversible change to a watched source file, confirm the dev server logs a recompile/HMR/restart within a few seconds, then **revert** it. No recompile observed → hot reload is not working; fix the cause (polling? bind mount? excluded dir?) and re-probe. A watcher that printed "ready" is not proof; an observed reload is.

## Links banner (final output)

The **last** thing `make dev` prints — after the contract is verified, never at the start or buried mid-log — is a boxed list of every service a person actually opens, one `Name → URL` per line, so the user can copy the link and go.

```
┌─────────────────────────────────────────┐
│  Nivee Web → http://localhost:3700      │
│  Nivee API → http://localhost:3701      │
│  Evolution → http://localhost:8280      │
└─────────────────────────────────────────┘
```

- **User-facing services only** — web apps, APIs, admin UIs, dashboards, dev tools. Omit raw DB/cache/queue ports nobody opens in a browser.
- **URLs use the deterministic localhost port** each service binds — same determinism as the rest of the skill.
- **Gate it on readiness.** Print once services are confirmed serving. If the watcher holds the foreground and would scroll the banner away, print after the servers report ready (or run the watcher detached and tail its logs below the banner) — the banner must survive as the last thing on screen.
- **Update mode:** a new service means a new line; keep names and ports in sync with what actually binds.

## Principles

- **Deterministic port per project.** Same project → same port, always. Pick from a range that avoids common dev defaults and the OS ephemeral range.
- **Free the port — and verify, don't just detect.** Process-listing tools aren't all equal: some miss wildcard, dual-stack, or child-process binds. After the kill step, **prove** the port is free (a different tool, or a real bind probe) before launching. Can't free it → report and stop, don't proceed to a doomed bind.
- **Free the framework's dev-server lock, not just the port.** Modern dev servers take an OS-level exclusive lock on a file besides binding the port — Next.js ≥ 16.3: `.next/dev/lock` (JSON with `pid`, `port`, `appUrl`), held by the `next-server` child; a second `next dev` dies with "Another next dev server is already running" and prints the PID. The two are independent: a process that got SIGTERM from the free-port step can close its socket and **stay alive holding the lock** — the port probe honestly reports "free" and the launch dies on the lock (seen: a `next-server` 46 minutes old, no port, lock in hand). So the free step also finds the holder and kills it (TERM, wait, KILL), and **proves** it: no process has the lock file open, no dev process of this project is alive.
- **Identify the holder by open file descriptor and by `cwd`, never by the number inside the lock file.** `/proc/<pid>/fd` → the lock path is the direct proof of who blocks; processes whose `cwd` is this project and whose cmdline is the framework's dev process catch what the file doesn't yet record (the parent that outlives its child, a server mid-startup). The PID written in the file is a record, not a guarantee — PIDs are recycled. The `cwd` cut is what keeps the neighbour project's dev server alive on the same machine.
- **Three things the kill step must never touch:** a process by `pkill -f <pattern>` (the shell running the recipe carries the pattern in its own cmdline — it has killed the shell); any **ancestor of the killer** (a make recipe's shell has the whole recipe line, `… nohup pnpm exec next dev …`, in its cmdline and the project as `cwd` — the first version of this step terminated its own `make` mid-sentence); and the **lock file itself** (`rm` is the recipe for two servers: the lock lives on the inode, a server that holds it keeps it after the name is gone, and the next launch creates a new inode, acquires "the" lock and runs alongside). A leftover lock file with no holder blocks nothing — the OS released it when the holder died.
- **Detect the stack from project files** and use the framework's standard dev command, passing the port explicitly (a CLI flag beats an env var).
- **Project-local deps:** install when missing. **System tools** (Docker, package managers, runtimes): print the install command and stop — never install system-wide without explicit consent.
- **Idempotent.** Re-running shouldn't duplicate Makefile entries, restart healthy services, or re-run applied migrations.

## Heal

Read stderr. Diagnose. Patch so the next reboot + `make dev` satisfies the full outcome contract without re-invoking the skill. Retry **once**. Never loop. Unknown error → report verbatim and ask, don't guess.

- `make dev` **fails despite a kill step** → the kill step isn't verifying the port is free; strengthen the verification, don't add retries.
- `make dev` **dies on "Another … dev server is already running" right after the port was reported free** → the free step only looks at the port; add the lock-holder kill (see Principles) and prove the holder is gone. Don't tell the user to run the printed `kill <pid>` — that is the step's job, every run.
- The launch step prints "serving" but the **PID file points at a dead process** (`make down` later kills nothing, or two servers turn up) → the serving probe checks the port, not identity; require that the listener descends from the launched PID (see Verify).
- The launch **hangs for the full timeout** after a port/lock clash → it is waiting for the launched process to die, and only the child died; read the log for the error line instead.
- **Hot reload doesn't fire** despite a running watcher → the watcher isn't seeing edits (no polling / no bind mount / dir excluded); fix the watch path, don't tell the user to restart manually.
- **Migrations didn't apply** → they were never wired into `make dev`, or ran before the DB was healthy; wire them in after the readiness wait.
- **CI job stuck queued** → the label matches no online runner (service down, or runner registered on another repo/org scope). Bring the runner back or fix the label — never "solve" it by reverting the repo to hosted minutes.
- **CI passes locally, fails on the runner with "command not found"** → the runner's environment lacks the toolchain; provide it in the service env or install it in the job, don't hand-fix the shell.

## Update

Patch via `Edit`. Show the diff before applying. Never regenerate.

## Notes

- Port lives in the Makefile (not env var) — preserves determinism across machines.
- Cross-platform: Linux + Mac native. Windows: require WSL2.
