#!/usr/bin/env bash
# claude-shortcuts verifier — read-only. Reports the shell functions, env hygiene,
# and the per-IDE, per-profile setup (bash / Claude / Claude Ultra profiles, support
# settings, Ctrl+Q / Ctrl+Shift+U / Ctrl+Shift+Q), plus what Ctrl+Q resolves to.
set -uo pipefail

pass() { printf '  \033[32mOK\033[0m   %s\n' "$1"; }
warn() { printf '  \033[33mWARN\033[0m %s\n' "$1"; }
fail() { printf '  \033[31mFAIL\033[0m %s\n' "$1"; }

echo "== shell (~/.bashrc) =="
rc="$HOME/.bashrc"
grep -q '^_claude_clean_env()' "$rc" 2>/dev/null && pass "_claude_clean_env() defined" || fail "_claude_clean_env() missing in ~/.bashrc (child-session env would leak)"
grep -q '^claude()'  "$rc" 2>/dev/null && grep -q '^claudew()' "$rc" 2>/dev/null \
  && pass "claude() and claudew() defined" || fail "claude()/claudew() missing in ~/.bashrc"
n_claude="$(grep -c '^claude()' "$rc" 2>/dev/null || true)"
[ "${n_claude:-0}" -le 1 ] && pass "claude() defined once" || warn "claude() defined ${n_claude}x — the last one wins; re-run install.sh"
grep -q '^# >>> claude-modes >>>$' "$rc" 2>/dev/null && warn "legacy claude-modes block still present" || true
defs="$(bash -ic 'type claude; type claudew' 2>/dev/null || true)"
echo "$defs" | grep -q -- '--effort'                           && warn "claude forces --effort (expected: none; level comes from ~/.claude/settings.json)" || pass "claude  -> no --effort (settings/efforts at runtime)"
echo "$defs" | grep -q -- "--settings '{\"ultracode\": true}'" && pass "claudew -> ultracode" || warn "claudew not ultracode (open a NEW shell?)"
echo "$defs" | grep -q '_claude_clean_env'                      && pass "both call _claude_clean_env" || warn "functions don't call _claude_clean_env (open a NEW shell?)"

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
echo "== IDE profiles, support settings & keybindings (ALL profiles) =="
CS_HOME="$HOME" python3 - <<'PY'
import json, re, os, glob
home = os.environ["CS_HOME"]
def strip(raw):
    raw=re.sub(r'(^|[^:])//.*$', r'\1', raw, flags=re.M)
    raw=re.sub(r',(\s*[}\]])', r'\1', raw); return raw
def load(f):
    try: return json.loads(strip(open(f).read()) or "[]")
    except Exception as e: return e
def pt(b,key,prof):
    return (isinstance(b,dict) and b.get("key")==key and not str(b.get("command","")).startswith("-")
            and isinstance(b.get("args"),dict) and b["args"].get("profileName")==prof)
def has(d,key,cmd):
    return any(isinstance(b,dict) and b.get("key")==key and b.get("command")==cmd for b in d)

IDES = (("VS Code", "Code"), ("Antigravity IDE", "Antigravity IDE"), ("Antigravity (legacy)", "Antigravity"))
for label, sub in IDES:
    root = os.path.join(home, ".config", sub, "User")
    if not os.path.isdir(root):
        print(f"  {label}: not installed"); continue
    print(f"  [{label}]  {root}")
    for f in [os.path.join(root,"settings.json")]+sorted(glob.glob(os.path.join(root,"profiles","*","settings.json"))):
        d=load(f); short=f.replace(root+"/","")
        if isinstance(d,Exception): print(f"    FAIL invalid JSON: {short}: {d}"); continue
        profs=d.get("terminal.integrated.profiles.linux",{}); env=d.get("terminal.integrated.env.linux",{})
        c="Claude" in profs; u="Claude Ultra" in profs; b="bash" in profs
        flow = d.get("terminal.integrated.flowControl") is False
        skb  = d.get("terminal.integrated.sendKeybindingsToShell") is False
        skip = "workbench.action.terminal.newWithProfile" in d.get("terminal.integrated.commandsToSkipShell", [])
        nomode="CLAUDE_MODE" not in env
        eff=env.get("CLAUDE_CODE_EFFORT_LEVEL","<unset>")
        ok = c and u and b and flow and skb and skip and nomode
        flags = " ".join(n for n, v in (("Claude",c),("Ultra",u),("bash",b),("flowControl",flow),("noShellKeys",skb),("skipShell",skip)) if not v)
        print(f"    {'OK ' if ok else 'CHK'} settings {short}: eff={eff!r}" + (f"  missing: {flags}" if flags else "") + (" [CLAUDE_MODE leftover]" if not nomode else ""))
    for f in [os.path.join(root,"keybindings.json")]+sorted(glob.glob(os.path.join(root,"profiles","*","keybindings.json"))):
        if not os.path.exists(f): continue
        d=load(f); short=f.replace(root+"/","")
        if isinstance(d,Exception): print(f"    FAIL invalid keybindings: {short}: {d}"); continue
        q=any(pt(b,"ctrl+q","Claude") for b in d); uu=any(pt(b,"ctrl+shift+u","Claude Ultra") for b in d)
        nq=has(d,"ctrl+q","-workbench.action.quit"); sq=has(d,"ctrl+shift+q","workbench.action.quit")
        ok = q and uu and nq and sq
        flags = " ".join(n for n, v in (("Ctrl+Q->Claude",q),("Ctrl+Shift+U->Ultra",uu),("Ctrl+Q-quit",nq),("Ctrl+Shift+Q->quit",sq)) if not v)
        print(f"    {'OK ' if ok else 'CHK'} keys {short}" + (f": missing {flags}" if flags else ""))
PY

echo
echo "== what Ctrl+Q (profile \"Claude\") resolves to =="
sim(){ CLAUDE_CODE_EFFORT_LEVEL="$1" bash -c 'M="${CLAUDE_CODE_EFFORT_LEVEL:-max}"; if [ "$M" = ultracode ]; then echo "claude --settings ultracode"; else echo "claude --effort $M"; fi'; }
printf '  Ctrl+Q       (env vazio / ausente)   -> %s\n' "$(sim "")"
printf '  Ctrl+Q       (env=high)              -> %s\n' "$(sim high)"
printf '  Ctrl+Q       (env=ultracode)         -> %s\n' "$(sim ultracode)"
printf '  Ctrl+Shift+U (Claude Ultra)          -> claude --settings ultracode (hardcoded)\n'
lvl="$(python3 -c 'import json,os;print(json.load(open(os.path.expanduser("~/.claude/settings.json"))).get("effortLevel","<unset>"))' 2>/dev/null || echo '<unreadable>')"
printf '  terminal claude                      -> effortLevel do ~/.claude/settings.json = %s (assimetria intencional)\n' "$lvl"
