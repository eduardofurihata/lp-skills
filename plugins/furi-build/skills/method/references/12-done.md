# Step 12 — Done (Encerramento)

> **Step terminal.** É o último step do protocolo — **não existe Step 13**. Aqui a feature é movida para `done` (card promovido) e **só então** o trabalho é **commitado** — num único commit — na branch atual. **Ordem é contrato: mover primeiro, commitar por último.**

**Chame e use:** `/solve` · `/principles` · `/front` (se tem UI) — os três via Skill tool · `11-follow-ups.md` · `rationalizations.md`

## Pré-requisito

**Gateway 11 → 12 LIBERADO** — o Step 11 publicou o Gate de Convergência com `✅ CONVERGIU` (zero follow-ups abertos, passe seco). Sem ele, nada aqui começa: nem o done doc, nem o `rm`, nem o commit.

## Artefato

`kanban/12-done/<tópico>.md` — nome por domínio (`00-start.md`): o card promovido, com o resumo abaixo.

## Conteúdo — Resumo Final

- **Links para todos os docs** (Steps 1-11):
  - Problema: `docs/01-problem/<tópico>.md`
  - User Stories: `docs/02-user-stories/<tópico>.md`
  - Use Cases: `docs/03-use-cases/<tópico>.md`
  - Spec: `docs/04-spec/<tópico>.md`
  - Design: `docs/05-design/<tópico>.md` (se tem UI)
  - To Do: (deletado — ver abaixo)
  - Test Cases: `docs/06-test-cases/<tópico>.md`
  - Plano: `kanban/08-implementation/<tópico>.md`
  - Code Review: `kanban/09-code-review/<tópico>.md`
  - Run Test: `kanban/10-run-test/<tópico>.md`
  - Follow-ups: `kanban/11-follow-ups/<tópico>.md`
- **Arquivos de código alterados** — lista completa
- **Status final dos TCs** — **checklist completo por TC** (`- [x] TC-N`), copiado da seção `## Test Cases (QA)` do card de to-do, + contagem total (todos PASSED)
- **Ledger de Follow-ups final** — tabela completa copiada de `kanban/11-follow-ups/<tópico>.md` (todos `RESOLVIDO-NO-STEP` / `RESOLVIDO-POR-CICLO` / `DESCARTADO`, **zero `ABERTO`**), com link do done doc de cada ciclo
- **Conteúdo do todo incorporado** — tasks completadas do `kanban/07-todo/`
- **Princípios — o que produziram** (`/principles`), 5 linhas, sem prosa:
  - **Reutilizado (DRY):** o que existia e foi estendido em vez de recriado (do § 3.1 do plano)
  - **Descartado (YAGNI):** o que foi considerado e não construído (do § 3.2 do plano)
  - **Motores (§ 3.3):** quais nasceram, quais cresceram, que lógica dispersa foi absorvida
  - **Elevado (refatoração do perímetro, § 3.5):** o que estava abaixo do nível #1 no caminho percorrido e subiu — e o que já estava no nível #1
  - **DS ganhou** (`/front`, se tem UI): tokens e componentes **promovidos**, padrões visuais elevados. Nada promovido → escreva que a feature coube no DS existente.
- **Commit SHA** — hash do commit criado neste step (ver abaixo)

> Sem essas 5 linhas o done doc mente por omissão: registra o que a feature faz e esconde **como ela ficou** — que é justamente o que o próximo ciclo (e quem for revisar a mudança) precisa saber. A linha do DS é o que impede a próxima feature de reinventar o que esta acabou de promover.

## Ações obrigatórias (ORDEM É CONTRATO — mover primeiro, commitar por último)

> **Mover o card é o PRIMEIRO ato. O commit é o ÚLTIMO — e é UM SÓ.**
> O commit fecha o protocolo capturando TUDO de uma vez: código + docs (01-11) + card de done + remoção do card de todo. Por isso ele vem **depois** de mover o card. Código pronto de steps anteriores fica **não-commitado** até aqui — nada de commit adiantado. Commitar antes de mover força um segundo commit (commit → move → commit de novo); é exatamente isso que esta ordem elimina.

### 1. Mover o card (promover `07-todo` → `12-done`) — PRIMEIRO

**Antes de apagar:** copie para dentro do done (o card some, o registro sobrevive):
- do card de to-do, a seção `## Test Cases (QA)` — checklist final, tudo `- [x] TC-N`, registro permanente do que foi testado;
- de `kanban/11-follow-ups/<tópico>.md`, o **ledger final** — zero `ABERTO`, registro permanente do que apareceu e como foi resolvido ou por que foi descartado.

Escreva o card de done em `kanban/12-done/<tópico>.md` (com o resumo acima, incluindo o checklist por TC) e **delete** o card da coluna to-do:

```bash
rm kanban/07-todo/<tópico>.md
```

Todo folder = só trabalho ativo. Feature done → o card sai de `07-todo` e passa a viver em `12-done`. **No kanban, a coluna é o status.**

### 2. Commit na branch atual — POR ÚLTIMO, UM ÚNICO COMMIT

Só agora, com **o card já movido e o done doc já escrito**, faça **um único commit** de tudo (código + artefatos) na **branch atual** (NUNCA crie branch — ver `SKILL.md`):

```bash
git add -A
git commit -m "feat(<escopo>): <descrição da feature>"
```

- Mensagem em **Conventional Commits** (`feat` / `fix` / `refactor` / `docs` … `(<escopo>)` = área da feature).
- **`git add -A` pega tudo de uma vez:** código, docs (01-11), card de done e a remoção (`rm`) do card de todo entram no MESMO commit.
- **SHA é nota de bastidor:** o commit já É o registro (está no `git log`). Anotar o SHA no done doc é opcional e **não justifica um segundo commit** só para gravá-lo.

> **Escopo do commit:** só o ciclo **RAIZ** do `/method` commita; ciclo de follow-up aninhado roda este Step 12 inteiro **menos o commit** (`11-follow-ups.md` § Ciclo aninhado NÃO commita).

## Red Flags — PARE (cada uma gera o segundo commit que queremos evitar)

- "O Step 10 passou, deixa eu commitar o código já" → NÃO. O commit é o ÚLTIMO ato, depois de mover o card.
- "Commito o código, movo o card, e commito o card depois" → NÃO. Mover PRIMEIRO; UM commit no fim.
- "Preciso gravar o SHA no done doc → commito de novo" → NÃO. O SHA vive no `git log`; não vale um segundo commit.
- "O código já estava pronto, então commitei lá atrás" → NÃO. Código de steps anteriores espera o Step 12 e entra no commit único, junto com o card.
- "O ciclo de follow-up terminou, commito ele antes de voltar pra feature" → NÃO. Ciclo aninhado não commita. Um commit, no fim, no ciclo raiz.

## Princípios neste step

Aqui a lente é **registro, não cobrança**: o que os princípios produziram sai nas cinco linhas do § *Conteúdo — Resumo Final*, copiadas do plano (§ 3.1, § 3.2, § 3.3, § 3.5) e do que o Step 5 promoveu ao DS.

**Nenhuma decisão nova de arquitetura ou de design se toma no Step 12.** O que aparecer aqui é **achado** — e achado depois do Step 11 reabre o Gate de Convergência (`11-follow-ups.md`), não vira correção de última hora antes do commit.

## Checklist Final (step terminal — sem gateway de saída)

- [ ] **Gateway 11 → 12 LIBERADO** — Gate de Convergência `✅ CONVERGIU` publicado no Step 11
- [ ] Done doc referencia todos os artefatos (Steps 1-11) e contém o **ledger final** copiado do Step 11
- [ ] Done doc registra as **5 linhas de princípios**: reutilizado (DRY) · descartado (YAGNI) · **motores** · **elevado** (refatoração do perímetro) · **DS ganhou** (se tem UI)
- [ ] Checklist por TC (`- [x] TC-N`) copiado do card de to-do
- [ ] Card de `kanban/07-todo/<tópico>.md` deletado — **ANTES do commit**
- [ ] Artefato `kanban/12-done/<tópico>.md` existe com conteúdo substantivo
- [ ] **UM único commit** na branch atual (Conventional Commits) capturando código + docs (01-11) + card de done + remoção do todo + **todos os ciclos de follow-up** — sem commit adiantado do código, sem commit extra depois

Tudo ✅ → feature encerrada. **Fim do protocolo.**
