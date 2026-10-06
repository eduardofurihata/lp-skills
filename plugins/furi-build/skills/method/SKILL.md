---
name: method
description: 'Use ONLY when the user explicitly invokes /method (bare /method = the objective is whatever the conversation is already about), or when another skill invokes `furi-build:method` via the Skill tool. NEVER activate on your own initiative. — rigorous engineering protocol: Step 0 + 11 steps from problem to commit, living docs in place.'
argument-hint: "[objetivo]"
requires: solve
---

# /method — Protocolo de Engenharia Rigorosa

/method é a espinha: combinado com outra skill, os 11 steps rodam inteiros — ela intercala o que pede, não a substitui nem rebaixa; combinada, é o final dela que vence o do /method. Vontade de pular ou comprimir um step ("o pedido já tem", "é cerimônia") = declarar o plano combinado e ter o sim, não decidir calado — comprimir um doc nunca é pular story nem use case. Não cria branch/worktree/subagente nem faz push/merge. Cada step 1-10 invoca /solve (Skill tool real) e fecha publicando o Gateway → próximo: uma linha, barata e obrigatória — ✅ LIBERADO (marca `- [x]` o step no `track/<objetivo>.md`) ou ❌ BLOQUEADO: `<motivo>` (refaz o step). Cada linha é uma ação fechada antes da próxima. Docs 1-6 no presente, sem `Round N` nem changelog.

## Step 0 — Start
- Rotear cada parte do pedido ao doc dono em `docs/` (novo só sem dono, com motivo, nomeado pela capacidade) e publicar Roteamento
- Declarar o plano combinado quando houver outra skill
- Criar `track/<objetivo>.md`: os 11 steps como `- [ ]`
- Retomar do primeiro `- [ ]`, se o `<objetivo>.md` já existe em `track/`

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
- Abrir no `<objetivo>.md` um `- [ ]` por tarefa e `- [ ] TC-N` por TC

## Step 8 — Implementation
- Executar as tarefas abertas, marcando `- [x]`; desvio = decisão nova, com motivo, no plano
- Proteger o que fizemos com a pirâmide completa: unit, integração, e2e — versionadas e rodáveis; N/A só nomeando o stack/harness conferido e o comando que falharia, N/A sem evidência de tentativa = ❌; manual não conta

## Step 9 — Code review
- Revisar as mudanças
- Invocar 1x /code-review [medium] pela Skill tool — é do harness (lista de skills), não do cache de plugins; não rodou = ❌
- Voltar ao 8 com cada achado dos dois como `- [ ]` no plano

## Step 10 — Run test
- Rodar build, a pirâmide inteira, regressão e TCs como usuário (Playwright na instância livre), criando as condições de cada TC; dado que vive em prod = e2e com fixtures mockados é a forma canônica, declarar ao substituir a rota de navegador
- Marcar cada TC com screenshot ao lado do `<objetivo>.md`, ou `❌ motivo`; workaround que faz passar é FAILED
- Voltar ao 8 com cada falha como `- [ ]` no plano, só depois de rodar todos, resetando os TCs

## Step 11 — Done
- Levar aos docs do Roteamento o que foi decidido e ainda vale
- Apagar o `<objetivo>.md` e os screenshots ao lado dele
- Commitar uma vez: `<tipo>(<escopo>): <descrição>`, placar `X de N PASSED` no corpo
- Encerrar com o que foi feito, sem pendência; sozinho, sem próximo passo nem sugestão; combinado, o final da skill-alvo vence
