---
name: work
description: 'Use ONLY when the user explicitly invokes /work (bare /work = the objective is whatever the conversation is already about), or when another skill invokes `furi-ship:work` via the Skill tool. NEVER activate on your own initiative. — the ground (setup, card, branch, status), then the commit with the front screens proven on the card. Never pushes.'
effort: max
handoff: pull-request
argument-hint: "[KEY-N | descrição] [/skill…] | (vazio = card ativo)"
---

# /work — o terreno, o commit, a prova na tela

Não pusha nem mergeia: o alvo é um commit local com a tela provando o que mudou. Lê `.claude/ship/setup.md`; a seção **§ Work** é sua: branch e status da etapa — falta → infira do repositório, pergunte só o não derivável, grave; arquivo não existe → crie com ela. **Cada `- [ ]` é uma tarefa:** `TaskCreate` um por item, `TaskUpdate` fecha antes da próxima.

- [ ] Ler `.claude/ship/setup.md § Work`: o status da etapa e qual branch — `main`, `dev`, `homolog`, a do card (`<prefixo>-##-##-…`) ou outra que o projeto use
- [ ] Ler o card — descrição, critérios, anexos; vazio = o da branch
- [ ] Entrar na branch que o § Work manda
- [ ] Entender o card e o código e dar nota de 0 a 100 ao entendimento: ≥ 90 segue, abaixo entende mais; ambiguidade real → pergunte
- [ ] Mover o card para o status da etapa
- [ ] Implementar o que o card pede
- [ ] Fechar **um** commit
- [ ] Listar todas as telas de front mexidas — nenhuma, diga e siga
- [ ] Subir no card o print de cada tela mexida
- [ ] Retornar branch, commit, telas, anexos e status; próximo: `/pull-request`

Com outras skills no argumento: entenda o que cada uma pede e execute tudo combinado, numa passada só — nunca uma antes ou depois da outra. Nunca rebase, force nem branch sobre integração stale.
