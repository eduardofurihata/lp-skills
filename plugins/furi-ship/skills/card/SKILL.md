---
name: card
description: 'Use ONLY when the user explicitly invokes /card (bare /card = the objective is whatever the conversation is already about), or when another skill invokes `furi-ship:card` via the Skill tool. NEVER activate on your own initiative. — first truly understands the problem and the project, then writes the card as PM/PO and creates it on the right board with destination, owner and images. Ship MODIFIER: alone it ends; with a target it delegates the new key. Refuses without Jira.'
effort: max
requires: [jira, work, pull-request, homolog, prod]
handoff: work
argument-hint: "[KEY] <descrição> [/skill…] [/alvo]"
---

# /card — uma linha vira um card que o dev pega sem perguntar

Quem lê o card não viu esta conversa: ele vale o que valeu o entendimento antes dele. Modificador: sozinho encerra; com alvo delega a key nova; outra `/skill` no argumento roda antes. Sem Jira → recuse.

## Parar e entender, de verdade

- [ ] Entender o problema do prompt
- [ ] Entender os arquivos do projeto e o projeto como um todo
- [ ] Investigar o problema
- [ ] Brainstorm do problema

Termina escrita: o problema nas suas palavras, o que a investigação provou, o que o brainstorm abriu — sem isso não há card.

## Só então, o card

- [ ] Ler `.claude/ship/card.md`: board, destino (na sprint ou fora, qual coluna) e dono
- [ ] Perguntar, criar ou atualizar `.claude/ship/card.md`, se e somente se faltar info na leitura
- [ ] Verificar se já existe card aberto do problema
- [ ] Escrever o problema como PM/PO, para quem não viu a conversa
- [ ] Criar o card no board, com destino, dono e imagens (`/jira` via Skill tool)
- [ ] Retornar as infos do card

O card diz o quê, por quê e como se confere, nunca como se faz, no idioma do board: título imperativo · Contexto (quem, onde, impacto) · Objetivo (o pronto observável) · Critérios de aceite · Referências visuais · Como testar (pré-condição → passos → resultado). Retorno: key, URL, destino, dono, anexos.
