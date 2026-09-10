---
name: make-dev
description: Use when the user types /make-dev, runs a freshly-cloned project for the first time, hits port conflicts (EADDRINUSE / "address already in use"), needs the project's Makefile updated after gaining services or dependencies, when hot reload or auto-migrations aren't working and `make dev` should set them up so the next run just works, or when a push to GitHub should run the repo's Actions on the local self-hosted runner instead of burning GitHub-hosted minutes.
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

1. **Free the port — and verify it's free** (see Principles) before binding.
2. **Bring up dependencies** (DB, cache, queues — via compose or equivalent) and **wait until each is actually healthy**, not just started. Migrating a DB that's still booting fails — poll readiness (healthcheck, `pg_isready`, a real connection probe) with a bounded retry.
3. **Run migrations automatically** — idempotent, every run. Detect the tool from project files; run its "apply pending" command. Seed only when the DB is empty (optional).
4. **Launch the app in watch mode** on the deterministic port. Full-stack/monorepo → run every watched process (frontend + backend) concurrently so a change anywhere reloads.
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

- **Serving**: hit the port (HTTP/health) and get a real response.
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
- **Watch for stale framework state.** Lock files / server registries can survive a crash and block the next launch. Clear them when stale.
- **Detect the stack from project files** and use the framework's standard dev command, passing the port explicitly (a CLI flag beats an env var).
- **Project-local deps:** install when missing. **System tools** (Docker, package managers, runtimes): print the install command and stop — never install system-wide without explicit consent.
- **Idempotent.** Re-running shouldn't duplicate Makefile entries, restart healthy services, or re-run applied migrations.

## Heal

Read stderr. Diagnose. Patch so the next reboot + `make dev` satisfies the full outcome contract without re-invoking the skill. Retry **once**. Never loop. Unknown error → report verbatim and ask, don't guess.

- `make dev` **fails despite a kill step** → the kill step isn't verifying the port is free; strengthen the verification, don't add retries.
- **Hot reload doesn't fire** despite a running watcher → the watcher isn't seeing edits (no polling / no bind mount / dir excluded); fix the watch path, don't tell the user to restart manually.
- **Migrations didn't apply** → they were never wired into `make dev`, or ran before the DB was healthy; wire them in after the readiness wait.
- **CI job stuck queued** → the label matches no online runner (service down, or runner registered on another repo/org scope). Bring the runner back or fix the label — never "solve" it by reverting the repo to hosted minutes.
- **CI passes locally, fails on the runner with "command not found"** → the runner's environment lacks the toolchain; provide it in the service env or install it in the job, don't hand-fix the shell.

## Update

Patch via `Edit`. Show the diff before applying. Never regenerate.

## Notes

- Port lives in the Makefile (not env var) — preserves determinism across machines.
- Cross-platform: Linux + Mac native. Windows: require WSL2.
