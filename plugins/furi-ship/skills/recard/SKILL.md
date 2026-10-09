---
name: recard
description: 'Use when user invokes /recard <KEY> (bare /recard = the card the conversation is already about) — rewrites an existing Jira card''s real description from everything analysed in the conversation, as PM/PO, with screenshots, posted ONLY as a comment: the description is never edited. With other skills in the argument or the same prompt it combines them in one pass as the bar of the understanding; it never implements. Refuses without Jira.'
argument-hint: "<KEY> [/skill…]"
disable-model-invocation: true
handoff: card
---

# /recard — o card real, num comentário

A descrição fica como está; o que esta conversa entendeu vira um comentário que o dev lê sem ter visto a conversa. Com outras skills no argumento ou no mesmo prompt, numa passada só: são régua do entendimento e do comentário, nunca ordem de resolver — nenhum código muda. Sem Jira → recuse. **Os `- [ ]` são o checklist do run, em `.claude/ship/run.md`:** escreva cada um, marque `- [x]` ao fechar, retome do primeiro aberto; quem o criou apaga ao fim.

- [ ] Ler o card: descrição, comentários, anexos, links; sem KEY e sem card na conversa → pergunte
- [ ] Juntar o que a conversa analisou (causa, código, dados, decisões); o que falta → investigar no projeto
- [ ] Escrever o entendimento: o que o card diz × o que é de verdade
- [ ] Ler `.claude/ship/setup.md § Card`: idioma do board; falta → pergunte e grave ali
- [ ] Capturar as telas no browser automatizado, como o usuário: o atual e, quando existe, o esperado; uma por passo que importa, nome que diz o que mostra
- [ ] Escrever como PM/PO, para quem não viu a conversa
- [ ] Anexar as telas ao card e comentar com elas inline; descrição, título e campos intocados
- [ ] Reler o card publicado: o comentário renderiza, as telas aparecem, a descrição não mudou
- [ ] Retornar key, URL do comentário e anexos

O comentário abre com `Descrição real — <data>` e segue: Contexto (quem, onde, impacto) · Problema real (o que o card diz × o que acontece, a causa) · Objetivo (o pronto observável) · Critérios de aceite · Referências visuais (as telas) · Como testar (pré-condição → passos → resultado). Diz o quê, por quê e como se confere, nunca como se faz.
