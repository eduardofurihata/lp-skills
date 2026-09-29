# Step 1 — Problema

**Uma frase, e ela descreve o problema, não a solução.** "Falta um endpoint de X" é solução disfarçada; se não cabe em uma frase, você não entendeu o problema ainda. **Cada `- [ ]` é uma tarefa:** `TaskCreate` um por item, `TaskUpdate` fecha antes da próxima.

- [ ] Invocar o `/solve` via Skill tool
- [ ] Escrever o problema em 1 frase, sem solução embutida
- [ ] Nomear a capacidade que falta, não a tela onde ela some — com UI, a fricção, não o widget
- [ ] Separar em outro problema cada "e" da frase, cada um na sua seção
- [ ] Identificar quem é afetado (persona/role) e como — um problema com N afetados, não N problemas gêmeos
- [ ] Escrever `docs/01-problem/<tópico>.md` — nome por domínio; doc que já cobre o domínio se atualiza, não se duplica (`00-start.md`) — com `# <Tópico>` · `## Problema` (1 frase) · `## Contexto` (2-3 linhas, se preciso) · `## Afetados` (`- <persona> (<como é afetada>)`)
- [ ] Publicar o Gateway Check 1 → 2 com as linhas obrigatórias (`SKILL.md` § Gateway Check)

"Falta um botão" não é problema; "o usuário não consegue voltar sem perder o que digitou" é.
