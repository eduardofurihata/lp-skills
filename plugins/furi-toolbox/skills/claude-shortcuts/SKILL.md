---
name: claude-shortcuts
description: 'Use when user invokes /claude-shortcuts to set up, verify or replicate the user''s Claude Code shortcuts: terminal `claude` / `claudew` (ultracode) and IDE terminal profiles "Claude" (Ctrl+Q, --effort max, tunable) and "Claude Ultra" (Ctrl+Shift+U, ultracode) for VS Code + Antigravity IDE, across all profiles.'
allowed-tools: Bash, Read, Edit, Write
disable-model-invocation: true
---

# /claude-shortcuts

Installs and verifies the user's way to launch Claude Code, on any machine, **mirroring** the reference setup — never "improving" it. On the reference machine run only `verify.sh`.

## What it sets up

- **Terminal** (`~/.bashrc`, block `# >>> claude-shortcuts >>>`): `claude` = no forced effort (level from settings and `/effort`); `claudew` = ultracode. Shell **functions** in a subshell that first runs `_claude_clean_env`, then `unset CLAUDE_CODE_EFFORT_LEVEL`.
- **IDEs** (VS Code + Antigravity IDE, **every profile**): terminal profiles `bash` (default), `Claude` (**Ctrl+Q** — `--effort max`; `CLAUDE_CODE_EFFORT_LEVEL` in the IDE env tunes it: empty = max, a level, or `ultracode`; unset before launch so `/effort` stays free) and `Claude Ultra` (**Ctrl+Shift+U** — ultracode); quit moves to **Ctrl+Shift+Q**.

The exact profile commands, JSONC blocks and keybindings live in `scripts/install.sh` — it is the source, not this file.

## How to run

```bash
bash scripts/install.sh [--default-mode high|ultracode] [--target shell|vscode|antigravity|antigravity-legacy]
bash scripts/verify.sh      # per IDE, per profile, and what Ctrl+Q resolves to
source ~/.bashrc
```

Direction is **Antigravity → VS Code**, never the reverse. Idempotent; backs up every touched file; reload the IDE window after. It rewrites the bashrc block (removing legacy blocks and duplicates), imposes profiles and settings in the base `settings.json` **and every `profiles/*/settings.json`** by **surgical text edits**, and fixes keybindings in the base **and every existing** `profiles/*/keybindings.json` — never creating one.

## Gotchas — each one cost real debugging time

- **The active Antigravity is "Antigravity IDE"** → `~/.config/Antigravity IDE/User/` (path with a space). `~/.config/Antigravity/User/` is the orphaned old install — patching only it changes nothing.
- **Per-profile config.** With a profile active, base `User/` files do nothing: settings are isolated per profile; keybindings inherit the base unless the profile has its own file.
- **Settings are JSONC** (`//` comments, trailing commas): never `json.load` them — that was a real crash.
- **Child-session env.** A `claude` launched from a terminal opened inside Claude writes no transcript and vanishes from `/resume` — hence `_claude_clean_env` (shell only).
- **Ctrl+Q is XON**: `stty -ixon` in every profile **and** `flowControl: false`; `sendKeybindingsToShell: false` + `commandsToSkipShell` let it fire inside a terminal.
- **Empty = max** (`${CLAUDE_CODE_EFFORT_LEVEL:-max}`). **`ultracode` is not an effort level** — alone in the env var it's ignored; the `Claude` profile detects it and switches to `--settings`. Any valid `--effort` **suppresses** ultracode.
- `bash -c` doesn't read `~/.bashrc`: profiles repeat the flags by hand — keep them in sync. Linux only.
