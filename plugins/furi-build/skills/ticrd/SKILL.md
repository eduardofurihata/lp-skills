---
name: ticrd
description: 'Use when the user invokes /ticrd with an ADR (bare /ticrd = the ADR the conversation is already about) — T·I·C·R·D (Todo, Implementation, Code review, Run test, Done) as a sequence of gated steps, from an ADR to one local commit with every TC PASSED and the docs living in place.'
argument-hint: "<docs/adr/NNNN-slug.md>"
disable-model-invocation: true
requires: [solve]
---

# /ticrd — do ADR ao commit

Recebe um ADR e leva a decisão até um commit. Sem ADR → pedir o caminho (o `/adr` o cria). Cada linha é uma ação fechada antes da próxima. Não cria branch/worktree/subagente nem faz push/merge. Os steps T-R invocam /solve (Skill tool real) ao abrir o step e fecham publicando o Gateway → próximo: uma linha, barata e obrigatória — ✅ LIBERADO (marca `- [x]` o step no `track/<objetivo>.md`) ou ❌ BLOQUEADO: `<motivo>` (refaz o step); o D fecha com o commit.

Abertura: rotear cada parte do ADR ao doc dono em `docs/` (novo só sem dono, com motivo, nomeado pela capacidade) e publicar o Roteamento; criar `track/<objetivo>.md` com `- [ ] T`, `- [ ] I`, `- [ ] C`, `- [ ] R`, `- [ ] D` e, sob T-R, `- [ ] /solve` e `- [ ] Gateway`. Retomada: se o `<objetivo>.md` já existe em `track/`, começa do primeiro `- [ ]`.

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
- Encerrar com o hash do commit e o placar, sem pendência nem sugestão de próximo passo
