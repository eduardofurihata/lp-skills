---
name: method
description: 'Use ONLY when the user explicitly invokes /method (bare /method = the objective is whatever the conversation is already about), or when another skill invokes `furi-build:method` via the Skill tool. NEVER activate on your own initiative. — the rigorous engineering protocol: 11 steps (plus Step 0) from problem to committed code, living docs updated in place.'
effort: max
argument-hint: "[objetivo]"
requires: solve
---

# /method — Protocolo de Engenharia Rigorosa

Tudo nesta conversa, sem branch, worktree nem subagente; merge para `main` só com o usuário autorizando ESTE merge. Do Step 0 ao 11 com transição automática; só pausa em decisão irreversível que só o usuário julga. Não existe tarefa pequena demais; código feito fora volta ao Step 1 como insumo. Fora do protocolo: typo, refactor sem mudança de comportamento, config sem código e pergunta.

**Cada `- [ ]` é uma tarefa:** `TaskCreate` um por item, `TaskUpdate` fecha antes da próxima. Os Steps 1-10 abrem com `- [ ] Invocar o /solve` e fecham com `- [ ] Publicar o Gateway Check N → N+1`: artefato escrito · itens fechados · **Veredicto** ✅ LIBERADO / ❌ BLOQUEADO — motivo.

## Step 0 — Start

- [ ] Retomar: se o `<objetivo>.md` desta esteira já existe em `track/`, seguir do step que a pasta dele diz — o de outra esteira fica intocado
- [ ] Arrumar: `git rm` no que o git rastreia em `track/` e `git mv` das pastas antigas de `docs/` para o contrato, do maior para o menor — e commitar só isso (`chore: arruma docs/track`)
- [ ] Rotear: ler todo `docs/**/*.md`, quebrar o pedido em partes e mandar cada uma ao arquivo que já é dono dela — criar só sem dono, com o motivo, nomeado pela capacidade, nunca pelo ticket ou pela feature; mesclar no dono os irmãos que cobrem o mesmo
- [ ] Publicar **Estrutura** e **Roteamento** (parte → arquivo, ou `novo: <nome> — motivo`) e perguntar se sobrou ambiguidade

Contrato — `docs/`: `00-context` (brainstorming) · `01-problem` · `02-user-stories` · `03-use-cases` · `04-spec` · `05-design` (era `04-design`) · `06-test-cases` (era `05-test-cases`); `track/`: `07-todo` · `08-implementation` · `09-code-review` · `10-run-test`. **Doc vivo:** descreve a capacidade como ela é hoje — reescrito no presente, sem `Round N` nem changelog; acima de ~30 KB vira pasta. O `track/` tem um arquivo por esteira, `<objetivo>.md` — a pasta é o status — e nunca vai ao git.

## Steps 1-6 — docs: atualizam os arquivos do Roteamento, no presente

- [ ] 1 · Problema: 1 frase, sem solução embutida → `docs/01-problem/`: `## <problema>` · `### Problema` · `### Contexto`
- [ ] 2 · User Stories: uma por necessidade de cada persona que o problema afeta → `docs/02-user-stories/`: "Como <persona>, quero <ação> para <benefício>."
- [ ] 3 · Use Cases: todos os casos de uso de cada story → `docs/03-use-cases/`: `## UC-N — <nome>` · Ator · Fluxo · Resultado · Estados de tela (com UI)
- [ ] 4 · Spec: toda decisão em aberto, sem perguntar, olhando docs, código e `CLAUDE.md` → `docs/04-spec/`: `## Escopo derivado` (plataformas · superfície visual) e `### D-N` · por quê · UC que exige · reusar, estender ou criar · descartadas — sem superfície visual, pula o 5
- [ ] 5 · Design: as decisões de cada tela, pelo `/front` → `docs/05-design/`: `## <tela>` + o que o DS ganhou no `docs/05-design/design-system.md`
- [ ] 6 · Test Cases: no máximo 10, adversariais, pela régua do ISTQB, cobrindo todo UC e D-N → `docs/06-test-cases/`: `### TC-N` · Cobre · Bug único · Pré-condição · Passos que outra pessoa executa · Resultado no front

## Steps 7-10 — código: cada step move o `<objetivo>.md` para a sua pasta

- [ ] 7 · To Do: o plano — o que ele decidir errado vira código errado → `track/07-todo/<objetivo>.md`: `- [ ] <o que muda> · UC-N/TC-N · arquivos: <lista>` por tarefa e `## Test Cases (QA)` com um `- [ ] TC-N` por TC
- [ ] 8 · Implementação: executar as tarefas abertas do plano marcando `- [x]` — desvio vira decisão nova, com motivo, no plano
- [ ] 9 · Code Review: de todas as mudanças (`git diff`, também `--cached`), com o lint do projeto — cada achado vira `- [ ]` no plano e volta ao 8
- [ ] 10 · Run Test: o build, todos os TCs e a regressão das features afetadas, do zero, pelo front, como usuário (Playwright na instância livre), criando as condições de cada um; `- [x]` com screenshot ou `❌ motivo` — só depois de todos, cada falha vira `- [ ]`, o checklist reseta e volta ao 8. Workaround que faz o TC passar é FAILED disfarçado

## Step 11 — Done: um único commit, no fim

- [ ] Levar aos docs do Roteamento, no presente, o que a esteira decidiu e ainda vale
- [ ] Apagar só o `track/*/<objetivo>.md` desta esteira e a evidência dela — nunca o `track/` inteiro, que pode ter esteira em paralelo
- [ ] Commitar uma vez: `git add -A -- . ':(exclude)track'` + `git commit -m "feat(<escopo>): <descrição>"`, com o placar `X de N PASSED via front` no corpo
- [ ] Encerrar dizendo o que foi feito — sem pendência, próximo passo nem sugestão
