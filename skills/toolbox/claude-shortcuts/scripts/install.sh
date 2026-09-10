#!/usr/bin/env bash
# claude-shortcuts installer — replicates the user's Claude Code shortcuts:
#
#   Terminal (~/.bashrc):
#     claude   -> no forced effort (level comes from ~/.claude/settings.json "effortLevel"
#                 and /effort at runtime)
#     claudew  -> ultracode (--settings '{"ultracode": true}')
#     both run `_claude_clean_env` first (drops the env of an enclosing Claude session,
#     otherwise the new one is a child session with no transcript)
#
#   IDEs (VS Code + Antigravity IDE + legacy Antigravity), in ALL profiles:
#     terminal profile "bash"          -> plain shell; unsets the effort knob
#     terminal profile "Claude"        -> Ctrl+Q: --effort max by default; CLAUDE_CODE_EFFORT_LEVEL
#                                         in the IDE env tunes it ("" = max, level, or "ultracode")
#     terminal profile "Claude Ultra"  -> Ctrl+Shift+U: hardcoded ultracode
#     support settings                 -> flowControl off, sendKeybindingsToShell off,
#                                         commandsToSkipShell ∋ newWithProfile (Ctrl+Q reaches the
#                                         workbench even with a terminal focused)
#     keybinds Ctrl+Q / Ctrl+Shift+U   -> open the profiles; Ctrl+Q unbound from quit,
#                                         quit moves to Ctrl+Shift+Q
#
# Settings files are JSONC (// comments, trailing commas) — patched by SURGICAL text
# edits so comments are preserved (the env.linux block is rewritten only when it is
# missing our knob — when it is already right it is left untouched, comments included).
# On the reference machine every step reports "ok" — the skill mirrors it, it doesn't change it.
# Idempotent. Backs up every file it touches to *.bak-<ts>.
# Usage:  bash install.sh [--default-mode low|medium|high|xhigh|max|ultracode]
#                         [--target shell|vscode|antigravity|antigravity-legacy]...
#         --target limits the run (repeatable; default = everything). Typical: the
#         Antigravity IDE is the reference, so `--target vscode` propagates it to VS Code
#         without touching Antigravity (direction: Antigravity > VS Code, never the reverse).
#         (no --default-mode = knob left absent/empty in the IDE env = max on Ctrl+Q — absent and ""
#          resolve the same; the terminal is never forced)
set -euo pipefail

DEFAULT_MODE=""
TARGETS=""
while [ $# -gt 0 ]; do
  case "$1" in
    --default-mode) DEFAULT_MODE="${2:-}"; shift 2 ;;
    --target)
      case "${2:-}" in shell|vscode|antigravity|antigravity-legacy) TARGETS="$TARGETS ${2}"; shift 2 ;;
        *) echo "unknown --target: ${2:-} (shell|vscode|antigravity|antigravity-legacy)" >&2; exit 2 ;; esac ;;
    *) echo "unknown arg: $1" >&2; exit 2 ;;
  esac
done
# No --target = everything; otherwise only the named ones.
want() { [ -z "$TARGETS" ] || case " $TARGETS " in *" $1 "*) return 0 ;; *) return 1 ;; esac; }
TS="$(date +%Y%m%d-%H%M%S)"

# ---------------------------------------------------------------------------
# 1) Shell: _claude_clean_env + claude() (effort from settings) + claudew() (ultracode)
# ---------------------------------------------------------------------------
install_bashrc() {
  local rc="$HOME/.bashrc"
  [ -f "$rc" ] || touch "$rc"
  echo "==> shell (~/.bashrc)"
  CS_RC="$rc" CS_TS="$TS" python3 - <<'PY'
import os, re, shutil

rc = os.environ["CS_RC"]; ts = os.environ["CS_TS"]
txt = open(rc).read()

BLOCK = """# >>> claude-shortcuts >>>
# claude  -> effort do ~/.claude/settings.json ("effortLevel") e do /effort em runtime; nada forçado.
# claudew -> ultracode (xhigh + workflows automáticos) via --settings.
# Funções (não alias) para o JSON de --settings escapar limpo; "$@" repassa args extras.
# _claude_clean_env limpa o env herdado de uma sessão Claude (terminal aberto de DENTRO do Claude):
# sem isso a nova sessão vira "child session" e NÃO grava transcript -> some do /resume.
_claude_clean_env() { unset CLAUDECODE CLAUDE_CODE_CHILD_SESSION CLAUDE_PID CLAUDE_CODE_SESSION_ID CLAUDE_CODE_ENTRYPOINT AI_AGENT; }
claude()  { ( _claude_clean_env; command claude --dangerously-skip-permissions "$@" ); }
claudew() { ( _claude_clean_env; command claude --dangerously-skip-permissions --settings '{"ultracode": true}' "$@" ); }
# Remove qualquer CLAUDE_CODE_EFFORT_LEVEL herdado para nunca sobrescrever o ultracode do claudew.
unset CLAUDE_CODE_EFFORT_LEVEL
# <<< claude-shortcuts <<<
"""

# Lines this installer owns, wherever they came from: our marked block (old or new
# name), a legacy alias, or hand-written bare definitions. A bare definition is
# removed together with the run of `#` comment lines directly above it, so a
# hand-maintained block migrates cleanly instead of leaving orphan comments —
# and, crucially, no second definition survives below ours to override it.
START = re.compile(r'^# >>> claude-(modes|shortcuts) >>>$')
END   = re.compile(r'^# <<< claude-(modes|shortcuts) <<<$')
OWNED = re.compile(r'^(_claude_clean_env\(\)|claude\(\)|claudew\(\)|alias claude=|unset CLAUDE_CODE_EFFORT_LEVEL\s*$)')

lines = txt.split("\n")
DEFS = [l for l in BLOCK.split("\n") if l and not l.startswith('#')]
if (all(lines.count(l) == 1 for l in DEFS)
        and not any(l.startswith('alias claude=') or START.match(l) for l in lines)):
    print("  ok: claude/claudew/_claude_clean_env já definidos exatamente assim — nada a fazer")
    raise SystemExit(0)
out = []
i = 0
while i < len(lines):
    line = lines[i]
    if START.match(line):
        j = i + 1
        while j < len(lines) and not END.match(lines[j]):
            j += 1
        i = j + 1
        continue
    if OWNED.match(line):
        while out and out[-1].startswith('#') and not out[-1].startswith('#!'):
            out.pop()
        i += 1
        continue
    out.append(line)
    i += 1

body = "\n".join(out)
body = re.sub(r'\n{3,}', '\n\n', body).rstrip('\n')
new = body + "\n\n" + BLOCK
if new != txt:
    shutil.copy2(rc, rc + ".bak-" + ts)
    open(rc, "w").write(new)
    print("  ok: bloco claude-shortcuts gravado (definições antigas/manuais removidas)")
else:
    print("  ok: bloco claude-shortcuts já em dia")
PY
}

# ---------------------------------------------------------------------------
# 2) IDE settings + keybindings across ALL profiles (one Python pass per IDE).
# ---------------------------------------------------------------------------
patch_ide() {
  local cfg_root="$1" label="$2"
  [ -d "$cfg_root" ] || { echo "==> $label: not installed, skipping"; return; }
  echo "==> $label ($cfg_root)"
  CS_ROOT="$cfg_root" CS_MODE="$DEFAULT_MODE" CS_TS="$TS" python3 - <<'PY'
import os, re, glob, json

root = os.environ["CS_ROOT"]; mode = os.environ["CS_MODE"]; ts = os.environ["CS_TS"]

# --- the three terminal profiles, byte-for-byte as on the reference machine ----
# (the IDE isn't launched from inside a Claude session, so no child-session cleanup here;
#  that lives in the shell functions, where it is needed)
BASH_CMD   = 'unset CLAUDE_CODE_EFFORT_LEVEL; stty -ixon; exec bash'
CLAUDE_CMD = ('stty -ixon; M="${CLAUDE_CODE_EFFORT_LEVEL:-max}"; unset CLAUDE_CODE_EFFORT_LEVEL; '
              'if [ "$M" = ultracode ]; then command claude --dangerously-skip-permissions --settings \'{"ultracode": true}\'; '
              'else command claude --dangerously-skip-permissions --effort "$M"; fi; exec bash')
ULTRA_CMD  = ('stty -ixon; unset CLAUDE_CODE_EFFORT_LEVEL; '
              'command claude --dangerously-skip-permissions --settings \'{"ultracode": true}\'; exec bash')

PROFILES = [
    ("bash",         BASH_CMD,   "terminal-bash"),
    ("Claude",       CLAUDE_CMD, "robot"),
    ("Claude Ultra", ULTRA_CMD,  "zap"),
]

def backup(f):
    if os.path.exists(f):
        open(f + ".bak-" + ts, "w").write(open(f).read())

# --- JSONC-aware span helpers -------------------------------------------------
def match_span(txt, i, open_ch, close_ch):
    """Index just past the bracket that closes the one at txt[i]; strings/escapes respected."""
    depth = 0; in_str = False; esc = False
    while i < len(txt):
        c = txt[i]
        if in_str:
            if esc: esc = False
            elif c == '\\': esc = True
            elif c == '"': in_str = False
        else:
            if c == '"': in_str = True
            elif c == open_ch: depth += 1
            elif c == close_ch:
                depth -= 1
                if depth == 0: return i + 1
        i += 1
    return None

def find_key_span(txt, key, open_ch='{', close_ch='}'):
    """Span of `"key": {...}` (or [...]) plus its trailing comma, if any."""
    m = re.search(r'^[ \t]*"%s"\s*:\s*\%s' % (re.escape(key), open_ch), txt, flags=re.M)
    if not m: return None
    s = m.start(); e = match_span(txt, m.end() - 1, open_ch, close_ch)
    if e is None: return None
    j = e
    while j < len(txt) and txt[j] in ' \t\r\n': j += 1
    if j < len(txt) and txt[j] == ',': return (s, j + 1)
    return (s, e)

def remove_key(txt, key):
    while True:
        sp = find_key_span(txt, key)
        if not sp: return txt
        s, e = sp
        while e < len(txt) and txt[e] in ' \t': e += 1
        if e < len(txt) and txt[e] == '\n': e += 1
        txt = txt[:s].rstrip(' \t') + txt[e:]

def insert_top(txt, snippet):
    """Insert `snippet` (a complete `"key": value` line, no trailing comma) right after the root `{`."""
    b = txt.index('{')
    rest = txt[b+1:]
    sep = '' if rest.lstrip().startswith('}') else ','
    return txt[:b+1] + '\n' + snippet + sep + txt[b+1:]

def strip_jsonc(raw):
    raw = re.sub(r'(^|[^:])//.*$', r'\1', raw, flags=re.M)
    raw = re.sub(r',(\s*[}\]])', r'\1', raw); return raw

# --- terminal profiles --------------------------------------------------------
def entry(name, cmd, icon, indent):
    body = json.dumps({"path": "/bin/bash", "args": ["-c", cmd], "icon": icon}, indent=2, ensure_ascii=False)
    return indent + json.dumps(name) + ': ' + ('\n' + indent).join(body.split('\n'))

def profiles_already_right(blk):
    try:
        obj = json.loads(strip_jsonc(blk[blk.index('{'):].rstrip().rstrip(',')))
    except Exception:
        return False
    return all(obj.get(n) == {"path": "/bin/bash", "args": ["-c", c], "icon": ic} for n, c, ic in PROFILES)

def ensure_profiles(txt):
    sp = find_key_span(txt, "terminal.integrated.profiles.linux")
    if sp:
        s, e = sp
        blk = txt[s:e]
        if profiles_already_right(blk): return txt   # same path/args/icon → keep the file's own formatting
        for name, _, _ in PROFILES:
            blk = remove_key(blk, name)             # impose: drop entries with our names
        blk = re.sub(r',(\s*\})', r'\1', blk)      # heal a trailing comma left by a removal
        m = re.search(r'\{', blk); i = m.end()
        key_indent = re.match(r'[ \t]*', blk).group(0)
        ins = ',\n'.join(entry(n, c, ic, key_indent + '  ') for n, c, ic in PROFILES)
        rest = blk[i:].lstrip()
        sep = '' if rest.startswith('}') else ','
        blk = blk[:i] + '\n' + ins + sep + blk[i:]
        return txt[:s] + blk + txt[e:]
    ins = ',\n'.join(entry(n, c, ic, '    ') for n, c, ic in PROFILES)
    return insert_top(txt, '  "terminal.integrated.profiles.linux": {\n' + ins + '\n  }')

# --- env block: rewritten wholesale (other keys kept), our knob + comments -----
ENV_KEY = "terminal.integrated.env.linux"
ENV_COMMENTS = [
    '// Padrão do perfil "Claude" (Ctrl+Q). Vazio = max. Valores: low/medium/high/xhigh/max/ultracode.',
    '// O perfil dá unset nela antes de lançar o claude, para o /effort continuar livre na sessão.',
]

def ensure_env(txt):
    others = {}
    sp = find_key_span(txt, ENV_KEY)
    had_comma = False
    if sp:
        s, e = sp
        raw = txt[s:e].rstrip()
        had_comma = raw.endswith(',')
        obj_txt = raw[raw.index('{'):].rstrip(',')
        try:
            others = json.loads(strip_jsonc(obj_txt) or "{}")
        except Exception:
            others = {}
        cur = others.get("CLAUDE_CODE_EFFORT_LEVEL", "")   # absent and "" both resolve to max (`:-max`)
        if cur == mode and "CLAUDE_MODE" not in others:
            return txt                                  # already right: keep the block (and its comments) as is
        others.pop("CLAUDE_MODE", None)                # legacy two-variable design
        others.pop("CLAUDE_CODE_EFFORT_LEVEL", None)
        key_indent = re.match(r'[ \t]*', txt[s:e]).group(0)
    else:
        if mode == "": return txt                       # no block at all is also "max"; don't invent one
        key_indent = '  '
    inner = key_indent + '  '
    lines = [inner + c for c in ENV_COMMENTS]
    items = [('CLAUDE_CODE_EFFORT_LEVEL', mode)] + sorted(others.items())
    lines += [inner + json.dumps(k) + ': ' + json.dumps(v, ensure_ascii=False) + (',' if n < len(items) - 1 else '')
              for n, (k, v) in enumerate(items)]
    block = key_indent + json.dumps(ENV_KEY) + ': {\n' + '\n'.join(lines) + '\n' + key_indent + '}'
    if sp:
        return txt[:s] + block + (',' if had_comma else '') + txt[e:]
    return insert_top(txt, block)

# --- support settings ---------------------------------------------------------
def set_scalar(txt, key, value, enforce):
    val = json.dumps(value)
    pat = re.compile(r'^([ \t]*"%s"\s*:\s*)([^,\n}]+)' % re.escape(key), flags=re.M)
    m = pat.search(txt)
    if m:
        if not enforce or m.group(2).strip() == val: return txt
        return txt[:m.start(2)] + val + txt[m.end(2):]
    return insert_top(txt, '  ' + json.dumps(key) + ': ' + val)

def ensure_array_has(txt, key, value):
    sp = find_key_span(txt, key, '[', ']')
    if not sp:
        return insert_top(txt, '  ' + json.dumps(key) + ': [\n    ' + json.dumps(value) + '\n  ]')
    s, e = sp
    blk = txt[s:e]
    if json.dumps(value) in strip_jsonc(blk): return txt
    i = blk.index('[') + 1
    rest = blk[i:].lstrip()
    sep = '' if rest.startswith(']') else ','
    key_indent = re.match(r'[ \t]*', blk).group(0)
    blk = blk[:i] + '\n' + key_indent + '  ' + json.dumps(value) + sep + blk[i:]
    return txt[:s] + blk + txt[e:]

def ensure_support(txt):
    txt = set_scalar(txt, "terminal.integrated.flowControl", False, enforce=True)          # Ctrl+Q is XON
    txt = set_scalar(txt, "terminal.integrated.sendKeybindingsToShell", False, enforce=True)
    txt = ensure_array_has(txt, "terminal.integrated.commandsToSkipShell", "workbench.action.terminal.newWithProfile")
    txt = set_scalar(txt, "terminal.integrated.defaultProfile.linux", "bash", enforce=False)
    txt = set_scalar(txt, "terminal.integrated.defaultLocation", "editor", enforce=False)
    txt = set_scalar(txt, "terminal.integrated.enablePersistentSessions", False, enforce=False)
    return txt

# ---- settings: base + every profile ----
sfiles = [os.path.join(root, "settings.json")] + sorted(glob.glob(os.path.join(root, "profiles", "*", "settings.json")))
for f in sfiles:
    if not os.path.exists(f):
        open(f, "w").write("{}\n")
    txt = open(f).read()
    if not txt.strip(): txt = "{}\n"
    new = ensure_support(ensure_env(ensure_profiles(txt)))
    if new != txt:
        backup(f); open(f, "w").write(new); print("    settings: " + f.replace(root + "/", ""))
    else:
        print("    settings ok: " + f.replace(root + "/", ""))

# ---- keybindings: base (covers inheritors) + every existing per-profile file ----
# Parse-clean-rewrite: preserves the leading // header, drops stale bindings, dedupes.
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

def has(data, key, cmd):
    return any(isinstance(b, dict) and b.get("key") == key and b.get("command") == cmd for b in data)

KB_QUIT = {"key": "ctrl+shift+q", "command": "workbench.action.quit"}
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
    if not has(data, "ctrl+shift+q", "workbench.action.quit"):          data.append(KB_QUIT)
    if not has(data, "ctrl+q", "-workbench.action.quit"):               data.append(KB_QNEG)
    if not any(points_to(b, "ctrl+q", "Claude") for b in data):             data.append(KB_Q)
    if not any(points_to(b, "ctrl+shift+u", "Claude Ultra") for b in data): data.append(KB_U)
    new = lead_comment(raw) + json.dumps(data, indent=4, ensure_ascii=False) + "\n"
    if new != raw:
        backup(f); open(f, "w").write(new); print("    keybindings: " + f.replace(root + "/", ""))
    else:
        print("    keybindings ok: " + f.replace(root + "/", ""))
PY
}

echo "claude-shortcuts installer (Ctrl+Q default: ${DEFAULT_MODE:-max — env var ausente/vazia}; targets: ${TARGETS:-all})"
echo
if want shell;              then install_bashrc; echo; fi
if want vscode;             then patch_ide "$HOME/.config/Code/User"            "VS Code"; echo; fi
if want antigravity;        then patch_ide "$HOME/.config/Antigravity IDE/User" "Antigravity IDE"; echo; fi
if want antigravity-legacy; then patch_ide "$HOME/.config/Antigravity/User"     "Antigravity (legacy)"; echo; fi
echo "Done."
echo "  Terminal : 'source ~/.bashrc' then:  claude (effort do settings) | claudew (ultracode)"
echo "  IDEs     : reload window, then:  Ctrl+Q -> Claude (max) | Ctrl+Shift+U -> Claude Ultra (ultracode) | Ctrl+Shift+Q -> quit"
echo "             (para mudar o padrão do Ctrl+Q: CLAUDE_CODE_EFFORT_LEVEL em terminal.integrated.env.linux"
echo "              do settings.json de cada profile — ou rode com --default-mode <nivel|ultracode>)"
echo "  Verify   : bash $(dirname "$0")/verify.sh"
