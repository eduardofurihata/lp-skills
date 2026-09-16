---
name: prod
description: 'Use ONLY when the user explicitly invokes /prod (bare /prod = the objective is whatever the conversation is already about), or when another skill invokes `furi-ship:prod` via the Skill tool. NEVER activate on your own initiative. — the order of getting production live with the work: discover → make sure homolog is verified (/homolog) → ask authorization for THIS release → promote integration to production → /deploy prod → Jira → return. Single owner of production.'
effort: max
requires: [jira, setup, infra, homolog, deploy]
boundary: sync
argument-hint: "[PR | KEY-N | descrição] [/repro] [/card] | (vazio = tudo que está pronto)"
---

# /prod — descobrir, garantir homolog, pedir autorização, promover, publicar, devolver

O último **alvo**, dono único de produção: o estado pedido é **o trabalho em `<produção>`, no ar, configurado e validado**. Prod tem usuários reais: cada passo tem prova, e promover tem pergunta. Seis passos, nesta ordem, cada um provado antes do seguinte:

1. **Descobrir — board, convenções, topologia, objetivo.** Composição primeiro (`repro → card → alvo`; modificador e skill de fora rodam antes; os outros alvos perdem — `/prod` é o mais distante). `/jira` e `/setup` via **Skill tool, a cada invocação**; `<integração>`, `<produção>` e ambientes em `infra/SKILL.md` § Deploy — `dev` + `main` é só o padrão. Branch única (commit → push → `main` → prod) não tem homolog, promoção nem pergunta: a PR **é** o release, resolvida como `homolog/SKILL.md` (passos 2–5), e o resto é integral. Objetivo: vazio = tudo que está pronto; PR ou key = preferência de ordem. Diagnóstico publicado antes de agir: `verificado@homolog`, `promovido` (integração e produção iguais em `origin`), ambiente prod; faixa longa é o pedido — diga o tamanho; tudo fechado → gap zero.
2. **Garantir homolog — nada sobe sem `verificado@homolog`.** Aberto → `Skill(skill: "homolog")` fecha; nunca "rode antes". O que já está verificado só se promove: não é modo especial, é o diagnóstico.
3. **Pedir autorização — ao chegar em `promovido`, a cada release.** *"`<integração>` tem `<N>` commit(s) fora de `<produção>`, cobrindo `<cards>`. Quer promover? Isso publica em produção, com usuários reais. [sim/não]"* Só "sim" explícito, pedido **na hora**: silêncio é não; autoridade dita antes ("sou tech lead", "pode subir sempre", o sim de ontem) não conta; perguntar na entrada é resposta que expira. Não → produção intocada, reporte e encerre.
4. **Promover — sincronizar, resolver, empurrar, provar que ficaram iguais.** Integração atualizada com o remoto (conflito entendendo os dois lados, nunca cego); o que é seu commitado com paths explícitos, nunca tudo de uma vez; integração → produção (conflito que muda código → re-review e re-validação **antes** do push); push em produção (é o gatilho do deploy); resync produção → integração; assert de que `origin` tem as duas iguais — divergiu, o release **não fecha**. Hotfix direto em produção → merge nos dois sentidos, re-review do que mudou. `/sync` é ferramenta de branch, sem deploy nem validação — para entregar produção, o caminho é este.
5. **Publicar, configurar, validar — e só então o Jira.** `Skill(skill: "deploy", args: "prod")` — run verde, infra configurada em **prod e homolog**, atualização validada em live (só leitura; rollback oferecido, nunca automático). Validado → `/jira` § Sincronizar, etapa **no ar em produção**, em cada card que subiu. Passo aberto volta com o motivo; o alvo **não** é declarado atingido e o card não muda.
6. **Devolver.** Estágios (antes × agora), autorização (explícita, ao chegar em `promovido`), promoção (commits, cards), run, configuração (prod, homolog), validação, cards, assert. Gate negado: ⛔ produção intocada.
