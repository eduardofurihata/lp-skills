# Step 8 — Implementação (8a: Plano · 8b: Codificar)

**8a é o portão mais barato do protocolo** — o que o plano decidir errado vira código errado. Reúso, descarte, motor, DS e perímetro se decidem por escrito aqui; o 8b executa. **Cada `- [ ]` é uma tarefa:** `TaskCreate` um por item, `TaskUpdate` fecha antes da próxima.

- [ ] Invocar o `/solve` via Skill tool
- [ ] Escrever `track/08-implementation/<objetivo>.md` autocontido — efêmero, um por esteira (`00-start.md`) — com 1 Contexto (Steps 1-5) · 2 Código existente e i18n (string user-facing é chave) · 3 Estratégia (ordem das tasks, referência, uma frase por arquivo, extensão e direção das dependências) · 4 Mapa TC → código · 5 Riscos · 6 Checklist de tasks
- [ ] Decidir o reúso (§ 3.1): preciso de → já existe? (grep) → reutilizar / estender / criar justificado
- [ ] Listar o que não se constrói (§ 3.2): cogitado e sem UC
- [ ] Mapear os motores (§ 3.3): capacidade → motor → nasce / estende / absorve
- [ ] Planejar o DS, com UI (§ 3.4): reusar / compor / promover, padrões a elevar, estados, zero literal
- [ ] Declarar o perímetro (§ 3.5): arquivo → por que entra → o que sobe, ou "já no nível #1"
- [ ] Publicar o Gateway Check 8a → 8b com as linhas obrigatórias (`SKILL.md` § Gateway Check)
- [ ] Codificar task a task relendo o plano — desvio vira decisão nova, com motivo, no plano; nunca retrofit depois
- [ ] Pôr a capacidade no motor — o chamador só chama; a mesma regra achada fora → absorve
- [ ] Elevar cada arquivo do perímetro ou declará-lo no nível #1 — fora dele, não se vasculha
- [ ] Aplicar, com UI: zero literal, todos os estados, a11y AA, breakpoints do projeto
- [ ] Blindar cada linha: input validado, auth explícito, zero segredo, sanitize, least privilege, erro com contexto (nunca `catch {}`), sem N+1 — o da stack em `.claude/patterns.md`
- [ ] Testar o impacto: grep de quem usa cada arquivo alterado → features afetadas → sem TC, criar o de regressão
- [ ] Rodar tsc e lint e marcar todas as tasks
- [ ] Publicar o Gateway Check 8b → 9 com as linhas obrigatórias (`SKILL.md` § Gateway Check)
