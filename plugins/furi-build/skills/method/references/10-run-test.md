# Step 10 — Run Test

**FRONT É FRONT.** Cada TC roda como usuário real — abrir, navegar, clicar, preencher — com evidência. Código, tsc e "a tela carregou" não são teste. **Cada `- [ ]` é uma tarefa:** `TaskCreate` um por item, `TaskUpdate` fecha antes da próxima.

- [ ] Invocar o `/solve` via Skill tool
- [ ] Mover o `<objetivo>.md` da esteira para `track/10-run-test/`
- [ ] Rodar, pelo `/solve`, o build do projeto e todos os TCs do `## Test Cases (QA)`, mais a regressão das features que os arquivos alterados afetam, do zero e pelo front (web = Playwright, na instância livre), criando as condições que cada um pede; marcar cada TC `- [x]` com screenshot ou `❌ motivo` e escrever cada falha como `- [ ]` no plano
- [ ] Publicar o Gateway Check 10 → 11 com as linhas obrigatórias (`SKILL.md` § Gateway Check) — com TC falhando, o checklist de TCs reseta e a esteira volta ao Step 8

Workaround que faz o TC passar é FAILED disfarçado. Dizer "não rodei X" não libera PASSED: pragmatismo muda o como, nunca o quanto.
