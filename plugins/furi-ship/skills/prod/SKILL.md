---
name: prod
description: 'Use ONLY when the user explicitly invokes /prod (bare /prod = the objective is whatever the conversation is already about), or when another skill invokes `furi-ship:prod` via the Skill tool. NEVER activate on your own initiative. — production live with the work: homolog guaranteed (/homolog) → promote integration to production → publish, configure, validate production → Jira → return. Single owner of production.'
effort: max
requires: [jira, setup, homolog, infra]
boundary: sync
argument-hint: "[PR | KEY-N | descrição] [/repro] [/card] | (vazio = tudo que está pronto)"
---

# /prod — homolog garantido e promovido, depois produção no ar e provado

Dono único de produção, onde há usuários reais: cada passo tem prova; quem digita `/prod` autoriza este release — promover não pergunta.

## Primeiro, homolog e a promoção

- [ ] Compor: `repro → card → alvo`, skill de fora antes; os outros alvos perdem
- [ ] `/jira` e `/setup` via Skill tool, a cada invocação
- [ ] Ler `.claude/ship/prod.md`: `<produção>` (a branch que publica), URL, gatilho, checagem, rotas críticas, rollback, runner, último release (commit, data, cards), pendências; criar ou atualizar se e somente se faltar ou divergir, perguntando só o não derivável. `<integração>` vem do `homolog.md` (não existe → a branch que os PRs miram; sem gravar)
- [ ] Diagnosticar antes de agir: `verificado@homolog`, `promovido` (integração e produção iguais em `origin`), ambiente; faixa longa é o pedido — diga o tamanho; tudo fechado → gap zero
- [ ] Garantir homolog: aberto → `Skill(skill: "homolog")`; só o verificado se promove
- [ ] Promover: integração atualizada com o remoto → o que é seu commitado com paths explícitos → integração em produção → push em produção (o gatilho) → resync produção em integração → assert de que as duas são iguais em `origin`

Produção é `main`, senão `master`, senão a default; igual à integração ⇒ branch única: sem homolog nem promoção, `verificado@homolog` e `promovido` = `—`, diagnóstico `pr` · `integrado` · ambiente — a PR é o release, resolvida como `homolog/SKILL.md` § Primeiro, a PR, sem `homolog.md`. Valor de secret, nunca. Conflito entendendo os dois lados; conflito que muda código → re-review antes do push; assert divergente → o release não fecha. Hotfix direto em produção → merge nos dois sentidos, re-review. `/sync` é ferramenta de branch, sem publicar.

## Só então, produção no ar

- [ ] Publicar: push na `<produção>` dispara o workflow; esperar o run verde
- [ ] Configurar, em prod e em homolog: migrations (após o código no ar), env, secrets, flags e seeds do `## DevOps` das PRs
- [ ] Validar em live, só leitura: responde, commit publicado no ar, rotas críticas sem erro
- [ ] Sincronizar `/jira`, **no ar em produção**, em cada card que subiu — só depois de validado
- [ ] Atualizar `prod.md`; devolver estágios, promoção (commits, cards), run, validação, cards, assert

Run vermelho seu: conserte e redeploye, teto ~3; fila, runner offline, nenhum run: reporte, não contorne. Secret: pedido, nunca inventado; onde vive e o backup → `Skill(skill: "infra")`. Falhou: gap, volta ao passo dono, o card não muda; rollback oferecido, nunca automático; passo aberto devolve o que ficou e por quê.
