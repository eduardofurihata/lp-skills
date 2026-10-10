---
name: ticrd
description: 'Invoked ONLY by `furi-build:method` via the Skill tool, in its Step 2, with the ADR path and the `track/<objetivo>.md` path. NEVER activate on your own initiative. — the second half of /method: T·I·C·R·D (Todo, Implementation, Code review, Run test, Done), from an ADR to one local commit with every TC PASSED and the docs living in place.'
argument-hint: "<docs/adr/NNNN-slug.md> <track/objetivo.md>"
user-invocable: false
requires: [solve]
---

# /ticrd — do ADR ao commit

A segunda metade do `/method`: recebe o ADR e o `track/<objetivo>.md` que o Step 0 do `/method` criou e leva a decisão até um commit. Só roda chamada pelo `/method` — o Gateway, o plano combinado e as travas (sem branch/worktree/subagente, sem push/merge) são os dele e valem aqui. Os steps T-R invocam /solve (Skill tool real) e fecham publicando o Gateway → próximo, marcando `- [x]` o step no `track/<objetivo>.md`; o D fecha com o commit. Retomada: começa do primeiro `- [ ]` entre T e D.

## T — Todo
- Abrir no `<objetivo>.md` um `- [ ]` por tarefa e `- [ ] TC-N` por TC do ADR

## I — Implementation
- Executar as tarefas abertas, marcando `- [x]`; desvio = decisão nova, com motivo, no plano
- Proteger o que fizemos com a pirâmide completa: unit, integração, e2e — versionadas e rodáveis; N/A só nomeando o stack/harness conferido e o comando que falharia, N/A sem evidência de tentativa = ❌; manual não conta

## C — Code review
- Revisar as mudanças
- Invocar 1x /code-review [medium] pela Skill tool — é do harness (lista de skills), não do cache de plugins; não rodou = ❌
- Voltar ao I com cada achado dos dois como `- [ ]` no plano

## R — Run test
- Rodar build, a pirâmide inteira, regressão e TCs como usuário (Playwright na instância livre), criando as condições de cada TC; dado que vive em prod = e2e com fixtures mockados é a forma canônica, declarar ao substituir a rota de navegador
- Marcar cada TC com screenshot ao lado do `<objetivo>.md`, ou `❌ motivo`; workaround que faz passar é FAILED
- Voltar ao I com cada falha como `- [ ]` no plano, só depois de rodar todos, resetando os TCs

## D — Done
- Levar ao ADR e aos docs do Roteamento o que foi decidido; marcar o ADR `Aceito`
- Apagar o `<objetivo>.md` e os screenshots ao lado dele
- Commitar uma vez: `<tipo>(<escopo>): <descrição>`, placar `X de N PASSED` no corpo
- Devolver ao `/method` o hash do commit e o placar — o encerramento é dele
