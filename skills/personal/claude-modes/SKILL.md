---
name: claude-modes
description: Use when setting up or replicating the user's Claude Code launch modes on a machine — terminal commands `claude` (effort max) and `claudew` (ultracode), plus IDE terminal profiles "Claude" (max) and "Claude Ultra" (ultracode) for VS Code + Antigravity, bound to Ctrl+Q (max) and Ctrl+Shift+U (ultracode) across ALL profiles. Triggers on "configura o claude/claudew", "instala os modos do claude", "ctrl+q / ctrl+shift+u claude", "replica essa config em outra máquina".
allowed-tools: Bash, Read, Edit, Write
---

# /claude-modes — Claude Code launch modes (terminal + IDEs)

Installs and verifies the user's preferred way to launch Claude Code, on any machine.

## What it sets up

**Terminal (`~/.bashrc`) — two commands:**
- `claude`  → `--effort max` (normal max mode)
- `claudew` → ultracode (`--settings '{"ultracode": true}'` = xhigh + automatic workflow orchestration)

Both are shell **functions** (not aliases) so the JSON in `--settings` escapes cleanly and `"$@"` forwards extra args (e.g. `claudew --model opus`). A trailing `unset CLAUDE_CODE_EFFORT_LEVEL` keeps a stray effort override from silently suppressing `claudew`'s ultracode.

**IDEs (VS Code + Antigravity) — two terminal profiles + two shortcuts, in ALL profiles:**

| Shortcut | Terminal profile | Opens |
|---|---|---|
| **Ctrl+Q** | `Claude` | effort max (reads `CLAUDE_CODE_EFFORT_LEVEL`, default `max`) |
| **Ctrl+Shift+U** | `Claude Ultra` | ultracode (hardcoded `--settings '{"ultracode": true}'`) |

- **`Claude`** runs a command that branches on `CLAUDE_CODE_EFFORT_LEVEL`: value `ultracode` → real ultracode; anything else (`max`/`xhigh`/…) → `--effort <value>`. So Ctrl+Q opens max by default, but the per-profile env value can retune it.
- **`Claude Ultra`** always opens ultracode — it `unset`s the (suppressing) env var, then calls `--settings`.

```jsonc
"terminal.integrated.env.linux": { "CLAUDE_CODE_EFFORT_LEVEL": "max" },
"terminal.integrated.profiles.linux": {
  "Claude":       { "icon": "robot", "path": "/bin/bash", "args": ["-c",
    "stty -ixon; if [ \"$CLAUDE_CODE_EFFORT_LEVEL\" = ultracode ]; then unset CLAUDE_CODE_EFFORT_LEVEL; command claude --dangerously-skip-permissions --settings '{\"ultracode\": true}'; else command claude --dangerously-skip-permissions --effort \"${CLAUDE_CODE_EFFORT_LEVEL:-max}\"; fi; exec bash"] },
  "Claude Ultra": { "icon": "zap",   "path": "/bin/bash", "args": ["-c",
    "stty -ixon; unset CLAUDE_CODE_EFFORT_LEVEL; command claude --dangerously-skip-permissions --settings '{\"ultracode\": true}'; exec bash"] }
}
// keybindings.json
{ "key": "ctrl+q",       "command": "workbench.action.terminal.newWithProfile", "args": { "profileName": "Claude" } },
{ "key": "ctrl+shift+u", "command": "workbench.action.terminal.newWithProfile", "args": { "profileName": "Claude Ultra" } }
```

## How to run

```bash
bash scripts/install.sh                             # Ctrl+Q effort = max (default)
bash scripts/install.sh --default-mode ultracode    # make Ctrl+Q open ultracode too
bash scripts/verify.sh                              # check everything, per profile
source ~/.bashrc                                    # activate claude/claudew now
```

After install, **reload the IDE window** (or fully reopen) so it re-reads settings/keybindings.

The installer is **idempotent** and backs up every file it touches to `*.bak-<timestamp>`.

## Steps the skill performs

1. **Shell.** Rewrite the `# >>> claude-modes >>>` block in `~/.bashrc` with `claude`/`claudew` + `unset`. Remove any legacy `alias claude=...`.
2. **IDE settings — every profile.** For VS Code (`~/.config/Code/User`) and Antigravity (`~/.config/Antigravity/User`): in the base `settings.json` **and every `profiles/*/settings.json`**, define the `Claude` and `Claude Ultra` terminal profiles (+ a `bash` profile if absent), set `CLAUDE_CODE_EFFORT_LEVEL` (default `max`), drop any legacy `CLAUDE_MODE`. Done by **surgical text insertion** (not full JSON re-serialization) so `//` comments and the user's toggle comment survive.
3. **IDE keybindings.** In the base `keybindings.json` **and every existing `profiles/*/keybindings.json`**: add Ctrl+Q→`Claude` and Ctrl+Shift+U→`Claude Ultra`, remove stale Ctrl+Q bindings from older installs (e.g. `closeActiveEditor`), dedupe. The leading `// Place your key bindings…` header is preserved. Does **not** create `keybindings.json` inside profiles that don't have one (they inherit the base — creating one would break inheritance).
4. **Verify.** `scripts/verify.sh` reports `claude`/`claudew`, env hygiene, and per-profile profiles + shortcuts.

## Critical gotchas (these cost real debugging time — preserve them)

- **Settings files are JSONC.** VS Code/Antigravity `settings.json` and `keybindings.json` allow `//` comments and trailing commas; `json.load` rejects them. The installer parses settings by **surgical regex/brace-matching text edits** (preserving comments) and keybindings by strip-comments→parse→clean→re-serialize with the header re-prepended. Never naively `json.load` these files — that was a real crash.
- **IDEs use per-profile config, NOT just the base `User/`.** If a profile is active (address bar shows `profiles › <id>`), editing the base files alone does nothing for it. **Settings** are isolated per profile → write **every** `profiles/*/settings.json`. **Keybindings** inherit the base Default unless a profile has its own file → write the base (covers inheritors) **and** every existing per-profile keybindings file. Find the active profile: `~/.config/<IDE>/User/globalStorage/storage.json` → `profileAssociations` / `userDataProfiles`.
- **`CLAUDE_CODE_EFFORT_LEVEL` only accepts effort levels** (`low/medium/high/xhigh/max`), validated inside the Claude binary. The literal `ultracode` is **not** an effort level — alone in the env var it's ignored (Claude falls back to xhigh). That's why the `Claude` profile command **detects** `ultracode` and switches to `--settings` (and why `Claude Ultra` uses `--settings` directly). Never rely on `ultracode` being a valid effort value.
- **An effort override suppresses ultracode.** Wherever `CLAUDE_CODE_EFFORT_LEVEL`/`--effort` is set to a valid level, ultracode is off for that session. Keep it unset in the shell (`claudew`); the IDE commands `unset` it before going ultracode.
- **A keybinding can't pass env vars** — only a `profileName`. That's why max vs ultracode are two separate terminal profiles, one per shortcut, instead of one profile + a key that sets a variable.
- **Ctrl+Shift+U may collide with IBus Unicode entry on Linux.** Inside Electron the IDE usually wins, but if it doesn't fire, rebind to `Ctrl+Alt+U` or a chord. Editable in `keybindings.json`.
- **Verified against Claude Code 2.1.156.** Effort resolution order: (1) `--effort` flag, (2) `settings.ultracode === true`, (3) `settings.effortLevel`. `--settings '{"ultracode": true}'` genuinely enables ultracode.

## Notes
- Cursor has no "Claude" terminal profile here, so it's skipped.
- Re-run any time after the IDE recreates/renames a profile; it's safe, idempotent, and backs up first.
