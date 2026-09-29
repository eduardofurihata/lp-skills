# Step 0 — Start (estrutura + inventário)

**Antes de qualquer step: as pastas estão certas e eu sei o que já existe.** Roda uma vez e não produz artefato. **Cada `- [ ]` é uma tarefa:** `TaskCreate` um por item, `TaskUpdate` fecha antes da próxima.

- [ ] Conferir as pastas do projeto contra o contrato abaixo
- [ ] Renomear `obra/` ou `kanban/` para `track/` com `git mv`, antes de tudo
- [ ] Renumerar as pastas antigas com `git mv`, do maior para o menor — senão um rename sobrescreve o outro
- [ ] Apagar a `11-follow-ups/` antiga
- [ ] Corrigir pasta fora do contrato, duplicada ou com lacuna — pasta que não existe não se cria vazia, nasce com o artefato do step
- [ ] Commitar só a arrumação antes do Step 1 (`chore: renumera docs/track`), fora do commit da feature
- [ ] Ler o conteúdo de todo `docs/**/*.md` e `track/**/*.md` num scan único — o nome não diz tudo
- [ ] Apontar o que se relaciona com a feature: mesma área, fluxo, tela ou domínio
- [ ] Decidir a ação por step: relacionado → atualizar · nada → criar por domínio · redundantes → mesclar sem perder conteúdo · obsoletos → deletar
- [ ] Listar o que há em `docs/00-context/` como insumo, sem renumerar nem virar artefato
- [ ] Publicar no chat os blocos **Estrutura** e **Inventário**
- [ ] Perguntar antes do Step 1 se sobrou ambiguidade de estrutura

Contrato — `docs/`: `00-context` · `01-problem` · `02-user-stories` · `03-use-cases` · `04-spec` · `05-design` (era `04-design`) · `06-test-cases` (era `05-test-cases`); `track/`: `07-todo` (`06-todo`) · `08-implementation` (`07-…`) · `09-code-review` (`08-…`) · `10-run-test` (`09-…`) · `11-done` (`12-done`, `10-done`).

Nome do arquivo é o domínio, não a task: `pagamentos.md`, nunca `add-pix.md`; features do mesmo domínio no mesmo arquivo, por H2/H3 — PIX é pagamento, então atualiza `pagamentos.md`. `00-context/` é brainstorming fora da esteira; o que virar trabalho entra pelo Step 1. Conhecimento permanente vive em `.claude/`.

**Estrutura:** pastas no contrato N/12 · renomeadas · commit · fora do contrato · ✅/❌. **Inventário:** docs lidos (N em M pastas) · relacionados (arquivo → por quê) · ação por step.
