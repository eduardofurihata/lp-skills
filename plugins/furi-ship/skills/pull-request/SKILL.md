---
name: pull-request
description: 'Use ONLY when the user explicitly invokes /pull-request (bare /pull-request = the objective is whatever the conversation is already about), or when another skill invokes `furi-ship:pull-request` via the Skill tool. NEVER activate on your own initiative. — pushes the branch and opens or updates the pull request against the detected integration branch, as the team setup dictates — the /work loop two stages further; a missing commit is closed first, never handed back. Never merges.'
effort: max
requires: [jira, setup, pipeline]
handoff: homolog
boundary: prod
argument-hint: "[KEY-N | descrição] [/repro] [/card] | (vazio = a branch atual)"
---

# /pull-request — o trabalho publicado: push e PR, conforme o setup

O segundo **alvo** do pipeline: o estado pedido é **a branch em `origin` com o PR aberto ou atualizado na integração** — ou só o push, quando o time não abre PR. É a escada do `/work` com dois degraus a mais: o que não está commitado, o loop fecha antes. Termina em `pr` (ou `push`): **não mergeia, não deploya**.

## Os guarda-chuvas

- **Descobrir, nunca assumir.** Board e estrutura vêm do `/jira`; `Abre PR`, `Template` e a posição da key vêm do `/setup` — os dois via **Skill tool, a cada invocação**: mencionar não é invocar. Base do PR: a `<integração>` detectada (§ deploy-context), nunca `main` por ser a default.
- **Publicar é o objetivo; o PR é a forma que o time escolheu.** `Abre PR: sim` ⇒ push + PR; `não` ⇒ push, e pronto. Idempotente: PR aberto → **título e descrição atualizados e um comentário com o que entrou**, nunca um segundo `create`. Os cards vêm dos **commits**, não do nome da branch: cada um claro no título e no `## Cards`, **comentado e movido no board** (etapa publicado, pelo `jira.md`); sem card, publica e diz.
- **Um dono por regra.** O loop é o § reconcile; `branch` e `commit` abertos fecham pelos motores deles (§ branch, § work-cycle — nunca "rode o `/work` antes"); `push` e `pr` são o § pr-publish. Esta skill declara e entrega; não reimplementa motor.

## Fluxo

0. § composicao **primeiro**: modificador (`/repro`, `/card`) e skill de fora rodam antes; `/homolog` e `/prod` vencem — delegue e não rode; `/work` perde para este. Depois `furi-ship:jira` e `furi-ship:setup` via Skill tool, e § deploy-context, passo 1.
1. Objetivo: vazio = a branch atual e o que ela carrega · `KEY-N` ou descrição = esse trabalho, commitado ou não.
2. Declare `alvo = {atéOEstágio: pr (push, com Abre PR: não), ambiente: —, branch: a de trabalho, fonteDoDelta: commits fora de origin/<branch> · o objetivo, gate: —, paradas: as dos modificadores}` e entregue ao § reconcile: `card?` → `branch` → `reprodução?` → `commit` → `push` → `pr?`.
3. Report: estágios fechados (antes × agora) · PR (URL, base) ou "publicado sem PR" · branch e cards · Jira (etapa publicado) · `kanban/13-ship/` · próximo: `/homolog` (ou `/prod`, em branch única). Gap zero se diz com a evidência; o que não convergiu volta com o que resistiu.

## PARE se pensar
"árvore suja, mando rodar o `/work` antes" · "a integração andou, resolvo o conflito e pusho" · "já tem PR, crio outro" · "`Abre PR: não`, então nem pusho" · "os cards são os do nome da branch"
