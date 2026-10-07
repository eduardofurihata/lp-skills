---
name: pwx
description: 'Drives a real, already-logged-in browser from the terminal with `pwx` (playwright-cli over CDP to a dedicated automation browser profile; one tab per project/session; logins shared and persistent). Use it whenever a task needs to open, read, click through or test a website — logged-in pages (Gmail, Google, dashboards, admin panels), anti-bot sites, reproducing a web bug, checking a deployed page, acting as another role (admin/user) — or when pwx, playwright-cli or CDP come up. Prefer it over Playwright MCP or a fresh Playwright browser whenever login, cookies or parallel sessions matter.'
argument-hint: "[papel] <comando playwright-cli...>"
auto-invoke: true
---

# /pwx — conectar, olhar, agir, cristalizar, fechar

`pwx` comanda um navegador real que já está aberto e logado: cada projeto ganha a própria aba; os logins são do perfil, compartilhados por todas as sessões.

1. **Garantir — a máquina está configurada.** Configurada = `pwx --help` responde, `~/.local/bin/pwx-background.cjs` existe e `~/.claude/settings.json` tem o hook `SessionEnd` com `close-tab`. Faltou qualquer um (máquina nova, Node trocado no nvm, `env: node: No such file`) → rode `scripts/install.sh` desta skill (idempotente; precisa de Node ≥ 20 e um Chromium; caminho do navegador como argumento se não achar) e repita. Ele deixa: `pwx`/`browser` em `~/.local/bin` com o node absoluto no shebang (rodam sem nvm no PATH, como no hook), cada sessão numa janela própria aberta em segundo plano (não rouba o foco; clique nela para acompanhar), e o hook que fecha a aba quando o Claude Code fecha. Primeiro uso na máquina → `browser up` abre o navegador de automação; peça ao usuário o login nele, uma vez. `pwx` diz que o navegador não respondeu → `browser up [papel]`; papel inexistente → `browser add <papel>` e o mesmo pedido de login.
2. **Olhar — só quando precisa.** `pwx goto <url>`, depois `pwx snapshot` para ler a página e pegar as refs (`e12`). Snapshot custa tokens: tire um por tela nova, não um por ação; `pwx find "<texto>"` acha um trecho sem ler tudo.
3. **Agir — pela ref ou pelo seletor.** `pwx click e12`, `pwx fill e5 "texto"`, `pwx press Enter`, `pwx eval '() => location.href'`, `pwx screenshot --filename=<arquivo>`. Outra conta → o papel na frente: `pwx admin goto …`. Duas janelas no mesmo projeto → `PWX_SESSION=<nome> pwx …`. `pwx --help <comando>` dá as opções.
4. **Cristalizar — o que se repete vira script.** Fluxo que funcionou e vai rodar de novo → escreva um script Playwright que conecta no mesmo navegador (`chromium.connectOverCDP(\`http://127.0.0.1:${porta}\`)`, porta em `browser endpoint <papel>`), abre a própria página com `browser.contexts()[0].newPage()` e a fecha no fim — nunca `browser.close()` num navegador compartilhado.
5. **Fechar — a aba é sua, o resto não.** Terminou → `pwx close-tab`. Nunca feche aba de outra sessão, nunca faça logout nem troque conta no perfil compartilhado (derruba todas as sessões daquele papel), nunca derrube o navegador (`browser down`) sem o usuário pedir.

Senha, código 2FA ou login novo → peça ao usuário que entre na janela do navegador; não digite credencial.
