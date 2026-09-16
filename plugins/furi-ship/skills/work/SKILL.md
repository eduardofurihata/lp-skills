---
name: work
description: 'Use ONLY when the user explicitly invokes /work (bare /work = the objective is whatever the conversation is already about), or when another skill invokes `furi-ship:work` via the Skill tool. NEVER activate on your own initiative. — takes the objective to a local commit on the branch the team setup dictates: board via /jira, conventions via /setup, then the pipeline loop closes only the open stages, branch → commit. Never pushes; composes with /repro and /card.'
effort: max
requires: [jira, setup, pipeline]
handoff: pull-request
argument-hint: "[KEY-N | descrição] [/repro] [/card] | (vazio = card ativo)"
---

# /work — o objetivo em commit local, na branch que o setup manda

O primeiro **alvo** do pipeline: o que se pede é um **estado** — implementado, revisado, testado e **commitado na branch de trabalho** — não uma sequência de passos. Onde o trabalho está, o loop descobre; o que falta, o loop fecha. Termina no `commit`: **não pusha, não abre PR, não mergeia**.

## Os guarda-chuvas

- **Descobrir, nunca assumir.** Board, projeto e estrutura vêm do `/jira`; modo e nome da branch e formato do commit vêm do `/setup` — os dois via **Skill tool, a cada invocação**: mencionar não é invocar. O `/setup` pergunta uma vez por repositório e grava; pedido de sessão vale só para esta invocação.
- **A branch é a do setup.** Nasce no `pipeline/SKILL.md` § branch, antes de qualquer código, com `<integração>` detectada pela topologia (§ deploy-context), nunca chutada. Fechar o `commit` nunca cria nem troca branch.
- **Um dono por regra.** O loop é o § reconcile (diagnóstico publicado antes de agir; fecha só os estágios abertos, na ordem); o estado que fecha o `commit` é o § work-cycle; a composição é o § composicao. Esta skill declara e entrega; não reimplementa motor.
- **Sem Jira, sem card, ainda funciona.** `Rastreamento ≠ Jira` → o objetivo é a descrição ou o que já está na árvore. Card só nasce com `/card` composto: o pipeline nunca cria card sozinho.

## Fluxo

0. § composicao **primeiro**: modificador (`/repro`, `/card`) e skill de fora rodam antes; alvo mais distante (`/pull-request`, `/homolog`, `/prod`) vence — delegue e não rode. Depois `furi-ship:jira` e `furi-ship:setup` via Skill tool, e § deploy-context, passo 1.
1. Objetivo: `KEY-N` (qualquer projeto) · descrição · vazio = o da branch atual (`docs/jira/todo/*.md` com `branch:` igual à atual, ou o card em `kanban/08-implementation/`); nenhum → diga como chamar.
2. Declare `alvo = {atéOEstágio: commit, ambiente: —, branch: a de trabalho, fonteDoDelta: o objetivo, gate: —, paradas: as dos modificadores}` e entregue ao § reconcile: `card?` → `branch` → `reprodução?` → `commit`.
3. Report: estágios já fechados × fechados agora · projeto e board · setup (modo da branch, origem) · branch · commit · kanban · Jira · próximo: `/pull-request`. Gap zero se diz com a evidência, não se refaz; estágio que não convergiu volta com o que resistiu.

## PARE se pensar
"já sei o board/setup, sigo sem invocar" · "crio a branch aqui" · "rode outra skill antes" · "é pequeno, implemento e commito" · "não tem card, crio um" · "terminei, já pusho"
