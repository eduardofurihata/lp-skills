---
name: make-dev
description: Use when the user types /make-dev, runs a freshly-cloned project for the first time, hits port conflicts (EADDRINUSE / "address already in use"), needs the project's Makefile updated after gaining services or dependencies, or wants a failing `make dev` patched so the next run works.
---

# /make-dev

One command to start any local project with hot reload, without conflicting with other projects on the same machine.

## Modes (auto-detected)

- **Create** — no Makefile → write one
- **Update** — Makefile exists but the project changed → patch in place, never regenerate (preserves user customizations)
- **Heal** — last `make dev` failed → diagnose, patch the Makefile or related files, retry **once**, then stop

## Principles

- **Deterministic port per project.** Same project → same port, always. Pick from a range that avoids common dev defaults and the OS ephemeral range.
- **Free the port — and verify, don't just detect.** Process-listing tools are not all equal: some miss wildcard, dual-stack, or child-process binds on certain systems. After your kill step, **prove** the port is free (a different tool, or a real bind probe) before launching. If you can't free it, report and stop — don't proceed to a doomed bind.
- **Watch for stale framework state.** Some dev tooling tracks running servers via lock files or registries that can survive a crash and block the next launch. Clear them when stale.
- **Detect the stack from project files** and use the framework's standard dev command, passing the port explicitly (a CLI flag is more reliable than an env var).
- **Project-local deps:** install when missing. **System tools** (Docker, package managers, runtimes): print the install command and stop — never install system-wide without explicit user consent.
- **Idempotent.** Re-running shouldn't duplicate Makefile entries or restart healthy services.

## Heal

Read stderr. Diagnose. Patch so the next reboot + `make dev` works without re-invoking the skill. Retry **once**. Never loop. Unknown error → report verbatim and ask the user, don't guess.

When `make dev` fails despite a kill step running, the kill step is **not actually verifying** the port is free — it's trusting a process-listing tool that missed something. Strengthen the verification, don't add more retries.

## Update

Patch via `Edit`. Show the diff before applying. Never regenerate.

## Notes

- Port lives in the Makefile (not env var) — preserves determinism across machines
- Cross-platform: Linux + Mac native. Windows: require WSL2
