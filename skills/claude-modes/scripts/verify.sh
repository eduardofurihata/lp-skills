#!/usr/bin/env bash
# claude-modes verifier — checks the install applied correctly and reports
# the exact mode each surface will open in. Read-only, no mutations.
set -uo pipefail

pass() { printf '  \033[32mOK\033[0m   %s\n' "$1"; }
warn() { printf '  \033[33mWARN\033[0m %s\n' "$1"; }
fail() { printf '  \033[31mFAIL\033[0m %s\n' "$1"; }

echo "== shell (~/.bashrc) =="
if grep -q '^claudew()' "$HOME/.bashrc" 2>/dev/null && grep -q '^claude()' "$HOME/.bashrc" 2>/dev/null; then
  pass "claude() and claudew() defined"
else
  fail "claude()/claudew() functions missing in ~/.bashrc"
fi
# Resolve what the functions actually expand to in a fresh interactive shell.
defs="$(bash -ic 'type claude; type claudew' 2>/dev/null || true)"
echo "$defs" | grep -q -- '--effort max'                 && pass "claude  -> --effort max"      || warn "claude not resolving to --effort max (open a NEW shell?)"
echo "$defs" | grep -q -- "--settings '{\"ultracode\": true}'" && pass "claudew -> ultracode"   || warn "claudew not resolving to ultracode (open a NEW shell?)"

echo
echo "== effort env hygiene (must be empty so claudew's ultracode isn't suppressed) =="
cur="$(printenv CLAUDE_CODE_EFFORT_LEVEL || true)"
[ -z "$cur" ] && pass "CLAUDE_CODE_EFFORT_LEVEL unset in this shell" || warn "CLAUDE_CODE_EFFORT_LEVEL=$cur set in this shell (terminal claudew would degrade to effort)"
if command -v systemctl >/dev/null 2>&1; then
  systemctl --user show-environment 2>/dev/null | grep -q '^CLAUDE_CODE_EFFORT_LEVEL=' \
    && warn "CLAUDE_CODE_EFFORT_LEVEL is in systemd --user env (leaks to desktop apps)" \
    || pass "not in systemd --user environment"
fi

echo
echo "== IDE terminal profiles =="
check_ide() {
  local cfg_root="$1" label="$2"
  [ -d "$cfg_root" ] || { echo "  $label: not installed"; return; }
  local -a targets=("$cfg_root/settings.json")
  [ -d "$cfg_root/profiles" ] && while IFS= read -r f; do targets+=("$f"); done \
    < <(grep -rl '"Claude"' "$cfg_root/profiles" --include=settings.json 2>/dev/null || true)
  local f
  for f in "${targets[@]}"; do
    [ -f "$f" ] || continue
    CM_FILE="$f" CM_LABEL="$label" python3 - <<'PY'
import json, os
f, label = os.environ["CM_FILE"], os.environ["CM_LABEL"]
try:
    d = json.load(open(f))
except Exception as e:
    print(f"  FAIL {label}: invalid JSON {f}: {e}"); raise SystemExit
prof = d.get("terminal.integrated.profiles.linux", {}).get("Claude")
env  = d.get("terminal.integrated.env.linux", {})
short = f.replace(os.path.expanduser("~"), "~")
if not prof:
    print(f"  -- {label}: no Claude profile in {short}"); raise SystemExit
cmd = prof["args"][1] if prof.get("args") else ""
ok_branch = '[ "$CLAUDE_CODE_EFFORT_LEVEL" = ultracode ]' in cmd and "--settings" in cmd
val = env.get("CLAUDE_CODE_EFFORT_LEVEL", "<unset>")
persist = d.get("terminal.integrated.enablePersistentSessions", None)
mark = "OK  " if ok_branch else "FAIL"
opens = "ultracode" if val == "ultracode" else f"--effort {val if val!='<unset>' else 'max'}"
print(f"  {mark} {label}: {short}")
print(f"        CLAUDE_CODE_EFFORT_LEVEL={val}  =>  opens: {opens}")
if "CLAUDE_MODE" in env: print("        WARN leftover CLAUDE_MODE var present")
if persist is not False: print("        WARN enablePersistentSessions not false (edits may not take effect on reopen)")
PY
  done
}
check_ide "$HOME/.config/Code/User"        "VS Code"
check_ide "$HOME/.config/Antigravity/User" "Antigravity"

echo
echo "== behavior simulation (what the IDE command resolves to) =="
sim() { CLAUDE_CODE_EFFORT_LEVEL="$1" bash -c 'if [ "$CLAUDE_CODE_EFFORT_LEVEL" = ultracode ]; then echo "claude --settings ultracode"; else echo "claude --effort ${CLAUDE_CODE_EFFORT_LEVEL:-max}"; fi'; }
printf '  max       -> %s\n' "$(sim max)"
printf '  ultracode -> %s\n' "$(sim ultracode)"
printf '  xhigh     -> %s\n' "$(sim xhigh)"
printf '  (empty)   -> %s\n' "$(env -u CLAUDE_CODE_EFFORT_LEVEL bash -c 'if [ "$CLAUDE_CODE_EFFORT_LEVEL" = ultracode ]; then echo ultra; else echo "claude --effort ${CLAUDE_CODE_EFFORT_LEVEL:-max}"; fi')"
