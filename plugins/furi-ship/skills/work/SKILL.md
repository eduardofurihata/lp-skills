---
name: work
description: 'Use ONLY when the user explicitly invokes /work (bare /work = the objective is whatever the conversation is already about), or when another skill invokes `furi-ship:work` via the Skill tool. NEVER activate on your own initiative. — the order of taking an objective to a local commit: discover → branch as the setup dictates → understand → close the commit (implemented, reviewed, QA-tested with evidence, one commit with the card key) → return. Never pushes.'
effort: max
requires: [jira, setup]
handoff: pull-request
argument-hint: "[KEY-N | descrição] [/repro] [/card] | (vazio = card ativo)"
---

# /work — descobrir, ramificar, entender, fechar o commit, devolver

O primeiro **alvo**: o objetivo implementado, revisado, testado e **commitado na branch que o setup manda** — não pusha, não mergeia. **Arquivo da skill: `.claude/ship/work.md`** — lido no início, criado na primeira vez, atualizado ao aprender; curto: como rodar e testar localmente (comandos, URL, onde estão os usuários de teste e onde este projeto guarda a evidência — nunca um valor). Cinco passos, cada um provado antes do seguinte:

1. **Descobrir.** Composição primeiro: `repro → card → alvo`; modificador e skill de fora rodam antes e saem do argumento; alvo mais distante vence — delegue e não rode. `/jira` e `/setup` via **Skill tool, a cada invocação**; `<integração>` do `homolog.md` (não existe → a branch que os PRs miram; sem PR, a usual em `origin`, várias → pergunte, senão a default; diverge dos PRs → avise; sem gravar — o dono é o `/homolog`). Objetivo: a key (card com anexos, lidos), a descrição, ou vazio = o da branch atual; sem Jira, a descrição ou o que já está na árvore — card só nasce com `/card`. Diagnóstico publicado antes de agir: `branch` e `commit` fechados ou abertos, com evidência; tudo fechado → gap zero, dito.
2. **Ramificar — antes de qualquer código.** gh → integração → branch: traga a integração, depois a branch do `/setup § Branch` — por card (existe → entra e sincroniza), lote aberto (fica enquanto nenhum PR dele foi mergeado ou fechado) ou direto na integração. Nome pelo padrão do setup; no lote é o do 1º card e **não muda**; sem card, o slug. Nunca sobre integração stale, nunca rebase ou force; conflito entendendo os dois lados. Pedido de sessão ("hoje quero branch") vale só para esta invocação.
3. **Entender — ≥ 90 antes de codar.** Com card: assignee é você e `/jira` § Sincronizar (**trabalho começou**). Leia o código; ambiguidade real → pergunte antes; senão siga sem inventar pergunta. O card fala de produto; a arquitetura é sua.
4. **Fechar o commit — um estado, não um passo.** Implementado · revisado a frio (bugs, edge cases, padrões do projeto, segurança, "faz o que o card pede") · testado com evidência **na superfície onde o usuário vê**, 100% dos casos, screenshot por caso · sem pendência conhecida · documentado como o projeto documenta · **um** commit com a key do card, se há, onde o `/setup § Commit` manda; nunca cria nem troca branch. Reprodução nesta conversa → antes do commit, `repro/SKILL.md` § Human Check. ~3 passadas sem convergir → pare e diga o que resistiu.
5. **Devolver.** Branch (modo, origem), commit, Jira; próximo: `/pull-request`. Override de sessão → ofereça `/setup branch`.
