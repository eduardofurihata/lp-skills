---
name: method
description: 'Use ONLY when the user explicitly invokes /method (bare /method = the objective is whatever the conversation is already about), or when another skill invokes `furi-build:method` via the Skill tool. NEVER activate on your own initiative. — the rigorous engineering protocol: 11 steps (plus Step 0) from problem to committed code, one artifact per step, /solve reinvoked every step.'
effort: max
argument-hint: "[feature-name]"
requires: solve
---

# /method — Protocolo de Engenharia Rigorosa

Tudo nesta conversa, sem branch, worktree nem subagente; merge para `main` só com o usuário autorizando ESTE merge. Vale do Step 0 ao 11 com transição automática; só pausa em decisão irreversível que só o usuário julga. Nível do `/solve`; não existe tarefa pequena demais; código feito fora volta ao Step 1 como insumo. **Cada `- [ ]` é uma tarefa:** `TaskCreate` um por item, `TaskUpdate` fecha antes da próxima.

- [ ] Invocar o `/solve` via Skill tool
- [ ] Rodar o Step 0 (`references/00-start.md`)
- [ ] Rodar o Gate Check: os docs 01-05 cobrem a feature? Faltando, escrever antes de codar
- [ ] Rodar o Step 1 (`references/01-problema.md`)
- [ ] Rodar o Step 2 (`references/02-user-stories.md`)
- [ ] Rodar o Step 3 (`references/03-use-cases.md`)
- [ ] Rodar o Step 4 (`references/04-spec.md`)
- [ ] Rodar o Step 5, só com superfície visual (`references/05-design.md`)
- [ ] Rodar o Step 6 (`references/06-test-cases.md`)
- [ ] Rodar o Step 7 (`references/07-todo.md`)
- [ ] Rodar o Step 8 (`references/08-implementation.md`)
- [ ] Rodar o Step 9 (`references/09-code-review.md`)
- [ ] Rodar o Step 10 (`references/10-run-test.md`) — mudança de código volta ao 9, até 100% PASSED sem mudança
- [ ] Rodar o Step 11, com o único commit (`references/11-done.md`)

Cada step produz o seu `<tópico>.md` — sem ele, não foi executado — e publica `## Gateway Check — Step N → N+1`: artefato e critérios · **Princípios** (SOLID = os cinco) · **Refatoração** · **Design** (ou `N/A — derivado do Step 4`) · **Veredicto** ✅ LIBERADO / ❌ BLOQUEADO — motivo. Fora do protocolo: typo, refactor sem mudança de comportamento, config sem código e pergunta.
