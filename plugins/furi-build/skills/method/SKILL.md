---
name: method
description: 'Use ONLY when the user explicitly invokes /method (bare /method = the objective is whatever the conversation is already about), or when another skill invokes `furi-build:method` via the Skill tool. NEVER activate on your own initiative. — rigorous engineering protocol: Step 0 + 6 steps from problem to commit, the decision record via /adr, living docs in place.'
argument-hint: "[objetivo]"
requires: [solve, adr]
---

# /method — Protocolo de Engenharia Rigorosa

/method é a espinha: combinado com outra skill, os 6 steps rodam inteiros — ela intercala o que pede, não a substitui nem rebaixa; combinada, é o final dela que vence o do /method. Vontade de pular ou comprimir um step ("o pedido já tem", "é cerimônia") = declarar o plano combinado e ter o sim, não decidir calado — comprimir o ADR nunca é pular story nem use case. Não cria branch/worktree/subagente nem faz push/merge. Os steps 0-5 invocam /solve (Skill tool real), o do 0 antes de tudo; os 1-5 fecham publicando o Gateway → próximo: uma linha, barata e obrigatória — ✅ LIBERADO (marca `- [x]` o step no `track/<objetivo>.md`) ou ❌ BLOQUEADO: `<motivo>` (refaz o step). Cada linha é uma ação fechada antes da próxima.

## Step 0 — Start
- Invocar /solve (Skill tool) antes de qualquer leitura, pergunta ou item de outra skill — é a 1ª ação do run
- Rotear cada parte do pedido ao doc dono em `docs/` (novo só sem dono, com motivo, nomeado pela capacidade) e publicar Roteamento
- Declarar o plano combinado quando houver outra skill, no argumento ou como outro /comando no mesmo prompt — o Step 0 roda antes do 1º item dela
- Criar `track/<objetivo>.md`: os 6 steps como `- [ ]` e, sob cada step 1-5, `- [ ] /solve` e `- [ ] Gateway`
- Retomar do primeiro `- [ ]`, se o `<objetivo>.md` já existe em `track/`

## Step 1 — ADR
- Invocar /adr (Skill tool) com o objetivo e o Roteamento → `docs/adr/NNNN-<slug>.md`: problema, user stories, use cases, spec, design e test cases
- O Gateway confere as 6 seções: problema em 1 frase (≤150) e contexto (≤300), sem solução; cada story com UC; cada UC e decisão da spec com TC; até 10 TCs
- BLOQUEADO → corrigir o mesmo arquivo; ainda não é decisão

## Step 2 — Todo
- Abrir no `<objetivo>.md` um `- [ ]` por tarefa e `- [ ] TC-N` por TC do ADR

## Step 3 — Implementation
- Executar as tarefas abertas, marcando `- [x]`; desvio = decisão nova, com motivo, no plano
- Proteger o que fizemos com a pirâmide completa: unit, integração, e2e — versionadas e rodáveis; N/A só nomeando o stack/harness conferido e o comando que falharia, N/A sem evidência de tentativa = ❌; manual não conta

## Step 4 — Code review
- Revisar as mudanças
- Invocar 1x /code-review [medium] pela Skill tool — é do harness (lista de skills), não do cache de plugins; não rodou = ❌
- Voltar ao 3 com cada achado dos dois como `- [ ]` no plano

## Step 5 — Run test
- Rodar build, a pirâmide inteira, regressão e TCs como usuário (Playwright na instância livre), criando as condições de cada TC; dado que vive em prod = e2e com fixtures mockados é a forma canônica, declarar ao substituir a rota de navegador
- Marcar cada TC com screenshot ao lado do `<objetivo>.md`, ou `❌ motivo`; workaround que faz passar é FAILED
- Voltar ao 3 com cada falha como `- [ ]` no plano, só depois de rodar todos, resetando os TCs

## Step 6 — Done
- Levar ao ADR e aos docs do Roteamento o que foi decidido; marcar o ADR `Aceito`
- Apagar o `<objetivo>.md` e os screenshots ao lado dele
- Commitar uma vez: `<tipo>(<escopo>): <descrição>`, placar `X de N PASSED` no corpo
- Encerrar com o que foi feito, sem pendência; sozinho, sem próximo passo nem sugestão; combinado, o final da skill-alvo vence
