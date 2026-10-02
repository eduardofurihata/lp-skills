---
name: method
description: 'Use ONLY when the user explicitly invokes /method (bare /method = the objective is whatever the conversation is already about), or when another skill invokes `furi-build:method` via the Skill tool. NEVER activate on your own initiative. — rigorous engineering protocol: Step 0 + 11 steps from problem to commit, living docs in place.'
argument-hint: "[objetivo]"
requires: solve
---

# /method — Protocolo de Engenharia Rigorosa

/method é a espinha: combinado com outra skill, os 11 steps rodam inteiros — ela intercala o que pede, não a substitui nem rebaixa. Vontade de pular um step ("o pedido já tem", "é cerimônia") = declarar o plano combinado e ter o sim, não decidir calado. Não cria branch/worktree/subagente nem faz push/merge. Steps 1-10 invocam /solve (Skill tool real) e, ao fim, publicam o Gateway → próximo: ✅ LIBERADO ou ❌ BLOQUEADO com motivo; ❌ refaz o step. Cada linha é uma ação, feita e fechada antes da próxima. Docs 1-6 no presente, sem `Round N` nem changelog; Steps 7-10 levam `<objetivo>.md` ao step em `track/`.

## Step 0 — Start
- Rotear cada parte do pedido ao doc dono em `docs/` (novo só sem dono, com motivo, nomeado pela capacidade) e publicar Roteamento
- Declarar o plano combinado quando houver outra skill — a espinha são os 11 steps, a outra intercala — e ter o sim antes de seguir
- Retomar do step do `<objetivo>.md`, se já existe em `track/`

## Step 1 — Problem
- Escrever o problema: em 1 frase (≤150 chars) e contexto (≤300) apenas, sem solução → `docs/01-problem/`

## Step 2 — User stories
- Criar as user stories do problema → `docs/02-user-stories/`

## Step 3 — Use cases
- Criar os use cases de cada story → `docs/03-use-cases/`

## Step 4 — Spec
- Decidir o que está em aberto, lendo docs e código → `docs/04-spec/`

## Step 5 — Design
- Decidir o design de cada tela, se houver → `docs/05-design/` e `design-system.md`

## Step 6 — Test cases
- Criar até 10 TCs cobrindo os UCs e spec → `docs/06-test-cases/`

## Step 7 — Todo
- Criar o plano em `track/07-todo/<objetivo>.md`: `- [ ]` por tarefa, `- [ ] TC-N` por TC

## Step 8 — Implementation
- Executar as tarefas abertas, marcando `- [x]`; desvio = decisão nova, com motivo, no plano
- Proteger o que fizemos com a pirâmide: unit, integração e e2e

## Step 9 — Code review
- Revisar as mudanças
- Invocar /code-review [medium], no máx 1x
- Voltar ao 8 com cada achado dos dois como `- [ ]` no plano

## Step 10 — Run test
- Rodar build, a pirâmide inteira, regressão e TCs como usuário (Playwright na instância livre), criando as condições de cada TC
- Marcar cada TC com screenshot ao lado do `<objetivo>.md`, ou `❌ motivo`; workaround que faz passar é FAILED
- Voltar ao 8 com cada falha como `- [ ]` no plano, só depois de rodar todos, resetando os TCs

## Step 11 — Done
- Levar aos docs do Roteamento o que foi decidido e ainda vale
- Apagar o `<objetivo>.md` e os screenshots ao lado dele
- Commitar uma vez: `<tipo>(<escopo>): <descrição>`, placar `X de N PASSED` no corpo
- Encerrar com o que foi feito, sem pendência, próximo passo nem sugestão
