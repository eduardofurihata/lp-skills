#!/usr/bin/env bash
# claude-modes verifier — read-only. Reports terminal functions, env hygiene,
# and per-profile IDE setup (Claude + Claude Ultra profiles, Ctrl+Q / Ctrl+Shift+U).
set -uo pipefail

pass() { printf '  \033[32mOK\033[0m   %s\n' "$1"; }
warn() { printf '  \033[33mWARN\033[0m %s\n' "$1"; }
fail() { printf '  \033[31mFAIL\033[0m %s\n' "$1"; }

echo "== shell (~/.bashrc) =="
grep -q '^claude()'  "$HOME/.bashrc" 2>/dev/null && grep -q '^claudew()' "$HOME/.bashrc" 2>/dev/null \
  && pass "claude() and claudew() defined" || fail "claude()/claudew() missing in ~/.bashrc"
defs="$(bash -ic 'type claude; type claudew' 2>/dev/null || true)"
echo "$defs" | grep -q -- '--effort max'                       && pass "claude  -> --effort max" || warn "claude not --effort max (open a NEW shell?)"
echo "$defs" | grep -q -- "--settings '{\"ultracode\": true}'" && pass "claudew -> ultracode"     || warn "claudew not ultracode (open a NEW shell?)"

echo
echo "== effort env hygiene (must be empty so claudew's ultracode isn't suppressed) =="
cur="$(printenv CLAUDE_CODE_EFFORT_LEVEL || true)"
[ -z "$cur" ] && pass "CLAUDE_CODE_EFFORT_LEVEL unset in this shell" || warn "CLAUDE_CODE_EFFORT_LEVEL=$cur set (terminal claudew would degrade)"
if command -v systemctl >/dev/null 2>&1; then
  systemctl --user show-environment 2>/dev/null | grep -q '^CLAUDE_CODE_EFFORT_LEVEL=' \
    && warn "CLAUDE_CODE_EFFORT_LEVEL in systemd --user env (leaks to desktop apps)" \
    || pass "not in systemd --user environment"
fi

echo
echo "== IDE profiles & keybindings (ALL profiles) =="
CM_HOME="$HOME" python3 - <<'PY'
import json, re, os, glob
home = os.environ["CM_HOME"]
def strip(raw):
    raw=re.sub(r'(^|[^:])//.*$', r'\1', raw, flags=re.M)
    raw=re.sub(r',(\s*[}\]])', r'\1', raw); return raw
def load(f):
    try: return json.loads(strip(open(f).read()) or "[]")
    except Exception as e: return e
def pt(b,key,prof):
    return (isinstance(b,dict) and b.get("key")==key and not str(b.get("command","")).startswith("-")
            and isinstance(b.get("args"),dict) and b["args"].get("profileName")==prof)

for label, sub in (("VS Code","Code"), ("Antigravity","Antigravity")):
    root = os.path.join(home, ".config", sub, "User")
    if not os.path.isdir(root):
        print(f"  {label}: not installed"); continue
    print(f"  [{label}]")
    for f in [os.path.join(root,"settings.json")]+sorted(glob.glob(os.path.join(root,"profiles","*","settings.json"))):
        d=load(f); short=f.replace(root+"/","")
        if isinstance(d,Exception): print(f"    FAIL invalid JSON: {short}: {d}"); continue
        profs=d.get("terminal.integrated.profiles.linux",{}); env=d.get("terminal.integrated.env.linux",{})
        c="Claude" in profs; u="Claude Ultra" in profs; nomode="CLAUDE_MODE" not in env
        eff=env.get("CLAUDE_CODE_EFFORT_LEVEL","<unset>")
        ok=c and u and nomode
        print(f"    {'OK ' if ok else 'CHK'} settings {short}: Claude={c} Ultra={u} eff={eff}{' [CLAUDE_MODE leftover]' if not nomode else ''}")
    for f in [os.path.join(root,"keybindings.json")]+sorted(glob.glob(os.path.join(root,"profiles","*","keybindings.json"))):
        if not os.path.exists(f): continue
        d=load(f); short=f.replace(root+"/","")
        if isinstance(d,Exception): print(f"    FAIL invalid keybindings: {short}: {d}"); continue
        q=any(pt(b,"ctrl+q","Claude") for b in d); uu=any(pt(b,"ctrl+shift+u","Claude Ultra") for b in d)
        print(f"    {'OK ' if (q and uu) else 'CHK'} keys {short}: Ctrl+Q->Claude={q} Ctrl+Shift+U->Ultra={uu}")
PY

echo
echo "== behavior simulation (what the Claude terminal profile resolves to) =="
sim(){ CLAUDE_CODE_EFFORT_LEVEL="$1" bash -c 'if [ "$CLAUDE_CODE_EFFORT_LEVEL" = ultracode ]; then echo "claude --settings ultracode"; else echo "claude --effort ${CLAUDE_CODE_EFFORT_LEVEL:-max}"; fi'; }
printf '  Ctrl+Q       (Claude, env=max)  -> %s\n' "$(sim max)"
printf '  Ctrl+Shift+U (Claude Ultra)     -> claude --settings ultracode (hardcoded)\n'
