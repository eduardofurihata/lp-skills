---
name: method
description: 'Use ONLY when the user explicitly invokes /method (bare /method = the objective is whatever the conversation is already about), or when another skill invokes `furi-build:method` via the Skill tool. NEVER activate on your own initiative. — the rigorous engineering protocol: 11 steps (plus Step 0) from problem to committed code, living docs updated in place.'
argument-hint: "[objetivo]"
requires: solve
---

# /method — Protocolo de Engenharia Rigorosa

Não cria branch nem worktree, não usa subagente, não faz push nem merge: para no commit.

**Cada `- [ ]` é uma tarefa:** `TaskCreate` um por item, `TaskUpdate` fecha antes da próxima. Os Steps 1-10 abrem com `- [ ] Invocar o /solve via Skill tool` — cada item do step se decide e se faz no nível dele — e fecham com `- [ ] Publicar o Gateway Check N → N+1`: artefato escrito · itens fechados · **Veredicto** ✅ LIBERADO / ❌ BLOQUEADO — motivo.

## Step 0 — Start

- [ ] Rotear cada parte do pedido ao doc que já é dono dela e publicar o Roteamento no chat

**Rotear:** ler todo `docs/**/*.md`; doc novo só sem dono, com o motivo, nomeado pela capacidade, nunca pelo ticket; irmãos que cobrem o mesmo se mesclam no dono.

Contrato — `docs/`: `00-context` (brainstorming) · `01-problem` · `02-user-stories` · `03-use-cases` · `04-spec` · `05-design` · `06-test-cases`; `track/`: `07-todo` · `08-implementation` · `09-code-review` · `10-run-test`. **Doc vivo:** descreve a capacidade como ela é hoje — reescrito no presente, sem `Round N` nem changelog; acima de ~30 KB vira pasta. O `track/` tem um arquivo por esteira, `<objetivo>.md` — a pasta é o status —, e o de outra esteira não se mexe; se ele já existe, a esteira retoma do step da pasta dele.

## Steps 1-6 — docs: atualizam os arquivos do Roteamento, no presente

- [ ] Escrever o problema em 1 frase (até 150 caracteres) com contexto (até 300), sem dar solução → `docs/01-problem/`
- [ ] Criar as user stories do problema → `docs/02-user-stories/`
- [ ] Criar os use cases de cada story → `docs/03-use-cases/`
- [ ] Decidir o que está em aberto, sem perguntar, analisando docs, código e `CLAUDE.md` → `docs/04-spec/`
- [ ] Decidir cada tela pelo `/front`, se houver tela → `docs/05-design/` e o `design-system.md`
- [ ] Criar até 10 TCs adversariais, régua ISTQB, cobrindo os UCs e as D-N → `docs/06-test-cases/`

## Steps 7-10 — código: cada step move o `<objetivo>.md` para a sua pasta

- [ ] Criar o plano em `track/07-todo/<objetivo>.md`: um `- [ ]` por tarefa e um `- [ ] TC-N` por TC
- [ ] Executar as tarefas abertas do plano, marcando `- [x]`, em `track/08-implementation/`
- [ ] Fazer o code review das mudanças da feature, com o lint, em `track/09-code-review/`
- [ ] Rodar o build, os TCs e a regressão, do zero e pelo front, em `track/10-run-test/`

Desvio vira decisão nova, com motivo, no plano. Achado do review e falha de teste viram `- [ ]` no plano e voltam ao 8; o teste só decide depois de rodar todos, e aí o checklist de TCs reseta. Teste é como usuário (Playwright na instância livre), criando as condições de cada TC, com `- [x]` e screenshot ou `❌ motivo`; workaround que faz o TC passar é FAILED disfarçado.

## Step 11 — Done: um único commit, no fim

- [ ] Levar aos docs do Roteamento, no presente, o que a esteira decidiu e ainda vale
- [ ] Apagar só o `track/*/<objetivo>.md` desta esteira e a evidência dela
- [ ] Commitar uma vez: `feat(<escopo>): <descrição>`, placar `X de N PASSED` no corpo
- [ ] Encerrar dizendo o que foi feito — sem pendência, próximo passo nem sugestão
