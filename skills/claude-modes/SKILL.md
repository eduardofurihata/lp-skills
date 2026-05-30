---
name: claude-modes
description: Use when setting up or replicating the user's Claude Code launch modes on a machine — terminal commands `claude` (effort max) and `claudew` (ultracode), plus the IDE "Claude" terminal profile (VS Code + Antigravity) driven by a single CLAUDE_CODE_EFFORT_LEVEL toggle that understands `ultracode`, with Ctrl+Q closing the Claude tab. Triggers on "configura o claude/claudew", "instala os modos do claude", "replica essa config em outra máquina".
allowed-tools: Bash, Read, Edit, Write
---

# /claude-modes — Claude Code launch modes (terminal + IDEs)

Installs and verifies the user's preferred way to launch Claude Code, on any machine.

## What it sets up

**Terminal (`~/.bashrc`) — two commands:**
- `claude`  → `--effort max` (normal max mode)
- `claudew` → ultracode (`--settings '{"ultracode": true}'` = xhigh + automatic workflow orchestration)

Both are shell **functions** (not aliases) so the JSON in `--settings` escapes cleanly and `"$@"` forwards extra args (e.g. `claudew --model opus`). A trailing `unset CLAUDE_CODE_EFFORT_LEVEL` keeps a stray effort override from silently suppressing `claudew`'s ultracode.

**IDEs (VS Code + Antigravity) — one toggle:**
The "Claude" terminal profile runs a command that **branches on a single env var** `CLAUDE_CODE_EFFORT_LEVEL`:
- `max` (or `xhigh`, `high`, …) → `claude --effort <value>`
- `ultracode` → real ultracode via `--settings '{"ultracode": true}'`

So the user edits **one line** in the active profile's `settings.json` and reopens the terminal. No second variable, no toggling to `null`.

```jsonc
"terminal.integrated.env.linux": { "CLAUDE_CODE_EFFORT_LEVEL": "max" },   // or "ultracode"
"terminal.integrated.profiles.linux": {
  "Claude": { "path": "/bin/bash", "args": ["-c",
    "stty -ixon; if [ \"$CLAUDE_CODE_EFFORT_LEVEL\" = ultracode ]; then unset CLAUDE_CODE_EFFORT_LEVEL; command claude --dangerously-skip-permissions --settings '{\"ultracode\": true}'; else command claude --dangerously-skip-permissions --effort \"${CLAUDE_CODE_EFFORT_LEVEL:-max}\"; fi; exec bash"
  ], "icon": "robot" }
}
```

**Ctrl+Q:** bound to `workbench.action.closeActiveEditor` so it closes the Claude terminal tab (the profile opens as an editor tab via `defaultLocation: editor`).

## How to run

```bash
# from this skill dir (default IDE mode = max):
bash scripts/install.sh
# or pre-set the IDE toggle to ultracode:
bash scripts/install.sh --default-mode ultracode

bash scripts/verify.sh        # check everything + see what each surface opens in
source ~/.bashrc              # activate claude/claudew in the current shell
```

The installer is **idempotent** and backs up every file it touches to `*.bak-<timestamp>`. It patches both the base `User/settings.json` and any per-profile `profiles/<id>/settings.json` that already defines a "Claude" profile (the active profile id differs per machine — that's the #1 gotcha, see below).

## Steps the skill performs

1. **Shell.** Rewrite the `# >>> claude-modes >>>` block in `~/.bashrc` with the `claude`/`claudew` functions + `unset`. Remove any legacy `alias claude=...`.
2. **IDEs.** For VS Code (`~/.config/Code/User`) and Antigravity (`~/.config/Antigravity/User`): set the "Claude" terminal profile command (the branch above), set `CLAUDE_CODE_EFFORT_LEVEL` to the chosen default, drop any old `CLAUDE_MODE` var, and set `enablePersistentSessions: false` so toggle edits take effect on reopen. Apply to the base file AND every profile that has a Claude profile.
3. **Ctrl+Q.** Add `{ "key": "ctrl+q", "command": "workbench.action.closeActiveEditor" }` to each IDE's `keybindings.json` (only if not already bound).
4. **Verify.** Run `scripts/verify.sh` and report what `claude`, `claudew`, and each IDE profile resolve to.

## Critical gotchas (these cost real debugging time — preserve them)

- **IDEs use per-workspace PROFILES, not the base `User/settings.json`.** If a profile is active (address bar shows `profiles › <id>`), editing the base file does nothing. The installer auto-discovers any `profiles/*/settings.json` containing a `"Claude"` profile and patches those too. To find the active one manually: `~/.config/<IDE>/User/globalStorage/storage.json` → `profileAssociations`.
- **`CLAUDE_CODE_EFFORT_LEVEL` only accepts effort levels** (`low/medium/high/xhigh/max`), validated inside the Claude binary. The literal `ultracode` is **not** an effort level — putting it in the env var alone just gets ignored (Claude falls back to xhigh). That's why the profile command **detects** `ultracode` and switches to `--settings '{"ultracode": true}'` explicitly, `unset`-ting the invalid value first. Never rely on `ultracode` being a valid effort value.
- **An effort override suppresses ultracode.** Anywhere `CLAUDE_CODE_EFFORT_LEVEL` (or `--effort`) is set to a valid level, ultracode is turned off for that session. Keep it unset in the shell so `claudew` works; the IDE command handles its own un-setting.
- **The env var can leak from 5 places** (historically the worst bug): `.bashrc` export, `systemd --user` environment, the IDE's `terminal.integrated.env.linux`, the IDE's terminal-profile command, and the KDE/Plasma login session (captured at login). `verify.sh` checks the shell + systemd. If a stale `max`/value reappears, hunt there; a logout/login clears a poisoned Plasma session.
- **Verified against Claude Code 2.1.156.** Effort resolution order: (1) `--effort` flag, (2) `settings.ultracode === true`, (3) `settings.effortLevel`. `--settings '{"ultracode": true}'` genuinely enables ultracode.

## Notes
- Cursor has no "Claude" terminal profile here, so it's skipped.
- Re-run any time after the IDE recreates/renames a profile; it's safe and backs up first.
