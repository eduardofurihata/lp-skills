#!/usr/bin/env bash
# install.sh — instala pwx + browser (idempotente). Uso: install.sh [caminho do binário do navegador]
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
BIN="$HOME/.local/bin"; HOME_BA="$HOME/.browser-automation"
mkdir -p "$BIN" "$HOME_BA/logs" "$HOME_BA/profiles"

command -v node >/dev/null || { echo "node não encontrado (precisa de Node >= 20)"; exit 1; }
command -v playwright-cli >/dev/null || npm i -g @playwright/cli@latest

install -m 0755 "$HERE/pwx" "$BIN/pwx"
install -m 0755 "$HERE/browser" "$BIN/browser"

if [ ! -f "$HOME_BA/config.json" ]; then
  BROWSER="${1:-}"
  if [ -z "$BROWSER" ]; then
    for c in "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge" \
             "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
             "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser" \
             /usr/bin/microsoft-edge /usr/bin/google-chrome /usr/bin/chromium; do
      [ -x "$c" ] && { BROWSER="$c"; break; }
    done
  fi
  [ -n "$BROWSER" ] || { echo "nenhum navegador Chromium encontrado; passe o caminho: install.sh <binário>"; exit 1; }
  node -e 'const fs=require("fs");const c=JSON.parse(fs.readFileSync(process.argv[1],"utf8"));c.browserBinary=process.argv[2];fs.writeFileSync(process.argv[3],JSON.stringify(c,null,2)+"\n")' \
    "$HERE/config.example.json" "$BROWSER" "$HOME_BA/config.json"
  echo "config criada: $HOME_BA/config.json (navegador: $BROWSER)"
fi

# snapshots do playwright-cli fora dos repositórios
GI="$HOME/.config/git/ignore"; mkdir -p "$(dirname "$GI")"; touch "$GI"
grep -qx '.playwright-cli/' "$GI" || echo '.playwright-cli/' >> "$GI"

# fecha a aba do projeto quando a sessão do Claude Code termina
SETTINGS="$HOME/.claude/settings.json"; [ -f "$SETTINGS" ] || echo '{}' > "$SETTINGS"
node -e '
const fs=require("fs"),p=process.argv[1],d=JSON.parse(fs.readFileSync(p,"utf8"));
const cmd="command -v pwx >/dev/null && pwx close-tab >/dev/null 2>&1; true";
const se=((d.hooks??={}).SessionEnd??=[]);
if(!se.some(g=>(g.hooks||[]).some(h=>h.command===cmd))){se.push({hooks:[{type:"command",command:cmd,timeout:15}]});fs.writeFileSync(p,JSON.stringify(d,null,2)+"\n");console.log("hook SessionEnd adicionado");}
' "$SETTINGS"

case ":$PATH:" in *":$BIN:"*) ;; *) echo "adicione $BIN ao PATH";; esac
echo "pronto: $(command -v pwx || echo "$BIN/pwx") · teste com: pwx goto https://example.com"
