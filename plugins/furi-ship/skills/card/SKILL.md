---
name: card
description: 'Use ONLY when the user explicitly invokes /card (bare /card = the objective is whatever the conversation is already about), or when another skill invokes `furi-ship:card` via the Skill tool. NEVER activate on your own initiative. — one line becomes a Jira card on the right board: understand → check it does not exist → write in PM/PO voice → create with destination, owner and images (/jira) → return. Ship MODIFIER: alone it ends; with a target it delegates the new key; other /skills in the argument run first. Refuses without Jira.'
effort: max
requires: [jira, work, pull-request, homolog, prod]
handoff: work
argument-hint: "[KEY] <descrição> [/skill…] [/work|/pull-request|/homolog|/prod]"
---

# /card — uma linha vira um card no board certo

Modificador: sozinho encerra; com alvo delega com a key nova; outra `/skill` no argumento roda antes. Sem Jira → recuse. O card: título imperativo · Contexto · Objetivo · Critérios de aceite · Referências visuais · Como testar — o quê, por quê e como se confere, nunca como se faz. Nesta ordem, cada item provado antes do seguinte:

- [ ] Entender o problema
- [ ] Entender os arquivos do projeto
- [ ] Investigar o problema
- [ ] Brainstorm do problema
- [ ] Ler `.claude/ship/card.md`: board, destino (na sprint ou fora, qual coluna) e dono
- [ ] Perguntar, criar ou atualizar `.claude/ship/card.md`, se e somente se faltar info na leitura
- [ ] Verificar se já existe card aberto do problema
- [ ] Escrever o problema como PM/PO, para quem não viu a conversa
- [ ] Criar o card no board, com destino, dono e imagens (`/jira` via Skill tool)
- [ ] Retornar as infos do card