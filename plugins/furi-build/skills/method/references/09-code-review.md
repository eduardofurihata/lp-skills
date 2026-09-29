# Step 9 — Code Review Crítico

**Revisar até 100% limpo, princípio a princípio e por nome — o que aparecer se corrige agora.** Nunca "bom o suficiente". **Cada `- [ ]` é uma tarefa:** `TaskCreate` um por item, `TaskUpdate` fecha antes da próxima.

- [ ] Invocar o `/solve` via Skill tool
- [ ] Ler `git status` e `git diff` (e `--cached`): todas as mudanças da feature, ainda não commitadas
- [ ] Conferir contra o plano (8a), os TCs (6) e os UCs (3): exatamente o que pedem, nem mais, nem menos
- [ ] Revisar cada arquivo: código morto, bugs, segurança (XSS, injection, secrets, auth), performance (N+1, re-renders), erro silencioso ou genérico, consistência com o codebase
- [ ] Passar o `/principles` um a um e por nome: SRP, OCP, LSP, ISP, DIP, DRY, KISS, YAGNI, LoD, Motores e o saldo do perímetro (§ 3.5) — e o plano § 3.1-3.3 cumprido
- [ ] Passar o `/front`, com UI, guarda-chuva a guarda-chuva: DS, consistência, estados, a11y AA, breakpoints, § 3.4 — e o nível do `/solve`
- [ ] Corrigir cada achado agora e voltar ao diff, até zero issues
- [ ] Escrever `track/09-code-review/<objetivo>.md` (efêmero, `00-start.md`): Resumo (branch · iterações · PR existente) · Arquivos (✅ limpo / ⚠️ corrigido) · Problemas corrigidos · Cobertura · Segurança · Qualidade (uma linha por princípio, com evidência) · Design (uma por guarda-chuva, ou `N/A — derivado do Step 4`) · Veredicto ✅/❌ e confiança
- [ ] Voltar ao 8b com veredicto ❌ e rodar o Step 9 inteiro de novo
- [ ] Publicar o Gateway Check 9 → 10 com as linhas obrigatórias (`SKILL.md` § Gateway Check)

Relatório brutalmente honesto: linha em branco = princípio não revisado. Não cria nem aprova PR — só atualiza o existente.
