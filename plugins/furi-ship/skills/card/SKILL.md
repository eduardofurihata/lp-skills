---
name: card
description: 'Use ONLY when the user explicitly invokes /card (bare /card = the objective is whatever the conversation is already about), or when another skill invokes `furi-ship:card` via the Skill tool. NEVER activate on your own initiative. — first truly understands the problem and the project, then writes the card as PM/PO and creates it on the right board with destination, owner and images. With other skills in the argument it understands and combines them in one pass. Refuses without Jira.'
effort: max
requires: [work, pull-request, homolog, prod]
handoff: work
argument-hint: "[KEY] <descrição> [/skill…]"
---

# /card — uma linha vira um card que o dev pega sem perguntar

Quem lê o card não viu esta conversa: ele vale o que valeu o entendimento antes dele. Com outras skills no argumento: entenda o que cada uma pede e execute tudo combinado, numa passada só — nunca uma antes ou depois da outra. Sem Jira → recuse. **Cada `- [ ]` é uma tarefa:** `TaskCreate` um por item, `TaskUpdate` fecha antes da próxima.

- [ ] Entender o problema do prompt
- [ ] Entender os arquivos do projeto e o projeto como um todo
- [ ] Investigar o problema
- [ ] Brainstorm do problema
- [ ] Escrever o entendimento
- [ ] Ler `.claude/ship/setup.md § Card`: rastreamento, board, destino (na sprint ou fora, qual coluna), dono e idioma; falta → pergunte e grave ali
- [ ] Verificar se já existe card aberto do problema
- [ ] Escrever o problema como PM/PO, para quem não viu a conversa
- [ ] Criar o card no board, com destino, dono e imagens
- [ ] Retornar as infos do card

O card diz o quê, por quê e como se confere, nunca como se faz, no idioma do board: título imperativo · Contexto (quem, onde, impacto) · Objetivo (o pronto observável) · Critérios de aceite · Referências visuais · Como testar (pré-condição → passos → resultado). Retorno: key, URL, destino, dono, anexos.
