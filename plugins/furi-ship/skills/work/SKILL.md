---
name: work
description: 'Use ONLY when the user explicitly invokes /work (bare /work = the objective is whatever the conversation is already about), or when another skill invokes `furi-ship:work` via the Skill tool. NEVER activate on your own initiative. — takes the objective to a local commit on the branch the team setup dictates: board via /jira, conventions via /setup, then branch → commit (implemented, reviewed, QA-tested with evidence, one commit with the card key). Never pushes.'
effort: max
requires: [jira, setup, infra]
handoff: pull-request
argument-hint: "[KEY-N | descrição] [/repro] [/card] | (vazio = card ativo)"
---

# /work — o objetivo em commit local, na branch que o setup manda

O primeiro **alvo** da entrega: o que se pede é um **estado** — implementado, revisado, testado e **commitado na branch de trabalho** —, não uma sequência de passos. Dois estágios, `branch` → `commit`: o fechado se declara, o aberto se fecha. Termina no `commit`: **não pusha, não mergeia**.

## Os guarda-chuvas

- **Descobrir, nunca assumir.** Board e estrutura vêm do `/jira`; modo e nome da branch e formato do commit vêm do `/setup` — os dois via **Skill tool, a cada invocação**: mencionar não é invocar. `<integração>` vem de `infra/SKILL.md` § Deploy (detectada). Pedido de sessão ("hoje quero branch") vale só para esta invocação e não reescreve o setup.
- **gh → integração → branch.** Nunca sobre integração stale, nunca renomear a branch de um lote, nunca rebase/force: conflito se resolve entendendo os dois lados. A branch nasce **antes** de qualquer código; fechar o `commit` nunca cria nem troca branch.
- **O commit é um estado, não um passo.** Implementado · revisado a frio · testado com evidência **na superfície onde o usuário vê** · sem pendência conhecida · documentado · **um** commit com a key do card ativo. "É pequeno, implemento e commito" é a violação. Retomar, não recomeçar.
- **Sem Jira, sem card, ainda funciona.** `Rastreamento ≠ Jira` → o objetivo é a descrição ou o que já está na árvore. Card só nasce com `/card` composto — ninguém cria card sozinho.

## Fluxo

0. **Composição primeiro:** ordem fixa `repro → card → alvo`; modificador (`/repro`, `/card`) e skill de fora rodam antes e saem do argumento; alvo mais distante (`/pull-request`, `/homolog`, `/prod`) vence — delegue e não rode. Depois `furi-ship:jira` e `furi-ship:setup` via Skill tool; `<integração>` por `infra/SKILL.md` § Deploy.
1. **Objetivo:** `KEY-N` (`jira_get_issue`, anexos inclusive) · descrição · vazio = o da branch atual (`docs/jira/todo/*.md` com `branch:` igual à atual, ou o artefato em `obra/08-implementation/`); nenhum → diga como chamar.
2. **Diagnóstico, publicado antes de agir** — os sinais: `branch` fechado = `git branch --show-current` é a do setup e `git rev-list --left-right --count origin/<integração>...HEAD` não está atrás; `commit` fechado = `git status --porcelain` vazio · `git log origin/<integração>..HEAD` tem o objetivo · `obra/10-run-test/<feature>.md` 100% PASSED · `obra/12-done/<feature>.md` com `tests: passed` e ledger sem `ABERTO` · nada em `obra/07-todo/`. Tudo fechado → gap zero, dito com a evidência.
3. **Branch** (aberto): `git fetch origin && git checkout <integração> && git merge origin/<integração>`; então pelo `/setup § Branch` — `branch por card` → `checkout -b <nome>` (existe → `checkout` + merge de `origin/<branch>` e da integração); `branch acumula cards` → a branch de partida é **lote aberto** (nenhum PR dela mergeado/fechado) → fica nela e sincroniza, senão `checkout -b`; `direto na integração` → nada. Nome pelo padrão `Nome:`; no lote é o do 1º card e **não muda** — os cards são os commits; sem card, o slug do objetivo.
4. **Commit** (aberto): com card, assignee = você e `/jira` § Sincronizar (etapa **trabalho começou**). Entendimento ≥ 90 (leia o código): abaixo, ou ambiguidade real, `AskUserQuestion` **antes** de codar; senão segue sem inventar pergunta. Feche o estado do guarda-chuva: review em `obra/09-code-review/<feature>.md` (bugs, edge cases, `.claude/patterns.md`, segurança, performance, código morto, "faz o que o card pede"); TCs do card ou `docs/06-test-cases/` executados com screenshot por caso em `obra/10-run-test/`; achado que o trabalho criou ou tocou se resolve agora; artefato de `07-todo/` vira `12-done/` com `tests: passed`; **mover primeiro, commitar por último**, um commit com a key onde o `/setup § Commit` manda. Reprodução feita nesta conversa (`/repro`)? Depois do commit rode `repro/SKILL.md` § Human Check. ~3 passadas sem convergir → pare e diga o que resistiu.
5. **Report:** branch (modo, origem) · commit · obra · Jira · próximo: `/pull-request`. Override de sessão? Ofereça `/setup branch`, sem gravar.

## PARE se pensar
"já sei o board/setup, sigo sem invocar" · "todo projeto meu tem `dev`" · "acabei de clonar, pulo o fetch" · "card novo no lote, renomeio a branch" · "a árvore já tem código, só commito" · "`tsc` passou, tá testado" · "terminei, já pusho"
