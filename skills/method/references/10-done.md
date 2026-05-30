# Step 10 — Done (Encerramento)

> **Step terminal.** É o último step do protocolo — **não existe Step 11**. Aqui a feature é movida para `done`, o card é promovido e o trabalho é **commitado** na branch atual.

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
- **Commit SHA** — hash do commit criado neste step (ver abaixo)

## Ações obrigatórias (nesta ordem)

### 1. Mover o card (promover `06-todo` → `10-done`)

Escreva o card de done em `kanban/10-done/<tópico>.md` (com o resumo acima) e **delete** o card da coluna to-do:

```bash
rm kanban/06-todo/<tópico>.md
```

Todo folder = só trabalho ativo. Feature done → o card sai de `06-todo` e passa a viver em `10-done`. **No kanban, a coluna é o status.**

### 2. Commit na branch atual

Com o card movido e o done doc escrito, **commite tudo** (código + artefatos) na **branch atual** (NUNCA crie branch — ver `SKILL.md`):

```bash
git add -A
git commit -m "feat(<escopo>): <descrição da feature>"
```

- Mensagem em **Conventional Commits** (`feat` / `fix` / `refactor` / `docs` … `(<escopo>)` = área da feature).
- Inclua no commit: código, docs (01-09), card de done e a remoção do card de todo.
- Registre o **commit SHA** resultante no done doc.

> **Escopo do commit:** vale para o `/method` completo. **`/fast` e `/todo` NÃO commitam** (ver suas skills) — neles o código fica não-commitado para você decidir quando versionar.

## Checklist Final (step terminal — sem gateway de saída)

- [ ] Done doc referencia todos os artefatos (docs 1-9)
- [ ] Card de `kanban/06-todo/<tópico>.md` deletado (card movido para `10-done`)
- [ ] Artefato `kanban/10-done/<tópico>.md` existe com conteúdo substantivo
- [ ] Commit criado na branch atual (Conventional Commits) e **SHA registrado** no done doc

Tudo ✅ → feature encerrada. **Fim do protocolo.**
