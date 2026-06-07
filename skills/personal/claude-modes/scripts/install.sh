#!/usr/bin/env bash
# claude-modes installer — replicates the user's Claude Code launch setup:
#
#   Terminal (~/.bashrc):
#     claude   -> --effort max
#     claudew  -> ultracode (--settings '{"ultracode": true}')
#
#   IDEs (VS Code + Antigravity), in ALL profiles:
#     terminal profile "Claude"        -> reads CLAUDE_CODE_EFFORT_LEVEL (default max);
#                                         value "ultracode" switches to real ultracode
#     terminal profile "Claude Ultra"  -> hardcoded ultracode
#     keybind  Ctrl+Q        -> open "Claude" terminal (max)
#     keybind  Ctrl+Shift+U  -> open "Claude Ultra" terminal (ultracode)
#
# Settings files are JSONC (// comments, trailing commas) — patched by SURGICAL
# text insertion so comments are preserved. Idempotent. Backs up every file to *.bak-<ts>.
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

# ---------------------------------------------------------------------------
# 1) Shell: claude() = effort max, claudew() = ultracode
# ---------------------------------------------------------------------------
install_bashrc() {
  local rc="$HOME/.bashrc"
  [ -f "$rc" ] || touch "$rc"
  echo "==> shell (~/.bashrc)"
  cp -p "$rc" "$rc.bak-$TS" 2>/dev/null || true
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
# 2) IDE settings + keybindings across ALL profiles (one Python pass per IDE).
# ---------------------------------------------------------------------------
patch_ide() {
  local cfg_root="$1" label="$2"
  [ -d "$cfg_root" ] || { echo "==> $label: not installed, skipping"; return; }
  echo "==> $label ($cfg_root)"
  CM_ROOT="$cfg_root" CM_MODE="$DEFAULT_MODE" CM_TS="$TS" python3 - <<'PY'
import os, re, glob, json

root = os.environ["CM_ROOT"]; mode = os.environ["CM_MODE"]; ts = os.environ["CM_TS"]

CLAUDE_CMD = ('stty -ixon; if [ "$CLAUDE_CODE_EFFORT_LEVEL" = ultracode ]; then '
              'unset CLAUDE_CODE_EFFORT_LEVEL; '
              "command claude --dangerously-skip-permissions --settings '{\"ultracode\": true}'; "
              'else command claude --dangerously-skip-permissions --effort "${CLAUDE_CODE_EFFORT_LEVEL:-max}"; '
              'fi; exec bash')
ULTRA_CMD = ('stty -ixon; unset CLAUDE_CODE_EFFORT_LEVEL; '
             "command claude --dangerously-skip-permissions --settings '{\"ultracode\": true}'; "
             'exec bash')

def entry(name, cmd, icon):
    return ('    %s: { "path": "/bin/bash", "args": %s, "icon": %s }'
            % (json.dumps(name), json.dumps(["-c", cmd]), json.dumps(icon)))

def backup(f):
    if os.path.exists(f):
        open(f + ".bak-" + ts, "w").write(open(f).read())

def find_key_span(txt, key):
    """Span of `"key": { ... }` (+ trailing comma) using brace matching that respects strings."""
    m = re.search(r'"%s"\s*:\s*\{' % re.escape(key), txt)
    if not m: return None
    s = m.start(); i = m.end() - 1
    depth = 0; in_str = False; esc = False
    while i < len(txt):
        c = txt[i]
        if in_str:
            esc = (c == '\\' and not esc) if c == '\\' else False
            if c == '"' and not esc: in_str = False
        else:
            if c == '"': in_str = True
            elif c == '{': depth += 1
            elif c == '}':
                depth -= 1
                if depth == 0:
                    j = i + 1
                    while j < len(txt) and txt[j] in ' \t\r\n': j += 1
                    if j < len(txt) and txt[j] == ',': return (s, j + 1)
                    return (s, i + 1)
        i += 1
    return None

def remove_key(txt, key):
    while True:
        sp = find_key_span(txt, key)
        if not sp: return txt
        s, e = sp
        # swallow the blank line left behind
        while e < len(txt) and txt[e] in ' \t': e += 1
        if e < len(txt) and txt[e] == '\n': e += 1
        txt = txt[:s].rstrip(' \t') + txt[e:]

PROFILES_KEY = '"terminal.integrated.profiles.linux"'

def ensure_profiles(txt):
    txt = remove_key(txt, "Claude")            # idempotent: drop our prior entries
    txt = remove_key(txt, "Claude Ultra")
    ins = entry("Claude", CLAUDE_CMD, "robot") + ',\n' + entry("Claude Ultra", ULTRA_CMD, "zap")
    m = re.search(r'"terminal\.integrated\.profiles\.linux"\s*:\s*\{', txt)
    if m:
        i = m.end()
        rest = txt[i:].lstrip()
        sep = '' if rest.startswith('}') else ','
        return txt[:i] + '\n' + ins + sep + txt[i:]
    # no linux profiles object -> create full block after first {
    block = ('  "terminal.integrated.profiles.linux": {\n'
             + entry("bash", "stty -ixon; exec bash", "terminal-bash") + ',\n'
             + ins + '\n  },\n')
    b = txt.index('{')
    return txt[:b+1] + '\n' + block + txt[b+1:]

def ensure_env(txt):
    # drop legacy CLAUDE_MODE (the old two-variable design), comment-safe
    txt = re.sub(r'\s*"CLAUDE_MODE"\s*:\s*"[^"]*"\s*,?', '', txt)
    txt = re.sub(r',(\s*"CLAUDE_CODE_EFFORT_LEVEL")', r'\1', txt)  # heal a leading comma if CLAUDE_MODE was first
    if '"terminal.integrated.env.linux"' in txt:
        if re.search(r'"CLAUDE_CODE_EFFORT_LEVEL"\s*:', txt):
            return re.sub(r'("CLAUDE_CODE_EFFORT_LEVEL"\s*:\s*)"[^"]*"', r'\1"%s"' % mode, txt, count=1)
        return re.sub(r'("terminal\.integrated\.env\.linux"\s*:\s*\{)',
                      r'\1 "CLAUDE_CODE_EFFORT_LEVEL": "%s",' % mode, txt, count=1)
    b = txt.index('{')
    return txt[:b+1] + '\n  "terminal.integrated.env.linux": { "CLAUDE_CODE_EFFORT_LEVEL": "%s" },\n' % mode + txt[b+1:]

# ---- settings: base + every profile ----
sfiles = [os.path.join(root, "settings.json")] + sorted(glob.glob(os.path.join(root, "profiles", "*", "settings.json")))
for f in sfiles:
    if not os.path.exists(f):
        open(f, "w").write("{}\n")
    txt = open(f).read()
    if not txt.strip(): txt = "{}\n"
    new = ensure_env(ensure_profiles(txt))
    if new != txt:
        backup(f); open(f, "w").write(new); print("    settings: " + f.replace(root + "/", ""))
    else:
        print("    settings ok: " + f.replace(root + "/", ""))

# ---- keybindings: base (covers inheritors) + every existing per-profile file ----
# Parse-clean-rewrite: preserves the leading // header, drops stale bindings, dedupes.
def strip_jsonc(raw):
    raw = re.sub(r'(^|[^:])//.*$', r'\1', raw, flags=re.M)
    raw = re.sub(r',(\s*[}\]])', r'\1', raw); return raw

def lead_comment(raw):
    out = []
    for line in raw.splitlines():
        s = line.strip()
        if s == '' or s.startswith('//'): out.append(line)
        else: break
    return ('\n'.join(out) + '\n') if out else ''

def points_to(b, key, prof):
    return (isinstance(b, dict) and b.get("key") == key
            and not str(b.get("command", "")).startswith("-")
            and isinstance(b.get("args"), dict) and b["args"].get("profileName") == prof)

KB_QNEG = {"key": "ctrl+q", "command": "-workbench.action.quit"}
KB_Q    = {"key": "ctrl+q", "command": "workbench.action.terminal.newWithProfile", "args": {"profileName": "Claude"}}
KB_U    = {"key": "ctrl+shift+u", "command": "workbench.action.terminal.newWithProfile", "args": {"profileName": "Claude Ultra"}}

def keep(b):
    if not isinstance(b, dict): return True
    k, cmd = b.get("key"), str(b.get("command", ""))
    if k == "ctrl+q" and cmd == "workbench.action.closeActiveEditor": return False   # stale (old skill)
    if k == "ctrl+q" and not cmd.startswith("-") and not points_to(b, "ctrl+q", "Claude"): return False
    if k == "ctrl+shift+u" and not cmd.startswith("-") and not points_to(b, "ctrl+shift+u", "Claude Ultra"): return False
    return True

base_kb = os.path.join(root, "keybindings.json")
if not os.path.exists(base_kb): open(base_kb, "w").write("[]\n")
kfiles = [base_kb] + sorted(glob.glob(os.path.join(root, "profiles", "*", "keybindings.json")))
for f in kfiles:
    if not os.path.exists(f): continue
    raw = open(f).read()
    try:
        data = json.loads(strip_jsonc(raw) or "[]")
    except Exception as e:
        print("    SKIP invalid keybindings: " + f.replace(root + "/", "") + " -> " + str(e)); continue
    if not isinstance(data, list): data = []
    data = [b for b in data if keep(b)]
    if not any(isinstance(b, dict) and b.get("key") == "ctrl+q" and b.get("command") == "-workbench.action.quit" for b in data):
        data.append(KB_QNEG)
    if not any(points_to(b, "ctrl+q", "Claude") for b in data):             data.append(KB_Q)
    if not any(points_to(b, "ctrl+shift+u", "Claude Ultra") for b in data): data.append(KB_U)
    new = lead_comment(raw) + json.dumps(data, indent=4, ensure_ascii=False) + "\n"
    if new != raw:
        backup(f); open(f, "w").write(new); print("    keybindings: " + f.replace(root + "/", ""))
    else:
        print("    keybindings ok: " + f.replace(root + "/", ""))
PY
}

echo "claude-modes installer (default IDE mode: $DEFAULT_MODE)"
echo
install_bashrc
echo
patch_ide "$HOME/.config/Code/User"        "VS Code"
echo
patch_ide "$HOME/.config/Antigravity/User" "Antigravity"
echo
echo "Done."
echo "  Terminal : 'source ~/.bashrc' then:  claude (max) | claudew (ultracode)"
echo "  IDEs     : reload window, then:  Ctrl+Q -> Claude (max) | Ctrl+Shift+U -> Claude Ultra (ultracode)"
echo "             (Ctrl+Q's effort = CLAUDE_CODE_EFFORT_LEVEL in the active profile's settings.json)"
echo "  Verify   : bash $(dirname "$0")/verify.sh"
