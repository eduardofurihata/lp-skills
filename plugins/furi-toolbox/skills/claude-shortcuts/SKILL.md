---
name: claude-shortcuts
description: Use when setting up or replicating the user's Claude Code shortcuts on a machine — terminal commands `claude` (no forced effort; level from ~/.claude/settings.json) and `claudew` (ultracode), plus IDE terminal profiles "Claude" (Ctrl+Q — `--effort max` by default, tunable via CLAUDE_CODE_EFFORT_LEVEL in the IDE settings) and "Claude Ultra" (Ctrl+Shift+U — ultracode) for VS Code + Antigravity IDE, across ALL profiles. Triggers on "atalhos do claude", "configura o claude/claudew", "ctrl+q / ctrl+shift+u claude", "instala os modos do claude", "replica essa config em outra máquina".
allowed-tools: Bash, Read, Edit, Write
---

# /claude-shortcuts — Claude Code shortcuts (terminal + IDEs)

Installs and verifies the user's preferred way to launch Claude Code, on any machine. The reference is the user's real setup (`~/.bashrc`, `~/.config/Antigravity IDE/User`, `~/.config/Code/User`) — this skill **mirrors** it for other machines; on the reference machine itself `install.sh` is a no-op and `verify.sh` is the only thing worth running. Never "improve" the reference from here: the machine is the source of truth, the skill follows it.

## What it sets up

**Terminal (`~/.bashrc`) — two commands + a cleaner:**
- `claude`  → **no forced effort**. The level comes from `~/.claude/settings.json` (`"effortLevel"`) and from `/effort` at runtime. Nothing here pins a level.
- `claudew` → ultracode (`--settings '{"ultracode": true}'` = xhigh + automatic workflow orchestration).
- `_claude_clean_env` → `unset CLAUDECODE CLAUDE_CODE_CHILD_SESSION CLAUDE_PID CLAUDE_CODE_SESSION_ID CLAUDE_CODE_ENTRYPOINT AI_AGENT`. Both commands run inside a subshell that calls it first, so a terminal opened from **inside** a Claude session doesn't inherit that session's identity (see gotchas).

Both are shell **functions** (not aliases) so the JSON in `--settings` escapes cleanly and `"$@"` forwards extra args (e.g. `claudew --model opus`). A trailing `unset CLAUDE_CODE_EFFORT_LEVEL` keeps a stray effort override from silently suppressing `claudew`'s ultracode.

```bash
# >>> claude-shortcuts >>>
_claude_clean_env() { unset CLAUDECODE CLAUDE_CODE_CHILD_SESSION CLAUDE_PID CLAUDE_CODE_SESSION_ID CLAUDE_CODE_ENTRYPOINT AI_AGENT; }
claude()  { ( _claude_clean_env; command claude --dangerously-skip-permissions "$@" ); }
claudew() { ( _claude_clean_env; command claude --dangerously-skip-permissions --settings '{"ultracode": true}' "$@" ); }
unset CLAUDE_CODE_EFFORT_LEVEL
# <<< claude-shortcuts <<<
```

**IDEs (VS Code + Antigravity IDE) — three terminal profiles + three shortcuts, in ALL profiles:**

| Shortcut | Terminal profile | Opens |
|---|---|---|
| **Ctrl+Q** | `Claude` | `--effort max` by default. `CLAUDE_CODE_EFFORT_LEVEL` in the IDE's `terminal.integrated.env.linux` tunes it: empty = `max`, a level = `--effort <level>`, `ultracode` = real ultracode. The profile `unset`s it before launching, so `/effort` stays free inside the session. |
| **Ctrl+Shift+U** | `Claude Ultra` | ultracode, hardcoded (`--settings '{"ultracode": true}'`) |
| **Ctrl+Shift+Q** | — | `workbench.action.quit` — quit moved here because Ctrl+Q now opens Claude |
| Ctrl+` | `bash` (default profile) | plain shell; `unset`s the effort knob so a manual `claude` isn't affected |

The terminal (`claude` = settings) and the IDE (Ctrl+Q = `max`) are **deliberately asymmetric**: in the IDE the user wants the heavy mode one key away; in a shell the global `effortLevel` rules.

Reference — exactly what the user's machine has (JSONC, `settings.json`):

```jsonc
"terminal.integrated.defaultLocation": "editor",
"terminal.integrated.defaultProfile.linux": "bash",
"terminal.integrated.enablePersistentSessions": false,
"terminal.integrated.profiles.linux": {
  "bash":         { "path": "/bin/bash", "args": ["-c", "unset CLAUDE_CODE_EFFORT_LEVEL; stty -ixon; exec bash"], "icon": "terminal-bash" },
  "Claude":       { "path": "/bin/bash", "args": ["-c",
    "stty -ixon; M=\"${CLAUDE_CODE_EFFORT_LEVEL:-max}\"; unset CLAUDE_CODE_EFFORT_LEVEL; if [ \"$M\" = ultracode ]; then command claude --dangerously-skip-permissions --settings '{\"ultracode\": true}'; else command claude --dangerously-skip-permissions --effort \"$M\"; fi; exec bash"], "icon": "robot" },
  "Claude Ultra": { "path": "/bin/bash", "args": ["-c",
    "stty -ixon; unset CLAUDE_CODE_EFFORT_LEVEL; command claude --dangerously-skip-permissions --settings '{\"ultracode\": true}'; exec bash"], "icon": "zap" }
},
"terminal.integrated.env.linux": {
  // Retuna o padrao do perfil "Claude" (Ctrl+Q). Vazio = max.
  // Valores: "low"/"medium"/"high"/"xhigh"/"max"/"ultracode".
  // O perfil da unset nela antes de lancar o claude, para o /effort continuar livre na sessao.
  "CLAUDE_CODE_EFFORT_LEVEL": ""
},
"terminal.integrated.sendKeybindingsToShell": false,
"terminal.integrated.flowControl": false,
"terminal.integrated.commandsToSkipShell": ["workbench.action.terminal.newWithProfile"]
```

```jsonc
// keybindings.json
{ "key": "ctrl+shift+q", "command": "workbench.action.quit" },
{ "key": "ctrl+q",       "command": "-workbench.action.quit" },
{ "key": "ctrl+q",       "command": "workbench.action.terminal.newWithProfile", "args": { "profileName": "Claude" } },
{ "key": "ctrl+shift+u", "command": "workbench.action.terminal.newWithProfile", "args": { "profileName": "Claude Ultra" } }
```

## How to run

```bash
bash scripts/install.sh                             # Ctrl+Q = max (knob absent or "" — same thing); terminal claude = settings
bash scripts/install.sh --default-mode high         # Ctrl+Q = --effort high, in every IDE profile
bash scripts/install.sh --default-mode ultracode    # Ctrl+Q = ultracode too
bash scripts/install.sh --target vscode             # Antigravity > VS Code: propagate the reference to VS Code only
bash scripts/verify.sh                              # check everything, per IDE and per profile
source ~/.bashrc                                    # activate claude/claudew now
```

`--target` (repeatable: `shell`, `vscode`, `antigravity`, `antigravity-legacy`) limits the run. The direction on the user's machines is **Antigravity → VS Code**: the Antigravity IDE is the reference, VS Code is brought up to it, never the reverse.

After install, **reload the IDE window** (or fully reopen) so it re-reads settings/keybindings.

The installer is **idempotent** and backs up every file it touches to `*.bak-<timestamp>`.

## Steps the skill performs

1. **Shell.** Rewrite the `# >>> claude-shortcuts >>>` block in `~/.bashrc`. Migration-safe: it also removes an older `# >>> claude-modes >>>` block, any legacy `alias claude=...`, and **hand-written** bare definitions of `_claude_clean_env()`, `claude()`, `claudew()` and `unset CLAUDE_CODE_EFFORT_LEVEL` — each together with the run of `#` comment lines directly above it — so the machine that was configured by hand ends up with exactly one block, no duplicates (a duplicate appended later would win and silently drop the env cleanup).
2. **IDE settings — every profile.** For VS Code (`~/.config/Code/User`), Antigravity IDE (`~/.config/Antigravity IDE/User` — note the space) and the legacy Antigravity (`~/.config/Antigravity/User`, if still present): in the base `settings.json` **and every `profiles/*/settings.json`**, impose the `bash`, `Claude` and `Claude Ultra` terminal profiles (existing entries with those names are replaced by the byte-identical reference ones), rewrite the `terminal.integrated.env.linux` block only if it lacks the knob (other keys preserved; `CLAUDE_MODE` dropped; `CLAUDE_CODE_EFFORT_LEVEL` set to `""` or to `--default-mode`; a block that already has it is left untouched, comments included), enforce `flowControl: false`, `sendKeybindingsToShell: false` and `commandsToSkipShell ∋ workbench.action.terminal.newWithProfile` (other entries kept), and write-if-absent `defaultProfile.linux: "bash"`, `defaultLocation: "editor"`, `enablePersistentSessions: false`. Done by **surgical text edits** (not full JSON re-serialization) so `//` comments elsewhere in the file survive.
3. **IDE keybindings.** In the base `keybindings.json` **and every existing `profiles/*/keybindings.json`**: Ctrl+Q→`Claude`, Ctrl+Shift+U→`Claude Ultra`, Ctrl+Q unbound from quit, Ctrl+Shift+Q→quit; stale Ctrl+Q bindings from older installs (e.g. `closeActiveEditor`) removed; deduped. Unrelated bindings (terminal ergonomics, IDE-specific ones) are left alone. The leading `// Place your key bindings…` header is preserved. Does **not** create `keybindings.json` inside profiles that don't have one (they inherit the base — creating one would break inheritance).
4. **Verify.** `scripts/verify.sh` reports the shell functions, env hygiene, and per-IDE/per-profile profiles, support settings and shortcuts, plus what Ctrl+Q resolves to.

## Critical gotchas (these cost real debugging time — preserve them)

- **The active Antigravity is "Antigravity IDE"** (`/opt/antigravity-ide`, `dataFolderName=.antigravity-ide`), and its user config lives in **`~/.config/Antigravity IDE/User/`** — a path with a space. `~/.config/Antigravity/User/` is the previous install, orphaned; no binary reads it. Patching only the old path looks successful and changes nothing. Always quote the path; patch both if both exist.
- **Child-session env.** A terminal opened from inside a Claude session inherits `CLAUDECODE`, `CLAUDE_CODE_CHILD_SESSION`, `CLAUDE_PID`, `CLAUDE_CODE_SESSION_ID`, `CLAUDE_CODE_ENTRYPOINT`, `AI_AGENT`. A `claude` launched there becomes a **child session: it writes no transcript and vanishes from `/resume`**. That's why the shell functions run `_claude_clean_env` in a subshell. The IDE profiles don't need it: the IDE is launched from the desktop, not from inside Claude (don't add it there "for safety" — the reference profiles don't have it, and the skill mirrors the reference).
- **Ctrl+Q is XON.** With terminal flow control on, the terminal swallows Ctrl+Q (and Ctrl+S) as XON/XOFF and the keybinding never fires. Two layers fix it: `stty -ixon` inside every profile command **and** `"terminal.integrated.flowControl": false` in settings.
- **The keybinding must reach the workbench while a terminal has focus.** `"terminal.integrated.sendKeybindingsToShell": false` plus `workbench.action.terminal.newWithProfile` in `terminal.integrated.commandsToSkipShell`. Without them Ctrl+Q works from the editor but not from inside a terminal.
- **Empty string = max.** The `Claude` profile reads `M="${CLAUDE_CODE_EFFORT_LEVEL:-max}"` — `:-` treats empty and unset the same, so `"CLAUDE_CODE_EFFORT_LEVEL": ""` in the IDE env means `max`, and so does no key at all (Antigravity IDE has the empty key; VS Code has it commented out — both are `max`, and the installer leaves both alone). The variable is the tuning knob (`high`, `ultracode`…), not a default-off switch. The profile `unset`s it right after reading, so `/effort` inside the session isn't pinned.
- **`bash -c` doesn't read `~/.bashrc`.** IDE profile commands are non-interactive, so the `claude`/`claudew` functions don't exist there — the profiles repeat the flags (`command claude --dangerously-skip-permissions …`) by hand. Keep them in sync with the shell block when changing flags.
- **Settings files are JSONC.** VS Code/Antigravity `settings.json` and `keybindings.json` allow `//` comments and trailing commas; `json.load` rejects them. The installer parses settings by **surgical regex/brace-matching text edits** (preserving comments) and keybindings by strip-comments→parse→clean→re-serialize with the header re-prepended. Never naively `json.load` these files — that was a real crash. The one block the installer can rewrite wholesale is `terminal.integrated.env.linux`, and only when the knob is missing.
- **IDEs use per-profile config, NOT just the base `User/`.** If a profile is active (address bar shows `profiles › <id>`), editing the base files alone does nothing for it. **Settings** are isolated per profile → write **every** `profiles/*/settings.json`. **Keybindings** inherit the base Default unless a profile has its own file → write the base (covers inheritors) **and** every existing per-profile keybindings file. Find the active profile: `~/.config/<IDE>/User/globalStorage/storage.json` → `profileAssociations` / `userDataProfiles`.
- **`CLAUDE_CODE_EFFORT_LEVEL` only accepts effort levels** (`low/medium/high/xhigh/max`), validated inside the Claude binary. The literal `ultracode` is **not** an effort level — alone in the env var it's ignored (Claude falls back to xhigh). That's why the `Claude` profile command **detects** `ultracode` and switches to `--settings` (and why `Claude Ultra` uses `--settings` directly). Never rely on `ultracode` being a valid effort value.
- **An effort override suppresses ultracode.** Wherever `CLAUDE_CODE_EFFORT_LEVEL`/`--effort` is set to a valid level, ultracode is off for that session. Keep it unset in the shell (`claudew`); the IDE commands `unset` it before going ultracode.
- **A keybinding can't pass env vars** — only a `profileName`. That's why max vs ultracode are two separate terminal profiles, one per shortcut, instead of one profile + a key that sets a variable.
- **Ctrl+Shift+U may collide with IBus Unicode entry on Linux.** Inside Electron the IDE usually wins, but if it doesn't fire, rebind to `Ctrl+Alt+U` or a chord. Editable in `keybindings.json`.
- **Verified against Claude Code 2.1.268.** Effort resolution order: (1) `--effort` flag, (2) `settings.ultracode === true`, (3) `settings.effortLevel`. `--settings '{"ultracode": true}'` genuinely enables ultracode.

## Notes
- Linux only (`terminal.integrated.profiles.linux`, `/bin/bash`). Cursor has no "Claude" terminal profile here, so it's skipped.
- Not managed here: the `eduzz` alias (`CLAUDE_CONFIG_DIR=$HOME/.eduzz`, a second account), the general terminal keybindings (`` ctrl+` `` swap, `ctrl+shift+a`, `f2` rename) — the installer preserves them but doesn't own them.
- Re-run any time after the IDE recreates/renames a profile; it's safe, idempotent, and backs up first.
- **On the reference machine, run `verify.sh`, not `install.sh`** — there is nothing to install, and touching a config that is already right is the failure mode this skill exists to avoid.
