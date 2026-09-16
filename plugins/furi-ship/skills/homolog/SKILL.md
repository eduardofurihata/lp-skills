---
name: homolog
description: 'Use ONLY when the user explicitly invokes /homolog (bare /homolog = the objective is whatever the conversation is already about), or when another skill invokes `furi-ship:homolog` via the Skill tool. NEVER activate on your own initiative. — gets everything that is ready live and verified on the homolog environment: PR resolved (review, merge or reject), deploy, config, smoke on the homolog URL. Never touches production.'
effort: max
requires: [jira, setup, pipeline, infra]
handoff: prod
argument-hint: "[PR | KEY-N | descrição] [/repro] [/card] | (vazio = tudo que está pronto)"
---

# /homolog — o que está pronto, no ar em homolog e verificado

O terceiro **alvo** do pipeline: o estado pedido é **o trabalho no ar em homolog, funcionando** — o que está atrás, o loop fecha antes. **"Mergeado" não é "entregue".** `<produção>` é o `/prod`.

## Os guarda-chuvas

- **Descobrir, nunca assumir.** Board e estrutura vêm do `/jira`; `Abre PR`, `Aprovação` e `Merge` vêm do `/setup` — os dois via **Skill tool, a cada invocação**. `<integração>` e o ambiente homolog são **detectados** (§ deploy-context, `deploy.md`): `dev` → homolog é só o padrão; `develop`, `homolog`, `staging` valem igual — o uso decide, não o nome.
- **Da PR ao ar, cada estágio tem a sua prova.** `integrado` é o § pr-cycle: review teu, gate de QA, aprova e mergeia como o setup manda — ou **rejeita**; PR aprovado ou devolvido, card comentado e movido no board. `publicado` é run **verde**; `configurado` é o § env-config: env, secret, migration, flag e seed que os PRs exigem (`## DevOps`), setados **como** o `deploy.md` manda e **onde** o `infra.md` diz — sem ele, `/infra` via Skill tool; valor de secret é pedido, nunca inventado nem escrito; pendência deixa o gap aberto. `verificado` é o § smoke na URL de homolog com **todos** os cards desde o último deploy verificado — só ele move o card para "no ar".
- **Um dono por regra.** O loop é o § reconcile; estágios de trás abertos fecham pelos motores deles, nunca "rode o `/work` antes". Achado vai ao § findings com prova — o pipeline nunca cria card. Esta skill declara e entrega; não reimplementa motor.

## Fluxo

0. § composicao **primeiro**: modificador e skill de fora rodam antes; `/prod` vence — delegue e não rode; `/work` e `/pull-request` perdem. Depois `furi-ship:jira` e `furi-ship:setup` via Skill tool; § deploy-context — sem homolog (branch única: commit → push → `main` → prod) → PARE e sugira `/prod`, sem invocar.
1. Objetivo: vazio = tudo que está pronto · `PR`, `KEY-N` ou descrição = preferência de ordem.
2. Declare `alvo = {atéOEstágio: verificado@homolog, ambiente: homolog, branch: <integração>, fonteDoDelta: PRs abertos para <integração> e commits nela não publicados, gate: —, paradas: as dos modificadores}` e entregue ao § reconcile, do `card?` ao `verificado@homolog`.
3. Report: estágios (antes × agora) · PRs (mergeado ou rejeitado, branch apagada) · run · config · smoke (URL, N/N cards) · cards · achados · próximo: `/prod`.

## PARE se pensar
"run verde, está funcionando" · "`queued` há 10 min, subiu" · "testei em localhost" · "verifico só o card desta rodada" · "já que está verificado, jogo pra produção"
