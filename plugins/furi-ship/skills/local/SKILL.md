---
name: local
description: 'Use ONLY when the user explicitly invokes /local (bare /local = the objective is whatever the conversation is already about), or when another skill invokes `furi-ship:local` via the Skill tool. NEVER activate on your own initiative. — the ground (setup, card, branch, status), then one local commit. Never pushes.'
handoff: gh
argument-hint: "[KEY-N | descrição] [/skill…] | (vazio = card ativo)"
---


# /local — o terreno e o commit

Não pusha nem mergeia: o alvo é um commit local. Com outras skills no argumento ou no mesmo prompt: entenda o que cada uma pede e execute tudo combinado, numa passada só — nunca uma antes ou depois da outra; o que uma delas manda fazer antes de tudo vem antes do 1º `- [ ]` daqui, e a que traz protocolo próprio de implementação e commit roda inteira dentro de "Implementar" e "Fechar um commit". Sem card: o mesmo processo, sem Jira e sem criar card. **Os `- [ ]` são o checklist do run, em `.claude/ship/run.md`:** escreva cada um, marque `- [x]` ao fechar, retome do primeiro aberto; um arquivo por run (mesmo encadeando skills), quem o criou apaga ao fim.

- [ ] Ler `.claude/ship/setup.md § Local` (projeto antigo: `§ Work` — renomeie): o status da etapa e qual branch — `main`, `dev`, `homolog`, a do card (`<prefixo>-##-##-…`) ou outra que o projeto use; falta → pergunte e grave ali
- [ ] Ler o card ou o prompt — descrição, critérios, anexos, comentários; vazio = o card da branch
- [ ] Entrar na branch que o § Local manda
- [ ] Entender o card e o código e dar nota de 0 a 100 ao entendimento: ≥ 90 segue, abaixo entende mais; ambiguidade real → pergunte
- [ ] Mover o card para o status da etapa
- [ ] Implementar o que o card pede
- [ ] Fechar **um** commit
- [ ] Retornar branch, commit e status; próximo: `/gh`

Nunca rebase, force nem branch sobre integração stale.
