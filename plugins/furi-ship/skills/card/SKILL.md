---
name: card
description: 'Use ONLY when the user explicitly invokes /card (bare /card = the objective is whatever the conversation is already about), or when another skill invokes `furi-ship:card` via the Skill tool. NEVER activate on your own initiative. — one line becomes a Jira card on the right board: PM/PO voice, the setup''s default destination, reference images attached. Ship MODIFIER: alone it ends; with a target it delegates with the new key; other /skills in the argument run first. Refuses without Jira.'
effort: max
requires: [jira, setup, work, pull-request, homolog, prod]
handoff: work
argument-hint: "[KEY] <descrição> [/skill…] [/work|/pull-request|/homolog|/prod]"
---

# /card — Uma linha vira card no Jira

## Os guarda-chuvas

- **Intake puro, no board certo.** Só o card remoto, uma entrega por card. **O pipeline nunca cria card sozinho.**
- **Descobrir, nunca assumir.** `/jira` e `/setup` via Skill tool, toda vez; key, tipo, sprint e pessoa se conferem no site.
- **Voz de PM/PO.** Para quem não viu a conversa: o quê, por quê, como se confere — nunca o como (rota sim, arquivo não).

## Fluxo

0. `furi-ship:jira` e `furi-ship:setup` via Skill tool; sem Jira → recuse com o motivo (com alvo, delegue sem key). Outra `/skill` no argumento = doutrina: Skill tool antes de redigir, com o objetivo; alvos, no 6.
1. Key = 1º token que casa `^[A-Z][A-Z0-9_]{1,9}$` e existe no site; vence a memória sem reescrevê-la (outro projeto → `jira_get_agile_boards`). Sem descrição nem contexto → peça uma linha; 2+ entregas → split.
2. Duplicata aberta: `jira_search` `project=<KEY> AND statusCategory!=Done AND text~"<termos>"`, limit 10; forte → pergunte.
3. Scan leve → escreva no `Idioma dos cards` pelo template: título imperativo ≤ 80 · `## Contexto` (quem, tela + rota, impacto) · `## Objetivo` (pronto observável) · `## Critérios de aceite` (verificáveis; estados, se há tela) · `## Referências visuais` (se houver) · `## Como testar` por último (pré-condição → passos → resultado; a `DoD` orienta; reprodução já vista na conversa → transcreva).
4. `jira_create_issue` (`tipoBug`/`tipoResto` do `/jira`); destino do setup: `sprint ativa` → `jira_get_sprints_from_board` (`boardId` do `/jira`, active) + `jira_add_issues_to_sprint`, sem sprint → backlog, avisado; `Atribuir a` → `jira_assign_issue`, não achou → sem dono, avisado.
5. Anexos: toda imagem de referência sobe — receita em `jira/references/anexar-jira.md`.
6. Report: key, título, tipo, destino, dono, anexos, URL. Sozinho, encerre e sugira `/work <KEY>-<N>`; com alvo, `Skill(skill: "<alvo>", args: "<verbos restantes> <KEY>-<N>")`.

## PARE se pensar
"já sei o board, pulo o `/jira`" · "prescrevo a solução" · "o update deu ok, então anexou" · "`/card /prod`: criei e parei"
