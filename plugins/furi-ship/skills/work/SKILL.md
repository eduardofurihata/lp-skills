---
name: work
description: 'Use ONLY when the user explicitly invokes /work (bare /work = the objective is whatever the conversation is already about), or when another skill invokes `furi-ship:work` via the Skill tool. NEVER activate on your own initiative. — the ground (setup, card, branch, status), then the commit with the front screens proven on the card. Never pushes.'
effort: max
requires: [setup]
handoff: pull-request
argument-hint: "[KEY-N | descrição] [/card] | (vazio = card ativo)"
---

# /work — o terreno, o commit, a prova na tela

Não pusha nem mergeia: o alvo é um commit local com a tela provando o que mudou. Sem arquivo próprio — lê `.claude/ship/setup.md` (branch, commit, status, como o projeto roda e se testa); falta algo → grave pelo dono. **Cada `- [ ]` é uma tarefa:** `TaskCreate` um por item, `TaskUpdate` fecha antes da próxima.

- [ ] Ler no `.claude/ship/setup.md` a etapa `/work`: o status que ela pede e qual branch — `main`, `dev`, `homolog`, a do card (`<prefixo>-##-##-…`) ou outra que o projeto use
- [ ] Ler o card — descrição, critérios, anexos; vazio = o da branch
- [ ] Entrar na branch que o setup mandou
- [ ] Entender o card e o código e dar nota de 0 a 100 ao entendimento: ≥ 90 segue, abaixo entende mais; ambiguidade real → pergunte
- [ ] Mover o card para o status da etapa
- [ ] Implementar o que o card pede
- [ ] Fechar **um** commit com a key do card, como o `setup.md § Commit` manda
- [ ] Listar todas as telas de front mexidas — nenhuma, diga e siga
- [ ] Subir no card o print de cada tela mexida
- [ ] Retornar branch, commit, telas, anexos e status; próximo: `/pull-request`

Skill no argumento roda antes e sai dele; alvo mais distante vence — delegue e não rode. Nunca rebase, force nem branch sobre integração stale.
