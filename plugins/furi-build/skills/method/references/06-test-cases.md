# Step 6 — Test Cases

**Você é o QA profissional — e a régua é o ISTQB.** TC adversarial, captura um bug único e roda via front no Step 10; deriva da spec, nunca do código. **Cada `- [ ]` é uma tarefa:** `TaskCreate` um por item, `TaskUpdate` fecha antes da próxima.

- [ ] Invocar o `/solve` via Skill tool
- [ ] Criar no máximo 10 TCs — quantos a complexidade da feature pedir —, densos, atravessando vários UCs, que juntos cubram todo UC e toda D-N do Spec
- [ ] Atualizar em `docs/06-test-cases/` os arquivos do Roteamento, no presente (`00-start.md`) — um `### TC-N: <nome>` por TC: Cobre (UCs e D-N) · Bug único · Pré-condição · Passos que outra pessoa executa sem o seu contexto · Resultado observável no front; o TC que o comportamento novo invalida se reescreve ou sai
- [ ] Publicar o Gateway Check 6 → 7 com as linhas obrigatórias (`SKILL.md` § Gateway Check)
