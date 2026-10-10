---
name: pull-request
description: 'Use ONLY when the user explicitly invokes /pull-request (bare /pull-request = the objective is whatever the conversation is already about), or when another skill invokes `furi-ship:pull-request` via the Skill tool. NEVER activate on your own initiative. — publishes the work: /work complete → target merged in → push → PR where the setup says (or push only) → title, description, comment → front screens and Jira card → return. Never merges.'
requires: [work]
handoff: homolog
boundary: prod
argument-hint: "[KEY-N | descrição] [/skill…] | (vazio = a branch atual)"
---

# /pull-request — o trabalho completo, publicado, a PR onde o setup manda

O alvo: a branch em `origin` com a PR no destino que o setup manda — ou só o push, se o time não abre PR. Não mergeia nem deploya. Com outras skills no argumento: entenda o que cada uma pede e execute tudo combinado, numa passada só — nunca uma antes ou depois da outra. Sem card: o mesmo processo, sem Jira e sem criar card. **Os `- [ ]` são o checklist do run, em `.claude/ship/run.md`:** escreva cada um, marque `- [x]` ao fechar, retome do primeiro aberto; um arquivo por run (mesmo encadeando skills), quem o criou apaga ao fim.

- [ ] Ler `.claude/ship/setup.md § Pull-request`: destino da PR (`main`, `dev`, `homolog`, outra branch, stacked PR ou sem PR — só push), status da etapa; falta → pergunte e grave ali
- [ ] Garantir o `/work` completo: mudança sem commit → `Skill(skill: "work")`, vai tudo junto; só se commita o inteiro, nunca pela metade
- [ ] Trazer a branch destino para a atual, para não ficar desatualizada
- [ ] Fazer push
- [ ] Abrir ou atualizar a PR no destino que o § Pull-request manda; sem PR → fica no push
- [ ] Atualizar o título: keys dos cards Jira, se houver, e tudo o que foi feito
- [ ] Atualizar a descrição: `## O que foi feito` (simples e leigo) · `## Cards` · `## Summary` · `## Solução` · `## Como testar` · `## DevOps`
- [ ] Criar comentário na PR, se necessário, com o que entrou
- [ ] Listar todas as telas de front mexidas — nenhuma, diga e siga
- [ ] Tirar o print de cada tela mexida com zoom out, para dar contexto
- [ ] Subir no card cada print separado e, além deles, um único arquivo com todos empilhados na vertical (um abaixo do outro), sem perder qualidade na junção (empilhe sem recomprimir, ex. `convert -append`)
- [ ] Comentar o card Jira, se houver, com o link da PR, o que foi feito e as telas
- [ ] Atualizar o status do card Jira para o da etapa
- [ ] Retornar PR (URL, destino) ou "publicado sem PR", branch, cards, telas e anexos; próximo: `/homolog`

Conflito ao trazer o destino: entendendo os dois lados, nunca force. Nunca uma segunda PR para a mesma branch.
