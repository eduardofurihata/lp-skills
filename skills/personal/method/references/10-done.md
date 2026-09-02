# Step 10 — Done (Encerramento)

> **Step terminal.** É o último step do protocolo — **não existe Step 11**. Aqui a feature é movida para `done` (card promovido) e **só então** o trabalho é **commitado** — num único commit — na branch atual. **Ordem é contrato: convergir primeiro, mover depois, commitar por último.**
>
> Terminal **não** quer dizer sem gateway: o Step 10 tem gateway de **entrada** — o **Gate de Convergência** (zero follow-ups abertos). Ele roda ANTES de escrever o done doc, ANTES do `rm` e ANTES do commit.

## Pré-requisitos (AMBOS)

1. Gateway 9 → 10 **LIBERADO** (ver `gateways.md`).
2. **Gate de Convergência ✅ CONVERGIU** publicado no chat (ver abaixo).

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
- **Ledger de Follow-ups final** — tabela completa copiada da seção `## Follow-ups` do card de to-do (todos `RESOLVIDO-NO-STEP` / `RESOLVIDO-POR-CICLO` / `DESCARTADO`, **zero `ABERTO`**), com link do done doc de cada ciclo
- **Conteúdo do todo incorporado** — tasks completadas do `kanban/06-todo/`
- **Princípios — o que produziram** (`principios.md`), 5 linhas, sem prosa:
  - **Reutilizado (DRY):** o que existia e foi estendido em vez de recriado (do § 3.1 do plano)
  - **Descartado (YAGNI):** o que foi considerado e não construído (do § 3.2 do plano)
  - **Motores (§ 3.3):** quais nasceram, quais cresceram, que lógica dispersa foi absorvida
  - **Elevado (refatoração do perímetro, § 3.5):** o que estava abaixo do nível #1 no caminho percorrido e subiu — e o que já estava no nível #1
  - **DS ganhou** (`design.md`, se tem UI): tokens e componentes **promovidos**, padrões visuais elevados. Nada promovido → escreva que a feature coube no DS existente.
- **Commit SHA** — hash do commit criado neste step (ver abaixo)

> Sem essas 5 linhas o done doc mente por omissão: registra o que a feature faz e esconde **como ela ficou** — que é justamente o que o próximo `/method` (e o `/merge`) precisa saber. A linha do DS é o que impede a próxima feature de reinventar o que esta acabou de promover.

## Gate de Convergência — ANTES de qualquer ação do Step 10

> **O protocolo fecha SECO.** Nem o `rm` do card, nem o commit, nem resumo de conclusão acontecem enquanto houver follow-up aberto. Publique este bloco no chat:

```markdown
## Gate de Convergência — Follow-ups
- Itens no ledger: **T** (A: **a** · B: **b** · C: **c**)
- Ciclos de follow-up executados: **N** — listar (Fn → `kanban/10-done/<f>.md`)
- Itens **ABERTOS**: **0**
- Itens novos detectados no último passe: **0** → **passe seco**
- **Veredicto: ✅ CONVERGIU** / ❌ BLOQUEADO — abertos: [listar Fn]
```

**❌ BLOQUEADO →** para CADA item aberto, rode o **`/method` COMPLETO** (Step 1→10, com `/solve`, tópico e artefatos próprios) — **sem commitar** (só o ciclo raiz commita) — marque `RESOLVIDO-POR-CICLO` no ledger e **republique o Gate**. Ciclo que gerar novo follow-up ⇒ passe não foi seco ⇒ o loop continua.

Triagem A/B/C, formato do ledger e racionalizações: `follow-ups.md`.

## Ações obrigatórias (ORDEM É CONTRATO — mover primeiro, commitar por último)

> **Mover o card é o PRIMEIRO ato. O commit é o ÚLTIMO — e é UM SÓ.**
> O commit fecha o protocolo capturando TUDO de uma vez: código + docs (01-09) + card de done + remoção do card de todo. Por isso ele vem **depois** de mover o card. Código pronto de steps anteriores fica **não-commitado** até aqui — nada de commit adiantado. Commitar antes de mover força um segundo commit (commit → move → commit de novo); é exatamente isso que esta ordem elimina.

### 1. Mover o card (promover `06-todo` → `10-done`) — PRIMEIRO

**Antes de apagar:** copie do card de to-do para dentro do done (o card some, o registro sobrevive):
- a seção `## Test Cases (QA)` — checklist final, tudo `- [x] TC-N`, registro permanente do que foi testado;
- a seção `## Follow-ups` — ledger final, zero `ABERTO`, registro permanente do que apareceu e como foi resolvido ou por que foi descartado.

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

> **Escopo do commit:** só o `/method` completo — e, dentro dele, **só o ciclo RAIZ** — commita. **`/fast` para no Step 8 (Code Review) — nem chega aqui.** O **`/todo`** faz a promoção do card (`06`→`10`) e grava `tests: passed`, mas **NÃO commita**. **Ciclo de follow-up aninhado** roda este Step 10 inteiro (done doc + `rm` do card) **menos o commit** — se ele commitasse, o `git add -A` varreria o código não-commitado da feature-pai para dentro do commit errado. O commit único do ciclo raiz cobre tudo: a feature + todos os ciclos de follow-up (código, docs de todos os tópicos, todos os cards de done, todas as remoções de to-do).

## Red Flags — PARE (cada uma gera o segundo commit que queremos evitar)

- "Step 9 passou, deixa eu commitar o código já" → NÃO. O commit é o ÚLTIMO ato, depois de mover o card.
- "Commito o código, movo o card, e commito o card depois" → NÃO. Mover PRIMEIRO; UM commit no fim.
- "Preciso gravar o SHA no done doc → commito de novo" → NÃO. O SHA vive no `git log`; não vale um segundo commit.
- "O código já estava pronto, então commitei lá atrás" → NÃO. Código de steps anteriores espera o step 10 e entra no commit único, junto com o card.
- "Commito a feature agora e resolvo os follow-ups num commit depois" → NÃO. Convergência vem ANTES do commit. Dois commits é exatamente o que esta ordem elimina.
- "O ciclo de follow-up terminou, commito ele antes de voltar pra feature" → NÃO. Ciclo aninhado não commita. Um commit, no fim, no ciclo raiz.

## Checklist Final (step terminal — sem gateway de saída)

- [ ] **Gate de Convergência ✅ CONVERGIU** publicado no chat — zero follow-ups `ABERTO`, passe seco confirmado
- [ ] Cada item de balde **B** fechado por ciclo `/method` próprio (1→10, com `/solve`, sem commit) com done doc linkado
- [ ] Cada item de balde **C** com justificativa registrada no ledger
- [ ] Done doc referencia todos os artefatos (docs 1-9) e contém o **ledger de follow-ups final**
- [ ] Done doc registra as **5 linhas de princípios**: reutilizado (DRY) · descartado (YAGNI) · **motores** · **elevado** (refatoração do perímetro) · **DS ganhou** (se tem UI)
- [ ] Card de `kanban/06-todo/<tópico>.md` deletado (card movido para `10-done`) — **ANTES do commit**
- [ ] Artefato `kanban/10-done/<tópico>.md` existe com conteúdo substantivo
- [ ] **UM único commit** na branch atual (Conventional Commits) capturando código + docs (01-09) + card de done + remoção do todo + **todos os ciclos de follow-up** — sem commit adiantado do código, sem commit extra depois

Tudo ✅ → feature encerrada. **Fim do protocolo.**
