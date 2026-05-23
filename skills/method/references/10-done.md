# Step 10 — Done

## Pré-requisito

Gateway 9 → 10 **LIBERADO** (ver `gateways.md`).

## Artefato

- **Pasta:** `kanban/10-done/`
- **Arquivo:** `<tópico>.md`

## Conteúdo — Resumo Final

- **Links para todos os docs** (Steps 1-9):
  - Problema: `docs/01-problem/<tópico>.md`
  - User Stories: `docs/02-user-stories/<tópico>.md`
  - Use Cases: `docs/03-use-cases/<tópico>.md`
  - Spec: `docs/04-spec/<tópico>.md`
  - To Do: (deletado — ver abaixo)
  - Test Cases: `docs/05-test-cases/<tópico>.md`
  - Plano: `kanban/07-implementation/<tópico>.md`
  - Code Review: `kanban/08-code-review/<tópico>.md`
  - Run Test: `kanban/09-run-test/<tópico>.md`
- **Arquivos de código alterados** — lista completa
- **Status final dos TCs** — todos PASSED, contagem total
- **Conteúdo do todo incorporado** — tasks completadas do `kanban/06-todo/`

## Ação obrigatória

**Delete o todo da feature:**

```bash
rm kanban/06-todo/<tópico>.md
```

Todo folder = só trabalho ativo. Feature done → arquivo removido.

## Gateway 10 → 11

- [ ] Done doc referencia todos os artefatos (docs 1-9)
- [ ] Todo em `kanban/06-todo/` deletado
- [ ] Artefato `kanban/10-done/<tópico>.md` existe com conteúdo substantivo
