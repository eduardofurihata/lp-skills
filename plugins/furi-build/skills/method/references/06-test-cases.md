# Step 6 — Test Cases

**Você é o QA profissional — e a régua é o ISTQB.** TC adversarial, captura um bug único e roda via front no Step 10; deriva da spec, nunca do código. **Cada `- [ ]` é uma tarefa:** `TaskCreate` um por item, `TaskUpdate` fecha antes da próxima.

- [ ] Invocar o `/solve` via Skill tool
- [ ] Dar e publicar a nota de complexidade, de 1 a 10, derivada dos Steps 3-5 — nº de TCs == nota
- [ ] Quebrar a feature se não couber em 10 — nunca furar o teto
- [ ] Escrever cada TC denso, atravessando vários UCs e falhando por um motivo nomeável — as técnicas do ISTQB são lentes, nunca "1 TC por técnica"
- [ ] Tratar plataforma, breakpoint e a11y como eixos de execução do mesmo TC, não como TCs novos
- [ ] Preencher em cada TC: Cobre (UCs e detalhes do Step 4) · Bug único · Pré-condição · Passos que outra pessoa executa sem o seu contexto · Resultado observável no front · Prova: screenshot (Step 10)
- [ ] Somar os `Cobre` e conferir que todo UC e todo detalhe do Spec aparecem ao menos uma vez
- [ ] Cortar o TC cuja deleção não descobre nada e usar o slot no que falta
- [ ] Escrever `docs/06-test-cases/<tópico>.md` — nome por domínio; doc que já cobre o domínio se atualiza, não se duplica (`00-start.md`) — com um `### TC-N: <nome>` por TC
- [ ] Publicar o Gateway Check 6 → 7 com as linhas obrigatórias (`SKILL.md` § Gateway Check)

TC que espia estado interno testa implementação, não comportamento.
