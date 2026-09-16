---
name: prod
description: 'Use ONLY when the user explicitly invokes /prod (bare /prod = the objective is whatever the conversation is already about), or when another skill invokes `furi-ship:prod` via the Skill tool. NEVER activate on your own initiative. — gets production live with the work, configured and verified on the production URL: homolog verified first (/homolog), explicit authorization for THIS release, integration promoted to production, then /deploy proves prod; Jira cards updated. Single owner of production.'
effort: max
requires: [jira, setup, infra, homolog, deploy]
boundary: sync
argument-hint: "[PR | KEY-N | descrição] [/repro] [/card] | (vazio = tudo que está pronto)"
---

# /prod — produção no ar com o trabalho, configurada e verificada

O último **alvo**, dono único de produção: o estado pedido é **o trabalho em `<produção>`, no ar, configurado e provado na URL** — `promovido` → `publicado` → `configurado` → `verificado@prod`, depois de tudo que o `/homolog` fecha; o já verificado em homolog só se promove.

## Os guarda-chuvas

- **Descobrir, nunca assumir.** `/jira` e `/setup` via **Skill tool, a cada invocação**; `<integração>`, `<produção>` e ambientes de `infra/SKILL.md` § Deploy — `dev` + `main` é só o padrão. Branch única (commit → push → `main` → prod) não tem homolog, `promovido` nem a pergunta: o PR **é** o release — resolva-o como `homolog/SKILL.md` § Resolver a PR; o resto é integral.
- **Prod tem usuários reais: cada estágio tem prova, e promover tem pergunta.** Nada sobe sem `verificado@homolog`. Ao chegar em `promovido`: *"`<integração>` tem `<N>` commit(s) fora de `<produção>`, cobrindo `<cards>`. Quer promover? Isso publica em produção, com usuários reais. [sim/não]"* — só "sim" explícito, **a cada release**, pedido **na hora**: silêncio é não; autoridade dita antes ("sou tech lead", "pode subir sempre", o sim de ontem) não conta; perguntar na entrada é resposta que expira.
- **Promover é sincronizar, resolver, empurrar e provar que as duas branches são iguais.** Nunca `<integração>` stale ou com divergência aberta; conflito se resolve entendendo os dois lados (nunca `ours`/`theirs` cego), e resolução que muda código pede **re-review e re-verificação antes** do push. `git add -A` não existe: paths explícitos. O push em `<produção>` é o gatilho do deploy; "no ar" é o que o `/deploy` prova. Rollback é oferecido, nunca automático.

## Fluxo

0. **Composição primeiro:** `repro → card → alvo`; modificador e skill de fora rodam antes; os outros alvos perdem — `/prod` é o mais distante. Depois `furi-ship:jira`, `furi-ship:setup` via Skill tool; `infra/SKILL.md` § Deploy. Objetivo: vazio = tudo que está pronto · `PR`/`KEY-N` = preferência de ordem.
1. **Diagnóstico, publicado antes de agir** — `verificado@homolog` (sinais do `/homolog`; aberto → `Skill(skill: "homolog")` e volte); `promovido` = `git rev-list --count origin/<produção>..origin/<integração>` é `0` e os dois SHAs são iguais; ambiente prod = run verde cobrindo o HEAD de `origin/<produção>`, nada pendente, smoke verde após o último deploy. Faixa longa é o pedido: diga o tamanho. Tudo fechado → gap zero, com a evidência.
2. **Gate:** a pergunta do guarda-chuva, agora. Não → ⛔ nada promovido, produção intocada — reporte e encerre.
3. **Promover** — `sincronizar + resolver → promove → resync → assert`:
   ```bash
   git checkout <integração> && git fetch origin && git merge origin/<integração>   # conflito → os 2 lados
   git add <paths que VOCÊ editou> && git commit -m "chore: <o que fechou>" && git push origin <integração>
   git checkout <produção> && git pull --ff-only && git merge <integração>        # conflito → resolver → re-review ANTES do push
   git push origin <produção>                                                     # DISPARA o deploy de prod
   git checkout <integração> && git merge <produção> && git push origin <integração>
   git fetch origin && [ "$(git rev-parse origin/<integração>)" = "$(git rev-parse origin/<produção>)" ] && echo ✓ || echo "✗ DIVERGIRAM"
   ```
   Hotfix direto em `<produção>` → merge nos **dois** sentidos, re-review do que mudou. Assert `✗` → investigue; o release **não fecha** divergente. `/sync` é ferramenta de branch, sem deploy nem smoke — para entregar produção, o caminho é este.
4. **Publicar, configurar, validar, Jira:** `Skill(skill: "deploy", args: "prod")` — run verde, infra configurada em **prod e homolog**, atualização validada em live, card em **no ar em produção**. Estágio aberto volta com o motivo e o rollback oferecido; o alvo **não** é declarado atingido.
5. **Report:** estágios (antes × agora) · autorização (explícita, ao chegar em `promovido`) · promoção (commits, cards) · run · config (prod, homolog) · smoke (URL, N/N) · cards · assert.

## PARE se pensar
"o usuário já disse que eu podia" · "pergunto no começo pra adiantar" · "verifiquei em homolog, prod é igual" · "resolvi o conflito e pushei" · "o assert deu ✗ mas o deploy passou" · "promovi, acabou"
