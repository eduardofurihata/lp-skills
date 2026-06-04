# Step 10 — Done (Encerramento)

> **Step terminal.** É o último step do protocolo — **não existe Step 11**. Aqui a feature é movida para `done` (card promovido) e **só então** o trabalho é **commitado** — num único commit — na branch atual. **Ordem é contrato: mover primeiro, commitar por último.**

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
- **Status final dos TCs** — **checklist completo por TC** (`- [x] TC-N`), copiado da seção `## Test Cases (QA)` do card de to-do, + contagem total (todos PASSED)
- **Conteúdo do todo incorporado** — tasks completadas do `kanban/06-todo/`
- **Commit SHA** — hash do commit criado neste step (ver abaixo)

## Ações obrigatórias (ORDEM É CONTRATO — mover primeiro, commitar por último)

> **Mover o card é o PRIMEIRO ato. O commit é o ÚLTIMO — e é UM SÓ.**
> O commit fecha o protocolo capturando TUDO de uma vez: código + docs (01-09) + card de done + remoção do card de todo. Por isso ele vem **depois** de mover o card. Código pronto de steps anteriores fica **não-commitado** até aqui — nada de commit adiantado. Commitar antes de mover força um segundo commit (commit → move → commit de novo); é exatamente isso que esta ordem elimina.

### 1. Mover o card (promover `06-todo` → `10-done`) — PRIMEIRO

**Antes de apagar:** copie a seção `## Test Cases (QA)` (checklist final, tudo `- [x] TC-N`) do card de to-do para dentro do done — é o registro permanente do que foi testado (o card de to-do some, o status sobrevive no done).

Escreva o card de done em `kanban/10-done/<tópico>.md` (com o resumo acima, incluindo o checklist por TC) e **delete** o card da coluna to-do:

```bash
rm kanban/06-todo/<tópico>.md
```

Todo folder = só trabalho ativo. Feature done → o card sai de `06-todo` e passa a viver em `10-done`. **No kanban, a coluna é o status.**

### 2. Commit na branch atual — POR ÚLTIMO, UM ÚNICO COMMIT

Só agora, com **o card já movido e o done doc já escrito**, faça **um único commit** de tudo (código + artefatos) na **branch atual** (NUNCA crie branch — ver `SKILL.md`):

```bash
git add -A
git commit -m "feat(<escopo>): <descrição da feature>"
```

- Mensagem em **Conventional Commits** (`feat` / `fix` / `refactor` / `docs` … `(<escopo>)` = área da feature).
- **`git add -A` pega tudo de uma vez:** código, docs (01-09), card de done e a remoção (`rm`) do card de todo entram no MESMO commit.
- **NUNCA commite antes de mover o card.** Commitar o código primeiro e só depois mover o card força um segundo commit — exatamente o erro que esta ordem evita.
- **SHA é nota de bastidor:** o commit já É o registro (está no `git log`). Anotar o SHA no done doc é opcional e **não justifica um segundo commit** só para gravá-lo.

> **Escopo do commit:** vale para o `/method` completo. **`/fast` e `/todo` NÃO commitam** (ver suas skills) — neles o código fica não-commitado para você decidir quando versionar.

## Red Flags — PARE (cada uma gera o segundo commit que queremos evitar)

- "Step 9 passou, deixa eu commitar o código já" → NÃO. O commit é o ÚLTIMO ato, depois de mover o card.
- "Commito o código, movo o card, e commito o card depois" → NÃO. Mover PRIMEIRO; UM commit no fim.
- "Preciso gravar o SHA no done doc → commito de novo" → NÃO. O SHA vive no `git log`; não vale um segundo commit.
- "O código já estava pronto, então commitei lá atrás" → NÃO. Código de steps anteriores espera o step 10 e entra no commit único, junto com o card.

## Checklist Final (step terminal — sem gateway de saída)

- [ ] Done doc referencia todos os artefatos (docs 1-9)
- [ ] Card de `kanban/06-todo/<tópico>.md` deletado (card movido para `10-done`) — **ANTES do commit**
- [ ] Artefato `kanban/10-done/<tópico>.md` existe com conteúdo substantivo
- [ ] **UM único commit** na branch atual (Conventional Commits) capturando código + docs (01-09) + card de done + remoção do todo — sem commit adiantado do código, sem commit extra depois

Tudo ✅ → feature encerrada. **Fim do protocolo.**
