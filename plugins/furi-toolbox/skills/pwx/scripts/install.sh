#!/usr/bin/env bash
# install.sh — instala pwx + browser (idempotente). Uso: install.sh [caminho do binário do navegador]
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
BIN="$HOME/.local/bin"; HOME_BA="$HOME/.browser-automation"
mkdir -p "$BIN" "$HOME_BA/logs" "$HOME_BA/profiles"

command -v node >/dev/null || { echo "node não encontrado (precisa de Node >= 20)"; exit 1; }
command -v playwright-cli >/dev/null || npm i -g @playwright/cli@latest

# shebang com o node absoluto: pwx roda mesmo onde o nvm não está no PATH (o hook SessionEnd do Claude Code)
NODE="$(command -v node)"
for f in pwx browser; do
  sed "1s|.*|#!$NODE|" "$HERE/$f" > "$BIN/$f"; chmod 0755 "$BIN/$f"
done
install -m 0644 "$HERE/pwx-background.cjs" "$BIN/pwx-background.cjs"

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

# hooks do Claude Code: SessionStart avisa a IA que o navegador desta máquina é o pwx e recolhe janelas órfãs; SessionEnd fecha as janelas da sessão na hora
# (o vigia que o pwx sobe fecha mesmo sem hook: terminal fechado, crash)
CTX="Navegador desta máquina: pwx (skill furi-toolbox:pwx) — navegador real, já logado, uma aba por sessão. Para abrir, ler, clicar ou testar qualquer site, inclusive conferir um deploy, ver um erro num painel ou reproduzir um bug web, use pwx em vez de Playwright MCP, npx playwright, um navegador novo ou curl/WebFetch em página logada."
SETTINGS="$HOME/.claude/settings.json"; [ -f "$SETTINGS" ] || echo '{}' > "$SETTINGS"
node -e '
const fs=require("fs"),[p,pwx,ctx]=process.argv.slice(1),d=JSON.parse(fs.readFileSync(p,"utf8"));
let changed=false;
const ensure=(event,cmd,isPwx)=>{
  const gs=((d.hooks??={})[event]??=[]);
  if(gs.some(g=>(g.hooks||[]).some(h=>h.command===cmd)))return;
  d.hooks[event]=gs.map(g=>({...g,hooks:(g.hooks||[]).filter(h=>!isPwx(h.command||""))})).filter(g=>g.hooks.length);   // troca versões antigas do hook
  d.hooks[event].push({hooks:[{type:"command",command:cmd,timeout:15}]});
  changed=true;console.log(`hook ${event} atualizado`);
};
ensure("SessionStart",`echo ${JSON.stringify(ctx)}`,(c)=>c.includes("furi-toolbox:pwx"));
ensure("SessionStart",`"${pwx}" gc >/dev/null 2>&1; true`,(c)=>/pwx"? gc/.test(c));
ensure("SessionEnd",`"${pwx}" close-tab >/dev/null 2>&1; true`,(c)=>/pwx"? close-tab/.test(c));
if(changed)fs.writeFileSync(p,JSON.stringify(d,null,2)+"\n");
' "$SETTINGS" "$BIN/pwx" "$CTX"

case ":$PATH:" in *":$BIN:"*) ;; *) echo "adicione $BIN ao PATH";; esac
echo "pronto: $(command -v pwx || echo "$BIN/pwx") · teste com: pwx goto https://example.com"
