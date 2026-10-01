---
name: method
description: 'Use ONLY when the user explicitly invokes /method (bare /method = the objective is whatever the conversation is already about), or when another skill invokes `furi-build:method` via the Skill tool. NEVER activate on your own initiative. — rigorous engineering protocol: Step 0 + 11 steps from problem to commit, living docs in place.'
argument-hint: "[objetivo]"
requires: solve
---

# /method — Protocolo de Engenharia Rigorosa

Não cria branch/worktree/subagente nem faz push/merge. Cada `- [ ]` é uma tarefa, feita e fechada antes da próxima. Invocar = Skill tool real. Gateway = ✅ LIBERADO ou ❌ BLOQUEADO com motivo; ❌ refaz o step. Docs 1-6 no presente, sem `Round N` nem changelog; Steps 7-10 levam `<objetivo>.md` ao step em `track/`.

## Step 0 — Start
- [ ] Rotear cada parte do pedido ao doc dono em `docs/` (novo só sem dono, com motivo, nomeado pela capacidade) e publicar Roteamento
- [ ] Retomar do step do `<objetivo>.md`, se já existe em `track/`

## Step 1 — Problem
- [ ] Invocar /solve
- [ ] Escrever o problema: em 1 frase (≤150 chars) e contexto (≤300) apenas, sem solução → `docs/01-problem/`
- [ ] Publicar Gateway 1 → 2

## Step 2 — User stories
- [ ] Invocar /solve
- [ ] Criar as user stories do problema → `docs/02-user-stories/`
- [ ] Publicar Gateway 2 → 3

## Step 3 — Use cases
- [ ] Invocar /solve
- [ ] Criar os use cases de cada story → `docs/03-use-cases/`
- [ ] Publicar Gateway 3 → 4

## Step 4 — Spec
- [ ] Invocar /solve
- [ ] Decidir o que está em aberto, lendo docs e código → `docs/04-spec/`
- [ ] Publicar Gateway 4 → 5

## Step 5 — Design
- [ ] Invocar /solve
- [ ] Decidir o design de cada tela, se houver → `docs/05-design/` e `design-system.md`
- [ ] Publicar Gateway 5 → 6

## Step 6 — Test cases
- [ ] Invocar /solve
- [ ] Criar até 10 TCs cobrindo os UCs e spec → `docs/06-test-cases/`
- [ ] Publicar Gateway 6 → 7

## Step 7 — Todo
- [ ] Invocar /solve
- [ ] Criar o plano em `track/07-todo/<objetivo>.md`: `- [ ]` por tarefa, `- [ ] TC-N` por TC
- [ ] Publicar Gateway 7 → 8

## Step 8 — Implementation
- [ ] Invocar /solve
- [ ] Executar as tarefas abertas, marcando `- [x]`; desvio = decisão nova, com motivo, no plano
- [ ] Proteger o que fizemos com pirâmide de testes
- [ ] Publicar Gateway 8 → 9

## Step 9 — Code review
- [ ] Invocar /solve e revisar as mudanças
- [ ] Invocar /code-review [medium], no máx 1x
- [ ] Voltar ao 8 com cada achado dos dois como `- [ ]` no plano
- [ ] Publicar Gateway 9 → 10

## Step 10 — Run test
- [ ] Invocar /solve
- [ ] Rodar build, a pirâmide de testes, regressão e TCs como usuário (Playwright na instância livre), criando as condições de cada TC
- [ ] Marcar cada TC com screenshot ao lado do `<objetivo>.md`, ou `❌ motivo`; workaround que faz passar é FAILED
- [ ] Voltar ao 8 com cada falha como `- [ ]` no plano, só depois de rodar todos, resetando os TCs
- [ ] Publicar Gateway 10 → 11

## Step 11 — Done
- [ ] Levar aos docs do Roteamento o que foi decidido e ainda vale
- [ ] Apagar o `<objetivo>.md` e os screenshots ao lado dele
- [ ] Commitar uma vez: `<tipo>(<escopo>): <descrição>`, placar `X de N PASSED` no corpo
- [ ] Encerrar com o que foi feito, sem pendência, próximo passo nem sugestão
