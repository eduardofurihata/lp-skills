# Step 10 — Run Test

**FRONT É FRONT.** Cada TC roda como usuário real — abrir, navegar, clicar, preencher — com evidência. Código, tsc e "a tela carregou" não são teste. **Cada `- [ ]` é uma tarefa:** `TaskCreate` um por item, `TaskUpdate` fecha antes da próxima.

- [ ] Invocar o `/solve` via Skill tool
- [ ] Classificar todos os TCs (feature + regressão) em READY · NEEDS SETUP · BLOCKED — BLOCKED > 0 → perguntar antes de rodar qualquer um
- [ ] Criar as condições com poder total: usuário, dado, estado, flag, via front, DB ou API
- [ ] Criar uma task por grupo (~10 TCs) e uma por TC, e publicar o Audit Pré: N TCs · M tasks · M == N?
- [ ] Rodar tsc e lint
- [ ] Rodar cada TC do zero: web = Playwright (`mcp__playwright-4__*`; ocupado → próximo livre) · Android = emulador · iOS = simulador ou device · API = chamada real — mobile é Android e iOS
- [ ] Registrar PASSED com screenshot ou FAILED no `## Test Cases (QA)` do to-do
- [ ] Levar ao motor o fix de cada bug, resetar o checklist, voltar ao Step 9 e retestar tudo
- [ ] Provar a UI por estado × breakpoint (piso 320px), não só o happy path em desktop
- [ ] Reconciliar: TC sem evidência = NOT_RUN, nunca "coberto por"
- [ ] Publicar o Audit Pós: C == N · E == N · 0 FAILED/NOT_RUN/BLOCKED · último ciclo sem mudança
- [ ] Abrir o report com `X de N PASSED via front. Y NOT_RUN. Z FAILED. Net: PASS|FAIL|INCOMPLETE.`
- [ ] Escrever `track/10-run-test/<objetivo>.md` (efêmero, `00-start.md`) com evidência por TC e `## Test Environment Setup` (o que criou, qual `pw#`)
- [ ] Publicar o Gateway Check 10 → 11 com as linhas obrigatórias (`SKILL.md` § Gateway Check)

Workaround que faz o TC passar é FAILED disfarçado. Dizer "não rodei X" não libera PASSED: pragmatismo muda o como, nunca o quanto.
