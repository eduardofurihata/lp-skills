---
name: prod
description: 'Use ONLY when the user explicitly invokes /prod (bare /prod = the objective is whatever the conversation is already about), or when another skill invokes `furi-ship:prod` via the Skill tool. NEVER activate on your own initiative. — production live with the work: homolog guaranteed (/homolog) → promote integration to production → /deploy prod → Jira → return. Single owner of production.'
effort: max
requires: [jira, setup, homolog, deploy]
boundary: sync
argument-hint: "[PR | KEY-N | descrição] [/repro] [/card] | (vazio = tudo que está pronto)"
---

# /prod — descobrir, garantir homolog, promover, publicar, devolver

O último **alvo**, dono único de produção: o trabalho em `<produção>`, no ar, configurado e validado. Prod tem usuários reais: cada passo tem prova; quem digita `/prod` autoriza este release — promover não pergunta. **Arquivo da skill: `.claude/ship/prod.md`** — lido no início, criado na primeira vez, atualizado a cada release: último release validado (commit, data, cards), pendências, notas de rollback. Cinco passos:

1. **Descobrir.** Composição primeiro (`repro → card → alvo`; modificador e skill de fora rodam antes; os outros alvos perdem). `/jira` e `/setup` via **Skill tool, a cada invocação**; `<integração>`, `<produção>` e ambientes no `deploy.md § Ambientes` (não existe → `Skill(skill: "deploy", args: "mapa")`). Branch única (commit → push → `main` → prod): sem homolog nem promoção — a PR **é** o release, resolvida como `homolog/SKILL.md` (passos 2–5). Diagnóstico antes de agir: `verificado@homolog`, `promovido` (integração e produção iguais em `origin`), ambiente prod; faixa longa é o pedido — diga o tamanho; tudo fechado → gap zero.
2. **Garantir homolog — nada sobe sem `verificado@homolog`.** Aberto → `Skill(skill: "homolog")`. O que já está verificado só se promove.
3. **Promover — sincronizar, resolver, empurrar, provar que ficaram iguais.** Integração atualizada com o remoto (conflito entendendo os dois lados); o que é seu commitado com paths explícitos; integração → produção (conflito que muda código → re-review antes do push); push em produção (o gatilho do deploy); resync produção → integração; assert de que as duas são iguais em `origin` — divergiu, o release **não fecha**. Hotfix direto em produção → merge nos dois sentidos, re-review. `/sync` é ferramenta de branch, sem deploy.
4. **Publicar, configurar, validar — e só então o Jira.** `Skill(skill: "deploy", args: "prod")` — infra em prod **e** homolog, validação só leitura, rollback oferecido, nunca automático. Validado → `/jira` § Sincronizar, **no ar em produção**, em cada card que subiu. Passo aberto volta com o motivo; o card não muda.
5. **Devolver.** Estágios, promoção (commits, cards), run, validação, cards, assert.
