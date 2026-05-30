#!/usr/bin/env bash
# claude-modes installer — sets up `claude`/`claudew` shell commands and the
# IDE "Claude" terminal profile (VS Code + Antigravity) with a single
# CLAUDE_CODE_EFFORT_LEVEL toggle that understands `ultracode`.
#
# Idempotent: safe to re-run. Backs up every file it touches to *.bak-<ts>.
#
# Usage:  bash install.sh [--default-mode max|ultracode|xhigh|...]
set -euo pipefail

DEFAULT_MODE="max"
while [ $# -gt 0 ]; do
  case "$1" in
    --default-mode) DEFAULT_MODE="${2:-max}"; shift 2 ;;
    *) echo "unknown arg: $1" >&2; exit 2 ;;
  esac
done

TS="$(date +%Y%m%d-%H%M%S)"
backup() { [ -f "$1" ] && cp -p "$1" "$1.bak-$TS" && echo "  backup: $1.bak-$TS"; return 0; }

# The single command that powers the "Claude" terminal profile in the IDEs.
# It branches on CLAUDE_CODE_EFFORT_LEVEL:
#   ultracode -> real ultracode via --settings (unsets the invalid env value first)
#   anything else (max/xhigh/...) -> --effort <value>, defaulting to max
IDE_CMD='stty -ixon; if [ "$CLAUDE_CODE_EFFORT_LEVEL" = ultracode ]; then unset CLAUDE_CODE_EFFORT_LEVEL; command claude --dangerously-skip-permissions --settings '"'"'{"ultracode": true}'"'"'; else command claude --dangerously-skip-permissions --effort "${CLAUDE_CODE_EFFORT_LEVEL:-max}"; fi; exec bash'

# ---------------------------------------------------------------------------
# 1) Shell: claude() = effort max, claudew() = ultracode
# ---------------------------------------------------------------------------
install_bashrc() {
  local rc="$HOME/.bashrc"
  [ -f "$rc" ] || touch "$rc"
  echo "==> shell (~/.bashrc)"
  backup "$rc"
  # Remove any previous block we wrote, plus any legacy `alias claude=` line.
  local tmp; tmp="$(mktemp)"
  awk '
    /^# >>> claude-modes >>>$/ {skip=1}
    skip==1 {if (/^# <<< claude-modes <<<$/) skip=0; next}
    /^alias claude=/ {next}
    {print}
  ' "$rc" > "$tmp"
  cat >> "$tmp" <<'EOF'
# >>> claude-modes >>>
# `claude` = effort max (normal). `claudew` = ultracode (xhigh + workflow orchestration).
# Functions (not aliases) so the --settings JSON escapes cleanly; "$@" forwards extra args.
claude()  { command claude --dangerously-skip-permissions --effort max "$@"; }
claudew() { command claude --dangerously-skip-permissions --settings '{"ultracode": true}' "$@"; }
# Strip any inherited effort override so `claudew`'s ultracode is never suppressed.
unset CLAUDE_CODE_EFFORT_LEVEL
# <<< claude-modes <<<
EOF
  mv "$tmp" "$rc"
  echo "  ok: claude()=max, claudew()=ultracode"
}

# ---------------------------------------------------------------------------
# 2) IDE terminal profiles (VS Code "Code" + Antigravity)
#    Patches the ACTIVE profile settings.json AND the base User/settings.json.
# ---------------------------------------------------------------------------
patch_ide() {
  local cfg_root="$1" label="$2"
  [ -d "$cfg_root" ] || { echo "==> $label: not installed, skipping"; return; }
  echo "==> $label ($cfg_root)"

  # Collect every settings.json that already defines a "Claude" terminal profile,
  # plus the base User/settings.json. This covers per-profile setups where the
  # active profile id differs per machine.
  local -a targets=()
  [ -f "$cfg_root/settings.json" ] && targets+=("$cfg_root/settings.json")
  if [ -d "$cfg_root/profiles" ]; then
    while IFS= read -r f; do targets+=("$f"); done < <(grep -rl '"Claude"' "$cfg_root/profiles" --include=settings.json 2>/dev/null || true)
  fi
  if [ "${#targets[@]}" -eq 0 ]; then
    targets+=("$cfg_root/settings.json")  # nothing yet — seed the base file
  fi

  local f
  for f in "${targets[@]}"; do
    backup "$f"
    CM_FILE="$f" CM_CMD="$IDE_CMD" CM_MODE="$DEFAULT_MODE" python3 - <<'PY'
import json, os, sys
f    = os.environ["CM_FILE"]
cmd  = os.environ["CM_CMD"]
mode = os.environ["CM_MODE"]
try:
    with open(f) as fh: d = json.load(fh)
except FileNotFoundError:
    d = {}
except json.JSONDecodeError as e:
    print(f"  SKIP (invalid JSON): {f} -> {e}"); sys.exit(0)

profs = d.setdefault("terminal.integrated.profiles.linux", {})
profs.setdefault("bash", {"path": "/bin/bash", "args": ["-c", "stty -ixon; exec bash"], "icon": "terminal-bash"})
profs["Claude"] = {"path": "/bin/bash", "args": ["-c", cmd], "icon": "robot"}

# Make the "Claude" profile reachable + Ctrl+Q friendly defaults.
d.setdefault("terminal.integrated.defaultProfile.linux", "bash")
# Single toggle variable. ultracode is handled by the command above.
env = d.get("terminal.integrated.env.linux", {})
env.pop("CLAUDE_MODE", None)  # remove the old two-variable design if present
env["CLAUDE_CODE_EFFORT_LEVEL"] = mode
d["terminal.integrated.env.linux"] = env
# Fresh shells each open (so edits to the toggle take effect on reopen).
d["terminal.integrated.enablePersistentSessions"] = False

with open(f, "w") as fh:
    json.dump(d, fh, indent=2, ensure_ascii=False); fh.write("\n")
print(f"  ok: {f}  (CLAUDE_CODE_EFFORT_LEVEL={mode})")
PY
  done
}

# ---------------------------------------------------------------------------
# 3) Ctrl+Q: bind it to "close the active editor/tab" (the Claude terminal
#    opens as an editor tab via defaultLocation:editor). VS Code & Antigravity
#    read keybindings.json from the same User dir.
# ---------------------------------------------------------------------------
patch_keybindings() {
  local cfg_root="$1" label="$2"
  [ -d "$cfg_root" ] || return
  local kb="$cfg_root/keybindings.json"
  echo "==> $label keybindings (Ctrl+Q)"
  backup "$kb"
  CM_KB="$kb" python3 - <<'PY'
import json, os
kb = os.environ["CM_KB"]
try:
    with open(kb) as fh:
        import re
        raw = fh.read()
        # tolerate // comments and trailing commas in existing files
        raw = re.sub(r'(^|[^:])//.*$', r'\1', raw, flags=re.M)
        raw = re.sub(r',(\s*[}\]])', r'\1', raw)
        data = json.loads(raw) if raw.strip() else []
except (FileNotFoundError, json.JSONDecodeError):
    data = []
if not isinstance(data, list):
    data = []
binding = {"key": "ctrl+q", "command": "workbench.action.closeActiveEditor"}
if not any(b.get("key") == "ctrl+q" for b in data if isinstance(b, dict)):
    data.append(binding)
    with open(kb, "w") as fh:
        json.dump(data, fh, indent=2, ensure_ascii=False); fh.write("\n")
    print(f"  ok: bound ctrl+q -> closeActiveEditor in {kb}")
else:
    print(f"  ctrl+q already bound in {kb} — left as-is")
PY
}

# ---------------------------------------------------------------------------
echo "claude-modes installer (default IDE mode: $DEFAULT_MODE)"
echo
install_bashrc
echo
patch_ide  "$HOME/.config/Code/User"        "VS Code"
patch_keybindings "$HOME/.config/Code/User" "VS Code"
echo
patch_ide  "$HOME/.config/Antigravity/User"        "Antigravity"
patch_keybindings "$HOME/.config/Antigravity/User" "Antigravity"
echo
echo "Done."
echo "  Terminal : run 'source ~/.bashrc' (or open a new shell), then 'claude' (max) / 'claudew' (ultracode)."
echo "  IDE      : edit \"CLAUDE_CODE_EFFORT_LEVEL\": \"max\" | \"ultracode\" in the active profile's"
echo "             settings.json, then Ctrl+Q the Claude tab and reopen the Claude terminal profile."
echo "  Verify   : bash $(dirname "$0")/verify.sh"
