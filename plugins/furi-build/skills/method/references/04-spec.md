# Step 4 — Spec

**Toda decisão em aberto, resolvida aqui — sem perguntar.** Zero ambiguidade sobra para os steps seguintes. **Cada `- [ ]` é uma tarefa:** `TaskCreate` um por item, `TaskUpdate` fecha antes da próxima.

- [ ] Invocar o `/solve` via Skill tool
- [ ] Analisar tudo: docs dos Steps 1-3, decisões anteriores, código relevante, `CLAUDE.md`
- [ ] Listar os gaps: stack, regras de negócio, edge cases, integrações, permissões, dados, performance, segurança, i18n, rollback — e qual capacidade a feature exige e quem é o dono dela
- [ ] Derivar a plataforma do código: app mobile existe e a feature aparece nele → Android e iOS entram
- [ ] Derivar a superfície visual: sim quando algum UC lista estados de tela ou algum passo acontece numa tela — "web-only" e "não tem UI" não se aceitam declarados
- [ ] Resolver cada gap como uma D-N: justificativa e referência · UC que exige · já existe no projeto? (reusar/estender/criar) · motor dono (nasce/estende/absorve), depende de, cresce por · descartadas e por quê
- [ ] Decidir pelo `/solve` (referência #1 e boas práticas) e depois pelo código existente (`CLAUDE.md`, `.claude/patterns.md`, convenções); empate → a mais simples; decisão sem UC vai para descartadas
- [ ] Re-analisar do zero e repetir até zero gaps, nunca menos de um round — decisão nova criou ambiguidade, contradição ou regra que já tem dono (→ absorve no motor)?
- [ ] Publicar `✅ Spec completo — [N] rounds, [M] decisões, zero ambiguidades`
- [ ] Escrever `docs/04-spec/<tópico>.md` — nome por domínio; doc que já cobre o domínio se atualiza, não se duplica (`00-start.md`) — com `## Escopo derivado` (plataformas · superfície visual e por quê) e `## Decisões` (`### D-N`)
- [ ] Publicar o Gateway Check 4 → 5 com as linhas obrigatórias (`SKILL.md` § Gateway Check) — sem superfície visual, a linha de Design declara `❌ N/A — derivado do Step 4` uma vez aqui, os seguintes herdam e o próximo é o Step 6
